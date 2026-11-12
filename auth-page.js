/* VersusTrade sign in / sign up popup (Supabase Auth over REST). The key below is the PUBLIC publishable key. */
(function () {
  var SB = { url: 'https://axldgaxsdgeycinxqbem.supabase.co', key: 'sb_publishable_eU9t7DqMTbeAOIdsXhcYmg_wwvmwm3j' };
  var GOOGLE = true; // set to true after Google sign-in is set up in Supabase (client ID and secret)
  var LOGO = 'https://pub-d09b462a1f3c4a8c8b73f79bcf29c60e.r2.dev/REAL%20LOGO%20%20VERSUSTRADE.png';
  var STORE = 'vt_auth_session';
  var session = null, remember = true; // signed in by default on this device (the "keep me signed in" box starts ticked), so other pages and tabs stay logged in
  function readStore() {
    try {
      var v = localStorage.getItem(STORE); if (v) { remember = true; return JSON.parse(v); }
      v = sessionStorage.getItem(STORE); if (v) { remember = false; return JSON.parse(v); }
    } catch (e) {}
    return null;
  }
  session = readStore();
  function persist() {
    try {
      localStorage.removeItem(STORE); sessionStorage.removeItem(STORE);
      if (session) (remember ? localStorage : sessionStorage).setItem(STORE, JSON.stringify(session));
    } catch (e) {}
  }
  function now() { return Math.floor(Date.now() / 1000); }
  function redirectAfterAuth() {
    // Route newly authenticated admins to the admin workspace; customers go to their dashboard.
    if ((location.pathname === '/' || /\/(login|signup)\/?$/.test(location.pathname)) && String(location.search || '').indexOf('account=1') < 0) {
      getToken().then(function (tok) {
        if (!tok) { window.location.replace('/dashboard/'); return; }
        return fetch('https://versustrade-admin-api.versustradehq.workers.dev/admin/verify', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' },
          body: '{}'
        }).then(function (r) { return r.json(); }).then(function (d) {
          window.location.replace(d && d.authorized === true ? '/admin' : '/dashboard/');
        }).catch(function () { window.location.replace('/dashboard/'); });
      }).catch(function () { window.location.replace('/dashboard/'); });
    }
  }
  var navAuthCheck = 0;
  function announce(initial) {
    var li = !!session, checkId = ++navAuthCheck, userId = li ? session.id : '';
    if (!li && window.VTNav) window.VTNav.setLabel('Log in');
    window.dispatchEvent(new CustomEvent('vt-auth', { detail: { loggedIn: li, email: session && session.email, initial: !!initial } }));
    if (!li) return;
    askProfile();
    // Resolve the account role before changing the nav label. Do not let a slower,
    // older verification response overwrite the label for a newer login/session.
    getToken().then(function (tok) {
      if (!tok || checkId !== navAuthCheck || !session || session.id !== userId) return;
      return fetch('https://versustrade-admin-api.versustradehq.workers.dev/admin/verify', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' },
        body: '{}'
      }).then(function (r) {
        if (!r.ok) throw new Error('Admin verification failed');
        return r.json();
      }).then(function (d) {
        if (checkId !== navAuthCheck || !session || session.id !== userId) return;
        if (window.VTNav) window.VTNav.setLabel(d && d.authorized === true ? 'Admin' : 'Dashboard');
      }).catch(function () {
        if (checkId === navAuthCheck && session && session.id === userId && window.VTNav) window.VTNav.setLabel('Dashboard');
      });
    }).catch(function () {
      if (checkId === navAuthCheck && session && session.id === userId && window.VTNav) window.VTNav.setLabel('Dashboard');
    });
  }
  window.addEventListener('storage', function (e) {
    if (e.key !== STORE) return;
    var prev = session; session = readStore();
    if (!session !== !prev) announce();
    else if (session && prev && session.name !== prev.name) window.dispatchEvent(new CustomEvent('vt-profile', { detail: { name: session.name } }));
  });
 function setSession(d) {
  var user = d.user || null;
  var previous = session;

  session = {
    access_token: d.access_token || (previous && previous.access_token) || '',
    refresh_token: d.refresh_token || (previous && previous.refresh_token) || '',
    expires_at: d.expires_at || (now() + (d.expires_in || 3600)),
    email: (user && user.email) || (previous && previous.email) || '',
    id: (user && user.id) || (previous && previous.id) || '',
    name: user ? nameOf(user) : ((previous && previous.name) || ''),
    phone: (user && user.user_metadata && user.user_metadata.phone) || (previous && previous.phone) || '',
    dob: (user && user.user_metadata && user.user_metadata.dob) || (previous && previous.dob) || '',
    profileDone: user ? hasProfile(user) : !!(previous && previous.profileDone),
    created: (user && user.created_at && Date.parse(user.created_at)) || (previous && previous.created) || 0
  };

  persist();
}

function hasProfile(u) {
  var m = u && u.user_metadata;
  return !!(m && m.dob && m.phone && (m.full_name || m.name));
}

