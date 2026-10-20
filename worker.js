// VersusTrade rates Worker
// - GET  /rates     -> public JSON the website reads
// - POST /telegram  -> Telegram webhook; only allowed Telegram user IDs can change rates
//
// Bindings and secrets (see README.md):
//   RATES (KV namespace), BOT_TOKEN, WEBHOOK_SECRET, ALLOWED_IDS, ALLOWED_ORIGIN (plain var)

const STD_TTL_MS = 6 * 60 * 60 * 1000; // re-fetch the standard rate at most every 6 hours
const DEFAULTS = { mode: 'fixed', buy: 1300, sell: 1450, buyMargin: 75, sellMargin: 75, updated: null };

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = env.ALLOWED_ORIGIN || '*';

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET',
        'access-control-max-age': '86400',
      } });
    }
    if (url.pathname === '/rates' && req.method === 'GET') {
      return new Response(JSON.stringify(await currentRates(env)), { headers: {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': origin,
        'cache-control': 'public, max-age=30',
      } });
    }
    if (url.pathname === '/telegram' && req.method === 'POST') return handleTelegram(req, env);
    return new Response('VersusTrade rates OK');
  },
};

async function loadConfig(env) {
  return { ...DEFAULTS, ...((await env.RATES.get('config', 'json')) || {}) };
}

async function getStandard(env) {
  const cached = await env.RATES.get('std', 'json');
  if (cached && Date.now() - cached.t < STD_TTL_MS) return cached.n;
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    const d = await r.json();
    const n = d && d.rates && d.rates.NGN;
    if (n > 0) {
      await env.RATES.put('std', JSON.stringify({ n, t: Date.now() }));
      return n;
    }
  } catch (e) {}
  return cached ? cached.n : null; // stale is better than nothing
}

async function currentRates(env) {
  const cfg = await loadConfig(env);
  const standard = cfg.mode === 'live' ? await getStandard(env) : null;
  const live = cfg.mode === 'live' && standard > 0;
  return {
    mode: cfg.mode,
    buy: live ? Math.round(standard - cfg.buyMargin) : cfg.buy,
    sell: live ? Math.round(standard + cfg.sellMargin) : cfg.sell,
    standard: live ? Math.round(standard * 100) / 100 : null,
    buyMargin: cfg.buyMargin,
    sellMargin: cfg.sellMargin,
    updated: cfg.updated,
  };
}

const n0 = (x) => Math.round(x).toLocaleString('en-US');

function describe(r) {
  return r.standard
    ? `Mode: LIVE\nStandard rate: ₦${n0(r.standard)}\nBUY: ₦${n0(r.buy)} (standard − ₦${n0(r.buyMargin)})\nSELL: ₦${n0(r.sell)} (standard + ₦${n0(r.sellMargin)})`
    : `Mode: FIXED\nBUY: ₦${n0(r.buy)}\nSELL: ₦${n0(r.sell)}` + (r.mode === 'live' ? '\n(Live mode is on but the standard rate is unavailable, so fixed rates are showing.)' : '');
}

const HELP = [
  'Commands:',
  '/rates 1300 1450 – set fixed BUY and SELL',
  '/margin 75 75 – follow the live standard rate: BUY = standard − 75, SELL = standard + 75',
  '/margin 75 – same margin for both',
  '/live – switch back to live mode with the saved margins',
  '/status – show what the website is showing now',
].join('\n');

async function reply(env, chat, text) {
  await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text }),
  });
}

async function handleTelegram(req, env) {
  if (req.headers.get('x-telegram-bot-api-secret-token') !== env.WEBHOOK_SECRET) {
    return new Response('forbidden', { status: 403 });
  }
  const ok = new Response('ok');
  let update;
  try { update = await req.json(); } catch (e) { return ok; }
  const msg = update.message;
  if (!msg || !msg.text || !msg.from) return ok;

  const uid = String(msg.from.id), chat = msg.chat.id;
  const allowed = (env.ALLOWED_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!allowed.includes(uid)) {
    await reply(env, chat, `Not authorized. Your Telegram ID is ${uid}.`);
    return ok;
  }

  const parts = msg.text.trim().split(/\s+/);
  const cmd = parts[0].split('@')[0].toLowerCase();
  const nums = parts.slice(1).map((a) => Number(a.replace(/,/g, '')));
  const good = (list) => list.length > 0 && list.every((x) => Number.isFinite(x));
  const cfg = await loadConfig(env);
  const save = async () => { cfg.updated = new Date().toISOString(); await env.RATES.put('config', JSON.stringify(cfg)); };

  if (cmd === '/rates') {
    if (nums.length !== 2 || !good(nums) || nums.some((x) => x <= 0 || x > 1e7)) {
      await reply(env, chat, 'Use: /rates BUY SELL\nExample: /rates 1300 1450');
      return ok;
    }
    cfg.mode = 'fixed'; cfg.buy = nums[0]; cfg.sell = nums[1];
    await save();
    await reply(env, chat, 'Updated.\n' + describe(await currentRates(env)));
  } else if (cmd === '/margin') {
    if (!(nums.length === 1 || nums.length === 2) || !good(nums) || nums.some((x) => x < 0 || x > 1e6)) {
      await reply(env, chat, 'Use: /margin BUY SELL\nExample: /margin 75 75');
      return ok;
    }
    cfg.mode = 'live'; cfg.buyMargin = nums[0]; cfg.sellMargin = nums.length === 2 ? nums[1] : nums[0];
    await save();
    await reply(env, chat, 'Updated.\n' + describe(await currentRates(env)));
  } else if (cmd === '/live') {
    cfg.mode = 'live';
    await save();
    await reply(env, chat, 'Live mode on.\n' + describe(await currentRates(env)));
  } else if (cmd === '/status') {
    await reply(env, chat, describe(await currentRates(env)));
  } else {
    await reply(env, chat, HELP);
  }
  return ok;
}
