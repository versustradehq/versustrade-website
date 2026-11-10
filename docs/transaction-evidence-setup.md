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
4. Set Worker secrets/vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CHATWOOT_API_TOKEN`, `CHATWOOT_ACCOUNT_ID`; optionally `CHATWOOT_BASE_URL`.
5. Verify the actual Chatwoot API message/attachment payload and attachment download authentication before enabling chat import in production.

## API
All POST requests use `Authorization: Bearer <Supabase access token>`.
- `/admin/images/chat/list` — recent image attachments from the selected customer's currently linked Chatwoot conversation.
- `/admin/images/chat/import` — re-verifies the attachment belongs to that customer's linked conversation, downloads it, and copies it to R2.
- `/admin/images/upload` — multipart upload is not used; this route accepts a JSON request only in this first cut and will be extended with a raw image body and transaction reference header before UI integration.
- `/admin/images/list` — list evidence metadata for an admin-selected transaction.
- `/customer/transactions/images/list` — list evidence for the customer's own completed transaction.
- `/images/view` — authenticated image stream (fetch with Bearer token and display as a blob URL).

The first implementation slice intentionally does not make R2 objects public and does not delete original Chatwoot attachments.