function nameOf(u) {
  var m = u && u.user_metadata;
  return String((m && (m.name || m.full_name || m.username)) || '').trim();
}
  function call(path, o) {
    o = o || {};
    var h = { apikey: SB.key };
    if (o.body) h['Content-Type'] = 'application/json';
    if (o.token) h.Authorization = 'Bearer ' + o.token;
    return fetch(SB.url + '/auth/v1' + path, { method: o.method || 'POST', headers: h, body: o.body ? JSON.stringify(o.body) : undefined }).then(function (r) {
      return r.text().then(function (t) { var j = {}; try { j = t ? JSON.parse(t) : {}; } catch (e) {} return { ok: r.ok, status: r.status, data: j }; });
    });
  }
  var refreshing = null;
  function getToken() {
    if (!session) return Promise.resolve(null);
    if (session.expires_at - 60 > now()) return Promise.resolve(session.access_token);
    if (!refreshing) {
      refreshing = call('/token?grant_type=refresh_token', { body: { refresh_token: session.refresh_token } }).then(function (r) {
        refreshing = null;
        if (r.ok && r.data.access_token) { setSession(r.data); return session.access_token; }
        // another page or tab may have just renewed the login (each renewal replaces the refresh token): use theirs instead of logging out
        var latest = readStore();
        if (latest && latest.refresh_token && latest.refresh_token !== session.refresh_token) { session = latest; if (session.expires_at - 60 > now()) return session.access_token; }
        if (r.status >= 400 && r.status < 500 && r.status !== 429) { session = null; persist(); announce(); }
        return null;
      }, function () { refreshing = null; return null; });
    }
    return refreshing;
  }

  /* ---------- popup ---------- */
  var ICON = {
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4.4-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
    google: '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7-10.2 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>'
  };
  var root = document.createElement('div');
  root.className = 'va auth-page';
  root.setAttribute('role', 'main');
  root.innerHTML = '<video class="auth-bg-video" autoplay muted loop playsinline preload="metadata" aria-hidden="true"><source src="https://pub-d09b462a1f3c4a8c8b73f79bcf29c60e.r2.dev/VERSUS%20CRYPTO.mp4" type="video/mp4"></video><canvas class="auth-bg-globe" id="authGlobe" aria-hidden="true"></canvas><div class="auth-layout"><section class="auth-story"><a class="auth-brand" href="/" aria-label="VersusTrade home"><img src="' + LOGO + '" alt="VersusTrade"></a><div class="auth-story-copy"><span class="auth-eyebrow">TRUST. RELIABILITY. EVERY TRANSACTION.</span><h1>Trade with confidence.<br><em>Move with reliability.</em></h1><p>Crypto, gift cards and cross-border payments — backed by a team you can count on.</p><div class="auth-trust"><span class="auth-trust-dot"></span>Secure transactions. Reliable support.</div></div><div class="auth-story-foot">POWERED BY RELIABILITY. DRIVEN BY TRUST.</div></section><section class="auth-panel"><div class="auth-top"><a class="auth-mobile-brand" href="/"><img src="' + LOGO + '" alt="VersusTrade"></a><button type="button" class="auth-theme" id="authTheme" aria-label="Switch colour theme"><span class="auth-theme-icon">◐</span><span class="auth-theme-label">Light mode</span></button></div><div class="va-card"><div id="vaBody"></div></div><p class="auth-legal">By continuing, you agree to VersusTrade’s <a href="/privacy/">Privacy Policy</a> and <a href="/terms/">Terms of Service</a>.</p></section></div>';
  document.body.appendChild(root);
  <script>
