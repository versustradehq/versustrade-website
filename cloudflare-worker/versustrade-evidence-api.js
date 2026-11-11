const ALLOWED_ORIGINS = new Set(["https://versustrade.co", "https://www.versustrade.co"]);
function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.has(origin) ||
    /^https:\/\/[a-z0-9-]+\.versustrade-website\.pages\.dev$/i.test(origin);
}
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

async function cleanupCopiedChatUploads(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Cleanup configuration is incomplete");
  }
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json"
  };
  const query = "source=eq.customer_chat&created_at=lt." + encodeURIComponent(cutoff) +
    "&description=not.is.null&select=id,description&limit=500";
  const rowsRes = await fetch(env.SUPABASE_URL + "/rest/v1/transaction_images?" + query, { headers });
  if (!rowsRes.ok) throw new Error("Could not retrieve eligible chat evidence records (" + rowsRes.status + ")");
  const rows = await rowsRes.json();
  let deleted = 0;
  let skipped = 0;
  for (const row of rows) {
    let marker;
    try { marker = JSON.parse(row.description || ""); } catch (_) { skipped++; continue; }
    const key = String(marker && marker.cleanup_source === "chat-uploads" ? marker.source_key || "" : "");
    if (!/^[0-9a-f-]{36}\\/[A-Za-z0-9._/-]+$/i.test(key) ||
        key.split("/").some(part => !part || part === "." || part === "..") ||
        key.includes("\\\\") || key.length > 500) { skipped++; continue; }
    const objectPath = key.split("/").map(encodeURIComponent).join("/");
    const deleteRes = await fetch(env.SUPABASE_URL + "/storage/v1/object/chat-uploads/" + objectPath, {
      method: "DELETE",
      headers
    });
    if (!deleteRes.ok) continue;
    const clearRes = await fetch(env.SUPABASE_URL + "/rest/v1/transaction_images?id=eq." +
      encodeURIComponent(row.id), {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ description: null })
    });
    if (clearRes.ok) deleted++;
  }
  return { eligible: rows.length, deleted, skipped };
}

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(cleanupCopiedChatUploads(env));
  },
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = isAllowedOrigin(origin) ? {
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
            description: source === "customer_chat" && meta.source_key ? JSON.stringify({ cleanup_source: "chat-uploads", source_key: meta.source_key }) : (meta.description || null)
          });
          return { id: row.id, filename: row.original_filename, mime_type: row.mime_type, file_size: row.file_size, source: row.source, created_at: row.created_at };
        } catch (e) {
          await env.TRANSACTION_EVIDENCE.delete(key);
          throw e;
        }
      };

      const chatImageAt = async (customerId, imageKey) => {
        if (!/^[0-9a-f-]{36}$/i.test(String(customerId || ""))) throw new Error("Invalid customer");
        const key = String(imageKey || "");
        if (!key || key.length > 500 || key.startsWith("/") || key.includes("\\") || key.split("/").some(part => !part || part === "." || part === "..") || !key.startsWith(customerId + "/")) throw new Error("Invalid customer image");
        const objectPath = key.split("/").map(encodeURIComponent).join("/");
        const response = await fetch(env.SUPABASE_URL + "/storage/v1/object/chat-uploads/" + objectPath, {
          headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY }
        });
        if (!response.ok) throw new Error("The stored chat image is no longer available (" + response.status + ")");
        const headerType = (response.headers.get("Content-Type") || "").split(";")[0].toLowerCase();
        const ext = key.split("/").pop().toLowerCase().split(".").pop();
        const extensionType = ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" })[ext] || "";
        const type = MIME_EXT[headerType] ? headerType : extensionType;
        if (!MIME_EXT[type]) throw new Error("The chat attachment is not a supported image");
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (!bytes.length || bytes.length > MAX_BYTES || !isImage(bytes, type)) throw new Error("The chat attachment is invalid or exceeds the 10 MB limit");
        const filename = safeName(key.split("/").pop() || "chat-image." + MIME_EXT[type]);
        return { bytes, mime: type, ext: MIME_EXT[type], filename, key };
      };

      if (path === "/admin/chat-images/list") {
        if (!isAdmin) return respond({ error: "Admin access denied" }, 403);
        const customerId = String(body.customer_id || "");
        if (!/^[0-9a-f-]{36}$/i.test(customerId)) return respond({ error: "A valid customer is required" }, 400);
        const storageRes = await fetch(env.SUPABASE_URL + "/storage/v1/object/list/chat-uploads", {
          method: "POST",
          headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ prefix: customerId + "/", limit: 100, offset: 0, sortBy: { column: "created_at", order: "desc" } })
        });
        if (!storageRes.ok) throw new Error("Could not list customer chat uploads (" + storageRes.status + ")");
        const objects = await storageRes.json();
        const images = (Array.isArray(objects) ? objects : []).filter(x => {
          if (!x || !x.name || x.name.startsWith(".")) return false;
          const metadata = x.metadata || {};
          const mime = String(metadata.mimetype || metadata.contentType || metadata.content_type || "").split(";")[0].toLowerCase();
          const ext = x.name.toLowerCase().split(".").pop();
          return !!MIME_EXT[mime] || ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
        }).map(x => ({ key: customerId + "/" + x.name, filename: safeName(x.name), created_at: x.created_at || x.updated_at || null, file_size: Number(x.metadata && x.metadata.size || 0) }))
          .sort((a,b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
        return respond({ ok: true, images });
      }

      if (path === "/admin/chat-images/view") {
        if (!isAdmin) return respond({ error: "Admin access denied" }, 403);
        const image = await chatImageAt(body.customer_id, body.image_key);
        return new Response(image.bytes, { headers: { ...cors, "Content-Type": image.mime, "Cache-Control": "private, no-store", "Content-Disposition": "inline; filename=\"" + image.filename + "\"" } });
      }

      if (path === "/admin/chat-images/attach") {
        if (!isAdmin) return respond({ error: "Admin access denied" }, 403);
        const transaction = await transactionForAdmin(body.reference);
        if (transaction.archived_at) return respond({ error: "Restore this transaction before adding evidence" }, 409);
        if (transaction.customer_id !== body.customer_id) return respond({ error: "This image does not belong to the selected transaction customer" }, 403);
        const image = await chatImageAt(body.customer_id, body.image_key);
        const saved = await saveBytes(transaction, image, "customer_chat", { filename: image.filename, source_key: image.key }, user.id);
        return respond({ ok: true, image: saved }, 201);
      }

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
