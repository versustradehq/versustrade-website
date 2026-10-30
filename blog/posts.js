// Shared by the blog list and every post page. To add a post, add one entry to POSTS (newest first).
// c = category key from CATS, m = minutes to read, href = post page, img = optional cover image.
var CATS = {basics:'Basics', trading:'Trading', security:'Security', naira:'Naira & payments', markets:'Markets'};
var GLYPH = {basics:'\u20BF', trading:'\u2197', security:'\u2713', naira:'\u20A6', markets:'\u039E'};
// Glass-style cover art: colour mesh + translucent coins and a ring. [bg1, bg2, bg3, coinX, coinY]
var ART = {
  basics:['#F7931A','#B8101F','#5B1A8C',200,100], trading:['#7B2FF7','#E11D2E','#1A0B2E',110,100],
  security:['#26A17B','#0F3D3E','#0A1F2B',190,95], naira:['#2BB673','#0B6B3A','#0E1A14',110,105],
  markets:['#627EEA','#3B3F9E','#14B8D4',195,100]
};
var artCount = 0; // gives every SVG its own gradient/filter ids
function art(c) {
  var u = ++artCount, gA = 'gA' + u, gB = 'gB' + u, gF = 'gF' + u;
  var a = ART[c], x = a[3], y = a[4], sx = x > 150 ? 70 : 230;
  return '<svg class="art" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<defs><radialGradient id="' + gA + '" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity=".04"/></radialGradient>' +
    '<linearGradient id="' + gB + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>' +
    '<filter id="' + gF + '"><feGaussianBlur stdDeviation="14"/></filter></defs>' +
    '<rect width="300" height="200" fill="' + a[1] + '"/>' +
    '<circle cx="' + sx + '" cy="40" r="90" fill="' + a[0] + '" filter="url(#' + gF + ')"/>' +
    '<circle cx="' + (300 - sx) + '" cy="190" r="100" fill="' + a[2] + '" filter="url(#' + gF + ')"/>' +
    '<circle cx="' + sx + '" cy="150" r="34" fill="none" stroke="url(#' + gB + ')" stroke-width="9" opacity=".55"/>' +
    '<circle cx="' + sx + '" cy="150" r="34" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>' +
    '<circle cx="' + x + '" cy="' + y + '" r="62" fill="url(#' + gA + ')" stroke="url(#' + gB + ')" stroke-width="2"/>' +
    '<circle cx="' + x + '" cy="' + y + '" r="48" fill="none" stroke="#fff" stroke-opacity=".35"/>' +
    '<ellipse cx="' + (x - 20) + '" cy="' + (y - 34) + '" rx="26" ry="9" fill="#fff" opacity=".5" transform="rotate(-28 ' + (x - 20) + ' ' + (y - 34) + ')"/>' +
    '<text x="' + x + '" y="' + (y + 22) + '" text-anchor="middle" font-size="64" font-weight="800" fill="#fff" fill-opacity=".92" font-family="Inter,Segoe UI,Roboto,sans-serif">' + GLYPH[c] + '</text></svg>';
}
var POSTS = [
  {t:'How to send USDT to someone without buying crypto first', d:'Pay in naira and have USDT go straight to someone else\u2019s wallet. Here is the step-by-step, and the mistakes to avoid.', c:'naira', a:'Support Desk', m:5, date:'20 Oct 2026', href:'/blog/send-usdt-without-buying-crypto-first/', img:'https://pub-d09b462a1f3c4a8c8b73f79bcf29c60e.r2.dev/How%20to%20send%20USDT%20to%20someone%20without%20buying%20crypto%20first.png'},
  {t:'Bitcoin vs Ethereum: what\u2019s the difference?', d:'Both are called crypto, but they do different jobs. Here is what each one is for and how to choose where to start.', c:'basics', a:'VersusTrade Team', m:4, date:'19 Oct 2026', href:'/blog/bitcoin-vs-ethereum/', img:'https://pub-d09b462a1f3c4a8c8b73f79bcf29c60e.r2.dev/The%20two%20biggest%20names%20in%20crypto.png'},
  {t:'How crypto rates in naira are set', d:'Why the rate you see can differ from the dollar price, and what to compare before you buy or sell.', c:'naira', a:'Support Desk', m:4, date:'16 Oct 2026', href:'/blog/how-crypto-rates-in-naira-are-set/', img:'https://pub-d09b462a1f3c4a8c8b73f79bcf29c60e.r2.dev/Crypto%20Rates.png'},
  {t:'Seven habits that keep your wallet safe', d:'Strong passwords are the start. Learn the habits that stop most account and wallet losses.', c:'security', a:'VersusTrade Team', m:4, date:'13 Oct 2026', href:'/blog/seven-habits-that-keep-your-wallet-safe/', img:'https://pub-d09b462a1f3c4a8c8b73f79bcf29c60e.r2.dev/Keeping%20Wallet%20Safe.png'},
  {t:'Is your USDT real? How to spot fake USDT before you lose money', d:'Fake and “flash” USDT can look completely real in your wallet. Here is how to check a token before you accept it or send anything.', c:'security', a:'Support Desk', m:5, date:'28 Sep 2026', href:'/blog/how-to-spot-fake-usdt/', img:'https://pub-d09b462a1f3c4a8c8b73f79bcf29c60e.r2.dev/HOW%20TO%20SPOT%20FAKE%20USDT.png'},
];

// Posts that have a thumbnail (img) are listed first on the blog home page; within each group the order above (newest first) is kept.
POSTS = POSTS.map(function (p, i) { return [p, i]; }).sort(function (a, b) { return (b[0].img ? 1 : 0) - (a[0].img ? 1 : 0) || a[1] - b[1]; }).map(function (x) { return x[0]; });
