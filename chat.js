/* VersusTrade chat widget. One file shared by the website and the dashboard.
   Upload it to the root of the site (https://your-domain/chat.js). Needs window.VTAuth on the page (the website's login script, or the dashboard's). */
(function () {
  var css = "/* ===== VersusTrade chat (front end) ===== */\n.vc{padding:0;margin:0;position:fixed;right:20px;bottom:calc(92px + env(safe-area-inset-bottom,0px));z-index:130;width:380px;max-width:calc(100vw - 24px);height:min(680px,calc(100dvh - 120px));display:flex;flex-direction:column;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:30px;box-shadow:0 30px 80px -20px rgba(0,0,0,.35),0 8px 24px -10px rgba(0,0,0,.2);overflow:hidden;font-family:var(--font);font-size:14px;line-height:1.45;opacity:0;transform:translateY(16px) scale(.97);transform-origin:100% 100%;visibility:hidden;pointer-events:none;transition:opacity .25s,transform .35s cubic-bezier(.22,1,.36,1),visibility 0s .35s}\n.vc[data-open]{opacity:1;transform:none;visibility:visible;pointer-events:auto;transition-delay:0s}\n.vc *{box-sizing:border-box}\n.vc button{font-family:inherit}\n.vc :focus-visible{outline:2px solid var(--red);outline-offset:2px}\n.vc-v{display:none;flex:1;min-height:0;flex-direction:column}\n.vc[data-view=\"home\"] .vc-home,.vc[data-view=\"messages\"] .vc-msgs,.vc[data-view=\"tickets\"] .vc-tix,.vc[data-view=\"chat\"] .vc-chat{display:flex}\n.vc-x,.vc-back{width:36px;height:36px;flex:none;display:grid;place-items:center;border:0;border-radius:50%;background:none;color:inherit;cursor:pointer;transition:background .2s}\n.vc-x:hover,.vc-back:hover{background:rgba(127,127,127,.16)}\n.vc-x svg,.vc-back svg{width:20px;height:20px}\n/* avatars */\n.vc-avs{display:inline-flex;flex:none}\n.vc-av{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;border:2px solid #fff;background:#FFE4E6;color:var(--red)}\n.vc-av+.vc-av{margin-left:-10px}\n.vc-av:nth-child(2){background:#FFD0D5}\n.vc-av:nth-child(3){background:#FFBDC4}\n.vc-av svg{width:18px;height:18px}\n/* home */\n.vc-home{background:linear-gradient(180deg,#FF4654 0,#F0384A 190px,color-mix(in oklch,#F0384A 22%,var(--bg)) 300px,var(--bg) 380px);color:#fff;overflow-y:auto}\n.vc-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 12px 0 22px}\n.vc-brand{font-size:21px;font-weight:800;letter-spacing:-.02em}\n.vc-top .vc-avs{margin-left:auto}\n.vc-hi{margin:46px 22px 22px;font-size:30px;line-height:1.15;font-weight:800;letter-spacing:-.02em}\n.vc-wave{display:inline-block;transform-origin:70% 70%;animation:vcWave 2.2s ease-in-out 1}\n.vc-card{display:flex;align-items:center;justify-content:space-between;gap:12px;width:calc(100% - 32px);margin:0 16px 10px;padding:18px 20px;border:0;border-radius:16px;background:var(--bg);color:var(--text);font-size:15px;font-weight:600;text-align:left;text-decoration:none;cursor:pointer;box-shadow:0 8px 24px -10px rgba(0,0,0,.3);transition:transform .2s}\n.vc-card:hover{transform:translateY(-1px)}\n.vc-card svg{width:20px;height:20px;flex:none;color:var(--text)}\n.vc-card .wa{color:#25D366}\n/* white bars (messages + chat) */\n.vc-bar{display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid var(--line);background:var(--bg)}\n.vc-bt{flex:1;text-align:center;font-size:17px;font-weight:700;padding-left:36px}\n.vc-bar .vc-av{border-color:var(--bg)}\n.vc-pfp{display:block;width:42px;height:42px;flex:none;border-radius:50%;overflow:hidden}\n.vc-pfp svg{display:block;width:100%;height:100%}\n.vc-pfp .vc-av{width:100%;height:100%;border:0}\n.vc-li .vc-pfp{width:40px;height:40px}\n.vc-who2{flex:1;min-width:0}\n.vc-who2 b{display:block;font-size:16px}\n.vc-who2 span{display:flex;align-items:center;gap:5px;font-size:13px;color:var(--muted)}\n.vc-who2 svg{width:14px;height:14px;flex:none}\n.vc[data-mode=\"agent\"] .vc-who2 svg{color:#2FB868}\n.vc[data-mode=\"pending\"] .vc-who2 svg{color:#E8A317}\n/* messages tab */\n.vc-mbody{flex:1;overflow-y:auto;display:flex;flex-direction:column}\n.vc-recent{flex-direction:column;align-items:stretch;gap:12px}\n.vc-rec-h{font-size:15px;font-weight:700}\n.vc-rrow{display:flex;align-items:center;gap:12px;min-width:0;font-weight:400}\n.vc-rrow .vc-pfp,.vc-rrow .vc-av{width:40px;height:40px;flex:none}\n.vc-rt{flex:1;min-width:0}\n.vc-rt b{display:block;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.vc-rt span{display:block;color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.vc-ago{flex:none;color:var(--muted);font-size:13px;font-weight:400}\n.vc-tk{border-bottom:1px solid var(--line)}\n.vc-tk .vc-li{border-bottom:0}\n.vc-tkic{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:50%;background:var(--soft);color:var(--muted)}\n.vc-tkic svg{width:20px;height:20px}\n.vc-tx{display:none;padding:0 16px 14px 68px}\n.vc-tk[data-open] .vc-tx{display:block}\n.vc-tl{margin:0 0 6px;font-size:13px;line-height:1.45;white-space:pre-wrap;word-break:break-word}\n.vc-tl i{font-style:normal;font-weight:700;color:var(--muted)}\n.vc-empty{margin:auto;padding:24px;text-align:center}\n.vc-empty svg{width:46px;height:46px;margin-bottom:12px}\n.vc-empty b{display:block;font-size:20px;margin-bottom:8px}\n.vc-empty p{margin:0;color:var(--muted)}\n.vc-li{display:flex;align-items:center;gap:12px;width:100%;padding:14px 16px;border:0;border-bottom:1px solid var(--line);background:none;color:inherit;text-align:left;cursor:pointer}\n.vc-li:hover{background:var(--soft)}\n.vc-li .vc-av{width:40px;height:40px;border-color:var(--bg)}\n.vc-li-t{flex:1;min-width:0}\n.vc-li-t b{display:flex;align-items:center;gap:6px;font-size:14px}\n.vc-li-t span{display:block;color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.vc-dot{width:9px;height:9px;border-radius:50%;background:var(--red);flex:none}\n.vc-pill{align-self:center;display:inline-flex;align-items:center;gap:10px;margin:14px 0 16px;padding:13px 22px;border:0;border-radius:14px;background:var(--red);color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px -8px rgba(225,29,46,.6);transition:background .2s}\n.vc-pill:hover{background:var(--red-dark)}\n.vc-pill svg{width:18px;height:18px}\n.vc .vc-pill{color:#fff;background:linear-gradient(145deg,rgba(88,88,96,.88) 0%,rgba(38,38,44,.9) 100%);border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 30px -10px rgba(0,0,0,.5),inset 0 1px 1px rgba(255,255,255,.28),inset 0 -1px 2px rgba(0,0,0,.3);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);transition:all .4s cubic-bezier(.16,1,.3,1)}\n.vc .vc-pill:hover{background:linear-gradient(145deg,rgba(104,104,112,.9) 0%,rgba(48,48,54,.92) 100%);border-color:rgba(255,255,255,.3)}\n/* conversation */\n.vc-log{flex:1;overflow-y:auto;padding:14px 14px 8px;display:flex;flex-direction:column;gap:12px;overscroll-behavior:contain}\n.vc-intro{margin:6px 0 4px;text-align:center;color:var(--muted)}\n.vc-row{display:flex;flex-direction:column;max-width:88%;align-items:flex-start}\n.vc-row.user{align-self:flex-end;align-items:flex-end}\n.vc-who{display:flex;align-items:center;gap:6px;margin:0 4px 3px;font-size:11px;color:var(--muted)}\n.vc-tag{padding:1px 7px;border-radius:999px;background:var(--pill);font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}\n.vc-row.agent .vc-tag{background:var(--red-tint);color:var(--red)}\n.vc-b{padding:11px 15px;border-radius:22px;background:var(--pill);white-space:pre-wrap;overflow-wrap:anywhere}\n.vc-row.bot .vc-b,.vc-row.agent .vc-b{border-bottom-left-radius:8px}\n.vc-row.agent .vc-b{background:var(--red-tint)}\n.vc-row.user .vc-b{background:#434650;color:#fff;border-bottom-right-radius:8px}\n.vc-rate{display:flex;gap:2px;padding:4px 2px 2px}\n.vc-star{background:none;border:0;padding:0 3px;font-size:28px;line-height:1;cursor:pointer;color:var(--muted);opacity:.5}\n.vc-star.on,.vc-star:hover{color:#F5A623;opacity:1}\n.vc-star:disabled{cursor:default}\n.vc-sys{align-self:center;max-width:92%;padding:4px 11px;border-radius:999px;background:var(--pill);font-size:12px;color:var(--muted);text-align:center}\n.vc-acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n.vc-act{display:inline-flex;align-items:center;padding:7px 13px;border-radius:999px;border:1px solid var(--line);background:var(--bg);color:var(--text);font-size:13px;font-weight:600;text-decoration:none;cursor:pointer;transition:border-color .2s}\n.vc-act:hover{border-color:var(--red)}\n.vc-act.primary{background:var(--red);border-color:var(--red);color:#fff}\n.vc-act.primary:hover{background:var(--red-dark)}\n.vc-trade{min-width:230px;text-align:left}\n.vc-trade-h{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-weight:700}\n.vc-side{padding:2px 9px;border-radius:999px;background:rgba(255,255,255,.22);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}\n.vc-trade dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:3px 14px;font-size:13px}\n.vc-trade dt{opacity:.8}\n.vc-trade dd{margin:0;text-align:right;font-weight:600}\n.vc-typing{display:inline-flex;gap:4px;padding:13px 14px}\n.vc-typing span{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:vcDot 1s infinite ease-in-out}\n.vc-typing span:nth-child(2){animation-delay:.15s}\n.vc-typing span:nth-child(3){animation-delay:.3s}\n.vc-chips{display:flex;flex-wrap:wrap;gap:6px;padding:4px 14px 10px}\n.vc-chips::-webkit-scrollbar{display:none}\n.vc-chips:empty{display:none}\n.vc-chip{flex:none;padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:var(--bg);color:var(--text);font-size:13px;cursor:pointer;transition:border-color .2s}\n.vc-chip:hover{border-color:var(--red)}\n.vc-comp{margin:0 14px;padding:10px 10px 10px 16px;border:1px solid var(--line);border-radius:26px;background:var(--bg);transition:border-color .2s}\n.vc-comp:focus-within{border-color:var(--red)}\n.vc .vc-in,.vc .vc-in:focus,.vc .vc-in:focus-visible{outline:none;box-shadow:none;border:0;background:transparent;border-radius:0}\n.vc-in{display:block;width:100%;min-height:42px;max-height:112px;padding:6px 0;border:0;background:transparent;color:var(--text);font:inherit;font-size:16px;resize:none;outline:none}\n.vc-crow{display:flex;align-items:center;justify-content:space-between}\n.vc-attach{width:36px;height:36px;display:grid;place-items:center;border-radius:50%;color:var(--muted);cursor:pointer;transition:background .2s}\n.vc-attach:hover{background:var(--pill)}\n.vc-attach svg{width:20px;height:20px}\n.vc-send{width:42px;height:42px;flex:none;display:grid;place-items:center;border:0;border-radius:50%;background:var(--red);color:#fff;cursor:pointer;transition:background .2s,opacity .2s}\n.vc-send:hover{background:var(--red-dark)}\n.vc-send:disabled{background:var(--pill);color:var(--muted);cursor:default}\n.vc-send svg{width:20px;height:20px}\n.vc-end{display:none;margin:0 14px 12px;padding:16px 14px;border:1px solid var(--line);border-radius:20px;text-align:center;color:var(--muted);font-size:14px}\n.vc-end .vc-act{display:flex;margin:12px auto 0}\n.vc-note{margin:7px 14px 10px;text-align:center;font-size:11px;color:var(--muted)}\n.vc-chat{position:relative}\n.vc-attach{border:0;background:none}\nbutton.vc-attach[aria-expanded=\"true\"]{background:var(--pill);color:var(--text)}\n.vc-tools{display:flex;align-items:center;gap:2px}\n.vc-pop{margin:0 14px 8px;border:1px solid var(--line);border-radius:16px;background:var(--bg);max-height:218px;overflow-y:auto;padding:8px}\n.vc-pop[hidden]{display:none}\n.vc-eg{display:grid;grid-template-columns:repeat(8,1fr);gap:2px}\n.vc-em{height:36px;border:0;border-radius:9px;background:none;font-size:21px;line-height:1;cursor:pointer;transition:background .15s}\n.vc-em:hover{background:var(--pill)}\n.vc-b.vc-voice{padding:8px 10px}\n.vc-voice audio{display:block;width:210px;max-width:100%;height:36px}\n.vc-rec{display:none;align-items:center;gap:10px;min-height:42px}\n.vc-comp.rec .vc-in,.vc-comp.rec .vc-crow{display:none}\n.vc-comp.rec .vc-rec{display:flex}\n.vc-recdot{width:10px;height:10px;border-radius:50%;background:#D7141A;animation:vcPulse 1s infinite}\n.vc-rect{font-variant-numeric:tabular-nums;font-weight:700}\n.vc-recl{flex:1;color:var(--muted)}\n@keyframes vcPulse{50%{opacity:.3}}\n/* tab bar */\n.vc-tabs{display:none;border-top:1px solid var(--line);background:var(--bg)}\n.vc:not([data-view=\"chat\"]) .vc-tabs{display:flex}\n.vc-tabs button{position:relative;flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 0 12px;border:0;background:none;color:var(--muted);font-size:13px;font-weight:500;cursor:pointer;transition:color .2s}\n.vc-tabs button svg{width:26px;height:26px}\n.vc-tabs button[aria-current=\"page\"]{color:var(--text);font-weight:700}\n.vc-tabs button[aria-current=\"page\"] svg{fill:currentColor}\n.vc-tabs button[aria-current=\"page\"] .vc-tkn path+path{stroke:var(--bg)}\n.vc-badge{position:absolute;top:4px;left:calc(50% + 4px);min-width:19px;height:19px;padding:0 5px;border-radius:999px;background:#D7141A;color:#fff;font-size:11px;font-style:normal;font-weight:700;line-height:19px;text-align:center}\n.vc-badge[hidden]{display:none}\n/* launcher button */\n.fab svg.fab-x{display:none}\n.fab[data-open] svg.fab-chat{display:none}\n.fab[data-open] svg.fab-x{display:block}\n.fab-badge{position:absolute;top:-3px;right:-3px;min-width:21px;height:21px;padding:0 5px;border-radius:999px;background:#fff;color:var(--red);font-size:12px;font-weight:800;line-height:21px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.25)}\n.fab-badge[hidden]{display:none}\n@keyframes vcDot{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-4px);opacity:1}}\n@keyframes vcWave{0%,100%{transform:rotate(0)}20%{transform:rotate(16deg)}40%{transform:rotate(-8deg)}60%{transform:rotate(14deg)}80%{transform:rotate(-4deg)}}\n@media (max-width:560px){\n  .vc{inset:0;width:100%;max-width:none;height:100dvh;border-radius:0;border:0}\n  html.vc-lock{overflow:hidden}\n}\n@media (prefers-reduced-motion:reduce){.vc{transition:none}.vc-typing span,.vc-wave{animation:none}}\n";
  var st = document.createElement('style'); st.setAttribute('data-vt-chat', ''); st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();
/* VersusTrade chat: front end only (Home / Messages / Conversation).
   The "AI" and "representative" replies below are SIMULATED so the UI can be built and tested.
   To go live, replace the functions inside API (aiReply, requestHuman, agentReply) with real calls
   to your backend / LLM / live-chat service, and replace CHAT.isLoggedIn with your real session check. */
(function () {
  var CHAT = {
    whatsapp: '2349015508108',
    loginUrl: '/login/',
    simulate: true,
    api: 'https://versustrade-chat.versustradehq.workers.dev', // address of your chat API (see chat-api/README.md). Leave empty to use the built-in demo replies
    live: { base: 'https://app.chatwoot.com', inbox: 'giwQh1xyoth7swCP7MQxF3Fe' }, // real representatives through Chatwoot. Set to null to use the scripted demo
    newThreadAfterHours: 6, // a customer who comes back after this many quiet hours gets a new Chatwoot conversation (so the team is alerted again). 0 = always continue the same one
    debug: false, // shows a small "Debug:" line in the chat when the AI fails. Set to false when everything works
    isLoggedIn: function () { return !!(window.VTAuth && window.VTAuth.isLoggedIn()); }
  };
  var KEY = 'vt_chat_v3', WEEK = 7 * 24 * 3600 * 1000, MONTH = 30 * 24 * 3600 * 1000;
  var S = { open: false, view: 'home', mode: 'ai', msgs: [], agentReplied: false, unread: 0, closedAt: 0, uid: null, t0: 0, tix: [], tixAt: 0, tixConv: null };
  var sync = { ready: false, off: false, timer: 0 };
  function isCust(m) { return m.role === 'user' || m.role === 'trade' || m.role === 'summary'; }
  // a closed conversation stays readable (and can be rated) for 7 days, then the message box goes away
  function isEnded() { return !!S.closedAt && Date.now() - S.closedAt > WEEK; }
  function usable(st) { return !!(st && st.msgs && st.t && Date.now() - st.t < MONTH && (st.closedAt || Date.now() - st.t < WEEK)); }
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (usable(saved)) { S.msgs = saved.msgs; S.mode = (saved.mode === 'pending' && !CHAT.live) ? 'agent' : (saved.mode || 'ai'); S.agentReplied = !!saved.agentReplied; S.flow = saved.flow || null; S.closedAt = saved.closedAt || 0; S.uid = saved.uid || null; S.t0 = saved.t; S.tixAt = saved.tixAt || 0; S.tixConv = saved.tixConv || null; }
    else if (saved) localStorage.removeItem(KEY);
    if (saved && saved.tix) S.tix = saved.tix.filter(function (k) { return k && Date.now() - k.at < 180 * 24 * 3600 * 1000; });
  } catch (e) {}
  function snap() {
    return { msgs: S.msgs.slice(-60).map(function (m) { return m.kind === 'voice' ? { role: m.role, kind: m.kind, dur: m.dur, text: m.text } : m; }), mode: S.mode, agentReplied: S.agentReplied, flow: S.flow || null, closedAt: S.closedAt || 0, uid: S.uid || null,
      tix: S.tix, tixAt: Math.max(0, (S.tixAt || 0) - Math.max(0, S.msgs.length - 60)), tixConv: S.tixConv || null,
      cw: (CW && cw) ? { src: cw.src, conv: cw.conv, seen: cw.seen } : null, t: Date.now() };
  }
  function save() {
    var sn = snap(); S.t0 = sn.t;
    try { localStorage.setItem(KEY, JSON.stringify(sn)); } catch (e) {}
    pushRemote();
  }
  // logged-in customers: the chat is also kept in their account (table chat_state)
  function pushRemote() {
    if (!sync.ready || sync.off || !S.uid || !window.VTAuth || !window.VTAuth.rest) return;
    clearTimeout(sync.timer);
    sync.timer = setTimeout(function () {
      if (!S.uid || !(S.msgs.some(isCust) || S.tix.length)) return;
      window.VTAuth.rest('POST', '/chat_state?on_conflict=user_id', { user_id: S.uid, state: snap(), updated_at: new Date().toISOString() }, { Prefer: 'resolution=merge-duplicates,return=minimal' })
        .catch(function (err) { if (err && (err.status === 400 || err.status === 401 || err.status === 403 || err.status === 404)) sync.off = true; });
    }, 2000);
  }

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function svg(path, extra) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + path + '</svg>'; }
  var P = {
    bot: '<path d="M12 3v3M7 8h10a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z"/><circle cx="9" cy="13" r=".9" fill="currentColor"/><circle cx="15" cy="13" r=".9" fill="currentColor"/>',
    head: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M19 20c0 1-2 2-5 2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    sendArrow: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    clip: '<path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    home: '<path d="M4 11l8-7 8 7v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 15c1.7 1.3 4.3 1.3 6 0"/>',
    ticket: '<path d="M4 6h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4V7a1 1 0 0 1 1-1z"/><path d="M14 6v2M14 11v2M14 16v2"/>',
    chat: '<path d="M4 5h16v11H11l-4 4v-4H4z"/><path d="M8 9h8M8 12h5"/>',
    emoji: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14c.9 1.4 2.1 2 3.5 2s2.6-.6 3.5-2"/><circle cx="9" cy="10" r=".8" fill="currentColor"/><circle cx="15" cy="10" r=".8" fill="currentColor"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5"/>'
  };
  var EMOJIS = '\uD83D\uDE00 \uD83D\uDE03 \uD83D\uDE04 \uD83D\uDE01 \uD83D\uDE06 \uD83D\uDE05 \uD83D\uDE02 \uD83E\uDD23 \uD83D\uDE42 \uD83D\uDE09 \uD83D\uDE0A \uD83D\uDE0D \uD83E\uDD70 \uD83D\uDE18 \uD83D\uDE0E \uD83E\uDD29 \uD83E\uDD14 \uD83D\uDE10 \uD83D\uDE34 \uD83D\uDE22 \uD83D\uDE2D \uD83D\uDE21 \uD83E\uDD73 \uD83D\uDE4F \uD83D\uDC4D \uD83D\uDC4E \uD83D\uDC4C \u270C\uFE0F \uD83E\uDD1D \uD83D\uDC4F \uD83D\uDE4C \uD83D\uDCAA \uD83D\uDD25 \u2728 \uD83C\uDF89 \uD83D\uDCAF \u2764\uFE0F \uD83D\uDC99 \uD83D\uDC9A \uD83D\uDC9B \u2B50 \u2705 \u274C \u26A0\uFE0F \uD83D\uDCB0 \uD83D\uDCB5 \uD83D\uDCB8 \uD83D\uDCB3 \uD83C\uDFE6 \uD83D\uDCC8 \uD83D\uDCC9 \u20BF \uD83E\uDE99 \uD83C\uDF81 \uD83D\uDCF1 \uD83D\uDCAC \u23F3 \uD83D\uDE80'.split(' ');
  var WA = '<svg class="wa" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';
  var SENDI = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"/></svg>';
  var BETTY = '<svg viewBox="0 0 96 96" aria-hidden="true"><defs><linearGradient id="bty" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9A8A"/><stop offset="1" stop-color="#F0384A"/></linearGradient></defs><rect width="96" height="96" fill="url(#bty)"/><circle cx="48" cy="37" r="25" fill="#1F1A1B"/><path d="M13 96c2-21 18-31 35-31s33 10 35 31z" fill="#2B2F3E"/><path d="M39 67l9 14 9-14z" fill="#fff"/><rect x="42" y="55" width="12" height="15" rx="5" fill="#8F5B45"/><ellipse cx="48" cy="43" rx="15" ry="18" fill="#A86D52"/><path d="M32 38c1-13 11-18 16-18s15 5 16 18c-5-5-10-8-16-8s-11 3-16 8z" fill="#1F1A1B"/><circle cx="42.5" cy="44" r="1.9" fill="#2A1B16"/><circle cx="53.5" cy="44" r="1.9" fill="#2A1B16"/><path d="M43 51.5q5 4 10 0" fill="none" stroke="#5A2E22" stroke-width="1.8" stroke-linecap="round"/><path d="M30.5 42a17.5 17.5 0 0 1 35 0" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><rect x="26.5" y="40" width="6.5" height="13" rx="3.2" fill="#fff"/><rect x="63" y="40" width="6.5" height="13" rx="3.2" fill="#fff"/><path d="M31 52q0 12 12 12" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="45" cy="64" r="2.6" fill="#fff"/></svg>';
  var AVS = '<span class="vc-avs" aria-hidden="true"><span class="vc-av">' + svg(P.head) + '</span><span class="vc-av">' + svg(P.user) + '</span><span class="vc-av">' + svg(P.bot) + '</span></span>';

  /* ---------- DOM ---------- */
  var panel = el('div', 'vc');
  panel.id = 'vtChat'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'VersusTrade chat');
  panel.setAttribute('data-view', 'home'); panel.setAttribute('data-mode', S.mode);
  panel.innerHTML =
    '<div class="vc-v vc-home"><div class="vc-top"><span class="vc-brand">VersusTrade</span>' + AVS +
      '<button type="button" class="vc-x" data-act="close" aria-label="Close chat">' + svg(P.x) + '</button></div>' +
      '<h2 class="vc-hi">Hi <span id="vcHiName">there</span> <span class="vc-wave">\uD83D\uDC4B</span><br>How can we help?</h2>' +
      '<button type="button" class="vc-card vc-recent" id="vcRecent" data-act="chat" style="display:none"></button>' +
      '<button type="button" class="vc-card" data-act="new"><span>Send us a message</span>' + SENDI + '</button>' +
      '<a class="vc-card" id="vcWa" target="_blank" rel="noopener"><span>Chat on WhatsApp</span>' + WA + '</a></div>' +
    '<div class="vc-v vc-msgs"><div class="vc-bar"><span class="vc-bt">Messages</span><button type="button" class="vc-x" data-act="close" aria-label="Close chat">' + svg(P.x) + '</button></div>' +
      '<div class="vc-mbody" id="vcList"></div>' +
      '<button type="button" class="vc-pill" data-act="new"><span>Send us a message</span>' + SENDI + '</button></div>' +
    '<div class="vc-v vc-tix"><div class="vc-bar"><span class="vc-bt">Tickets</span><button type="button" class="vc-x" data-act="close" aria-label="Close chat">' + svg(P.x) + '</button></div>' +
      '<div class="vc-mbody" id="vcTix"></div></div>' +
    '<div class="vc-v vc-chat"><div class="vc-bar"><button type="button" class="vc-back" data-act="messages" aria-label="Back to messages">' + svg(P.back) + '</button><span class="vc-pfp" id="vcPfp"></span>' +
      '<div class="vc-who2"><b id="vcName">Betty</b><span>' + svg(P.clock) + '<span id="vcSub"></span></span></div>' +
      '<button type="button" class="vc-x" data-act="close" aria-label="Close chat">' + svg(P.x) + '</button></div>' +
      '<div class="vc-log" id="vcLog" role="log" aria-live="polite"><p class="vc-intro">Betty replies automatically. A team member can join any time.</p></div>' +
      '<div class="vc-chips" id="vcChips"></div>' +
      '<div class="vc-pop" id="vcPop" hidden></div>' +
      '<form class="vc-comp" id="vcForm" autocomplete="off"><textarea class="vc-in" id="vcIn" rows="1" maxlength="1000" placeholder="Message\u2026" aria-label="Message"></textarea>' +
      '<div class="vc-crow"><div class="vc-tools"><label class="vc-attach" title="Attach a file" aria-label="Attach a file">' + svg(P.clip) + '<input type="file" id="vcFile" accept="image/*,.pdf" hidden></label>' +
      '<button type="button" class="vc-attach" id="vcEmojiBtn" title="Emoji" aria-label="Emoji" aria-expanded="false">' + svg(P.emoji) + '</button>' +
      '<button type="button" class="vc-attach" id="vcMicBtn" title="Voice note" aria-label="Record a voice note">' + svg(P.mic) + '</button></div>' +
      '<button type="submit" class="vc-send" id="vcSend" aria-label="Send" disabled>' + svg(P.sendArrow, ' stroke-width="2.2"') + '</button></div>' +
      '<div class="vc-rec"><button type="button" class="vc-attach" id="vcRecCancel" aria-label="Cancel recording">' + svg(P.trash) + '</button><span class="vc-recdot"></span><span class="vc-rect" id="vcRecTime">0:00</span><span class="vc-recl">Recording\u2026</span>' +
      '<button type="button" class="vc-send" id="vcRecSend" aria-label="Send voice note">' + svg(P.sendArrow, ' stroke-width="2.2"') + '</button></div></form>' +
      '<div class=\"vc-end\" id=\"vcEnd\"><span>Your conversation has ended</span><button type=\"button\" class=\"vc-act\" id=\"vcNew\">Start a new conversation</button></div>' +
      '<p class="vc-note">Never share your password or seed phrase in chat.</p></div>' +
    '<nav class="vc-tabs" aria-label="Chat sections"><button type="button" data-go="home">' + svg(P.home) + '<span>Home</span></button>' +
      '<button type="button" data-go="messages">' + svg(P.chat) + '<span>Messages</span><i class="vc-badge" id="vcBadge" hidden></i></button>' +
      '<button type="button" data-go="tickets">' + svg(P.ticket, ' class="vc-tkn"') + '<span>Tickets</span></button></nav>';
  document.body.appendChild(panel);
  var $ = function (id) { return panel.querySelector('#' + id); };
  var log = $('vcLog'), chips = $('vcChips'), input = $('vcIn'), send = $('vcSend'), sub = $('vcSub'), wa = $('vcWa'), list = $('vcList'), badge = $('vcBadge');
  var nameEl = $('vcName'), pfpEl = $('vcPfp');

  var fab = document.getElementById('vtFab'), fabBadge = null;
  if (fab) {
    fab.setAttribute('aria-label', 'Chat with us'); fab.setAttribute('aria-controls', 'vtChat'); fab.removeAttribute('target');
    var chatSvg = fab.querySelector('svg'); if (chatSvg) chatSvg.classList.add('fab-chat');
    fab.insertAdjacentHTML('beforeend', svg(P.x, ' class="fab-x"'));
    fabBadge = el('span', 'fab-badge'); fabBadge.hidden = true; fab.appendChild(fabBadge);
    fab.addEventListener('click', function (e) { e.preventDefault(); toggle(); });
  }

  /* ---------- helpers ---------- */
  function money(cur, n) { return (cur === 'NGN' ? '\u20A6' : '$') + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 }); }
  function qtyStr(n) { return Number(n).toFixed(8).replace(/\.?0+$/, ''); }
  function waLink(text) { return 'https://api.whatsapp.com/send?phone=' + CHAT.whatsapp + '&text=' + encodeURIComponent(text || 'Hi VersusTrade'); }
  function tradeText(t) { if (t.custom) return t.custom; return 'Hi VersusTrade, I want to ' + t.side + ' ' + qtyStr(t.qty) + ' ' + t.asset + (t.network ? ' on ' + t.network : '') + ' (about ' + money(t.currency, t.amount) + ').'; }
  var lastTrade = null;
  function refreshWa() { wa.href = waLink(lastTrade ? tradeText(lastTrade) : 'Hi VersusTrade'); }
  function pause(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function scrollDown() { requestAnimationFrame(function () { log.scrollTop = log.scrollHeight; }); }
  function status() {
    panel.setAttribute('data-mode', S.mode);
    sub.textContent = S.mode === 'ai' ? 'Customer support \u00B7 replies instantly' : S.mode === 'pending' ? (CHAT.live ? 'Waiting for a team member\u2026' : 'Connecting you to the team\u2026') : 'Team \u00B7 online';
    nameEl.textContent = S.mode === 'agent' ? 'Support team' : 'Betty';
    pfpEl.innerHTML = S.mode === 'agent' ? '<span class="vc-av">' + svg(P.head) + '</span>' : BETTY;
    var ended = isEnded(), fm = $('vcForm'), nt = panel.querySelector('.vc-note'), en = $('vcEnd');
    if (fm) fm.style.display = ended ? 'none' : ''; if (nt) nt.style.display = ended ? 'none' : ''; if (en) en.style.display = ended ? 'block' : 'none';
    drawChips();
  }
  function badges() {
    var n = S.unread;
    badge.hidden = !n; badge.textContent = n;
    if (fabBadge) { fabBadge.hidden = !n || S.open; fabBadge.textContent = n; }
  }

  /* ---------- rendering ---------- */
  function drawMsg(m) {
    if (m.role === 'system') { var sy = el('div', 'vc-sys', m.text); log.appendChild(sy); return sy; }
    if (m.role === 'csat') {
      var cr = el('div', 'vc-row bot'), cwho = el('div', 'vc-who'); cwho.appendChild(el('span', '', 'Support team')); cr.appendChild(cwho);
      var lapsed = !m.rated && m.at && Date.now() - m.at > WEEK;
      cr.appendChild(el('div', 'vc-b', m.rated ? 'Thanks for rating us ' + m.rated + '/5.' : lapsed ? 'Rating for this conversation is no longer available.' : m.text));
      if (!m.rated && !lapsed) {
        var rt = el('div', 'vc-rate'), sts = [];
        [1, 2, 3, 4, 5].forEach(function (n) {
          var k = el('button', 'vc-star', '\u2605'); k.type = 'button'; k.setAttribute('aria-label', n + ' out of 5'); sts.push(k);
          k.addEventListener('mouseenter', function () { sts.forEach(function (x, i) { x.classList.toggle('on', i < n); }); });
          k.addEventListener('click', function () { rateChat(m, n, cr); });
          rt.appendChild(k);
        });
        rt.addEventListener('mouseleave', function () { sts.forEach(function (x) { if (!x.disabled) x.classList.remove('on'); }); });
        cr.appendChild(rt);
      }
      log.appendChild(cr); return cr;
    }
    var row = el('div', 'vc-row ' + (m.role === 'trade' || m.role === 'summary' ? 'user' : m.role));
    row.setAttribute('data-r', m.role);
    var prevRow = log.lastElementChild, sameRun = !!(prevRow && prevRow.getAttribute('data-r') === m.role);
    if ((m.role === 'bot' || m.role === 'agent') && !sameRun) {
      var who = el('div', 'vc-who'); who.appendChild(el('span', '', m.role === 'agent' ? 'Support team' : 'Betty'));
      if (m.role === 'agent') who.appendChild(el('span', 'vc-tag', 'Representative')); row.appendChild(who);
    }
    var b = el('div', 'vc-b');
    if (m.role === 'trade') {
      var t = m.trade; b.classList.add('vc-trade');
      var h = el('div', 'vc-trade-h'); h.appendChild(el('span', 'vc-side', t.side)); h.appendChild(el('span', '', (t.name || t.asset) + ' (' + t.asset + ')')); b.appendChild(h);
      var dl = el('dl');
      [['Amount', money(t.currency, t.amount)], ['Quantity', qtyStr(t.qty) + ' ' + t.asset], ['Rate', '1 ' + t.asset + ' \u2248 ' + money(t.currency, t.amount / t.qty)]].concat(t.network ? [['Network', t.network]] : []).forEach(function (r) { dl.appendChild(el('dt', '', r[0])); dl.appendChild(el('dd', '', r[1])); });
      b.appendChild(dl);
    } else if (m.role === 'summary') {
      var sm = m.summary; b.classList.add('vc-trade');
      var sh = el('div', 'vc-trade-h'); sh.appendChild(el('span', 'vc-side', sm.tag)); sh.appendChild(el('span', '', sm.title)); b.appendChild(sh);
      var sdl = el('dl'); sm.rows.forEach(function (r) { sdl.appendChild(el('dt', '', r[0])); sdl.appendChild(el('dd', '', r[1])); }); b.appendChild(sdl);
    } else if (m.kind === 'image' || m.kind === 'file') {
      b.classList.add('vc-media'); if (rowOf) rowOf.set(m, b); paintMedia(m, b);
    } else if (m.kind === 'voice') {
      b.classList.add('vc-voice');
      if (m.url) { var au = el('audio'); au.controls = true; au.src = m.url; au.preload = 'metadata'; b.appendChild(au); } else b.textContent = 'Voice note \u00B7 ' + dur(m.dur);
    } else b.textContent = m.text;
    if (m.role === 'agent' && ((m.imgs && m.imgs.length) || (m.files && m.files.length))) {
      if (!m.text) b.textContent = '';
      b.classList.add('vc-media');
      (m.imgs || []).forEach(function (g) { var a = el('a'); a.href = g.url; a.target = '_blank'; a.rel = 'noopener'; var im = el('img', 'vc-img'); im.alt = 'Picture'; im.src = g.thumb || g.url; im.loading = 'lazy'; a.appendChild(im); b.appendChild(a); });
      (m.files || []).forEach(function (f) { var a = el('a', 'vc-file', '\uD83D\uDCCE ' + f.name); a.href = f.url; a.target = '_blank'; a.rel = 'noopener'; b.appendChild(a); });
    }
    row.appendChild(b);
    if (m.actions && m.actions.length) {
      var acts = el('div', 'vc-acts');
      m.actions.forEach(function (a) {
        var n;
        if (a.href) { n = el('a', 'vc-act' + (a.primary ? ' primary' : ''), a.label); n.href = a.href; if (a.external) { n.target = '_blank'; n.rel = 'noopener'; } }
        else { n = el('button', 'vc-act' + (a.primary ? ' primary' : ''), a.label); n.type = 'button'; n.addEventListener('click', function () { runCmd(a.cmd, a.arg, a.label); }); }
        acts.appendChild(n);
      });
      row.appendChild(acts);
    }
    log.appendChild(row);
    return row;
  }
  function add(m) {
    if (!m.at) m.at = Date.now();
    S.msgs.push(m); if (S.closedAt && isCust(m)) S.closedAt = 0; var drawn = drawMsg(m); save(); scrollDown();
    mirror(m);
    if (m.role === 'user' || m.role === 'trade' || m.role === 'summary') drawChips();
    drawRecent();
    if ((m.role === 'bot' || m.role === 'agent' || m.role === 'csat') && !(S.open && S.view === 'chat')) { S.unread++; badges(); }
    if (S.view === 'messages') drawList();
    return drawn;
  }
  function showTyping() { var r = el('div', 'vc-row bot'); r.id = 'vcTyping'; var b = el('div', 'vc-b vc-typing'); b.innerHTML = '<span></span><span></span><span></span>'; b.setAttribute('aria-label', 'Typing'); r.appendChild(b); log.appendChild(r); scrollDown(); }
  function hideTyping() { var t = document.getElementById('vcTyping'); if (t) t.remove(); }
  function drawChips() {
    chips.innerHTML = '';
    if (S.mode !== 'ai') return;
    if (S.msgs.some(function (m) { return m.role === 'user' || m.role === 'trade' || m.role === 'summary'; })) return; // customer has started talking
    ['What do you do?', 'Buy or sell crypto', 'Sell gift cards', 'Talk to a representative'].forEach(function (q) {
      var c = el('button', 'vc-chip', q); c.type = 'button';
      c.addEventListener('click', function () { if (q === 'Talk to a representative') runCmd('handoff'); else userSay(q); });
      chips.appendChild(c);
    });
  }
  function drawList() {
    list.innerHTML = '';
    var last = null;
    for (var i = S.msgs.length - 1; i >= 0; i--) { if (S.msgs[i].role !== 'system') { last = S.msgs[i]; break; } }
    if (!last) {
      list.innerHTML = '<div class="vc-empty">' + svg(P.chat, ' style="color:var(--text)"') + '<b>No messages</b><p>Messages from the team will be shown here</p></div>';
      return;
    }
    var preview = last.role === 'trade' ? 'Trade request: ' + last.trade.side + ' ' + last.trade.asset : last.role === 'summary' ? last.summary.title : (last.text || plain(last));
    var item = el('button', 'vc-li'); item.type = 'button';
    item.innerHTML = S.mode === 'agent' ? '<span class="vc-av">' + svg(P.head) + '</span>' : '<span class="vc-pfp">' + BETTY + '</span>';
    var t = el('span', 'vc-li-t'), b = el('b', '', S.mode === 'agent' ? 'Support team' : 'Betty'); if (S.mode === 'agent') b.appendChild(el('span', 'vc-tag', 'Representative'));
    t.appendChild(b); t.appendChild(el('span', '', (last.role === 'user' || last.role === 'trade' ? 'You: ' : '') + preview)); item.appendChild(t);
    if (S.unread) item.appendChild(el('i', 'vc-dot'));
    item.addEventListener('click', function () { go('chat'); });
    list.appendChild(item);
  }

  /* ---------- greeting name, "Recent message" card, Tickets ---------- */
  function ago(t) {
    if (!t) return '';
    var sec = Math.max(0, (Date.now() - t) / 1000);
    if (sec < 60) return 'now'; if (sec < 3600) return Math.floor(sec / 60) + 'm'; if (sec < 86400) return Math.floor(sec / 3600) + 'h';
    if (sec < 604800) return Math.floor(sec / 86400) + 'd'; if (sec < 2592000) return Math.floor(sec / 604800) + 'w'; return Math.floor(sec / 2592000) + 'mo';
  }
  function plain(m) { if (m.kind === 'image') return 'Picture'; if (m.kind === 'file') return m.name || 'File'; if (m.role === 'agent' && !m.text && ((m.imgs && m.imgs.length) || (m.files && m.files.length))) return (m.imgs && m.imgs.length) ? 'Picture' : 'File'; return m.role === 'trade' ? 'Trade request: ' + tradeLine(m.trade) : m.role === 'summary' ? 'Gift card request: ' + (m.summary && m.summary.text || '') : String(m.text || ''); }
  function shortText(t, n) { t = String(t || '').replace(/\s+/g, ' ').trim(); n = n || 48; return t.length > n ? t.slice(0, n - 1) + '\u2026' : t; }
  function isTalk(m) { return m.role === 'user' || m.role === 'bot' || m.role === 'agent' || m.role === 'trade' || m.role === 'summary'; }
  function mergeTix(a, b) {
    var seen = {}, out = [];
    (a || []).concat(b || []).forEach(function (k) { if (!k) return; var key = (k.cid || '') + '|' + k.at; if (!seen[key]) { seen[key] = 1; out.push(k); } });
    out.sort(function (x, y) { return y.at - x.at; });
    return out.slice(0, 30);
  }
  function drawHi() {
    var u = who(), n = shownName(u), h = $('vcHiName');
    if (h) h.textContent = n || 'there';
  }
  // the latest conversation, shown on the home screen
  function drawRecent() {
    var card = $('vcRecent'); if (!card) return;
    var cur = S.msgs.slice(S.tixAt || 0), custs = cur.filter(isCust), last = null, i, title, prev, when, human;
    for (i = S.msgs.length - 1; i >= 0; i--) { if (isTalk(S.msgs[i])) { last = S.msgs[i]; break; } }
    if (custs.length && last) {
      title = shortText(plain(custs[0])); prev = (isCust(last) ? 'You: ' : '') + shortText(plain(last), 60); when = last.at || S.t0; human = S.mode === 'agent';
    } else if (S.tix.length) {
      title = S.tix[0].title; prev = 'Resolved'; when = S.tix[0].at; human = true;
    } else { card.style.display = 'none'; return; }
    card.innerHTML = '';
    card.appendChild(el('span', 'vc-rec-h', 'Recent message'));
    var row = el('span', 'vc-rrow');
    row.innerHTML = human ? '<span class="vc-av">' + svg(P.head) + '</span>' : '<span class="vc-pfp">' + BETTY.split('bty').join('btyH') + '</span>';
    var tx = el('span', 'vc-rt'); tx.appendChild(el('b', '', title)); tx.appendChild(el('span', '', prev));
    row.appendChild(tx); row.appendChild(el('span', 'vc-ago', ago(when)));
    card.appendChild(row); card.style.display = '';
  }
  // a closed conversation becomes a ticket (kept with its messages, so the customer can read it again)
  function archiveTicket() {
    var cid = (CW && cw && cw.conv) ? cw.conv : null;
    if (cid && S.tixConv === cid) return;
    var slice = S.msgs.slice(S.tixAt || 0).filter(isTalk), first = null;
    S.tixAt = S.msgs.length; S.tixConv = cid;
    slice.some(function (m) { if (isCust(m)) { first = m; return true; } });
    if (!first) return;
    slice = slice.slice(slice.indexOf(first));
    S.tix = mergeTix([{ id: cid || Date.now(), cid: cid, title: shortText(plain(first)), at: Date.now(), rated: 0,
      msgs: slice.filter(function (m) { return !m.kind; }).slice(-40).map(function (m) { return { role: isCust(m) ? 'user' : m.role, text: shortText(plain(m), 400) }; }) }], S.tix);
  }
  function rateTicket(k, n, stars) {
    stars.forEach(function (x, i) { x.disabled = true; x.classList.toggle('on', i < n); });
    cwCall('PATCH', '/contacts/' + encodeURIComponent(k.src) + '/conversations/' + k.cid + '/messages/' + k.mid, { submitted_values: { csat_survey_response: { rating: n } } }).then(function () {
      k.rated = n; S.msgs.forEach(function (m) { if (m.role === 'csat' && m.mid === k.mid) m.rated = n; }); save(); drawTix(); drawRecent();
    }, function () { stars.forEach(function (x) { x.disabled = false; x.classList.remove('on'); }); });
  }
  function drawTix() {
    var box = $('vcTix'); if (!box) return;
    box.innerHTML = '';
    if (!S.tix.length) { box.innerHTML = '<div class="vc-empty">' + svg(P.ticket, ' style="color:var(--text)"') + '<b>No tickets yet</b><p>Resolved conversations will be kept here</p></div>'; return; }
    S.tix.forEach(function (k) {
      var wrap = el('div', 'vc-tk'), li = el('button', 'vc-li'); li.type = 'button';
      li.innerHTML = '<span class="vc-tkic">' + svg(P.ticket) + '</span>';
      var t = el('span', 'vc-li-t'), b = el('b', '', k.title), reply = '';
      (k.msgs || []).forEach(function (m) { if (m.role !== 'user') reply = m.text; });
      t.appendChild(b);
      t.appendChild(el('span', '', 'Resolved \u00B7 ' + (k.rated ? 'You rated this ' + k.rated + '/5' : shortText(reply, 50) || 'Conversation closed')));
      li.appendChild(t); li.appendChild(el('span', 'vc-ago', ago(k.at)));
      var tx = el('div', 'vc-tx');
      if (!k.rated && k.mid && Date.now() - k.at < WEEK) {
        var rr = el('div', 'vc-tl', ''), rs = [];
        rr.appendChild(el('i', '', 'Rate this conversation'));
        var rt2 = el('div', 'vc-rate');
        [1, 2, 3, 4, 5].forEach(function (n) {
          var b2 = el('button', 'vc-star', '\u2605'); b2.type = 'button'; b2.setAttribute('aria-label', n + ' out of 5'); rs.push(b2);
          b2.addEventListener('mouseenter', function () { rs.forEach(function (x, i) { x.classList.toggle('on', i < n); }); });
          b2.addEventListener('click', function (ev) { ev.stopPropagation(); rateTicket(k, n, rs); });
          rt2.appendChild(b2);
        });
        rt2.addEventListener('mouseleave', function () { rs.forEach(function (x) { if (!x.disabled) x.classList.remove('on'); }); });
        rr.appendChild(rt2); tx.appendChild(rr);
      }
      (k.msgs || []).forEach(function (m) {
        var d = el('p', 'vc-tl'); d.appendChild(el('i', '', (m.role === 'bot' ? 'Betty' : m.role === 'agent' ? 'Support team' : 'You') + ': ')); d.appendChild(document.createTextNode(m.text)); tx.appendChild(d);
      });
      li.addEventListener('click', function () { if (wrap.hasAttribute('data-open')) wrap.removeAttribute('data-open'); else wrap.setAttribute('data-open', ''); });
      wrap.appendChild(li); wrap.appendChild(tx); box.appendChild(wrap);
    });
  }

  /* ---------- API (SIMULATED: swap these for real services) ---------- */
  var API = {
    aiReply: function (text) { return pause(700 + Math.random() * 500).then(function () { return mockAI(text); }); },
    requestHuman: function () { return pause(2200); },
    agentReply: function () { return pause(1600); }
  };
  function loginAct() { return { label: 'Log in to continue', cmd: 'login', primary: true }; }
  function repAct() { return { label: 'Talk to a representative', cmd: 'handoff' }; }
  function waAct(text) { return { label: 'Continue on WhatsApp', href: waLink(text), external: true }; }
  function mockAI(text) {
    var q = text.toLowerCase();
    if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(q)) return { text: 'Hello! I\u2019m Betty from VersusTrade customer support. I can explain what we do, how trading works and where to find rates, or connect you with a representative. What would you like to know?' };
    if (/(human|agent|representative|person|someone|support team)/.test(q)) return { text: 'Of course. I\u2019ll connect you with a representative.', actions: [repAct()] };
    if (/(what do you do|what is versus|who are you|about|services)/.test(q)) return { text: 'VersusTrade helps you buy and sell crypto and sell gift cards. You can check live market prices and start a trade from the homepage, and real people are available in chat or on WhatsApp whenever you need them.' };
    if (/(gift ?card)/.test(q)) return { text: 'You can sell gift cards with us. A representative confirms the card details, the rate and your payment, so it\u2019s best to speak with one directly.', actions: [{ label: 'Choose a gift card', cmd: 'giftcards', primary: true }, repAct(), waAct('Hi VersusTrade, I want to sell a gift card')] };
    if (/(rate|price|how much|worth|naira|dollar)/.test(q)) return { text: 'Our rates are set by VersusTrade and can change, so always check the live rate and the trade box before you trade. I can take you there.', actions: [{ label: 'See live rates', cmd: 'scroll', arg: 'rates' }, { label: 'Open trade box', cmd: 'scroll', arg: 'markets' }] };
    if (/(fee|charge|commission|limit|minimum|maximum|how long|time)/.test(q)) return { text: 'I don\u2019t want to guess on fees, limits or timing. A representative can give you exact figures for your trade.', actions: [repAct()] };
    if (/(log ?in|sign ?up|account|register|password|verify|kyc)/.test(q)) return { text: CHAT.isLoggedIn() ? 'You\u2019re logged in, so you can continue a transaction here whenever you\u2019re ready.' : 'You can chat with me and the team without an account, but to continue a transaction with the assistant you\u2019ll need to log in.', actions: CHAT.isLoggedIn() ? [] : [loginAct()] };
    if (/(buy|sell|trade|exchange|swap|btc|bitcoin|eth|usdt|coin|crypto|transaction|pay)/.test(q)) return { text: 'Choose Buy or Sell, pick a coin, enter an amount and press Continue. The details land in this chat and I\u2019ll take you through the next steps. To complete a transaction here you\u2019ll need to log in.', actions: [{ label: 'Open trade box', cmd: 'scroll', arg: 'markets', primary: true }].concat(CHAT.isLoggedIn() ? [] : [loginAct()]) };
    if (/(safe|trust|scam|legit|secure)/.test(q)) return { text: 'We keep our rates clear, our process simple and our team within reach. For your safety, never share your password or seed phrase with anyone, including us.' };
    if (/(thank|thanks|bye|ok(ay)?)\b/.test(q)) return { text: 'You\u2019re welcome! I\u2019m here if you need anything else.' };
    return { text: 'I\u2019m not sure I can answer that accurately. Would you like a representative to help?', actions: [repAct()] };
  }

  /* ---------- real AI (streams from CHAT.api) ---------- */
  var TAGS = {
    HANDOFF: function () { return [repAct()]; },
    RATES: function () { return [{ label: 'See live rates', cmd: 'scroll', arg: 'rates' }]; },
    TRADE: function () { return [{ label: 'Open trade box', cmd: 'scroll', arg: 'markets', primary: true }]; },
    GIFT: function () { return [repAct(), waAct('Hi VersusTrade, I want to sell a gift card')]; }
  };
  function visible(text) { return text.replace(/\[\[[A-Z]+\]\]/g, '').replace(/\[\[?[A-Z]*\]?$/, '').replace(/[ \t]+$/, '').replace(/^\s+/, ''); }
  function parseTags(text) {
    var acts = [], seen = {};
    (text.match(/\[\[([A-Z]+)\]\]/g) || []).slice(0, 2).forEach(function (t) {
      var k = t.slice(2, -2); if (TAGS[k] && !seen[k]) { seen[k] = 1; acts = acts.concat(TAGS[k]()); }
    });
    return { text: visible(text).trim(), actions: acts };
  }
  function history() {
    var out = [];
    S.msgs.slice(-14).forEach(function (m) {
      var r = null, c = null;
      if (m.role === 'user' && !m.kind) { r = 'user'; c = m.text; }
      else if (m.role === 'trade') { r = 'user'; c = tradeText(m.trade); }
      else if (m.role === 'summary') { r = 'user'; c = m.summary.text; }
      else if (m.role === 'bot') { r = 'assistant'; c = m.text; }
      if (!r || !c) return;
      if (out.length && out[out.length - 1].role === r) out[out.length - 1].content += '\n' + c; else out.push({ role: r, content: c });
    });
    while (out.length && out[0].role !== 'user') out.shift();
    return out;
  }
  function aiRespond(extra) {
    S.busy = true; showTyping();
    var ctrl = new AbortController(), idle = 0, row = null, bubble = null, full = '';
    function bump() { clearTimeout(idle); idle = setTimeout(function () { ctrl.abort(); }, 30000); }
    function paint() {
      var v = visible(full); if (!v) return;
      if (!row) { hideTyping(); row = drawMsg({ role: 'bot', text: '' }); bubble = row.querySelector('.vc-b'); }
      bubble.textContent = v; scrollDown();
    }
    function handle(chunk) {
      var line = chunk.replace(/^data:\s*/, '').trim(); if (!line || line === '[DONE]') return;
      var j; try { j = JSON.parse(line); } catch (e) { return; }
      if (j.error) throw new Error(j.error);
      if (j.t) { full += j.t; paint(); }
    }
    function done() {
      clearTimeout(idle); S.busy = false; if (row) row.remove(); hideTyping();
      var r = parseTags(full);
      if (/\[\[HANDOFF\]\]/.test(full)) { add({ role: 'bot', text: 'One moment...' }); handoff(); return; } // Betty is not sure: the team takes over
      if (!r.text) { fail(new Error('the AI sent an empty reply')); return; }
      add({ role: 'bot', text: r.text, actions: r.actions.concat(extra || []) });
    }
    function fail(err) {
      clearTimeout(idle); S.busy = false; if (row) row.remove(); hideTyping();
      if (CHAT.debug) {
        var raw = err && err.message ? err.message : 'empty reply';
        var why = err && err.name === 'AbortError' ? 'no reply within 30 seconds' : (err instanceof TypeError ? 'could not reach the Worker (site address not allowed, or wrong address)' : raw);
        add({ role: 'system', text: 'Debug: ' + why + (why === raw ? '' : ' [' + raw + ']') });
      }
      if (CW) { add({ role: 'bot', text: 'One moment...' }); handoff(); return; }
      add({ role: 'bot', text: 'I\u2019m having trouble answering right now. Would you like a representative to help?', actions: [repAct(), waAct(lastTrade ? tradeText(lastTrade) : '')].concat(extra || []) });
    }
    bump();
    var ctx = { loggedIn: CHAT.isLoggedIn(), trade: lastTrade && !lastTrade.custom ? { side: lastTrade.side, asset: lastTrade.asset, network: lastTrade.network || null, qty: lastTrade.qty, amount: lastTrade.amount, currency: lastTrade.currency } : null, giftCard: lastTrade && lastTrade.card ? lastTrade.card : null };
    (window.VTAuth ? window.VTAuth.getToken() : Promise.resolve(null))
      .then(function (tok) {
        var hdr = { 'Content-Type': 'application/json' };
        if (tok) hdr.Authorization = 'Bearer ' + tok;
        return fetch(CHAT.api, { method: 'POST', headers: hdr, body: JSON.stringify({ messages: history(), context: ctx }), signal: ctrl.signal });
      })
      .then(function (res) {
        if (!res.ok || !res.body) throw new Error('HTTP ' + res.status);
        var reader = res.body.getReader(), dec = new TextDecoder(), buf = '';
        function pump() {
          return reader.read().then(function (r) {
            bump();
            if (r.done) return;
            buf += dec.decode(r.value, { stream: true });
            var parts = buf.split('\n\n'); buf = parts.pop(); parts.forEach(handle);
            return pump();
          });
        }
        return pump().then(function () { if (buf) handle(buf); });
      })
      .then(done, fail);
  }

  /* ---------- conversation flow ---------- */
  function botSay(r) { hideTyping(); add({ role: 'bot', text: r.text, actions: r.actions }); }
  // ---------- real representatives (Chatwoot, API inbox) ----------
  var CW = CHAT.live, cw = { src: null, conv: null, seen: 0, timer: 0, wait: 0 };
  try { var cs = JSON.parse(localStorage.getItem('vt_cw_v1') || 'null'); if (CW && cs && cs.inbox === CW.inbox) { cw.src = cs.src; cw.conv = cs.conv; cw.seen = cs.seen || 0; cw.linked = cs.linked || null; cw.linkedName = cs.linkedName || null; cw.last = cs.last || 0; cw.prev = cs.prev || null; } } catch (e) {}
  if (CW && !S.msgs.length) { cw.conv = null; cw.seen = 0; } // a fresh chat starts a fresh conversation
  cw.q = Promise.resolve();
  function cwSave() { try { localStorage.setItem('vt_cw_v1', JSON.stringify({ inbox: CW.inbox, src: cw.src, conv: cw.conv, seen: cw.seen, linked: cw.linked || null, linkedName: cw.linkedName || null, last: cw.last || 0, prev: cw.prev || null })); } catch (e) {} }
  function cwPath(path) { return CW.base.replace(/\/+$/, '') + '/public/api/v1/inboxes/' + encodeURIComponent(CW.inbox) + path; }
  function cwCall(method, path, body) {
    return fetch(cwPath(path), { method: method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined }).then(function (r) {
      return r.text().then(function (t) {
        if (!r.ok) { var er = new Error('Chatwoot HTTP ' + r.status + (t ? ' ' + String(t).slice(0, 140) : '')); er.status = r.status; throw er; }
        try { return t ? JSON.parse(t) : null; } catch (e) { return null; }
      });
    });
  }
  function cwConv(sfx) { return '/contacts/' + encodeURIComponent(cw.src) + '/conversations/' + cw.conv + (sfx || ''); }
  function who() { return window.VTAuth && window.VTAuth.user ? window.VTAuth.user() : null; }
  // the name the customer chose on the dashboard, or the first part of their email
  function shownName(u) { if (!u) return ''; if (u.name) return u.name; var n = u.email ? u.email.split('@')[0] : ''; return n ? n.charAt(0).toUpperCase() + n.slice(1) : ''; }
  function tradeLine(t) { return t.side + ' ' + qtyStr(t.qty) + ' ' + t.asset + (t.network ? ' on ' + t.network : '') + ' (about ' + money(t.currency, t.amount) + ')'; }
  function transcript() {
    var u = who(), lines = [];
    S.msgs.slice(-10).forEach(function (m) {
      if (m.role === 'user' && !m.kind) lines.push('Customer: ' + m.text);
      else if (m.role === 'trade') lines.push('Customer sent a trade request: ' + tradeLine(m.trade));
      else if (m.role === 'summary') lines.push('Customer sent a gift card request: ' + m.summary.text);
      else if (m.role === 'bot') lines.push('Betty (automated): ' + m.text);
    });
    return 'The customer asked for a representative from the website chat.\n' +
      (u && u.email ? 'Signed in on the site as ' + u.email + ' (not yet verified by Chatwoot).\n' : 'Not signed in.\n') +
      (lastTrade ? 'Latest request: ' + (lastTrade.custom ? lastTrade.custom : tradeLine(lastTrade)) + '\n' : '') +
      (lines.length ? '\nRecent chat:\n' + lines.join('\n') : '');
  }
  function ctxText() {
    var u = who();
    return 'New chat from the VersusTrade website.\n' +
      (u && u.email ? 'Signed in on the site as ' + (u.name ? u.name + ' (' + u.email + ')' : u.email) + ' (not yet verified by Chatwoot).\n' : 'Not signed in.\n') +
      (lastTrade ? 'Latest request: ' + (lastTrade.custom ? lastTrade.custom : tradeLine(lastTrade)) + '\n' : '') +
      (cw.prev ? 'Earlier conversation with this customer: #' + cw.prev + ' (check whether it needs closing).\n' : '') +
      'Page: ' + String(location.href).slice(0, 200) + '\n' +
      'Betty (the automated assistant) is answering the customer until someone from the team replies here.';
  }
  // makes sure a Chatwoot contact and conversation exist (created on the customer's first message)
  function cwOpen() {
    var check = Promise.resolve(), idle = (CHAT.newThreadAfterHours || 0) * 3600 * 1000;
    if (cw.conv && idle && cw.last && Date.now() - cw.last > idle) { cw.prev = cw.conv; dropConv(); }
    if (cw.conv && cw.checked !== cw.conv) {
      var cid = cw.conv;
      check = cwCall('GET', cwConv('')).then(function (c) {
        if (c && c.status === 'resolved') dropConv(); else cw.checked = cid;
      }, function (err) { if (err && err.status === 404) dropConv(); });
    }
    return check.then(function () { return cw.conv ? null : cwCreate(); });
  }
  // the stored conversation was resolved (or no longer exists): the next message starts a new one
  function dropConv() {
    cw.conv = null; cw.seen = 0; cw.closing = false; cw.checked = null; clearInterval(cw.timer); cw.timer = 0; cwSave();
    if (S.mode !== 'ai') { S.mode = 'ai'; S.flow = null; S.agentReplied = false; hideTyping(); status(); }
  }
  function cwCreate(retry) {
    var u = who(), anon = { name: 'Website visitor' };
    var first = cw.src ? Promise.resolve() : cwCall('POST', '/contacts', u && u.email ? { name: shownName(u), email: u.email, identifier: u.id || undefined } : anon)
      .catch(function (err) { if (u && u.email) return cwCall('POST', '/contacts', anon); throw err; })   // never let the sign-in details stop a message getting through
      .then(function (c) { cw.src = c.source_id; cw.linked = (u && u.id && (c.email || (c.contact && c.contact.email))) ? u.id : null; cw.linkedName = cw.linked ? shownName(u) : null; cwSave(); });
    return first.then(function () {
      return cwCall('POST', '/contacts/' + encodeURIComponent(cw.src) + '/conversations', { custom_attributes: { page: String(location.href).slice(0, 200), signed_in: u ? 'yes' : 'no', trade: lastTrade ? (lastTrade.custom ? lastTrade.custom : tradeLine(lastTrade)) : 'none' } });
    }).then(function (cv) {
      cw.conv = cv.id; cw.seen = 0; cwSave();
      var note = ctxText(); cw.prev = null; cwSave();
      return cwCall('POST', cwConv('/messages'), { content: note });
    }).then(function () { startPolling(); }, function (err) {
      // the saved contact no longer exists in Chatwoot: make a new one and try once more
      if (!retry && cw.src && err && (err.status === 404 || err.status === 401 || err.status === 422)) { cw.src = null; cw.linked = null; cw.conv = null; cwSave(); return cwCreate(true); }
      throw err;
    });
  }

  // sends one customer message to Chatwoot; messages are queued so they arrive in order
  function cwPost(text) {
    cw.q = cw.q.then(function () {
      if (cw.closing) endConv();
      return cwOpen().then(function () { return cwCall('POST', cwConv('/messages'), { content: text }); });
    }).then(function () { cw.last = Date.now(); cwSave(); setTimeout(poll, 1500); }, function (err) {
      try { console.warn('VersusTrade chat: could not send to Chatwoot', err); } catch (e) {}
      if (S.mode !== 'ai') add({ role: 'system', text: 'That message couldn\u2019t be sent to the team. Try again, or continue on WhatsApp with the button at the top.' });
      if (CHAT.debug) add({ role: 'system', text: 'Debug: ' + (err && err.message || err) });
    });
    return cw.q;
  }
  // called for every message the customer sends, whether Betty or a team member answers it
  function mirror(m) {
    if (!CW) return;
    var t = '';
    if (m.role === 'user' && !m.kind) t = m.text;
    else if (m.role === 'trade') t = 'Trade request: ' + tradeLine(m.trade);
    else if (m.role === 'summary') t = 'Gift card request: ' + (m.summary && m.summary.text || '');
    if (t) cwPost(t);
  }
  // "Talk to a representative": same conversation, plus a note asking the team to take over
  function cwStart() {
    var p = cw.q.then(function () { return cwOpen(); }).then(function () {
      return cwCall('POST', cwConv('/messages'), { content: 'The customer asked to speak with a representative. Please reply here.' });
    }).then(function () { startPolling(); });
    cw.q = p.catch(function () {});
    return p;
  }
  function incoming(text, atts) {
    clearTimeout(cw.wait);
    if (S.mode !== 'agent') { S.mode = 'agent'; S.agentReplied = true; S.flow = null; S.busy = false; hideTyping(); status(); add({ role: 'system', text: 'Mr Reliable joined the chat' }); }
    var imgs = [], files = [];
    (atts || []).forEach(function (a) {
      if (!a) return; var u = a.data_url || a.thumb_url; if (!u) return;
      if (a.file_type === 'image') imgs.push({ url: u, thumb: a.thumb_url || u }); else files.push({ url: u, name: 'File' + (a.extension ? '.' + a.extension : '') });
    });
    add({ role: 'agent', text: text || '', imgs: imgs, files: files });
  }
  function poll() {
    if (!cw.conv || document.hidden) return;
    var cid = cw.conv;
    cwCall('GET', cwConv('/messages')).then(function (list) {
      if (cw.conv !== cid) return;
      (list || []).forEach(function (m) {
        if (!m || !(m.id > cw.seen)) return;
        cw.seen = m.id;
        var ct = String(m.content_type || ''), mt = m.message_type, content = String(m.content || '');
        var isTpl = mt === 3 || mt === 'template', isAct = mt === 2 || mt === 'activity';
        if (ct === 'input_csat' || (isTpl && /\brate\b/i.test(content))) { showCsat(m); return; } // Chatwoot's rating request
        if (isAct && /resolved/i.test(content)) { closeConv(); return; }
        var fromTeam = mt === 1 || mt === 'outgoing';
        if (fromTeam && (m.content || (m.attachments && m.attachments.length)) && !m.private) { cw.last = Date.now(); incoming(content, m.attachments); }
      });
      cwSave();
    }).catch(function () {});
    // the conversation itself: when the team clicks Resolve, close the chat on the website too
    cwCall('GET', cwConv('')).then(function (c) { if (c && c.status === 'resolved' && cw.conv === cid) closeConv(); }).catch(function () {});
  }
  // the team resolved the conversation in Chatwoot
  function closeConv(force) {
    if (cw.closing) return;
    cw.closing = true;
    if (!(force || S.mode !== 'ai') && !S.closedAt) { S.closedAt = Date.now(); archiveTicket(); save(); }   // resolved while the customer was only chatting with Betty
    if (force || S.mode !== 'ai') {
      clearTimeout(cw.wait); S.mode = 'ai'; S.flow = null; S.busy = false; S.agentReplied = false; hideTyping(); status();
      add({ role: 'system', text: 'This conversation has been closed. Send a message any time to start a new one.' });
      S.closedAt = Date.now(); archiveTicket(); save();
    }
    clearTimeout(cw.closeTimer); cw.closeTimer = setTimeout(endConv, 25000); // give the rating request a moment to arrive
  }
  function endConv() {
    clearTimeout(cw.closeTimer); clearInterval(cw.timer); cw.timer = 0;
    cw.conv = null; cw.seen = 0; cw.closing = false; cwSave();
  }
  function showCsat(m) {
    closeConv(true);
    if (!S.closedAt) S.closedAt = Date.now();
    archiveTicket(); save();
    if (S.msgs.some(function (x) { return x.role === 'csat' && x.mid === m.id; })) return;
    add({ role: 'csat', text: String(m.content || 'How would you rate the service provided by our team?'), cid: cw.conv, src: cw.src, mid: m.id, rated: 0, at: Date.now() });
    S.tix.forEach(function (k) { if (k.cid && k.cid === cw.conv) { k.mid = m.id; k.src = cw.src; } }); save();
    clearTimeout(cw.closeTimer); cw.closeTimer = setTimeout(endConv, 2000);
  }
  function rateChat(m, n, row) {
    if (m.at && Date.now() - m.at > WEEK) { add({ role: 'system', text: 'Ratings can only be left within 7 days of a conversation closing.' }); return; }
    var stars = Array.prototype.slice.call(row.querySelectorAll('.vc-star'));
    stars.forEach(function (x, i) { x.disabled = true; x.classList.toggle('on', i < n); });
    cwCall('PATCH', '/contacts/' + encodeURIComponent(m.src) + '/conversations/' + m.cid + '/messages/' + m.mid, { submitted_values: { csat_survey_response: { rating: n } } }).then(function () {
      m.rated = n; S.tix.forEach(function (k) { if (k.cid && k.cid === m.cid) k.rated = n; }); save();
      row.querySelector('.vc-b').textContent = 'Thanks for rating us ' + n + '/5.';
      var rt = row.querySelector('.vc-rate'); if (rt) rt.remove();
    }, function () {
      stars.forEach(function (x) { x.disabled = false; x.classList.remove('on'); });
      add({ role: 'system', text: 'Your rating couldn\u2019t be sent. Please try again.' });
    });
  }
  function startPolling() { if (!cw.timer) { cw.timer = setInterval(poll, 4000); poll(); } }
  function sendLive(text) { cwPost(text); }
  function toTeam(sim, liveText) {
    if (CW) { if (!liveText) add({ role: 'system', text: 'Files and voice notes can\u2019t be sent to the team in this chat yet. Please use the WhatsApp button at the top for those.' }); return; }
    if (S.mode === 'agent' && !S.agentReplied) { S.agentReplied = true; save(); showTyping(); API.agentReply().then(function () { hideTyping(); add({ role: 'agent', text: sim || 'Thanks, I\u2019m looking into this for you now.' }); }); }
  }
  function userSay(text) {
    text = (text || '').trim(); if (!text) return;
    if (S.busy || isEnded()) return;
    add({ role: 'user', text: text });
    if (S.mode === 'ai') { if (flowTry(text)) return; if (CHAT.api) aiRespond(); else { showTyping(); API.aiReply(text).then(botSay); } } else toTeam(null, text);
  }
  /* ---------- pictures and PDFs ---------- */
  var rowOf = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function decode(file) {
    return new Promise(function (ok, no) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); ok(im); };
      im.onerror = function () { URL.revokeObjectURL(u); no(new Error('That picture could not be read.')); };
      im.src = u;
    });
  }
  function shrink(im, side, q) {
    return new Promise(function (ok, no) {
      var k = Math.min(1, side / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(im.naturalWidth * k)); c.height = Math.max(1, Math.round(im.naturalHeight * k));
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
      c.toBlob(function (bl) { bl ? ok({ blob: bl, url: c.toDataURL('image/jpeg', q) }) : no(new Error('That picture could not be prepared.')); }, 'image/jpeg', q);
    });
  }
  function paintMedia(m, b) {
    b.textContent = '';
    if (m.kind === 'image') {
      var im = el('img', 'vc-img'); im.alt = 'Picture'; im.src = m.thumb || m.url || ''; im.loading = 'lazy';
      if (m.url) { var a = el('a'); a.href = m.url; a.target = '_blank'; a.rel = 'noopener'; a.appendChild(im); b.appendChild(a); } else b.appendChild(im);
    } else { b.appendChild(el('span', 'vc-file', '\uD83D\uDCCE ' + (m.name || 'File'))); }
    if (m.up) b.appendChild(el('small', 'vc-mst', 'Sending\u2026'));
    else if (m.err) b.appendChild(el('small', 'vc-mst vc-bad', 'Not sent'));
  }
  function attach(file) {
    if (!file || isEnded()) return;
    var isImg = /^image\//.test(file.type), isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!isImg && !isPdf) { add({ role: 'system', text: 'Only pictures and PDF files can be sent.' }); return; }
    if (file.size > (isImg ? 25 : 5) * 1024 * 1024) { add({ role: 'system', text: 'That file is too large (' + (isImg ? '25' : '5') + ' MB max).' }); return; }
    if (!CW || !window.VTAuth || !window.VTAuth.upload) { add({ role: 'system', text: 'Pictures can\u2019t be sent from this page right now.' }); return; }
    if (!CHAT.isLoggedIn()) { botSay({ text: 'Please log in to send pictures. It lets our team match them to your account.', actions: [loginAct()] }); return; }
    var m = { role: 'user', kind: isImg ? 'image' : 'file', text: isImg ? 'Picture' : file.name, name: file.name, up: 1 };
    var prep = isImg ? decode(file).then(function (im) { return shrink(im, 1600, 0.82).then(function (full) { return shrink(im, 240, 0.7).then(function (th) { m.thumb = th.url; return { blob: full.blob, ext: '.jpg', type: 'image/jpeg' }; }); }); })
                     : Promise.resolve({ blob: file, ext: '.pdf', type: 'application/pdf' });
    prep.then(function (f) {
      add(m);
      return window.VTAuth.upload(f.blob, f.ext, f.type);
    }).then(function (url) {
      m.url = url; m.up = 0; save(); repaintMedia(m);
      cwPost(m.kind === 'image' ? '\uD83D\uDCF7 Picture from the customer\n![picture](' + url + ')\n' + url : '\uD83D\uDCCE File from the customer: ' + m.name + '\n' + url);
      if (S.mode === 'ai') { showTyping(); pause(700).then(function () { botSay({ text: 'One moment...' }); handoff(); }); }
    }).catch(function (err) {
      if (!S.msgs.some(function (x) { return x === m; })) { add({ role: 'system', text: (err && err.message) || 'That picture could not be prepared.' }); return; }
      m.up = 0; m.err = 1; save(); repaintMedia(m);
      add({ role: 'system', text: 'Your picture couldn\u2019t be sent. Please try again.' });
      try { console.warn('VersusTrade chat: upload failed', err); } catch (e) {}
      if (CHAT.debug) add({ role: 'system', text: 'Debug: ' + (err && err.message || err) });
    });
  }
  function repaintMedia(m) { var b = rowOf && rowOf.get(m); if (b) paintMedia(m, b); }
  function handoff() {
    if (S.mode !== 'ai') return;
    S.flow = null; save();
    S.mode = 'pending'; status();
    if (CW) showTyping(); else add({ role: 'bot', text: 'Connecting you to a representative\u2026' });
    if (CW) {
      cwStart().then(function () {
        hideTyping();
        add({ role: 'bot', text: 'The team has been notified. You can keep typing here and they\u2019ll reply as soon as they can.' });
        clearTimeout(cw.wait);
        cw.wait = setTimeout(function () {
          if (S.mode === 'pending') add({ role: 'bot', text: 'Our team hasn\u2019t replied yet. You can keep waiting here, or continue on WhatsApp.', actions: [waAct(lastTrade ? tradeText(lastTrade) : '')] });
        }, 180000);
      }).catch(function (err) {
        hideTyping(); S.mode = 'ai'; status();
        add({ role: 'bot', text: 'I couldn\u2019t reach the team chat right now. You can continue on WhatsApp instead.', actions: [waAct(lastTrade ? tradeText(lastTrade) : '')] });
        if (CHAT.debug) add({ role: 'system', text: 'Debug: ' + (err && err.message || err) });
      });
      return;
    }
    API.requestHuman().then(function () {
      S.mode = 'agent'; S.agentReplied = false; status();
      add({ role: 'system', text: 'A representative joined the chat' });
      add({ role: 'agent', text: lastTrade && lastTrade.custom ? 'Hello, I can see you want to sell a gift card (' + lastTrade.card + '). How can I help?' : lastTrade ? 'Hello, I can see your ' + lastTrade.side + ' request for ' + qtyStr(lastTrade.qty) + ' ' + lastTrade.asset + '. How can I help?' : 'Hello, you\u2019re now chatting with the VersusTrade team. How can I help?' });
    });
  }
  function runCmd(cmd, arg, label) {
    if (cmd === 'handoff') handoff();
    else if (cmd === 'flow') flowCmd(arg, label);
    else if (cmd === 'login') { if (window.VTAuth) window.VTAuth.open(); else window.location.href = CHAT.loginUrl; }
    else if (cmd === 'giftcards') { if (window.matchMedia('(max-width:560px)').matches) close(); if (window.VTGiftCards) window.VTGiftCards.open(); }
    else if (cmd === 'scroll') {
      var t = document.getElementById(arg);
      if (window.matchMedia('(max-width:560px)').matches) close();
      if (t) { window.__vtLock = Date.now() + 1000; t.scrollIntoView({ behavior: 'smooth', block: 'start' }); setTimeout(function () { window.dispatchEvent(new Event('scroll')); }, 1050); }
    }
  }
  function sendTrade(t) {
    if (S.closedAt) resetChat(true);
    lastTrade = t; refreshWa();
    try { sessionStorage.setItem('vt_pending_trade', JSON.stringify(t)); } catch (e) {}
    open('chat');
    add({ role: 'trade', trade: t });
    if (S.mode !== 'ai') { toTeam('Got your ' + t.side + ' request. Let me check it and get back to you.', 'Trade request: ' + tradeLine(t)); return; }
    if (CHAT.api) { aiRespond(CHAT.isLoggedIn() ? [repAct(), waAct(tradeText(t))] : [loginAct(), repAct(), waAct(tradeText(t))]); return; }
    showTyping();
    pause(1100).then(function () {
      var word = t.side === 'buy' ? 'buy' : 'sell';
      if (CHAT.isLoggedIn()) botSay({ text: 'Thanks, I\u2019ve received your request to ' + word + ' ' + qtyStr(t.qty) + ' ' + t.asset + (t.network ? ' on ' + t.network : '') + '. I\u2019ll prepare the order and a representative will confirm the payment details with you.', actions: [repAct(), waAct(tradeText(t))] });
      else botSay({ text: 'I\u2019ve received your request to ' + word + ' ' + qtyStr(t.qty) + ' ' + t.asset + (t.network ? ' on ' + t.network : '') + ' (about ' + money(t.currency, t.amount) + '). To continue this transaction with me, please log in first. You can also finish it with a representative or on WhatsApp.', actions: [loginAct(), repAct(), waAct(tradeText(t))] });
    });
  }

  function sendGiftCard(name) {
    if (S.closedAt) resetChat(true);
    lastTrade = { custom: 'Hi VersusTrade, I want to sell my ' + name + '.', card: name }; refreshWa();
    open('chat');
    add({ role: 'user', text: 'I want to sell my ' + name + '.' });
    if (S.mode !== 'ai') { toTeam('Got it, you want to sell your ' + name + '. Let me check and get back to you.', 'I want to sell my ' + name + '.'); return; }
    if (S.busy) return;
    S.flow = { type: 'gift', d: { card: name } }; flowNext();
  }

  /* ---------- guided flows: Betty asks follow-up questions in the chat (crypto order, gift card sale) ---------- */
  var VT = function () { return window.VTTrade || null; };
  var ALIAS = { tether: 'USDT', 'usd coin': 'USDC', bitcoin: 'BTC', 'bitcoin cash': 'BCH', ethereum: 'ETH', ether: 'ETH', solana: 'SOL', ripple: 'XRP', dogecoin: 'DOGE', cardano: 'ADA', tron: 'TRX', avalanche: 'AVAX', chainlink: 'LINK', toncoin: 'TON', polkadot: 'DOT', litecoin: 'LTC', 'shiba inu': 'SHIB', cosmos: 'ATOM', uniswap: 'UNI', stellar: 'XLM', aptos: 'APT', 'near protocol': 'NEAR', bnb: 'BNB' };
  var SYMS = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'XRP', 'DOGE', 'ADA', 'TRX', 'AVAX', 'LTC', 'SHIB', 'BCH', 'XLM', 'SOL'];
  var GK = [[/visa/, 'Visa Gift Card'], [/amazon/, 'Amazon Gift Card'], [/apple|itunes/, 'Apple / iTunes Gift Card'], [/google ?play|play ?store/, 'Google Play Gift Card'], [/steam/, 'Steam Gift Card'], [/razer/, 'Razer Gold'], [/sephora/, 'Sephora Gift Card'], [/target/, 'Target Gift Card'], [/walmart/, 'Walmart Gift Card'], [/playstation|psn|\bps ?[45]\b/, 'PlayStation Gift Card'], [/xbox/, 'Xbox Gift Card']];
  var CANCEL = { label: 'Cancel', cmd: 'flow', arg: 'x:cancel' };
  var GSYM = { USD: '$', GBP: '\u00A3', EUR: '\u20AC', CAD: 'CA$', AUD: 'A$' };
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function ask(text, actions) {
    S.busy = true; showTyping();
    pause(550).then(function () { S.busy = false; botSay({ text: text, actions: actions && actions.length ? actions : undefined }); });
  }
  function ch(label, arg) { return { label: label, cmd: 'flow', arg: arg }; }

  function findCoin(q) {
    var v = VT(); if (!v) return null; var coins = v.coins(), keys = Object.keys(ALIAS).sort(function (a, b) { return b.length - a.length; }), i;
    for (i = 0; i < keys.length; i++) if (new RegExp('(^|[^a-z])' + keys[i] + '([^a-z]|$)').test(q) && coins.indexOf(ALIAS[keys[i]]) > -1) return ALIAS[keys[i]];
    for (i = 0; i < SYMS.length; i++) if (new RegExp('(^|[^a-z])' + SYMS[i].toLowerCase() + '([^a-z]|$)').test(q) && coins.indexOf(SYMS[i]) > -1) return SYMS[i];
    return null;
  }
  function findSide(q) {
    var b = /\b(buy|buying|purchase|get|need|top ?up)\b/.test(q), s = /\b(sell|selling|cash ?out|offload|convert)\b/.test(q);
    return b && !s ? 'buy' : s && !b ? 'sell' : null;
  }
  function findNet(q, asset) {
    var l = VT().nets(asset), i, n, code, w;
    for (i = 0; i < l.length; i++) {
      n = l[i]; code = n.c.toLowerCase();
      if (new RegExp('(^|[^a-z0-9])' + code.replace(/[^a-z0-9 ]/g, '') + '([^a-z0-9]|$)').test(q)) return n.c;
      w = n.n.toLowerCase().split(' ')[0];
      if (w.length > 3 && new RegExp('(on|via|using|through|network)\\s+' + w).test(q)) return n.c;
      if (n.c === 'BEP20' && /\b(bsc|binance smart|bnb chain|bnb smart)\b/.test(q)) return n.c;
    }
    return null;
  }
  function parseAmt(raw) {
    var q = raw.toLowerCase().replace(/,/g, '').replace(/\b(trc|erc|bep)\s?20\b/g, ' ');
    var m = q.match(/(\d+(?:\.\d+)?)\s*(?:(k|m|million|thousand)(?![a-z]))?/); if (!m) return null;
    var n = parseFloat(m[1]); if (m[2]) n *= (m[2] === 'k' || m[2] === 'thousand') ? 1e3 : 1e6;
    if (!(n > 0)) return null;
    var ccy = /\u20A6|\bngn\b|naira|(^|[^a-z])n\d/.test(q) ? 'NGN' : /\$|\busd\b|dollar|bucks/.test(q) ? 'USD' : null;
    var coin = findCoin(q), worth = /(with|worth|for)\s*[\u20A6$]?\s*\d/.test(q);
    return { v: n, ccy: ccy, coin: coin, kind: coin && !ccy && !worth ? 'crypto' : 'fiat' };
  }
  function rateLine() {
    var v = VT(), R = v && v.rates && v.rates(); if (!R || !(R.buy > 0)) return '';
    return 'Our rates today: you buy at ' + money('NGN', R.sell) + ' per $1 and sell at ' + money('NGN', R.buy) + ' per $1. They can change, so a representative confirms the final amount. ';
  }
  function detectIntent(q) {
    var info = /^(what|why|how (does|do|is|are)|explain|tell me about|is |are )/.test(q) && !/rate|price|how much|worth|sell|buy/.test(q), s = findSide(q);
    if (/gift ?card|giftcard|itunes|google ?play|steam|razer|sephora|walmart|playstation|xbox|amazon (card|voucher)|apple card|visa card/.test(q) && !(info && !s)) return 'gift';
    var c = findCoin(q), generic = /\b(crypto|cryptocurrency|coins?)\b/.test(q);
    if (info && !s) return null;
    if ((c || generic) && (s || /rate|price|how much|worth|want|need|trade|swap|exchange/.test(q))) return 'crypto';
    if (c && q.split(/\s+/).length <= 3) return 'crypto';
    return null;
  }

  function fillCrypto(f, q, raw) {
    var d = f.d, got = false, c = findCoin(q), sd = findSide(q), nw, a;
    if (c && (!d.asset || f.step === 'asset')) { if (d.asset !== c) d.network = null; d.asset = c; got = true; }
    if (sd && !d.side) { d.side = sd; got = true; }
    if (d.asset && !d.network) { nw = findNet(q, d.asset); if (nw) { d.network = nw; got = true; } }
    if (!d.value) {
      a = parseAmt(raw);
      if (a) {
        d.value = a.v; d.kind = a.kind; d.ccy = a.kind === 'fiat' ? a.ccy : null; got = true;
        if (a.kind === 'crypto' && a.coin && a.coin !== d.asset) { d.asset = a.coin; d.network = findNet(q, a.coin); }
      }
    } else if (d.kind === 'fiat' && !d.ccy) {
      if (/\u20A6|\bngn\b|naira/.test(q)) { d.ccy = 'NGN'; got = true; }
      else if (/\$|\busd\b|dollar/.test(q)) { d.ccy = 'USD'; got = true; }
      else if (d.asset && findCoin(q) === d.asset) { d.kind = 'crypto'; got = true; }
    }
    return got;
  }
  function nextCrypto(f) {
    var d = f.d, v = VT(), intro = f.intro ? rateLine() : '', l, verb;
    f.intro = false;
    if (!v) { S.flow = null; save(); ask('Use the trade box on the homepage to start a crypto order, or I can connect you with a representative.', [{ label: 'Open trade box', cmd: 'scroll', arg: 'markets', primary: true }, repAct()]); return; }
    if (!d.side && !d.asset) { f.step = 'side'; return ask(intro + 'Sure. Would you like to buy or sell crypto?', [ch('Buy crypto', 'c:side=buy'), ch('Sell crypto', 'c:side=sell'), CANCEL]); }
    if (!d.side) { f.step = 'side'; return ask(intro + 'Do you want to buy or sell ' + v.name(d.asset) + ' (' + d.asset + ')?', [ch('Buy ' + d.asset, 'c:side=buy'), ch('Sell ' + d.asset, 'c:side=sell'), CANCEL]); }
    if (!d.asset) {
      f.step = 'asset';
      var top = ['USDT', 'BTC', 'ETH', 'USDC', 'SOL', 'BNB'].filter(function (x) { return v.coins().indexOf(x) > -1; }).map(function (x) { return ch(x, 'c:asset=' + x); });
      return ask(intro + 'Which coin would you like to ' + d.side + '?', top.concat([ch('Other coin', 'c:asset=?'), CANCEL]));
    }
    if (!d.network) {
      l = v.nets(d.asset);
      if (l.length === 1) d.network = l[0].c;
      else { f.step = 'network'; return ask('Which network should the ' + d.asset + ' use? Pick the one your wallet or exchange supports. Crypto sent on the wrong network can be lost.', l.map(function (n) { return ch(n.c, 'c:network=' + n.c); }).concat([CANCEL])); }
    }
    if (!d.value) {
      f.step = 'value'; verb = d.side === 'buy' ? 'buy' : 'sell';
      return ask('How much ' + d.asset + ' do you want to ' + verb + '? Type an amount in naira (\u20A650,000), dollars ($100) or ' + d.asset + ' (20 ' + d.asset + ').', [CANCEL]);
    }
    if (d.kind === 'fiat' && !d.ccy) { f.step = 'ccy'; return ask('Is ' + d.value.toLocaleString('en-US') + ' in naira (\u20A6), US dollars ($) or ' + d.asset + '?', [ch('Naira (\u20A6)', 'c:ccy=NGN'), ch('US dollars ($)', 'c:ccy=USD'), ch(d.asset, 'c:ccy=coin'), CANCEL]); }
    finishCrypto(f);
  }
  function finishCrypto(f) {
    var d = f.d, v = VT(), cryp = d.kind === 'crypto', ccy = cryp ? 'NGN' : (d.ccy || 'NGN');
    var qd = v.quote(d.side, d.asset, ccy, cryp ? 'crypto' : 'fiat', d.value), acts = CHAT.isLoggedIn() ? [] : [loginAct()];
    S.flow = null; save();
    if (!qd || !(qd.qty > 0)) {
      var txt = 'Hi VersusTrade, I want to ' + d.side + ' ' + d.asset + ' on ' + d.network + ' (' + d.value + ' ' + (cryp ? d.asset : ccy) + ').';
      lastTrade = { custom: txt, card: null }; refreshWa();
      return ask('I couldn\u2019t load live prices just now, so I can\u2019t show an estimate. I\u2019ve noted that you want to ' + d.side + ' ' + d.asset + ' on ' + d.network + '. A representative will confirm the exact amount with you.', acts.concat([repAct(), waAct(txt)]));
    }
    var trade = { side: d.side, asset: d.asset, name: v.name(d.asset), currency: ccy, network: d.network, amount: qd.fiat, qty: qd.qty };
    lastTrade = trade; refreshWa(); add({ role: 'trade', trade: trade });
    var more = [ch('Change amount', 'c:edit=value')]; if (v.nets(d.asset).length > 1) more.push(ch('Change network', 'c:edit=network'));
    ask('Here\u2019s your request. It is an estimate, and a representative confirms the final amount before you pay. Make sure your wallet or exchange supports ' + d.network + '.', acts.concat([repAct(), waAct(tradeText(trade))]).concat(more));
  }

  function ccyOf(q) { return /\$|\busd\b|dollar|bucks/.test(q) ? 'USD' : /\u00A3|\bgbp\b|pound/.test(q) ? 'GBP' : /\u20AC|\beur\b|euro/.test(q) ? 'EUR' : /\bcad\b|canadian/.test(q) ? 'CAD' : /\baud\b|australian/.test(q) ? 'AUD' : null; }
  function fillGift(f, q, raw) {
    var d = f.d, got = false, i, a, m;
    if (f.step === 'cardtext' && !d.card && raw.trim().length > 1 && raw.length < 40) { d.card = cap(raw.trim()); return true; }
    if (!d.card) for (i = 0; i < GK.length; i++) if (GK[i][0].test(q)) { d.card = GK[i][1]; got = true; break; }
    if (!d.gkind) {
      if (/physical|plastic|actual card/.test(q)) { d.gkind = 'Physical card'; got = true; }
      else if (/e-?code|digital|code only|email/.test(q)) { d.gkind = 'E-code'; got = true; }
      else if (/receipt/.test(q)) { d.gkind = 'Receipt only'; got = true; }
    }
    if (!d.value) {
      m = q.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(?:(k)(?![a-z]))?/);
      if (m) { a = parseFloat(m[1]) * (m[2] ? 1000 : 1); if (a > 0) { d.value = a; d.ccy = ccyOf(q); got = true; } }
    } else if (!d.ccy && ccyOf(q)) { d.ccy = ccyOf(q); got = true; }
    if (!d.country && f.step === 'country' && raw.trim().length > 1 && raw.trim().length <= 40 && !/\d/.test(raw)) { d.country = cap(raw.trim()); got = true; }
    return got;
  }
  function nextGift(f) {
    var d = f.d, cards = (window.VTGiftCards && window.VTGiftCards.cards) || [];
    if (!d.card) {
      f.step = 'card';
      return ask('Which gift card would you like to sell?', cards.map(function (c) { return ch(c.n.replace(' Gift Card', ''), 'g:card=' + c.n); }).concat([ch('Other card', 'g:card=?'), CANCEL]));
    }
    if (!d.gkind) { f.step = 'gkind'; return ask('Is your ' + d.card + ' a physical card, an e-code, or do you only have the receipt?', [ch('Physical card', 'g:gkind=Physical card'), ch('E-code', 'g:gkind=E-code'), ch('Receipt only', 'g:gkind=Receipt only'), CANCEL]); }
    if (!d.value) { f.step = 'value'; return ask('What is the card value? For example $100, \u00A350 or \u20AC25.', [CANCEL]); }
    if (!d.ccy) { f.step = 'ccy'; return ask('Is ' + d.value.toLocaleString('en-US') + ' in US dollars, British pounds, euros or Canadian dollars?', [ch('US dollars ($)', 'g:ccy=USD'), ch('British pounds (\u00A3)', 'g:ccy=GBP'), ch('Euros (\u20AC)', 'g:ccy=EUR'), ch('Canadian dollars', 'g:ccy=CAD'), CANCEL]); }
    if (!d.country) { f.step = 'country'; return ask('Which country was the card bought in?', [ch('United States', 'g:country=United States'), ch('United Kingdom', 'g:country=United Kingdom'), ch('Canada', 'g:country=Canada'), CANCEL]); }
    finishGift(f);
  }
  function finishGift(f) {
    var d = f.d, val = (GSYM[d.ccy] || '') + Number(d.value).toLocaleString('en-US') + (GSYM[d.ccy] ? '' : ' ' + d.ccy);
    var text = 'I want to sell my ' + d.card + ' (' + d.gkind.toLowerCase() + ', ' + val + ', bought in ' + d.country + ').';
    S.flow = null; lastTrade = { custom: 'Hi VersusTrade, ' + text, card: d.card }; refreshWa();
    add({ role: 'summary', summary: { tag: 'sell', title: d.card, rows: [['Type', d.gkind], ['Value', val], ['Country', d.country]], text: text } });
    ask('Thanks, I\u2019ve noted that. A representative confirms the card details and the rate with you, then arranges your payment. Please have the card code or receipt ready.', (CHAT.isLoggedIn() ? [] : [loginAct()]).concat([repAct(), waAct(lastTrade.custom)]));
  }

  function flowNext() { var f = S.flow; if (!f) return; save(); if (f.type === 'crypto') nextCrypto(f); else nextGift(f); }
  function flowCmd(arg, label) {
    if (S.busy) return;
    add({ role: 'user', text: label || arg });
    var type = arg.charAt(0), kv = arg.slice(2).split('='), k = kv[0], val = kv.slice(1).join('=');
    if (type === 'x') { S.flow = null; save(); ask('No problem, I\u2019ve cancelled that. Ask me anything, or start again whenever you like.'); return; }
    var want = type === 'g' ? 'gift' : 'crypto';
    if (!S.flow || S.flow.type !== want) S.flow = { type: want, d: {} };
    var f = S.flow, d = f.d;
    if (want === 'crypto') {
      if (k === 'edit') { var lt = lastTrade && !lastTrade.custom ? lastTrade : null; if (lt) { d.side = lt.side; d.asset = lt.asset; d.network = val === 'network' ? null : lt.network; } }
      else if (k === 'ccy') { if (val === 'coin') { d.kind = 'crypto'; d.ccy = null; } else d.ccy = val; }
      else if (k === 'asset' && val === '?') { f.step = 'asset'; ask('Which coin? Type its name, for example Bitcoin or Solana.'); return; }
      else { d[k] = val; if (k === 'asset') d.network = null; }
    } else {
      if (k === 'card' && val === '?') { f.step = 'cardtext'; ask('Type the name of the gift card you want to sell.'); return; }
      d[k] = val;
    }
    flowNext();
  }
  function flowTry(text) {
    var q = text.toLowerCase().trim(), f = S.flow;
    if (/^(cancel|stop|start over|never ?mind|reset|forget it)\b/.test(q)) {
      if (!f) return false;
      S.flow = null; save(); ask('No problem, I\u2019ve cancelled that. Ask me anything, or start again whenever you like.'); return true;
    }
    if (/(human|agent|representative|real person|support team)/.test(q)) return false;
    if (f) {
      if ((f.type === 'crypto' ? fillCrypto(f, q, text) : fillGift(f, q, text))) { flowNext(); return true; }
      if (/\?|^(what|why|how|can|do|is|are|who|when)\b/.test(q)) return false;
      flowNext(); return true;
    }
    var intent = detectIntent(q); if (!intent) return false;
    S.flow = { type: intent === 'gift' ? 'gift' : 'crypto', d: {}, intro: /rate|price|how much|worth/.test(q) };
    if (S.flow.type === 'crypto') fillCrypto(S.flow, q, text); else fillGift(S.flow, q, text);
    flowNext(); return true;
  }

  /* ---------- emoji and voice notes ---------- */
  var pop = $('vcPop'), emojiBtn = $('vcEmojiBtn'), micBtn = $('vcMicBtn'), form = $('vcForm');
  function dur(sec) { sec = Math.max(0, Math.round(sec || 0)); return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }
  function showPop(kind) {
    var cur = pop.getAttribute('data-kind');
    if (!kind || cur === kind) { pop.hidden = true; pop.removeAttribute('data-kind'); pop.innerHTML = ''; emojiBtn.setAttribute('aria-expanded', 'false'); return; }
    pop.hidden = false; pop.setAttribute('data-kind', kind);
    emojiBtn.setAttribute('aria-expanded', kind === 'emoji');
    drawEmoji();
  }
  function insertText(t) {
    var a = input.selectionStart == null ? input.value.length : input.selectionStart, b = input.selectionEnd == null ? a : input.selectionEnd;
    input.setRangeText(t, a, b, 'end'); input.dispatchEvent(new Event('input')); input.focus({ preventScroll: true });
  }
  function drawEmoji() {
    pop.innerHTML = ''; var g = el('div', 'vc-eg'); g.setAttribute('role', 'listbox'); g.setAttribute('aria-label', 'Emoji');
    EMOJIS.forEach(function (e) { var b = el('button', 'vc-em', e); b.type = 'button'; b.setAttribute('aria-label', e); b.addEventListener('click', function () { insertText(e); }); g.appendChild(b); });
    pop.appendChild(g);
  }
  var rec = { mr: null, chunks: [], t0: 0, timer: 0, stream: null };
  function recUI(on) { form.classList.toggle('rec', on); if (!on) { clearInterval(rec.timer); $('vcRecTime').textContent = '0:00'; } }
  function startRec() {
    showPop(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) { add({ role: 'system', text: 'Voice notes aren\u2019t supported in this browser.' }); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'], mime = '';
      for (var i = 0; i < types.length; i++) { if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(types[i])) { mime = types[i]; break; } }
      rec.stream = stream; rec.chunks = []; rec.mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      rec.mr.ondataavailable = function (e) { if (e.data && e.data.size) rec.chunks.push(e.data); };
      rec.mr.start(); rec.t0 = Date.now(); recUI(true);
      rec.timer = setInterval(function () { var s = (Date.now() - rec.t0) / 1000; $('vcRecTime').textContent = dur(s); if (s >= 120) stopRec(true); }, 250);
    }).catch(function () { add({ role: 'system', text: 'Microphone access was blocked. Allow it in your browser settings to send voice notes.' }); });
  }
  function stopRec(sendIt) {
    if (!rec.mr) return;
    var mr = rec.mr, secs = (Date.now() - rec.t0) / 1000, chunks = rec.chunks, stream = rec.stream; rec.mr = null; recUI(false);
    mr.onstop = function () {
      stream.getTracks().forEach(function (t) { t.stop(); });
      if (sendIt && chunks.length && secs >= 1) sendVoice(URL.createObjectURL(new Blob(chunks, { type: mr.mimeType || 'audio/webm' })), secs);
    };
    try { mr.stop(); } catch (e) { stream.getTracks().forEach(function (t) { t.stop(); }); }
  }
  function sendVoice(url, secs) {
    if (isEnded()) return;
    // Front end only: the audio stays in this browser tab. Hook your upload here.
    add({ role: 'user', kind: 'voice', dur: secs, url: url, text: 'Voice note' });
    if (S.mode === 'ai') { showTyping(); pause(900).then(function () { botSay({ text: 'Thanks. I can\u2019t listen to voice notes myself, but a representative can. Want me to connect you?', actions: [repAct()] }); }); } else toTeam('Thanks, I\u2019ll listen to your voice note now.');
  }
  emojiBtn.addEventListener('click', function () { showPop('emoji'); });
  micBtn.addEventListener('click', startRec);
  $('vcRecCancel').addEventListener('click', function () { stopRec(false); });
  $('vcRecSend').addEventListener('click', function () { stopRec(true); });
  panel.addEventListener('click', function (e) { if (!pop.hidden && !e.target.closest('#vcPop, .vc-tools')) showPop(null); });

  function greet() { add({ role: 'bot', text: 'Hi! I\u2019m Betty from VersusTrade customer support. Ask me anything about what we do, or pick a coin in the trade box and I\u2019ll take it from there. A representative is available any time you need one.' }); }
  /* ---------- navigation ---------- */
  function go(view) {
    S.view = view; panel.setAttribute('data-view', view);
    [].forEach.call(panel.querySelectorAll('.vc-tabs button'), function (b) { if (b.dataset.go === (view === 'home' ? 'home' : view === 'tickets' ? 'tickets' : 'messages')) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    if (view === 'chat') {
      S.unread = 0; badges();
      status(); if (!S.msgs.length) greet();
      scrollDown(); setTimeout(function () { if (S.open && S.view === 'chat') input.focus({ preventScroll: true }); }, 120);
    } else if (view === 'messages') drawList();
    else if (view === 'tickets') drawTix();
    else if (view === 'home') { drawHi(); drawRecent(); }
  }
  function open(view) {
    if (!S.open) {
      S.open = true; panel.setAttribute('data-open', '');
      if (fab) { fab.setAttribute('data-open', ''); fab.setAttribute('aria-expanded', 'true'); }
      if (window.matchMedia('(max-width:560px)').matches) {
        document.documentElement.classList.add('vc-lock');
        // full-screen on phones: add a history step so the phone's Back button closes the chat instead of leaving the page
        try { history.pushState({ vtChat: 1 }, ''); S.pushed = true; } catch (e) {}
      }
    }
    go(view || S.view); badges();
  }
  function close() {
    if (!S.open) return; S.open = false;
    stopRec(false); showPop(null);
    if (S.pushed) { S.pushed = false; S.skipPop = true; try { history.back(); } catch (e) { S.skipPop = false; } setTimeout(function () { S.skipPop = false; }, 500); }
    panel.removeAttribute('data-open'); if (fab) { fab.removeAttribute('data-open'); fab.setAttribute('aria-expanded', 'false'); }
    document.documentElement.classList.remove('vc-lock'); badges();
  }
  function toggle() { S.open ? close() : open('home'); }

  panel.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]'), g = e.target.closest('[data-go]');
    if (a) { var k = a.dataset.act; if (k === 'close') close(); else if (k === 'new') { if (S.closedAt) resetChat(true); go('chat'); } else go(k === 'chat' ? 'chat' : 'messages'); }
    else if (g) go(g.dataset.go);
  });
  document.addEventListener('keydown', function (e) { if (S.open && e.key === 'Escape') { if (!pop.hidden) { showPop(null); return; } close(); if (fab) fab.focus(); } });
  input.addEventListener('input', function () { send.disabled = !input.value.trim(); input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 112) + 'px'; });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('vcForm').requestSubmit(); } });
  $('vcForm').addEventListener('submit', function (e) { e.preventDefault(); if (form.classList.contains('rec')) return; if (S.busy) return; showPop(null); var v = input.value; input.value = ''; input.style.height = 'auto'; send.disabled = true; userSay(v); });
  $('vcFile').addEventListener('change', function (e) { attach(e.target.files[0]); e.target.value = ''; });
  [].forEach.call(document.querySelectorAll('a[href="/support/"]'), function (a) {
    if (/chat with us/i.test(a.textContent)) a.addEventListener('click', function (e) { e.preventDefault(); open('chat'); });
  });

  // When someone logs in, let them know in the chat so the transaction can continue
  /* ---------- logged-in customers: chat saved to the account, Chatwoot contact linked ---------- */
  function redrawAll() {
    log.innerHTML = '<p class="vc-intro">Betty replies automatically. A team member can join any time.</p>';
    lastTrade = null;
    S.msgs.forEach(function (m) { if (m.role === 'trade') lastTrade = m.trade; else if (m.role === 'summary') lastTrade = { custom: m.summary.text, card: m.summary.title }; drawMsg(m); });
    refreshWa(); status(); badges(); drawHi(); drawRecent(); if (S.view === 'messages') drawList(); if (S.view === 'tickets') drawTix();
    if (CW && cw.conv && !cw.closing) startPolling();
    scrollDown();
  }
  // empty the chat. keepAccount = start a new conversation but stay linked to the same customer
  function resetChat(keepAccount) {
    hideTyping(); clearTimeout(sync.timer);
    S.msgs = []; S.mode = 'ai'; S.agentReplied = false; S.flow = null; S.closedAt = 0; S.busy = false; lastTrade = null; S.tixAt = 0; S.tixConv = null;
    if (!keepAccount) { S.uid = null; S.tix = []; }
    if (CW) {
      clearTimeout(cw.wait); clearTimeout(cw.closeTimer); clearInterval(cw.timer); cw.timer = 0; cw.conv = null; cw.seen = 0; cw.closing = false;
      if (!keepAccount) { cw.src = null; cw.linked = null; cw.linkedName = null; }
      cwSave();
    }
    if (!keepAccount) { try { localStorage.removeItem(KEY); } catch (e) {} }
    redrawAll();
    if (S.view === 'chat') greet(); else save();
  }
  function adopt(st) {
    S.msgs = st.msgs; S.mode = (st.mode === 'pending' && !CHAT.live) ? 'agent' : (st.mode || 'ai'); S.agentReplied = !!st.agentReplied; S.flow = st.flow || null; S.closedAt = st.closedAt || 0; S.t0 = st.t || 0; S.tixAt = st.tixAt || 0; S.tixConv = st.tixConv || null;
    if (CW && st.cw) { cw.src = st.cw.src || null; cw.conv = st.cw.conv || null; cw.seen = st.cw.seen || 0; cw.closing = false; cwSave(); }
    S.tix = mergeTix(S.tix, st.tix); redrawAll();
  }
  // tell Chatwoot who this visitor is, so the team sees the customer's email on the conversation
  function linkContact() {
    var u = who();
    var name = shownName(u);
    if (!CW || !cw.src || !u || !u.email || (cw.linked === u.id && cw.linkedName === name)) return Promise.resolve();
    var path = '/contacts/' + encodeURIComponent(cw.src), renamed = cw.linked === u.id;
    return cwCall('PATCH', path, { name: name, email: u.email, identifier: u.id })
      .catch(function () { return cwCall('PATCH', path, { name: name, email: u.email }); })
      .then(function () {
        cw.linked = u.id; cw.linkedName = name; cwSave();
        var idle = (CHAT.newThreadAfterHours || 0) * 3600 * 1000, quiet = idle && cw.last && Date.now() - cw.last > idle;
        if (cw.conv && !cw.closing && !quiet) return cwCall('POST', cwConv('/messages'), { content: renamed ? 'The customer changed their name to ' + name + '.' : 'The customer signed in on the website as ' + name + ' (' + u.email + ').' });
      }).catch(function () {});
  }
  function accountSync(u) {
    var A = window.VTAuth;
    if (!A || !A.rest || !u || !u.id) return Promise.resolve(false);
    if (S.uid && S.uid !== u.id) resetChat();   // this browser still held another account's chat
    var had = S.msgs.some(isCust), adopted = false;
    return A.rest('GET', '/chat_state?select=state&user_id=eq.' + encodeURIComponent(u.id) + '&limit=1').then(function (rows) {
      var st = rows && rows[0] && rows[0].state;
      if (st && st.tix) S.tix = mergeTix(S.tix, st.tix);
      // use the saved chat if this browser has none, or if it was updated on another device since
      if (usable(st) && st.msgs.length && (!had || (S.uid === u.id && st.t > (S.t0 || 0)))) { adopt(st); adopted = true; }
      S.uid = u.id; sync.ready = true; sync.off = false;
      save();
      return linkContact().then(function () { return adopted; });
    }).catch(function (err) {
      if (err && (err.status === 400 || err.status === 401 || err.status === 403 || err.status === 404)) sync.off = true;
      S.uid = u.id; save();
      return linkContact().then(function () { return false; });
    });
  }
  $('vcNew').addEventListener('click', function () { resetChat(true); });
  window.addEventListener('vt-profile', function () { drawHi(); linkContact(); });

  window.addEventListener('vt-auth', function (e) {
    var d = e.detail || {};
    drawHi();
    if (!d.loggedIn) { sync.ready = false; if (S.uid) resetChat(); return; }   // logged out: the next person on this device starts clean
    accountSync(who()).then(function (adopted) {
      if (adopted || d.initial || !S.msgs.length) return;
      var tr = lastTrade && !lastTrade.custom ? lastTrade : null;
      add({ role: 'bot', text: tr ? 'You\u2019re logged in as ' + d.email + '. Your request to ' + tr.side + ' ' + qtyStr(tr.qty) + ' ' + tr.asset + (tr.network ? ' on ' + tr.network : '') + ' is still here, and a representative can confirm the payment details with you.' : lastTrade ? 'You\u2019re logged in as ' + d.email + '. Your request is still here, and a representative can confirm the details with you.' : 'You\u2019re logged in as ' + d.email + '. You can continue your transaction here, and your chats are now saved to your account.', actions: lastTrade ? [repAct(), waAct(tradeText(lastTrade))] : [] });
    });
  });

  // Phone Back button: one screen at a time (conversation, messages, home), then it closes the chat
  window.addEventListener('popstate', function () {
    if (S.skipPop) { S.skipPop = false; return; }
    if (!S.open) return;
    if (S.view === 'chat') { showPop(null); go('messages'); try { history.pushState({ vtChat: 1 }, ''); } catch (e) {} }
    else if (S.view === 'messages' || S.view === 'tickets') { go('home'); try { history.pushState({ vtChat: 1 }, ''); } catch (e) {} }
    else { S.pushed = false; close(); }
  });

  S.msgs.forEach(function (m) { if (m.role === 'trade') lastTrade = m.trade; else if (m.role === 'summary') lastTrade = { custom: m.summary.text, card: m.summary.title }; drawMsg(m); });
  if (CW && cw.conv) startPolling();
  refreshWa(); status(); drawHi(); drawRecent(); go('home'); badges();
  window.VTChat = { open: open, close: close, toggle: toggle, sendTrade: sendTrade, sendGiftCard: sendGiftCard, config: CHAT };
})();

(function () {
  var st = document.createElement('style'); st.setAttribute('data-vt-chat', 'media');
  st.textContent = '.vc-b.vc-media{padding:5px;display:flex;flex-direction:column;gap:5px;max-width:78%}.vc-img{display:block;max-width:100%;width:230px;height:auto;border-radius:14px;background:rgba(127,127,127,.15)}.vc-mst{font-size:12px;opacity:.75;padding:0 6px 2px}.vc-mst.vc-bad{color:#ffb3bb;opacity:1}.vc-file{display:block;padding:8px 10px;font-size:14px;word-break:break-all;color:inherit;text-decoration:none}a.vc-file{text-decoration:underline}';
  (document.head || document.documentElement).appendChild(st);
})();

// Link to open the chat on arrival, e.g. https://your-domain/?chat=1
(function () {
  if (!/[?&]chat=1(&|$)/.test(location.search) || !window.VTChat) return;
  try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
  setTimeout(function () { window.VTChat.open('chat'); }, 600);
})();
