const ALLOWED_ORIGINS = new Set(["https://versustrade.co", "https://www.versustrade.co"]);
const MAX_BYTES = 10 * 1024 * 1024;
const MIME_EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status: status || 200, headers });
}
function safeName(name) {
  return String(name || "evidence").replace(/[\\/\\0-\\x1f\\x7f]/g, "_").slice(0, 140);
}
function isImage(bytes, mime) {
  if (mime === "image/jpeg") return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/png") return bytes.length > 8 && [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
  if (mime === "image/gif") return bytes.length > 6 && String.fromCharCode(...bytes.slice(0,6)).startsWith("GIF8");
  if (mime === "image/webp") return bytes.length > 12 && String.fromCharCode(...bytes.slice(0,4))==="RIFF" && String.fromCharCode(...bytes.slice(8,12))==="WEBP";
  return false;
}
async function readImage(request) {
  const type = (request.headers.get("Content-Type") || "").split(";")[0].toLowerCase();
  if (!MIME_EXT[type]) throw new Error("Only JPEG, PNG, WEBP and GIF images are accepted");
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_BYTES) throw new Error("Image exceeds the 10 MB limit");
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_BYTES) throw new Error("Image must be between 1 byte and 10 MB");
  if (!isImage(bytes, type)) throw new Error("The uploaded file does not match its image type");
  return { bytes, mime: type, ext: MIME_EXT[type] };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = ALLOWED_ORIGINS.has(origin) ? {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Transaction-Reference, X-File-Name",
      "Vary": "Origin"
    } : {};
    const headers = { "Content-Type": "application/json", ...cors };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const respond = (data, status) => json(data, status, headers);
    const path = new URL(request.url).pathname;

    if (request.method === "GET" && path === "/health") return respond({ ok: true, service: "versustrade-evidence-api" });
    if (request.method !== "POST") return respond({ error: "Not found" }, 404);
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.TRANSACTION_EVIDENCE) {
      return respond({ error: "Evidence API configuration is incomplete" }, 500);
    }

    const auth = request.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return respond({ error: "Authentication required" }, 401);

    try {
      const authRes = await fetch(env.SUPABASE_URL + "/auth/v1/user", {
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + token }
      });
      if (!authRes.ok) return respond({ error: "Invalid login session" }, 401);
      const user = await authRes.json();
      const dbHeaders = {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json"
      };
      const rest = (table, query) => env.SUPABASE_URL + "/rest/v1/" + table + (query ? "?" + query : "");
      const dbGet = async (table, query) => {
        const r = await fetch(rest(table, query), { headers: dbHeaders });
        if (!r.ok) throw new Error("Database request failed");
        return r.json();
      };
      const dbInsert = async (table, row) => {
        const r = await fetch(rest(table, ""), { method: "POST", headers: { ...dbHeaders, Prefer: "return=representation" }, body: JSON.stringify(row) });
        const data = await r.json().catch(()=>[]);
        if (!r.ok) throw new Error(data.message || "Could not save image record");
        return data[0];
      };
      const adminRows = await dbGet("admin_users", "user_id=eq." + encodeURIComponent(user.id) + "&select=user_id&limit=1");
      const isAdmin = adminRows.length > 0;
      const body = path === "/admin/images/upload" ? {} : await request.json().catch(()=>({}));

      const transactionForAdmin = async (reference) => {
        const rows = await dbGet("transactions", "reference=eq." + encodeURIComponent(reference) + "&select=id,reference,customer_id,status,archived_at&limit=1");
        if (!rows.length) throw new Error("Transaction not found");
        return rows[0];
      };
      const saveBytes = async (transaction, image, source, meta, actorId) => {
        const key = "transactions/" + transaction.id + "/" + crypto.randomUUID() + "." + image.ext;
        await env.TRANSACTION_EVIDENCE.put(key, image.bytes, { httpMetadata: { contentType: image.mime, cacheControl: "private, no-store" } });
        try {
          const row = await dbInsert("transaction_images", {
            transaction_id: transaction.id,
            transaction_reference: transaction.reference,
            customer_id: transaction.customer_id,
            storage_key: key,
            original_filename: safeName(meta.filename),
            mime_type: image.mime,
            file_size: image.bytes.byteLength,
            source,
            chatwoot_conversation_id: meta.conversation_id || null,
            chatwoot_message_id: meta.message_id || null,
            chatwoot_attachment_id: meta.attachment_id || null,
            uploaded_by: actorId || null,
            description: meta.description || null
          });
          return { id: row.id, filename: row.original_filename, mime_type: row.mime_type, file_size: row.file_size, source: row.source, created_at: row.created_at };
        } catch (e) {
          await env.TRANSACTION_EVIDENCE.delete(key);
          throw e;
        }
      };

      if (path === "/admin/images/upload") {
        if (!isAdmin) return respond({ error: "Admin access denied" }, 403);
        const reference = request.headers.get("X-Transaction-Reference") || "";
        const filenameHeader = request.headers.get("X-File-Name") || "admin-evidence";
        let filename = "admin-evidence";
        try { filename = decodeURIComponent(filenameHeader); } catch (_) { filename = filenameHeader; }
        const transaction = await transactionForAdmin(reference);
        if (transaction.archived_at) return respond({ error: "Restore this transaction before adding evidence" }, 409);
        const image = await readImage(request);
        const saved = await saveBytes(transaction, image, "admin_upload", { filename }, user.id);
        return respond({ ok: true, image: saved }, 201);
      }

      if (path === "/admin/images/list") {
        if (!isAdmin) return respond({ error: "Admin access denied" }, 403);
        const transaction = await transactionForAdmin(body.reference);
        const rows = await dbGet("transaction_images", "transaction_id=eq." + encodeURIComponent(transaction.id) + "&deleted_at=is.null&select=id,original_filename,mime_type,file_size,source,created_at&order=created_at.desc");
        return respond({ ok: true, images: rows });
      }

      if (path === "/customer/transactions/images/list") {
        if (isAdmin) { /* admins may also inspect only through the admin route */ }
        const rows = await dbGet("transactions", "reference=eq." + encodeURIComponent(body.reference) + "&customer_id=eq." + encodeURIComponent(user.id) + "&status=eq.VT-DONE&archived_at=is.null&select=id,reference&limit=1");
        if (!rows.length) return respond({ error: "Transaction evidence is available only for your completed transactions" }, 404);
        const images = await dbGet("transaction_images", "transaction_id=eq." + encodeURIComponent(rows[0].id) + "&customer_id=eq." + encodeURIComponent(user.id) + "&deleted_at=is.null&select=id,original_filename,mime_type,created_at&order=created_at.desc");
        return respond({ ok: true, images });
      }

      if (path === "/images/view") {
        const imageRows = await dbGet("transaction_images", "id=eq." + encodeURIComponent(body.image_id) + "&deleted_at=is.null&select=id,storage_key,customer_id,transaction_id,transaction_reference&limit=1");
        if (!imageRows.length) return respond({ error: "Image not found" }, 404);
        const record = imageRows[0];
        if (!isAdmin) {
          const tx = await dbGet("transactions", "id=eq." + encodeURIComponent(record.transaction_id) + "&customer_id=eq." + encodeURIComponent(user.id) + "&status=eq.VT-DONE&archived_at=is.null&select=id&limit=1");
          if (!tx.length || record.customer_id !== user.id) return respond({ error: "Access denied" }, 403);
        }
        const object = await env.TRANSACTION_EVIDENCE.get(record.storage_key);
        if (!object) return respond({ error: "Image file is missing" }, 404);
        const h = new Headers(cors);
        h.set("Content-Type", object.httpMetadata && object.httpMetadata.contentType || "application/octet-stream");
        h.set("Cache-Control", "private, no-store");
        h.set("Content-Disposition", "inline; filename=\"" + safeName(record.original_filename || "evidence") + "\"");
        return new Response(object.body, { headers: h });
      }

      return respond({ error: "Not found" }, 404);
    } catch (error) {
      return respond({ error: error.message || "Unexpected evidence API error" }, 400);
    }
  }
};