// Hero globe: dotted land, red arcs, city markers. Drag to rotate.
(function () {
  var cv = document.getElementById('authGlobe');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d'), root = document.documentElement, D = Math.PI / 180;
  var COLS = 144, ROWS = 72, STEP = 2.5;
  var LAND = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPCf//8HAAAAAAAAAAAAAAAAyPzz//8A4AAAAAADAAAAAACAlAnw//8AAAAAB4AfAAAAAADAAywA/P8AAABgAP4fAAEAAQIAPvYH+H8AAABguP//7x8A4P//K9wc+B8AgH+g1///////z////z98+AMC4L/8////////AP///684+AAB8P7///////9/wP///wMGcAAAfP7//////38fgAf+/wd+AAAAfP7//////wEBAAH4/x9+AABAKP//////f8ABAADw/3//AQCw+P///////8AAAADg////AwDA/////////wAAAADA//8vBwDA/////////wAAAADA//8/AACA/6/v////fwAAAADA//8PAACA1wf3////PwIAAADA//8HAADwYW/P////DwEAAACA//8DAADwQPnP//9/BAEAAACA//8DAAAAD+D/////yAAAAAAA/v8BAADgD8D/////IAAAAAAA+n8AAADwf9f/////AQAAAAAA/IMAAADw///3////AQAAAAAA8IEAAAD8/7/P////AAAAAAAA4AEAAAD8/79/+P9/AQAAAAAAwBEAAAD+/3//8OcHAAAAAAAAwBsYAAD8/39/4MMLAAAAAAAAAB4AAAD+//8e4IEHAQAAAAAAAHAAAAD+//8HwIAPAwAAAAAAAAAUAAD8//8JwIAGAAAAAAAAAID+AAD4//8PAIAABAAAAAAAAAD+AQDw/f8PAAEBAAAAAAAAAAD+DwAA8P8HAIBhAAAAAAAAAAD/DwAA8P8DAABzAAAAAAAAAAD/PwAA8P8BAABzMQAAAAAAAAD//wEA8P8AAAACwQMAAAAAAAD//wMA4P8AAAAEgAcAAAAAAAD//wMA4P8AAACABQEAAAAAAAD+/wEA4P8AAAAAAAAAAAAAAAD+/wAA4P8IAAAAMAAAAAAAAAD4/wAA4P8MAAAAfgIAAAAAAADw/wAA4D8MAAAA/gcAAAAAAADw/wAA4D8GAADA/w8AAAAAAADwPwAAwD8GAADg/w8AAAAAAADwHwAAwB8AAADg/x8AAAAAAAD4DwAAgB8AAADA/x8AAAAAAAD4DwAAgA8AAADA/x8AAAAAAAD4BwAAgAMAAADAwx8AAAAAAAD4AQAAAAAAAAAAAA8AAAAAAAD4AAAAAAAAAAAAAARAAAAAAAA8AAAAAAAAAAAAAAQgAAAAAAA4AAAAAAAAAAAAAAAQAAAAAAAcAAAAAAAAAAAAAAAIAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAMAQAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  var MARKERS = [
    { n: 'Lagos', t: '\u20A610M sent', lat: 6.52, lng: 3.38, side: 'bl', big: 1 },
    { n: 'Abuja', t: '\u20A625M received', lat: 9.07, lng: 7.4, side: 'tr' },
    { n: 'London', t: '\u00A350K received', lat: 51.51, lng: -0.13, side: 'l' },
    { n: 'New York', t: '5,000 USDT received', lat: 40.71, lng: -74.01, side: 'bl' },
    { n: 'S\u00E3o Paulo', t: '20 SOL sent', lat: -23.55, lng: -46.63, side: 'l' },
    { n: 'Dubai', t: '1 BTC sent', lat: 25.2, lng: 55.27, side: 'r' },
    { n: 'Singapore', t: '3,200 USDT sent', lat: 1.35, lng: 103.82, side: 'r' }
  ];
  var ARCS = [['London', 'New York'], ['London', 'Dubai'], ['New York', 'S\u00E3o Paulo'], ['Lagos', 'London'], ['Lagos', 'Dubai'], ['Lagos', 'New York'], ['Lagos', 'Abuja']];
  // Visitors who ask their device for reduced motion get a calmer globe (slower spin, no pulses).
  // Set RESPECT_REDUCED_MOTION to true to make it fully still for them. Dragging always works.
  var RESPECT_REDUCED_MOTION = false;
  var reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var still = reduced && RESPECT_REDUCED_MOTION, calm = reduced, spin = reduced ? 2 : 5;

  // land dots from the packed mask
  var bin = atob(LAND), dots = [];
  for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
    var i = r * COLS + c;
    if ((bin.charCodeAt(i >> 3) >> (i & 7)) & 1) {
      var la = (90 - (r + .5) * STEP) * D, ln = (-180 + (c + .5) * STEP) * D;
      dots.push([la, ln, Math.sin(la), Math.cos(la)]);
    }
  }

  function byName(n) { for (var k = 0; k < MARKERS.length; k++) if (MARKERS[k].n === n) return MARKERS[k]; }
  function vec(m) { var la = m.lat * D, ln = m.lng * D; return [Math.cos(la) * Math.cos(ln), Math.cos(la) * Math.sin(ln), Math.sin(la)]; }
  var arcs = ARCS.map(function (p, idx) {
    var a = vec(byName(p[0])), b = vec(byName(p[1]));
    var dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), om = Math.acos(dot), so = Math.sin(om), pts = [];
    for (var s = 0; s <= 48; s++) {
      var t = s / 48, w1 = Math.sin((1 - t) * om) / so, w2 = Math.sin(t * om) / so;
      var v = [w1 * a[0] + w2 * b[0], w1 * a[1] + w2 * b[1], w1 * a[2] + w2 * b[2]];
      pts.push([Math.asin(v[2]), Math.atan2(v[1], v[0]), 1 + (0.03 + 0.25 * om / Math.PI) * Math.sin(Math.PI * t)]);
    }
    return { pts: pts, off: idx * 0.17 };
  });

  var W = 300, R = 120, cx = 150, cy = 150, lat0 = 30 * D, lng0 = -25 * D, pal = null, tick = 0;

  // Light page: black land on a light globe with red lines.
  // Dark page: black globe with white land and white lines (markers stay red).
  // Set BLACK_SPHERE to true to use the black globe on the light page too.
  var BLACK_SPHERE = false;
  function palette() {
    var dark = BLACK_SPHERE || getComputedStyle(root).colorScheme === 'dark';
    return dark
      ? { s0: '#141416', s1: '#000000', edge: 'rgba(255,255,255,.28)', halo: 'rgba(255,255,255,.07)', dot: '255,255,255', line: '255,255,255', rgb: '255,64,80', text: '#F5F5F5', pill: 'rgba(12,12,12,.9)', ring: '#FFFFFF' }
      : { s0: '#FFFFFF', s1: '#E9E9EC', edge: 'rgba(0,0,0,.16)', halo: 'rgba(0,0,0,.06)', dot: '22,22,24', line: '225,29,46', rgb: '225,29,46', text: '#1A1A1A', pill: 'rgba(255,255,255,.92)', ring: '#FFFFFF' };
  }
  function proj(lat, lng, k) {
    var cl = Math.cos(lat), dl = lng - lng0, c0 = Math.cos(lat0), s0 = Math.sin(lat0), sl = Math.sin(lat);
    var x = cl * Math.sin(dl), y = c0 * sl - s0 * cl * Math.cos(dl), z = s0 * sl + c0 * cl * Math.cos(dl);
    return [cx + R * k * x, cy - R * k * y, z];
  }
  function pill(x, y, w, h, rad) {
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, rad); }
    else { ctx.beginPath(); ctx.rect(x, y, w, h); }
  }

  function draw(ts) {
    if (!pal || tick++ % 45 === 0) pal = palette();
    var t = ts / 1000;
    ctx.clearRect(0, 0, W, W);

    var h = ctx.createRadialGradient(cx, cy, R, cx, cy, R * 1.2);
    h.addColorStop(0, pal.halo); h.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = h; ctx.beginPath(); ctx.arc(cx, cy, R * 1.2, 0, 6.2832); ctx.fill();

    var g = ctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R);
    g.addColorStop(0, pal.s0); g.addColorStop(1, pal.s1);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = pal.edge; ctx.lineWidth = 1; ctx.stroke();

    // land dots in three depth bands
    var sz = Math.max(1.1, R / 150), bands = [new Path2D(), new Path2D(), new Path2D()];
    var c0 = Math.cos(lat0), s0 = Math.sin(lat0);
    for (var n = 0; n < dots.length; n++) {
      var d = dots[n], dl = d[1] - lng0, cd = Math.cos(dl);
      var z = s0 * d[2] + c0 * d[3] * cd;
      if (z <= 0.02) continue;
      var x = d[3] * Math.sin(dl), y = c0 * d[2] - s0 * d[3] * cd;
      var bp = bands[z > .6 ? 2 : z > .3 ? 1 : 0], px0 = cx + R * x, py0 = cy - R * y;
      bp.moveTo(px0 + sz, py0); bp.arc(px0, py0, sz, 0, 6.2832);
    }
    var al = [.3, .55, .9];
    for (var b = 0; b < 3; b++) { ctx.fillStyle = 'rgba(' + pal.dot + ',' + al[b] + ')'; ctx.fill(bands[b]); }

    // arcs and travelling pulses
    ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    arcs.forEach(function (a) {
      ctx.strokeStyle = 'rgba(' + pal.line + ',.7)'; ctx.beginPath();
      var pen = false;
      a.pts.forEach(function (p) {
        var q = proj(p[0], p[1], p[2]);
        if (q[2] > 0) { if (pen) ctx.lineTo(q[0], q[1]); else { ctx.moveTo(q[0], q[1]); pen = true; } } else pen = false;
      });
      ctx.stroke();
      if (!calm) {
        var f = ((t * .22 + a.off) % 1) * 48, k = Math.floor(f), p0 = a.pts[k], q = proj(p0[0], p0[1], p0[2]);
        if (q[2] > 0) {
          ctx.fillStyle = 'rgba(' + pal.line + ',.95)'; ctx.beginPath(); ctx.arc(q[0], q[1], 2.4, 0, 6.2832); ctx.fill();
        }
      }
    });

    // markers and labels
    var fs = Math.max(10, Math.min(12, W / 34)); // smaller labels on small screens
    ctx.font = '600 ' + fs.toFixed(1) + 'px -apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,Ubuntu,sans-serif'; ctx.textBaseline = 'middle';
    MARKERS.forEach(function (m) {
      var q = proj(m.lat * D, m.lng * D, 1);
      if (q[2] <= 0.05) return;
      var rad = m.big ? 5.5 : 4;
      if (!calm) {
        var ph = (t * .8 + MARKERS.indexOf(m) * .137) % 1;
        ctx.strokeStyle = 'rgba(' + pal.rgb + ',' + (0.45 * (1 - ph)).toFixed(3) + ')'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(q[0], q[1], rad + ph * 12, 0, 6.2832); ctx.stroke();
      }
      ctx.fillStyle = 'rgb(' + pal.rgb + ')'; ctx.strokeStyle = pal.ring; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(q[0], q[1], rad, 0, 6.2832); ctx.stroke(); ctx.fill();

      var label = m.t || m.n, tw = ctx.measureText(label).width, pw = tw + 14, ph2 = Math.round(fs * 1.85), px, py;
      if (m.side === 'r') { px = q[0] + 9; py = q[1] - ph2 / 2; }
      else if (m.side === 'l') { px = q[0] - 9 - pw; py = q[1] - ph2 / 2; }
      else if (m.side === 'tr') { px = q[0] + 8; py = q[1] - ph2 - 6; }
      else { px = q[0] - 8 - pw; py = q[1] + 6; }
      px = Math.max(4, Math.min(W - pw - 4, px)); py = Math.max(4, Math.min(W - ph2 - 4, py)); // keep the label inside the canvas
      ctx.globalAlpha = Math.min(1, (q[2] - .05) * 4);
      ctx.fillStyle = pal.pill; pill(px, py, pw, ph2, 11); ctx.fill();
      ctx.fillStyle = pal.text; ctx.textAlign = 'left'; ctx.fillText(label, px + 7, py + ph2 / 2 + .5);
      ctx.globalAlpha = 1;
    });
  }

  function size() {
    var w = cv.clientWidth || 300, dpr = Math.min(2, window.devicePixelRatio || 1);
    W = w; cv.width = Math.round(w * dpr); cv.height = Math.round(w * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = w / 2 * 0.74; cx = cy = w / 2;
  }

  var run = false, last = 0, drag = false, lx = 0, ly = 0, raf = 0, vx = 0, vy = 0, onScreen = true;
  function clampLat(v) { return Math.max(-1, Math.min(1, v)); }
  function frame(ts) {
    if (!run) return;
    var dt = Math.min(.05, (ts - last) / 1000); last = ts;
    if (!drag && !still) {
      lng0 += dt * spin * D - vx; lat0 = clampLat(lat0 + vy);   // slow spin + momentum from the last drag
      vx *= .94; vy *= .9;
    }
    draw(ts);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (run || still) return; run = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { run = false; cancelAnimationFrame(raf); }

  size(); draw(0);
  if (window.ResizeObserver) new ResizeObserver(function () { size(); draw(performance.now()); }).observe(cv);
  else window.addEventListener('resize', function () { size(); draw(performance.now()); });
  if (window.IntersectionObserver) new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; if (onScreen && !document.hidden) start(); else stop(); }).observe(cv);
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (onScreen) start(); });
  start();

  // Drag to rotate: mouse, touch or pen. Listens on the whole window and checks whether the pointer is
  // over the globe, so nothing sitting on top of the canvas can block it. Redraws straight away.
  var activeId = null;
  function over(x, y) { var r = cv.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
  function down(x, y) { drag = true; lx = x; ly = y; vx = vy = 0; cv.classList.add('grab'); document.body.style.userSelect = 'none'; }
  function move(x, y) {
    if (!drag) return;
    var dx = x - lx, dy = y - ly;
    lng0 -= dx * .007; lat0 = clampLat(lat0 + dy * .005);
    vx = dx * .007; vy = dy * .005;
    lx = x; ly = y;
    draw(performance.now());
  }
  function up() { if (!drag) return; drag = false; activeId = null; cv.classList.remove('grab'); document.body.style.userSelect = ''; if (still) { vx = vy = 0; } }
  if (window.PointerEvent) {
    window.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (!over(e.clientX, e.clientY)) return;
      activeId = e.pointerId; down(e.clientX, e.clientY);
    }, true);
    window.addEventListener('pointermove', function (e) { if (drag && e.pointerId === activeId) move(e.clientX, e.clientY); }, true);
    window.addEventListener('pointerup', function (e) { if (e.pointerId === activeId) up(); }, true);
    window.addEventListener('pointercancel', function (e) { if (e.pointerId === activeId) up(); }, true);
  } else {
    window.addEventListener('mousedown', function (e) { if (over(e.clientX, e.clientY)) down(e.clientX, e.clientY); }, true);
    window.addEventListener('mousemove', function (e) { move(e.clientX, e.clientY); }, true);
    window.addEventListener('mouseup', up, true);
    window.addEventListener('touchstart', function (e) { var t = e.touches[0]; if (over(t.clientX, t.clientY)) down(t.clientX, t.clientY); }, { passive: true, capture: true });
    window.addEventListener('touchmove', function (e) { var t = e.touches[0]; move(t.clientX, t.clientY); }, { passive: true, capture: true });
    window.addEventListener('touchend', up, true);
  }
})();
</script>
  var body = root.querySelector('#vaBody');
  var st = { tab: /\/signup\/?$/.test(location.pathname) ? 'signup' : 'login', email: '', name: '', phone: '', dob: '', mode: 'email', afterNewPass: false }, timer = 0, busy = false, lastFocus = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(sel) { return body.querySelector(sel); }
  function setErr(msg) { var e = $('.va-err'); if (!e) return; e.textContent = msg || ''; e.hidden = !msg; }
  var MIN_AGE = 18; // youngest age allowed to sign up (set 0 to switch the age check off)
  function checkName(v) {
    v = String(v || '').replace(/\s+/g, ' ').trim();
    if (!v) return 'Please enter your full name.';
    if (v.length > 80 || !/[A-Za-z\u00C0-\u024F]/.test(v)) return 'Please enter your full name.';
    if (v.split(' ').length < 2) return 'Please enter your first and last name.';
    return '';
  }
  function normPhone(raw) {
    var t = String(raw || '').trim().replace(/[\s().\-]/g, '');
    if (/^00/.test(t)) t = '+' + t.slice(2);
    if (!/^\+?\d+$/.test(t)) return '';
    if (t.charAt(0) === '+') { var d = t.slice(1); return d.length >= 8 && d.length <= 15 && d.charAt(0) !== '0' ? '+' + d : ''; }
    if (/^0\d{10}$/.test(t)) return '+234' + t.slice(1);
    if (/^234\d{10}$/.test(t)) return '+' + t;
    if (/^[789]\d{9}$/.test(t)) return '+234' + t;
    return '';
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function maxDob() { var d = new Date(); d.setFullYear(d.getFullYear() - MIN_AGE); return ymd(d); }
  function checkDob(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || ''));
    if (!m) return 'Please enter your date of birth.';
    var y = +m[1], mo = +m[2], da = +m[3], d = new Date(y, mo - 1, da);
    if (d.getFullYear() !== y || d.getMonth() !== mo - 1 || d.getDate() !== da || y < 1900 || d > new Date()) return 'Please enter a valid date of birth.';
    if (MIN_AGE && v > maxDob()) return 'You must be ' + MIN_AGE + ' or older to create an account.';
    return '';
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function lower(r) { return String((r.data && (r.data.msg || r.data.error_description || r.data.message || r.data.error_code)) || '').toLowerCase(); }
  function friendly(r, ctx) {
    var m = lower(r);
    if (r.status === 429 || m.indexOf('rate') > -1 || m.indexOf('seconds') > -1) return 'Too many tries. Please wait a minute, then try again.';
    if (ctx === 'login' && (m.indexOf('invalid') > -1 || m.indexOf('credentials') > -1)) return 'Incorrect email or password.';
    if (ctx === 'code' && (m.indexOf('expired') > -1 || m.indexOf('invalid') > -1 || m.indexOf('token') > -1)) return 'That code didn\u2019t work. Check it, or ask for a new one.';
    if (m.indexOf('password') > -1) return 'Please choose a stronger password (at least 8 characters).';
    if (m.indexOf('already') > -1) return 'This email already has an account. Please log in.';
    if (m.indexOf('email') > -1 && m.indexOf('valid') > -1) return 'Please enter a valid email address.';
    return 'Something went wrong. Please try again.';
  }
  var NET = 'Couldn\u2019t reach the sign-in service. Check your connection and try again.';

  function pwField(id, ac, ph) {
    return '<div class="va-pw"><input class="va-in" id="' + id + '" type="password" autocomplete="' + ac + '" placeholder="' + ph + '"><button type="button" class="va-eye" data-eye="' + id + '" aria-label="Show password">' + ICON.eye + '</button></div>';
  }
  function fieldName() { return '<label class="va-lab" for="vaName">Full name</label><input class="va-in" id="vaName" type="text" autocomplete="name" maxlength="80" placeholder="Enter your full name">'; }
  function fieldPhone() { return '<label class="va-lab" for="vaPhone">Phone number</label><input class="va-in" id="vaPhone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="e.g. 0801 234 5678">'; }
  function fieldDob() { return '<label class="va-lab" for="vaDob">Date of birth</label><input class="va-in" id="vaDob" type="date" autocomplete="bday" min="1900-01-01" max="' + maxDob() + '">'; }
  function wireEyes() {
    [].forEach.call(body.querySelectorAll('[data-eye]'), function (b) {
      b.addEventListener('click', function () {
        var i = body.querySelector('#' + b.getAttribute('data-eye')), show = i.type === 'password';
        i.type = show ? 'text' : 'password'; b.innerHTML = show ? ICON.eyeOff : ICON.eye; b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      });
    });
  }
  function head(title, sub, logo) {
    return '<div class="va-head">' + (logo ? '<span class="va-logo"><img src="' + LOGO + '" alt="" width="36" height="36"></span>' : '') + '<h2 class="va-t" id="vaTitle">' + title + '</h2>' + (sub ? '<p class="va-s">' + sub + '</p>' : '') + '</div>';
  }

  function view(name) {
    clearInterval(timer); busy = false;
    if (name === 'main') {
      var login = st.tab === 'login';
      body.innerHTML = head(login ? 'Log in to your account' : 'Create an account', login ? 'Welcome back! Please enter your details.' : 'Enter your details to get started.', true) +
        '<form class="va-form" id="vaForm" novalidate><div class="va-err" hidden></div>' +
        (login ? '' : fieldName()) +
        '<label class="va-lab" for="vaEmail">Email</label><input class="va-in" id="vaEmail" type="email" inputmode="email" autocomplete="email" placeholder="Enter your email">' +
        (login ? '' : fieldPhone() + fieldDob()) +
        '<label class="va-lab" for="vaPass">Password</label>' + pwField('vaPass', login ? 'current-password' : 'new-password', login ? 'Enter your password' : 'Create a password') +
        (login ? '' : '<p class="va-hint">Must be at least 8 characters.</p>') +
        '<div class="va-opts"><label class="va-chk"><input type="checkbox" id="vaKeep"><span>Keep me signed in</span></label>' + (login ? '<button type="button" class="va-a" id="vaForgot">Forgot password</button>' : '') + '</div>' +
        '<button type="submit" class="va-btn" id="vaGo">' + (login ? 'Sign in' : 'Create account') + '</button></form>' +
        (login ? '<button type="button" class="va-btn alt" id="vaCodeLogin">Email me a code instead</button>' : '') +
        (GOOGLE ? '<button type="button" class="va-btn alt" id="vaGoogle">' + ICON.google + 'Continue with Google</button>' : '') +
        '<p class="va-foot">' + (login ? 'Don\u2019t have an account? <a class="va-a" href="/signup/">Sign up</a>' : 'Already have an account? <a class="va-a" href="/login/">Log in</a>') + '</p>';
      var em = $('#vaEmail'), keep = $('#vaKeep'); em.value = st.email; keep.checked = remember;
      if (!login) { $('#vaName').value = st.name; $('#vaPhone').value = st.phone; $('#vaDob').value = st.dob; }

      $('#vaForm').addEventListener('submit', function (e) { e.preventDefault(); keep.checked ? remember = true : remember = false; if (login) doLogin(em.value.trim(), $('#vaPass').value); else doSignup(em.value.trim(), $('#vaPass').value, { name: $('#vaName').value, phone: $('#vaPhone').value, dob: $('#vaDob').value }); });
      if (login) {
        $('#vaForgot').addEventListener('click', function () { remember = keep.checked; startCode(em.value.trim(), true); });
        $('#vaCodeLogin').addEventListener('click', function () { remember = keep.checked; startCode(em.value.trim(), false); });
      }
      if (GOOGLE) $('#vaGoogle').addEventListener('click', function () { window.location.href = SB.url + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(location.origin + location.pathname); });
      wireEyes(); setTimeout(function () { (em.value ? $('#vaPass') : em).focus(); }, 60);
    } else if (name === 'code') {
      body.innerHTML = head('Check your email', 'We sent a code to <b>' + esc(st.email) + '</b>. Enter it below.' + (st.mode === 'signup' ? ' If you already have an account, go back and use Log in.' : ''), false) +
        '<form class="va-form" id="vaF2" novalidate><div class="va-err" hidden></div><div class="va-code-entry"><div class="va-code-slots" id="vaCodeSlots" aria-hidden="true"><span class="va-code-slot"></span><span class="va-code-slot"></span><span class="va-code-slot"></span><span class="va-code-slot"></span><span class="va-code-slot"></span><span class="va-code-slot"></span></div><input class="va-code-native" id="vaCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="Six-digit code from your email" autocapitalize="off" spellcheck="false"></div><button type="submit" class="va-btn" id="vaVerify" disabled>Verify</button></form>' +
        '<div class="va-row"><button type="button" class="va-a" id="vaResend" disabled>Resend code</button><button type="button" class="va-a" id="vaBack">Back</button></div>';
      var code = $('#vaCode'), vb = $('#vaVerify'), slots = Array.prototype.slice.call($('#vaCodeSlots').children);
      function paintCodeSlots() {
        var digits = code.value.split('');
        slots.forEach(function (slot, i) {
          slot.textContent = digits[i] || '';
          slot.classList.toggle('filled', !!digits[i]);
          slot.classList.toggle('active', i === digits.length && digits.length < 6);
          slot.classList.toggle('error', !!$('.va-err') && !$('.va-err').hidden);
          if (i === digits.length && digits.length < 6) { slot.innerHTML = '<span class="va-code-caret"></span>'; slot.classList.toggle('filled', false); }
        });
      }
      code.addEventListener('input', function () { code.value = code.value.replace(/\D/g, '').slice(0, 6); vb.disabled = code.value.length !== 6; paintCodeSlots(); setErr(''); });
      $('#vaCodeSlots').addEventListener('click', function () { code.focus(); });
      paintCodeSlots();
      $('#vaF2').addEventListener('submit', function (e) { e.preventDefault(); if (code.value.length === 6) verify(code.value); });
      $('#vaBack').addEventListener('click', function () { view('main'); });
      $('#vaResend').addEventListener('click', resend);
      cooldown(60); setTimeout(function () { code.focus(); }, 60);
    } else if (name === 'newpass') {
      body.innerHTML = head(st.afterNewPass ? 'Set a new password' : 'Change password', 'Choose a password you\u2019ll use to log in next time.', false) +
        '<form class="va-form" id="vaF3" novalidate><div class="va-err" hidden></div><label class="va-lab" for="vaNew">New password</label>' + pwField('vaNew', 'new-password', 'Create a password') +
        '<p class="va-hint">Must be at least 8 characters.</p><button type="submit" class="va-btn" id="vaSave">Save password</button></form>' +
        '<button type="button" class="va-btn alt" id="vaSkip">' + (st.afterNewPass ? 'Skip for now' : 'Cancel') + '</button>';
      $('#vaF3').addEventListener('submit', function (e) { e.preventDefault(); savePassword($('#vaNew').value); });
      $('#vaSkip').addEventListener('click', function () { close(); });
      wireEyes(); setTimeout(function () { $('#vaNew').focus(); }, 60);
    } else if (name === 'profile') {
  body.innerHTML = head('Complete your details', 'Just a few quick details to finish setting up your account.', true) +
    '<form class="va-form" id="vaPf" novalidate><div class="va-err" hidden></div>' + fieldName() + fieldPhone() + fieldDob() +
    '<button type="submit" class="va-btn" id="vaPfGo">Continue</button></form>';

  $('#vaName').value = (session && session.name) || '';
  $('#vaPhone').value = (session && session.phone) || '';
  $('#vaDob').value = (session && session.dob) || '';

  $('#vaPf').addEventListener('submit', function (e) {
    e.preventDefault();
    saveProfile({
      name: $('#vaName').value,
      phone: $('#vaPhone').value,
      dob: $('#vaDob').value
    });
  });

  setTimeout(function () {
    ($('#vaName').value ? $('#vaPhone') : $('#vaName')).focus();
  }, 60);
} else {
  body.innerHTML = head('You\u2019re signed in', 'Signed in as <b>' + esc(session ? session.email : '') + '</b>. Your chats with VersusTrade are saved to this account.', true) +
    '<button type="button" class="va-btn alt" id="vaChange">Change password</button><button type="button" class="va-btn alt" id="vaOut">Log out</button>';

  $('#vaChange').addEventListener('click', function () {
    st.afterNewPass = false;
    view('newpass');
  });

  $('#vaOut').addEventListener('click', logout);
}
  }
  function cooldown(sec) {
    var b = $('#vaResend'); if (!b) return; var left = sec;
    function tick() { if (!body.contains(b)) { clearInterval(timer); return; } b.disabled = left > 0; b.textContent = left > 0 ? 'Resend code in ' + left + 's' : 'Resend code'; left--; if (left < -1) clearInterval(timer); }
    tick(); timer = setInterval(tick, 1000);
  }
  function lock(btn, text) { if (btn) { btn.disabled = true; btn.setAttribute('data-t', btn.textContent); btn.textContent = text; } }
  function unlock(btn) { if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute('data-t') || btn.textContent; } }

  function doLogin(email, password) {
    if (busy) return;
    if (!validEmail(email)) { setErr('Please enter a valid email address.'); return; }
    if (!password) { setErr('Please enter your password.'); return; }
    busy = true; st.email = email.toLowerCase(); var b = $('#vaGo'); lock(b, 'Signing in\u2026'); setErr('');
    call('/token?grant_type=password', { body: { email: st.email, password: password } }).then(function (r) {
      busy = false;
      if (r.ok && r.data.access_token) { setSession(r.data); announce(); redirectAfterAuth(); close(); return; }
      unlock(b);
      if (lower(r).indexOf('not confirmed') > -1) { st.mode = 'signup'; call('/resend', { body: { type: 'signup', email: st.email } }); view('code'); return; }
      setErr(friendly(r, 'login'));
    }, function () { busy = false; unlock(b); setErr(NET); });
  }
  function doSignup(email, password, x) {
    if (busy) return;
    x = x || {};
    var nm = String(x.name || '').replace(/\s+/g, ' ').trim(), ph = normPhone(x.phone), eName = checkName(nm), eDob = checkDob(x.dob);
    st.name = nm; st.phone = x.phone || ''; st.dob = x.dob || '';
    if (eName) { setErr(eName); return; }
    if (!validEmail(email)) { setErr('Please enter a valid email address.'); return; }
    if (!ph) { setErr('Please enter a valid phone number, for example 0801 234 5678.'); return; }
    if (eDob) { setErr(eDob); return; }
    if (password.length < 8) { setErr('Your password must be at least 8 characters.'); return; }
    busy = true; st.email = email.toLowerCase(); var b = $('#vaGo'); lock(b, 'Creating account\u2026'); setErr('');
    call('/signup', { body: { email: st.email, password: password, data: { full_name: nm, name: nm, dob: x.dob, phone: ph } } }).then(function (r) {
      busy = false;
      if (r.ok && r.data.access_token) { setSession(r.data); announce(); redirectAfterAuth(); close(); return; }
      if (r.ok) { st.mode = 'signup'; st.afterNewPass = false; view('code'); return; }
      unlock(b); setErr(friendly(r, 'signup'));
    }, function () { busy = false; unlock(b); setErr(NET); });
  }
  function startCode(email, forgot) {
    if (busy) return;
    if (!validEmail(email)) { setErr(forgot ? 'Enter your email above first, then choose Forgot password.' : 'Enter your email above first.'); return; }
    busy = true; st.email = email.toLowerCase(); setErr('');
    call('/otp', { body: { email: st.email, create_user: true } }).then(function (r) {
      busy = false;
      if (r.ok) { st.mode = 'email'; st.afterNewPass = !!forgot; view('code'); return; }
      setErr(friendly(r, 'otp'));
    }, function () { busy = false; setErr(NET); });
  }
  function resend() {
    if (busy) return; busy = true;
    var p = st.mode === 'signup' ? call('/resend', { body: { type: 'signup', email: st.email } }) : call('/otp', { body: { email: st.email, create_user: true } });
    p.then(function (r) { busy = false; if (r.ok) { setErr(''); cooldown(60); } else setErr(friendly(r, 'otp')); }, function () { busy = false; setErr(NET); });
  }
  function verify(token) {
    if (busy) return; busy = true;
    var vb = $('#vaVerify'); lock(vb, 'Checking\u2026');
    call('/verify', { body: { type: st.mode === 'signup' ? 'signup' : 'email', email: st.email, token: token } }).then(function (r) {
      busy = false;
      if (r.ok && r.data.access_token) { setSession(r.data); announce(); redirectAfterAuth(); if (st.afterNewPass) view('newpass'); else close(); return; }
      unlock(vb); setErr(friendly(r, 'code'));
    }, function () { busy = false; unlock(vb); setErr(NET); });
  }
 function needsProfile() {
  if (!session || session.profileDone) return false;
  return true;
}

