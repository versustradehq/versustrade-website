/* VersusTrade chat widget: floating button + pop-up card that opens shortly after the page loads.
 *
 * Add to ANY page with one line, just before </body>:
 *   <script src="/blog/chat-widget.js" defer></script>
 *
 * The website chatbot isn't built yet, so for now both buttons open WhatsApp.
 * When the chatbot exists, define this on the page (before or after this script) and the buttons will use it instead:
 *   window.VersusChat = { open: function (mode) { /* mode is 'start' or 'question' *\/ } };
 *
 * Settings (optional, define before this script):
 *   window.VT_CHAT = { whatsapp: '234XXXXXXXXXX', delay: 1500, once: true };
 */
(function () {
  if (window.__vtChat) return; window.__vtChat = true;
  var cfg = window.VT_CHAT || {};
  var WA = cfg.whatsapp || 'YOURNUMBER';
  var DELAY = typeof cfg.delay === 'number' ? cfg.delay : 1500;
  var ONCE = cfg.once !== false;               // pop out once per browser session
  var LOGO = cfg.logo || 'https://pub-d09b462a1f3c4a8c8b73f79bcf29c60e.r2.dev/REAL%20LOGO%20%20VERSUSTRADE.png';
  var KEY = 'vt-chat-popped';

  var css = '\
.vtc,.vtc *{box-sizing:border-box}\
.vtc{position:fixed;right:20px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:200;font-family:var(--font,Inter,system-ui,"Segoe UI",Roboto,sans-serif);-webkit-font-smoothing:antialiased}\
.vtc-card{position:absolute;right:0;bottom:88px;width:min(420px,calc(100vw - 40px));padding:22px 22px 22px;border-radius:28px;color:#fff;background:linear-gradient(135deg,#0b0b0b 55%,#16233f 100%);border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 60px -12px rgba(0,0,0,.45);opacity:0;transform:translateY(14px) scale(.97);transform-origin:100% 100%;pointer-events:none;visibility:hidden;transition:opacity .35s ease,transform .45s cubic-bezier(.16,1,.3,1),visibility 0s linear .45s}\
.vtc.open .vtc-card{opacity:1;transform:none;pointer-events:auto;visibility:visible;transition:opacity .35s ease,transform .45s cubic-bezier(.16,1,.3,1),visibility 0s}\
.vtc-label{font-size:12px;font-weight:700;letter-spacing:.08em;color:rgba(255,255,255,.6)}\
.vtc-title{margin-top:6px;font-size:22px;line-height:1.2;font-weight:700;letter-spacing:-.02em;padding-right:132px}\
.vtc-status{margin-top:10px;display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600;color:rgba(255,255,255,.75)}\
.vtc-dot{width:14px;height:14px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 4px rgba(34,197,94,.22)}\
.vtc-av{position:absolute;top:22px;right:76px;display:flex}\
.vtc-av span{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;border:2px solid #0b0b0b;background:#fff;overflow:hidden}\
.vtc-av span+span{margin-left:-10px;background:#E8ECF4;color:#1A1A1A}\
.vtc-av img{width:28px;height:28px;object-fit:contain;display:block}\
.vtc-av svg{width:18px;height:18px}\
.vtc-x{position:absolute;top:22px;right:18px;width:50px;height:50px;border-radius:50%;display:grid;place-items:center;color:#fff;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);cursor:pointer;transition:background .15s}\
.vtc-x:hover{background:rgba(255,255,255,.16)}\
.vtc-x svg{width:16px;height:16px}\
.vtc-btns{margin-top:20px;display:flex;flex-wrap:wrap;gap:12px}\
.vtc-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:10px;height:58px;padding:0 22px;border-radius:999px;font:inherit;font-size:16px;font-weight:700;white-space:nowrap;cursor:pointer;border:1px solid transparent;transition:transform .15s,background .15s}\
.vtc-btn:hover{transform:translateY(-1px)}\
.vtc-btn svg{width:18px;height:18px;flex-shrink:0}\
.vtc-primary{background:#fff;color:#0b0b0b}\
.vtc-primary:hover{background:#f1f1f1}\
.vtc-ghost{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.14)}\
.vtc-ghost:hover{background:rgba(255,255,255,.2)}\
.vtc-fab{position:relative;display:grid;place-items:center;width:72px;height:72px;margin-left:auto;border-radius:50%;background:#000;color:#fff;cursor:pointer;border:1px solid rgba(255,255,255,.18);box-shadow:0 10px 30px -6px rgba(0,0,0,.45),0 0 0 6px rgba(225,29,46,.10);transition:transform .2s}\
.vtc-fab:hover{transform:scale(1.05)}\
.vtc-fab svg{width:28px;height:28px}\
.vtc-fab i{position:absolute;top:2px;right:2px;width:15px;height:15px;border-radius:50%;background:#22C55E;border:2px solid #fff}\
.vtc :focus-visible{outline:2px solid #fff;outline-offset:2px}\
.vtc-fab:focus-visible{outline-color:#E11D2E}\
@media (max-width:480px){.vtc{right:14px}.vtc-card{padding:18px}.vtc-av{top:18px;right:68px}.vtc-x{top:18px;right:14px;width:44px;height:44px}.vtc-title{font-size:20px;padding-right:118px}.vtc-btn{height:52px;font-size:15px;padding:0 16px}.vtc-fab{width:64px;height:64px}.vtc-card{bottom:80px}}\
@media (prefers-reduced-motion:reduce){.vtc-card,.vtc.open .vtc-card,.vtc-btn,.vtc-fab{transition:none}}\
@media print{.vtc{display:none}}';

  var CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.9A8 8 0 1 1 21 12z"/></svg>';
  var SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  var CLOSE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>';

  function mount() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var root = document.createElement('div'); root.className = 'vtc';
    root.innerHTML =
      '<div class="vtc-card" id="vtcCard" role="dialog" aria-label="Chat with VersusTrade" aria-hidden="true">' +
        '<div class="vtc-label">VERSUSTRADE</div>' +
        '<div class="vtc-title">Chat with VersusTrade</div>' +
        '<div class="vtc-status"><span class="vtc-dot"></span>Online now</div>' +
        '<div class="vtc-av" aria-hidden="true"><span><img src="' + LOGO + '" alt=""></span><span>' + CHAT + '</span></div>' +
        '<button class="vtc-x" type="button" aria-label="Close chat prompt">' + CLOSE + '</button>' +
        '<div class="vtc-btns">' +
          '<button class="vtc-btn vtc-primary" type="button" data-mode="start">' + CHAT + 'Start chat</button>' +
          '<button class="vtc-btn vtc-ghost" type="button" data-mode="question">' + SEARCH + 'Ask a question</button>' +
        '</div>' +
      '</div>' +
      '<button class="vtc-fab" type="button" aria-label="Chat with VersusTrade" aria-expanded="false" aria-controls="vtcCard">' + CHAT + '<i aria-hidden="true"></i></button>';
    document.body.appendChild(root);

    var card = root.querySelector('.vtc-card'), fab = root.querySelector('.vtc-fab');
    function set(open) {
      root.classList.toggle('open', open);
      card.setAttribute('aria-hidden', open ? 'false' : 'true');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function go(mode) {
      if (window.VersusChat && typeof window.VersusChat.open === 'function') { window.VersusChat.open(mode); set(false); return; }
      var text = mode === 'question' ? 'Hi VersusTrade, I have a question' : 'Hi VersusTrade';
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    }
    fab.addEventListener('click', function () { set(!root.classList.contains('open')); });
    root.querySelector('.vtc-x').addEventListener('click', function () { set(false); fab.focus(); });
    [].forEach.call(root.querySelectorAll('[data-mode]'), function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-mode')); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('open')) set(false); });

    var seen = false; try { seen = ONCE && sessionStorage.getItem(KEY) === '1'; } catch (x) {}
    if (!seen) setTimeout(function () { set(true); try { sessionStorage.setItem(KEY, '1'); } catch (x) {} }, DELAY);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
