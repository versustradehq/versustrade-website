// VersusTrade rates Worker
// GET /rates -> public BUY and SELL rates used by the website.
// POST /telegram -> optional Telegram rate updates.

const DEFAULTS = { buy: 1300, sell: 1450, updated: null };

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const allowedOrigins = (env.ALLOWED_ORIGIN || '').split(',').map((value) => value.trim()).filter(Boolean);
    const requestOrigin = req.headers.get('Origin');
    const origin = allowedOrigins.includes(requestOrigin) ? requestOrigin : (allowedOrigins[0] || 'https://versustrade.co');

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
        'cache-control': 'no-store',
      } });
    }
    if (url.pathname === '/telegram' && req.method === 'POST') return handleTelegram(req, env);
    return new Response('VersusTrade rates OK');
  },
};

async function loadConfig(env) {
  return { ...DEFAULTS, ...((await env.RATES.get('config', 'json')) || {}) };
}

async function currentRates(env) {
  const cfg = await loadConfig(env);
  return {
    buy: Number(cfg.buy) > 0 ? Number(cfg.buy) : DEFAULTS.buy,
    sell: Number(cfg.sell) > 0 ? Number(cfg.sell) : DEFAULTS.sell,
    updated: cfg.updated || null,
  };
}

const n0 = (x) => Math.round(x).toLocaleString('en-US');
function describe(r) {
  return `BUY: ₦${n0(r.buy)}\nSELL: ₦${n0(r.sell)}`;
}
const HELP = [
  'Commands:',
  '/rates 1300 1450 – set BUY and SELL rates',
  '/status – show the rates currently displayed on the website',
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
  const save = async () => {
    cfg.updated = new Date().toISOString();
    await env.RATES.put('config', JSON.stringify({ buy: cfg.buy, sell: cfg.sell, updated: cfg.updated }));
  };

  if (cmd === '/rates') {
    if (nums.length !== 2 || !good(nums) || nums.some((x) => x <= 0 || x > 1e7)) {
      await reply(env, chat, 'Use: /rates BUY SELL\nExample: /rates 1800 1900');
      return ok;
    }
    cfg.buy = nums[0];
    cfg.sell = nums[1];
    await save();
    await reply(env, chat, 'Updated.\n' + describe(await currentRates(env)));
  } else if (cmd === '/status') {
    await reply(env, chat, describe(await currentRates(env)));
  } else {
    await reply(env, chat, HELP);
  }
  return ok;
}
