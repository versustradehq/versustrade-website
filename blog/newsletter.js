/* Connects the website's newsletter forms to the backend (netlify/functions/subscribe.js).
 * The form sends the email to /api/subscribe, which emails a confirmation link (double opt-in).
 * The API key never touches the website: it lives only in Netlify's environment variables. */
window.VT_NEWSLETTER = {
  subscribe: function (email, extra) {
    return fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, website: (extra && extra.website) || '' })
    }).then(function (r) { if (!r.ok) throw new Error('subscribe failed: ' + r.status); });
  }
};
