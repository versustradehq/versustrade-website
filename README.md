# VersusTrade rates bot: setup (about 15 minutes)

You change the website's BUY and SELL rates by messaging a Telegram bot.

## Commands (only your allowed Telegram IDs can use them)
- `/rates 1300 1450`: fixed BUY and SELL
- `/margin 75 75`: follow the live standard USD/NGN rate (BUY = standard − 75, SELL = standard + 75)
- `/live`: back to live mode with the saved margins
- `/status`: what the website shows now

## Steps
1. **Create the bot.** In Telegram, open @BotFather, send `/newbot`, follow the prompts, and copy the bot token.
2. **Cloudflare + Wrangler.** Make a free Cloudflare account. Install Node.js, then:
   `npm install -g wrangler` and `wrangler login`
3. **Storage.** In this folder run `wrangler kv namespace create RATES` (older Wrangler versions use `wrangler kv:namespace create RATES`). Copy the `id` it prints into `wrangler.toml`.
4. **Your site address.** In `wrangler.toml`, set `ALLOWED_ORIGIN` to your site, for example `https://versustrade.com`.
5. **Secrets.** Run these one at a time; each asks you to paste the value:
   - `wrangler secret put BOT_TOKEN` (the token from step 1)
   - `wrangler secret put WEBHOOK_SECRET` (make up a long random string using letters, numbers, `_` or `-`)
   - `wrangler secret put ALLOWED_IDS` (type `0` for now; you'll replace it in step 8)
6. **Deploy.** `wrangler deploy`. It prints your Worker address, like `https://versustrade-rates.<your-name>.workers.dev`.
7. **Connect Telegram to the Worker.** Open this in a browser (fill in your values):
   `https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<WORKER_ADDRESS>/telegram&secret_token=<WEBHOOK_SECRET>`
   You should see `"ok":true`.
8. **Allow yourself.** Message your bot. It replies "Not authorized. Your Telegram ID is 123456789." Run `wrangler secret put ALLOWED_IDS` again with that number. For several people, separate IDs with commas: `123456789,987654321`.
9. **Point the website at it.** In `index.html`, replace the `RATES_URL` value (search for `YOUR-SUBDOMAIN`) with `<WORKER_ADDRESS>/rates`.

Send `/status` to the bot. If it answers, the setup works.

## Notes
- The Worker fetches the standard rate from open.er-api.com itself and caches it for 6 hours, so visitors never hit that service. Keep the "Rates By Exchange Rate API" credit on the page.
- Keep the bot token and webhook secret private. If either leaks, regenerate the token in @BotFather and run `wrangler secret put` again.
- Check Cloudflare's current free-plan limits before launch.
