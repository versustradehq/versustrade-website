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
function art(c) {
  var a = ART[c], x = a[3], y = a[4], sx = x > 150 ? 70 : 230;
  return '<svg class="art" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<defs><radialGradient id="gA" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity=".04"/></radialGradient>' +
    '<linearGradient id="gB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>' +
    '<filter id="gF"><feGaussianBlur stdDeviation="14"/></filter></defs>' +
    '<rect width="300" height="200" fill="' + a[1] + '"/>' +
    '<circle cx="' + sx + '" cy="40" r="90" fill="' + a[0] + '" filter="url(#gF)"/>' +
    '<circle cx="' + (300 - sx) + '" cy="190" r="100" fill="' + a[2] + '" filter="url(#gF)"/>' +
    '<circle cx="' + sx + '" cy="150" r="34" fill="none" stroke="url(#gB)" stroke-width="9" opacity=".55"/>' +
    '<circle cx="' + sx + '" cy="150" r="34" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>' +
    '<circle cx="' + x + '" cy="' + y + '" r="62" fill="url(#gA)" stroke="url(#gB)" stroke-width="2"/>' +
    '<circle cx="' + x + '" cy="' + y + '" r="48" fill="none" stroke="#fff" stroke-opacity=".35"/>' +
    '<ellipse cx="' + (x - 20) + '" cy="' + (y - 34) + '" rx="26" ry="9" fill="#fff" opacity=".5" transform="rotate(-28 ' + (x - 20) + ' ' + (y - 34) + ')"/>' +
    '<text x="' + x + '" y="' + (y + 22) + '" text-anchor="middle" font-size="64" font-weight="800" fill="#fff" fill-opacity=".92" font-family="Inter,Segoe UI,Roboto,sans-serif">' + GLYPH[c] + '</text></svg>';
}
var POSTS = [
  {t:'How to send USDT to someone without buying crypto first', d:'Pay in naira and have USDT go straight to someone else\u2019s wallet. Here is the step-by-step, and the mistakes to avoid.', c:'naira', a:'Support Desk', m:5, date:'20 Oct 2026', href:'/blog/send-usdt-without-buying-crypto-first/', img:'https://pub-d09b462a1f3c4a8c8b73f79bcf29c60e.r2.dev/How%20to%20send%20USDT%20to%20someone%20without%20buying%20crypto%20first.png'},
  {t:'Bitcoin vs Ethereum: what\u2019s the difference?', d:'Both are called crypto, but they do different jobs. Here is what each one is for and how to choose where to start.', c:'basics', a:'VersusTrade Team', m:4, date:'19 Oct 2026', href:'#'},
  {t:'How crypto rates in naira are set', d:'Why the rate you see can differ from the dollar price, and what to compare before you buy or sell.', c:'naira', a:'Support Desk', m:4, date:'16 Oct 2026', href:'#'},
  {t:'Seven habits that keep your wallet safe', d:'Strong passwords are the start. Learn the habits that stop most account and wallet losses.', c:'security', a:'VersusTrade Team', m:6, date:'13 Oct 2026', href:'#'},
  {t:'Reading a candlestick chart for the first time', d:'What each candle shows, how to read the wicks, and the three patterns worth learning first.', c:'trading', a:'Market Desk', m:4, date:'10 Oct 2026', href:'#'},
  {t:'What is a stablecoin, and why does USDT matter?', d:'Stablecoins hold a steady price, which is why traders use them to park money between trades.', c:'basics', a:'VersusTrade Team', m:5, date:'7 Oct 2026', href:'#'},
  {t:'How to spot a crypto scam before you send money', d:'Fake giveaways, cloned support accounts and \u201Cguaranteed returns\u201D all follow the same script.', c:'security', a:'Support Desk', m:5, date:'4 Oct 2026', href:'#'},
  {t:'Why prices move when the US Fed speaks', d:'Interest rate news reaches crypto within minutes. Here is why, and how to plan around big announcements.', c:'markets', a:'Market Desk', m:6, date:'1 Oct 2026', href:'#'},
  {t:'Position sizing: how much to risk per trade', d:'A simple rule for deciding trade size so one bad call does not wipe out your account.', c:'trading', a:'Market Desk', m:4, date:'28 Sep 2026', href:'#'},
  {t:'Selling crypto for naira: what to check first', d:'Rate, fees, payout time and account name. Run through this list before every sale.', c:'naira', a:'Support Desk', m:5, date:'25 Sep 2026', href:'#'}
];
