# VersusTrade rates bot:




## Notes
- The Worker fetches the standard rate from open.er-api.com itself and caches it for 6 hours, so visitors never hit that service. Keep the "Rates By Exchange Rate API" credit on the page.
- Keep the bot token and webhook secret private. If either leaks, regenerate the token in @BotFather and run `wrangler secret put` again.
- Check Cloudflare's current free-plan limits before launch.
