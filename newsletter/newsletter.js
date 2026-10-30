/* VersusTrade newsletter: used by the footer form on every page (website and blog) and by /newsletter/.
   Put this file next to your pages (same place the footer expects it). */
(function () {
  var BASE = 'https://axldgaxsdgeycinxqbem.supabase.co/functions/v1/super-endpoint';
  function post(path, body) {
    return fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) { var e = new Error('HTTP ' + r.status); e.status = r.status; e.data = d; throw e; } return d; });
    });
  }
  window.VT_NEWSLETTER = {
    // the footer form calls this: resolves when the confirmation email has been sent, rejects otherwise
    subscribe: function (email, opts) { return post('/subscribe', { email: email, website: (opts && opts.website) || '', source: (opts && opts.source) || 'footer' }); },
    confirm: function (token) { return post('/confirm', { token: token }); },
    unsubscribe: function (token) { return post('/unsubscribe', { token: token }); }
  };
})();
