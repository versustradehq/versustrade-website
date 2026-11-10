# Permanent transaction evidence

## Components
- Supabase migration: `supabase/migrations/202611100001_transaction_images.sql`
- Cloudflare Worker: `cloudflare-worker/versustrade-evidence-api.js`
- Worker config: `cloudflare-worker/wrangler-evidence.toml`

The R2 bucket is private. The Worker streams images only after verifying the Supabase session and either customer ownership of a completed transaction or admin membership in `admin_users`.

## Required setup (not performed by this repository change)
1. Create a **private** R2 bucket named `versustrade-transaction-evidence` (or change the Wrangler bucket name).
2. Apply the SQL migration in Supabase.
3. Deploy from `cloudflare-worker` with the evidence Wrangler config.
4. Set Worker configuration: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Bind the private R2 bucket as `TRANSACTION_EVIDENCE`.
5. Staff download the relevant image from the existing Chatwoot conversation and upload it through the admin transaction detail panel. No Chatwoot API token or paid Chatwoot API access is required.

## API
All POST requests use `Authorization: Bearer <Supabase access token>`.
- `/admin/images/upload` — raw image body with the image MIME type in `Content-Type`, transaction reference in `X-Transaction-Reference`, and filename in `X-File-Name`. Staff use this endpoint after downloading the image from Chatwoot.
- `/admin/images/list` — list evidence metadata for an admin-selected transaction.
- `/customer/transactions/images/list` — list evidence for the customer's own completed transaction.
- `/images/view` — authenticated image stream (fetch with Bearer token and display as a blob URL).

The first implementation slice intentionally does not make R2 objects public and does not delete original Chatwoot attachments.