function askProfile() {
  if (!needsProfile()) return;

  setTimeout(function () {
    if (!needsProfile() || root.hasAttribute('data-open')) return;

    lastFocus = document.activeElement;
    view('profile');
    root.setAttribute('data-open', '');
    document.documentElement.classList.add('va-lock');
  }, 700);
}
 function saveProfile(x) {
  if (busy) return;

  var nm = String(x.name || '').replace(/\s+/g, ' ').trim();
  var ph = normPhone(x.phone);
  var e1 = checkName(nm);
  var e2 = checkDob(x.dob);

  if (e1) { setErr(e1); return; }
  if (!ph) {
    setErr('Please enter a valid phone number, for example 0801 234 5678.');
    return;
  }
  if (e2) { setErr(e2); return; }

  busy = true;
  var b = $('#vaPfGo');
  lock(b, 'Saving\u2026');
  setErr('');

  getToken().then(function (tok) {
    if (!tok) {
      busy = false;
      unlock(b);
      setErr('Your session expired. Please log in again.');
      return;
    }

    var data = {
      full_name: nm,
      name: nm,
      dob: x.dob,
      phone: ph
    };

    return call('/user', {
      method: 'PUT',
      token: tok,
      body: { data: data }
    }).then(function (r) {
      busy = false;

      if (!r.ok) {
        unlock(b);
        setErr(friendly(r, 'profile'));
        return;
      }

      session.name = nm;
      session.phone = ph;
      session.dob = x.dob;
      session.profileDone = true;
      persist();

      window.dispatchEvent(new CustomEvent('vt-profile', {
        detail: { name: session.name }
      }));

      close();
    });
  }).catch(function () {
    busy = false;
    unlock(b);
    setErr(NET);
  });
}
  function savePassword(pw) {
    if (busy) return;
    if (pw.length < 8) { setErr('Your password must be at least 8 characters.'); return; }
    busy = true; var b = $('#vaSave'); lock(b, 'Saving\u2026');
    getToken().then(function (tok) {
      if (!tok) { busy = false; unlock(b); setErr('Your session expired. Please log in again.'); return; }
      return call('/user', { method: 'PUT', token: tok, body: { password: pw } }).then(function (r) {
        busy = false;
        if (r.ok) { close(); return; }
        unlock(b); setErr(friendly(r, 'pw'));
      });
    }, function () { busy = false; unlock(b); setErr(NET); });
  }
  function logout() {
    var t = session && session.access_token;
    session = null; persist(); announce(); close();
    if (t) call('/logout', { token: t, body: {} }).catch(function () {});
  }
  function open() {
    lastFocus = document.activeElement;
    if (needsProfile()) view('profile');
    else if (session) view('account');
    else view('main');
    root.setAttribute('data-open', '');
    document.documentElement.classList.add('va-lock');
  }
  function close() {
    if (needsProfile()) {
      if (!root.hasAttribute('data-open') || !body.querySelector('#vaPf')) {
        lastFocus = document.activeElement;
        view('profile');
        root.setAttribute('data-open', '');
        document.documentElement.classList.add('va-lock');
      } else {
        setErr('Please complete your details to continue.');
      }
      return;
    }
    root.removeAttribute('data-open');
    document.documentElement.classList.remove('va-lock');
    clearInterval(timer);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  // Authentication links navigate between the dedicated /login/ and /signup/ pages.

  // coming back from Google sign-in (or an email link): pick the session out of the address
  (function fromHash() {
    var h = String(location.hash || '');
    if (h.indexOf('access_token=') < 0) return;
    var p = {}; h.replace(/^#/, '').split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) p[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); });
    if (!p.access_token || !p.refresh_token) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    remember = true;
    call('/user', { method: 'GET', token: p.access_token }).then(function (r) {
      if (!r.ok) return;
      setSession({ access_token: p.access_token, refresh_token: p.refresh_token, expires_in: Number(p.expires_in) || 3600, user: r.data });
      announce();
      redirectAfterAuth();
    });
  })();

  // database access as the signed-in customer (protected by row level security in Supabase)
  function rest(method, path, body, extra) {
    return getToken().then(function (tok) {
      if (!tok) throw new Error('nosession');
      var h = { apikey: SB.key, Authorization: 'Bearer ' + tok };
      if (body) h['Content-Type'] = 'application/json';
      if (extra) for (var k in extra) h[k] = extra[k];
      return fetch(SB.url + '/rest/v1' + path, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined }).then(function (r) {
        return r.text().then(function (t) {
          var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
          if (!r.ok) { var err = new Error((j && (j.message || j.hint)) || ('HTTP ' + r.status)); err.status = r.status; throw err; }
          return j;
        });
      });
    });
  }

  // saves a picture / PDF for the customer in Supabase Storage (private folder) and returns a link the team can open for 30 days
  function upload(blob, ext, type) {
    return getToken().then(function (tok) {
      if (!tok || !session) throw new Error('Please log in again to send pictures.');
      var path = session.id + '/' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + (ext || '');
      var h = { apikey: SB.key, Authorization: 'Bearer ' + tok };
      return fetch(SB.url + '/storage/v1/object/chat-uploads/' + path, { method: 'POST', headers: { apikey: SB.key, Authorization: 'Bearer ' + tok, 'Content-Type': type || blob.type || 'application/octet-stream', 'x-upsert': 'false' }, body: blob }).then(function (r) {
        if (!r.ok) throw new Error(r.status === 404 ? 'Picture storage is not set up yet (run supabase-chat-uploads.sql).' : 'The picture could not be uploaded (' + r.status + ').');
        return fetch(SB.url + '/storage/v1/object/sign/chat-uploads/' + path, { method: 'POST', headers: { apikey: SB.key, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: 2592000 }) });
      }).then(function (r) {
        if (!r.ok) throw new Error('The picture link could not be created (' + r.status + ').');
        return r.json();
      }).then(function (d) { return SB.url + '/storage/v1' + d.signedURL; });
    });
  }
  window.VTAuth = {
    rest: rest,
    upload: upload,
    open: open, click: function () {
      if (!session) { open(); return; }
      getToken().then(function (tok) {
        if (!tok) { window.location.href = '/dashboard/'; return; }
        return fetch('https://versustrade-admin-api.versustradehq.workers.dev/admin/verify', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' },
          body: '{}'
        }).then(function (r) { return r.json(); }).then(function (d) {
          if (d && d.authorized === true) {
            if (window.VTNav) window.VTNav.setLabel('Admin');
            window.location.href = '/admin';
          } else {
            window.location.href = '/dashboard/';
          }
        }).catch(function () { window.location.href = '/dashboard/'; });
      }).catch(function () { window.location.href = '/dashboard/'; });
    },
    isLoggedIn: function () { return !!session; },
    getToken: getToken,
    email: function () { return session ? session.email : ''; },
    user: function () { return session ? { id: session.id, email: session.email, name: session.name || '' } : null; },
    // saves the display name to the account (used by the dashboard); other pages and tabs pick it up
    setName: function (n) {
      n = String(n || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      return getToken().then(function (tok) {
        if (!tok) throw new Error('Please log in again.');
        return call('/user', { method: 'PUT', token: tok, body: { data: { name: n } } });
      }).then(function (r) {
        if (!r.ok) throw new Error('Could not save your name.');
        session.name = n; persist(); window.dispatchEvent(new CustomEvent('vt-profile', { detail: { name: n } })); return n;
      });
    }
  };
  announce(true);
  (function initAuthPage() {
    var q = String(location.search || '');
    if (q.indexOf('account=1') > -1) st.tab = 'login';
    if (session && q.indexOf('account=1') < 0) {
      getToken().then(function (tok) {
        if (tok) { redirectAfterAuth(); return; }
        open();
      }).catch(open);
    } else {
      open();
    }
  })();
})();