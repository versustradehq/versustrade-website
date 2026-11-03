const allowedOrigins = [
  "https://versustrade.co",
  "https://www.versustrade.co"
];

const VALID_TYPES = ["CRYPTO_BUY", "CRYPTO_SELL", "GIFT_CARD_SELL"];
const VALID_STATUSES = ["VT-PRO", "VT-DONE", "VT-DEC"];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const corsOrigin = allowedOrigins.includes(origin) ? origin : "";
    const headers = {
      "Content-Type": "application/json",
      ...(corsOrigin ? {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Vary": "Origin"
      } : {})
    };
    const respond = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "GET" && path === "/health") {
      return respond({ ok: true, service: "versustrade-admin-api" });
    }

    const allowedPaths = [
      "/admin/verify",
      "/admin/transactions",
      "/admin/transactions/status",
      "/admin/transactions/list",
      "/admin/transactions/events",
      "/admin/transactions/archive",
      "/admin/transactions/restore",
      "/admin/transactions/delete",
      "/admin/activity",
      "/admin/customers/search",
      "/admin/rates/get",
      "/admin/rates/update"
    ];

    if (request.method !== "POST" || !allowedPaths.includes(path)) {
      return respond({ error: "Not found" }, 404);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return respond({ error: "Server configuration missing" }, 500);
    }

    const authorization = request.headers.get("Authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token) return respond({ error: "Authentication required" }, 401);

    try {
      // Verify the user's Supabase session.
      const authResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${token}`
        }
      });
      if (!authResponse.ok) return respond({ error: "Invalid login session" }, 401);
      const user = await authResponse.json();

      const dbHeaders = {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json"
      };

      // Confirm that this user is an authorized VersusTrade admin.
      const adminResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`,
        { headers: dbHeaders }
      );
      if (!adminResponse.ok) return respond({ error: "Admin verification failed" }, 500);
      const admins = await adminResponse.json();
      if (!admins.length) return respond({ error: "Admin access denied" }, 403);

      if (path === "/admin/verify") {
        return respond({ ok: true, authorized: true, message: "Admin verified" });
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return respond({ error: "Invalid JSON body" }, 400);
      }

      // Admin-only exchange-rate management, backed by the same KV used by the public Rates Worker.
      if (path === "/admin/rates/get") {
        if (!env.RATES) return respond({ error: "Rates KV binding is missing from the Admin API Worker" }, 500);
        const defaults = { mode: "fixed", buy: 1300, sell: 1450, buyMargin: 75, sellMargin: 75, updated: null };
        const config = { ...defaults, ...((await env.RATES.get("config", "json")) || {}) };
        return respond({ ok: true, rates: config });
      }

      if (path === "/admin/rates/update") {
        if (!env.RATES) return respond({ error: "Rates KV binding is missing from the Admin API Worker" }, 500);
        const mode = body.mode;
        const buy = Number(body.buy), sell = Number(body.sell);
        const buyMargin = Number(body.buyMargin), sellMargin = Number(body.sellMargin);
        if (!["fixed", "live"].includes(mode)) return respond({ error: "Choose fixed or live rate mode" }, 400);
        if (mode === "fixed" && (![buy, sell].every(Number.isFinite) || buy <= 0 || sell <= 0 || buy > 1e7 || sell > 1e7)) {
          return respond({ error: "Enter valid BUY and SELL rates greater than zero" }, 400);
        }
        if (![buyMargin, sellMargin].every(Number.isFinite) || buyMargin < 0 || sellMargin < 0 || buyMargin > 1e6 || sellMargin > 1e6) {
          return respond({ error: "Enter valid non-negative BUY and SELL margins" }, 400);
        }
        const defaults = { mode: "fixed", buy: 1300, sell: 1450, buyMargin: 75, sellMargin: 75, updated: null };
        const previous = { ...defaults, ...((await env.RATES.get("config", "json")) || {}) };
        const config = {
          mode,
          buy: mode === "fixed" ? buy : previous.buy,
          sell: mode === "fixed" ? sell : previous.sell,
          buyMargin,
          sellMargin,
          updated: new Date().toISOString()
        };
        await env.RATES.put("config", JSON.stringify(config));
        return respond({ ok: true, message: "Rates updated", rates: config });
      }

      const rest = (table, query = "") =>
        `${env.SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`;

      const getTransaction = async (reference, select = "*") => {
        const response = await fetch(
          rest("transactions", `reference=eq.${encodeURIComponent(reference)}&select=${encodeURIComponent(select)}&limit=1`),
          { headers: dbHeaders }
        );
        if (!response.ok) return { error: "Transaction lookup failed", status: 500 };
        const rows = await response.json();
        return rows.length
          ? { transaction: rows[0] }
          : { error: "Transaction reference not found", status: 404 };
      };

      const writeAdminActivity = async (reference, event_type, details = {}) => {
        const response = await fetch(rest("admin_activity"), {
          method: "POST",
          headers: { ...dbHeaders, Prefer: "return=representation" },
          body: JSON.stringify({
            reference,
            event_type,
            actor_user_id: user.id,
            details
          })
        });
        const rows = response.ok ? await response.json() : [];
        return { ok: response.ok, row: rows[0] || null };
      };

      // Search customers for admin transaction registration.
      if (path === "/admin/customers/search") {
        const query = String(body.query || "").trim().toLowerCase();
        if (query.length < 2 || query.length > 100) {
          return respond({ error: "Enter at least 2 characters to search" }, 400);
        }

        const customers = [];
        const perPage = 200;
        for (let page = 1; page <= 50; page++) {
          const usersResponse = await fetch(
            `${env.SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
            { headers: dbHeaders }
          );
          if (!usersResponse.ok) return respond({ error: "Customer search failed" }, 500);
          const result = await usersResponse.json();
          const users = result.users || [];

          for (const customer of users) {
            const metadata = customer.user_metadata || {};
            const name = String(metadata.full_name || metadata.name || metadata.username || "").trim();
            const email = String(customer.email || "").trim();
            if (name.toLowerCase().includes(query) || email.toLowerCase().includes(query)) {
              customers.push({ id: customer.id, name: name || "Name not provided", email });
            }
            if (customers.length >= 12) break;
          }
          if (customers.length >= 12 || users.length < perPage) break;
        }
        return respond({ ok: true, customers });
      }

      // Register a transaction.
      if (path === "/admin/transactions") {
        const {
          customer_id, transaction_type, asset, network, crypto_amount,
          card_brand, card_region, card_value, card_currency,
          fiat_currency, fiat_amount, exchange_rate, payout_amount,
          payout_currency, customer_note
        } = body;

        if (!customer_id || !VALID_TYPES.includes(transaction_type)) {
          return respond({ error: "customer_id and a valid transaction_type are required" }, 400);
        }

        const prefix = transaction_type === "GIFT_CARD_SELL" ? "GFT" : "CRY";
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const uniquePart = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
        const reference = `VT-${prefix}-${date}-${uniquePart}`;

        if (transaction_type === "GIFT_CARD_SELL" &&
          (!card_brand || !card_region || !card_currency)) {
          return respond({
            error: "Gift card transactions require card_brand, card_region and card_currency"
          }, 400);
        }
        if ((transaction_type === "CRYPTO_BUY" || transaction_type === "CRYPTO_SELL") &&
          (!asset || !crypto_amount)) {
          return respond({ error: "Crypto transactions require asset and crypto_amount" }, 400);
        }

        const customerResponse = await fetch(
          `${env.SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(customer_id)}`,
          { headers: dbHeaders }
        );
        if (!customerResponse.ok) return respond({ error: "Customer account not found" }, 404);

        const transaction = {
          reference, customer_id, transaction_type, status: "VT-PRO",
          asset: asset || null, network: network || null, crypto_amount: crypto_amount ?? null,
          card_brand: card_brand || null, card_region: card_region || null,
          card_value: card_value ?? null, card_currency: card_currency || null,
          fiat_currency: fiat_currency || null, fiat_amount: fiat_amount ?? null,
          exchange_rate: exchange_rate ?? null, payout_amount: payout_amount ?? null,
          payout_currency: payout_currency || null, customer_note: customer_note || null,
          created_by: user.id, updated_by: user.id
        };

        const insertResponse = await fetch(rest("transactions"), {
          method: "POST",
          headers: { ...dbHeaders, Prefer: "return=representation" },
          body: JSON.stringify(transaction)
        });
        const inserted = await insertResponse.json();
        if (!insertResponse.ok) {
          if (insertResponse.status === 409) {
            return respond({ error: "A transaction with this reference already exists" }, 409);
          }
          return respond({
            error: "Transaction creation failed",
            details: inserted.message || inserted
          }, 400);
        }

        const created = inserted[0];
        const eventResponse = await fetch(rest("transaction_events"), {
          method: "POST",
          headers: dbHeaders,
          body: JSON.stringify({
            transaction_id: created.id,
            event_type: "CREATED",
            previous_status: null,
            new_status: "VT-PRO",
            actor_user_id: user.id,
            details: { reference }
          })
        });
        if (!eventResponse.ok) {
          return respond({
            ok: false,
            warning: "Transaction created, but its audit event could not be recorded",
            transaction: created
          }, 500);
        }
        return respond({ ok: true, message: "Transaction registered", transaction: created }, 201);
      }

      // List active transactions or archived transactions.
      if (path === "/admin/transactions/list") {
        const requestedLimit = Number(body.limit);
        const limit = Number.isFinite(requestedLimit)
          ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 500)
          : 200;
        const archiveFilter = body.archived === true ? "not.is.null" : "is.null";
        const response = await fetch(
          rest("transactions", `select=*&archived_at=${archiveFilter}&order=created_at.desc&limit=${limit}`),
          { headers: dbHeaders }
        );
        if (!response.ok) return respond({ error: "Could not load transactions" }, 500);
        return respond({ ok: true, transactions: await response.json() });
      }

      // Load audit events for a single transaction.
      if (path === "/admin/transactions/events") {
        const reference = String(body.reference || "").trim();
        if (!reference) return respond({ error: "A transaction reference is required" }, 400);
        const found = await getTransaction(reference, "id,reference");
        if (found.error) return respond({ error: found.error }, found.status);
        const response = await fetch(
          rest("transaction_events", `transaction_id=eq.${encodeURIComponent(found.transaction.id)}&select=*&order=created_at.asc`),
          { headers: dbHeaders }
        );
        if (!response.ok) return respond({ error: "Could not load transaction events" }, 500);
        return respond({ ok: true, events: await response.json() });
      }

      // Global activity history, including records for permanently deleted transactions.
      if (path === "/admin/activity") {
        const requestedLimit = Number(body.limit);
        const limit = Number.isFinite(requestedLimit)
          ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 500)
          : 300;
        const [eventsResponse, adminActivityResponse] = await Promise.all([
          fetch(rest("transaction_events", `select=*&order=created_at.desc&limit=${limit}`), { headers: dbHeaders }),
          fetch(rest("admin_activity", `select=*&order=created_at.desc&limit=${limit}`), { headers: dbHeaders })
        ]);
        if (!eventsResponse.ok || !adminActivityResponse.ok) {
          return respond({ error: "Could not load activity history" }, 500);
        }

        const transactionEvents = (await eventsResponse.json()).map(event => ({
          id: event.id,
          reference: event.details?.reference || "",
          event_type: event.event_type,
          actor_user_id: event.actor_user_id,
          created_at: event.created_at,
          details: event.details || {},
          previous_status: event.previous_status,
          new_status: event.new_status
        }));
        const adminEvents = (await adminActivityResponse.json()).map(event => ({
          id: event.id,
          reference: event.reference,
          event_type: event.event_type,
          actor_user_id: event.actor_user_id,
          created_at: event.created_at,
          details: event.details || {},
          previous_status: null,
          new_status: null
        }));
        const activity = [...transactionEvents, ...adminEvents]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, limit);
        return respond({ ok: true, activity });
      }

      // Archive a transaction.
      if (path === "/admin/transactions/archive") {
        const reference = String(body.reference || "").trim();
        if (!reference) return respond({ error: "A transaction reference is required" }, 400);
        const found = await getTransaction(reference);
        if (found.error) return respond({ error: found.error }, found.status);
        const transaction = found.transaction;
        if (transaction.archived_at) return respond({ error: "Transaction is already archived" }, 409);

        const archivedAt = new Date().toISOString();
        const updateResponse = await fetch(
          rest("transactions", `id=eq.${encodeURIComponent(transaction.id)}`),
          {
            method: "PATCH",
            headers: { ...dbHeaders, Prefer: "return=representation" },
            body: JSON.stringify({
              archived_at: archivedAt,
              archived_by: user.id,
              updated_by: user.id,
              updated_at: archivedAt
            })
          }
        );
        const updatedRows = updateResponse.ok ? await updateResponse.json() : [];
        if (!updateResponse.ok || !updatedRows.length) {
          return respond({ error: "Could not archive transaction" }, 500);
        }

        const activity = await writeAdminActivity(reference, "ARCHIVED", { status: transaction.status });
        if (!activity.ok) {
          await fetch(rest("transactions", `id=eq.${encodeURIComponent(transaction.id)}`), {
            method: "PATCH",
            headers: dbHeaders,
            body: JSON.stringify({ archived_at: null, archived_by: null })
          });
          return respond({
            error: "Archive was rolled back because its activity record could not be saved"
          }, 500);
        }
        return respond({ ok: true, message: "Transaction archived", transaction: updatedRows[0] });
      }

      // Restore a transaction from Archives.
      if (path === "/admin/transactions/restore") {
        const reference = String(body.reference || "").trim();
        if (!reference) return respond({ error: "A transaction reference is required" }, 400);
        const found = await getTransaction(reference);
        if (found.error) return respond({ error: found.error }, found.status);
        const transaction = found.transaction;
        if (!transaction.archived_at) return respond({ error: "Transaction is not archived" }, 409);

        const updateResponse = await fetch(
          rest("transactions", `id=eq.${encodeURIComponent(transaction.id)}`),
          {
            method: "PATCH",
            headers: { ...dbHeaders, Prefer: "return=representation" },
            body: JSON.stringify({
              archived_at: null,
              archived_by: null,
              updated_by: user.id,
              updated_at: new Date().toISOString()
            })
          }
        );
        const updatedRows = updateResponse.ok ? await updateResponse.json() : [];
        if (!updateResponse.ok || !updatedRows.length) {
          return respond({ error: "Could not restore transaction" }, 500);
        }

        const activity = await writeAdminActivity(reference, "RESTORED", { status: transaction.status });
        if (!activity.ok) {
          await fetch(rest("transactions", `id=eq.${encodeURIComponent(transaction.id)}`), {
            method: "PATCH",
            headers: dbHeaders,
            body: JSON.stringify({
              archived_at: transaction.archived_at,
              archived_by: transaction.archived_by
            })
          });
          return respond({
            error: "Restore was rolled back because its activity record could not be saved"
          }, 500);
        }
        return respond({ ok: true, message: "Transaction restored", transaction: updatedRows[0] });
      }

      // Permanently delete an archived transaction, retaining an independent activity record.
      if (path === "/admin/transactions/delete") {
        const reference = String(body.reference || "").trim();
        if (!reference) return respond({ error: "A transaction reference is required" }, 400);
        const found = await getTransaction(reference);
        if (found.error) return respond({ error: found.error }, found.status);
        const transaction = found.transaction;
        if (!transaction.archived_at) {
          return respond({ error: "Only archived transactions can be permanently deleted" }, 409);
        }

        const snapshot = {
          transaction_id: transaction.id,
          transaction_type: transaction.transaction_type,
          status: transaction.status,
          customer_id: transaction.customer_id,
          asset: transaction.asset,
          network: transaction.network,
          crypto_amount: transaction.crypto_amount,
          card_brand: transaction.card_brand,
          card_region: transaction.card_region,
          card_value: transaction.card_value,
          card_currency: transaction.card_currency,
          fiat_currency: transaction.fiat_currency,
          fiat_amount: transaction.fiat_amount,
          payout_amount: transaction.payout_amount,
          payout_currency: transaction.payout_currency,
          archived_at: transaction.archived_at
        };
        const activity = await writeAdminActivity(reference, "DELETED", snapshot);
        if (!activity.ok || !activity.row) {
          return respond({ error: "Could not record permanent deletion in activity history" }, 500);
        }

        const eventsDelete = await fetch(
          rest("transaction_events", `transaction_id=eq.${encodeURIComponent(transaction.id)}`),
          { method: "DELETE", headers: dbHeaders }
        );
        if (!eventsDelete.ok) {
          await fetch(rest("admin_activity", `id=eq.${encodeURIComponent(activity.row.id)}`), {
            method: "DELETE",
            headers: dbHeaders
          });
          return respond({
            error: "Could not remove transaction audit records; transaction was not deleted"
          }, 500);
        }

        const transactionDelete = await fetch(
          rest("transactions", `id=eq.${encodeURIComponent(transaction.id)}`),
          { method: "DELETE", headers: dbHeaders }
        );
        if (!transactionDelete.ok) {
          await fetch(rest("admin_activity", `id=eq.${encodeURIComponent(activity.row.id)}`), {
            method: "DELETE",
            headers: dbHeaders
          });
          return respond({ error: "Could not permanently delete transaction" }, 500);
        }
        return respond({
          ok: true,
          message: "Transaction permanently deleted; activity record retained"
        });
      }

      // Update an existing transaction's status.
      if (path === "/admin/transactions/status") {
        const { reference, status } = body;
        if (!reference || !VALID_STATUSES.includes(status)) {
          return respond({ error: "A reference and valid status are required" }, 400);
        }
        const found = await getTransaction(reference, "id,reference,status,archived_at");
        if (found.error) return respond({ error: found.error }, found.status);
        const existing = found.transaction;
        if (existing.archived_at) {
          return respond({ error: "Restore this transaction before changing its status" }, 409);
        }
        if (existing.status === status) {
          return respond({
            ok: true,
            message: "Transaction already has this status",
            transaction: existing
          });
        }

        const updateResponse = await fetch(
          rest("transactions", `id=eq.${encodeURIComponent(existing.id)}`),
          {
            method: "PATCH",
            headers: { ...dbHeaders, Prefer: "return=representation" },
            body: JSON.stringify({
              status,
              updated_by: user.id,
              updated_at: new Date().toISOString()
            })
          }
        );
        const updatedRows = updateResponse.ok ? await updateResponse.json() : [];
        if (!updateResponse.ok || !updatedRows.length) {
          return respond({ error: "Transaction status update failed" }, 400);
        }
        const updated = updatedRows[0];

        const eventResponse = await fetch(rest("transaction_events"), {
          method: "POST",
          headers: dbHeaders,
          body: JSON.stringify({
            transaction_id: existing.id,
            event_type: "STATUS_CHANGED",
            previous_status: existing.status,
            new_status: status,
            actor_user_id: user.id,
            details: { reference }
          })
        });
        if (!eventResponse.ok) {
          return respond({
            ok: false,
            warning: "Status updated, but its audit event could not be recorded",
            transaction: updated
          }, 500);
        }
        return respond({
          ok: true,
          message: "Transaction status updated",
          transaction: updated
        });
      }

      return respond({ error: "Not found" }, 404);
    } catch (error) {
      return respond({ error: "Internal server error" }, 500);
    }
  }
};
