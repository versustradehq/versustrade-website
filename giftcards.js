/* Shared Visa and Amazon Gift Card selection flow for the homepage and customer dashboard. */
(function () {
  var catalogs = {
    'Visa Gift Card': {
      physical: ['Canada Visa Gift Card (100-299)','Canada Visa Gift Card (300 and above)','Canada Visa Gift Card (50-99)','USA Visa 4034/4358 (100-299)','USA Visa 4034/4358 (300 and above)','USA Visa 4034/4358 (50-99)'],
      ecode: ['USA Visa E-code (100-299)','USA Visa E-code (300 and above)']
    },
    'Amazon Gift Card': {
      physical: [
        'Australia Amazon No Receipt (25 and above)','Australia Amazon With Receipt (25 and above)',
        'Canada Amazon No Receipt (25 and above)','Canada Amazon With Receipt (25 and above)',
        'Germany Amazon No Receipt (10-100)','Germany Amazon With Receipt (10-100)',
        'UK Amazon No Receipt (10-100)','UK Amazon With Receipt (10-100)',
        'USA Amazon (10-24)','USA Amazon (25-49)','USA Amazon Cash Receipt (101-200)',
        'USA Amazon Cash Receipt (201-499)','USA Amazon Cash Receipt (50-100)',
        'USA Amazon Cash Receipt Single (500)','USA Amazon Credit/No Receipt (101-200)',
        'USA Amazon Credit/No Receipt (201-500)','USA Amazon Credit/No Receipt (50-100)',
        'USA Amazon Debit Receipt (101 - 200)','USA Amazon Debit Receipt (201 - 499)',
        'USA Amazon Debit Receipt (50-100)','USA Amazon Debit Receipt Single (500)'
      ],
      ecode: ['Australia Amazon Ecode (25 and above )','Canada Amazon Ecode (25 and above )','Germany Amazon Ecode (25 and above )','UK Amazon Ecode (10 and above )','USA Amazon Ecode (25 and above )']
    },
    'Apple / iTunes Gift Card': {
      physical: [
        'Australia Apple/iTunes Physical (50 and above)',
        'AUSTRIA Apple/iTunes Physical (50 and above)',
        'Belgium Apple/iTunes Physical (50 and above)',
        'Brazil Apple/Itunes Physical (50 and above)',
        'Canada Apple/iTunes Physical (50 and above)',
        'Denmark Apple/Itunes Physical (100 and above)',
        'Finland Apple/iTunes Physical (50 and above)',
        'France Apple/iTunes Physical (50 and above)',
        'Germany Apple/iTunes Physical (50 and above)',
        'Greece Apple/iTunes Physical (25 and above)',
        'Ireland Apple/iTunes Physical (50 and above)',
        'Italy Apple/iTunes Physical (50 and above)',
        'Luxembourg Apple/iTunes Physical (25 and above)',
        'Mexico Apple/iTunes Physical (100 and above)',
        'NETHERLANDS Apple/iTunes Physical (50 and above)',
        'Norway Apple/Itunes Physical (100 and above)',
        'NZD Apple/iTunes Physical (50 and above)',
        'Poland Apple/iTunes Physical (100 and above)',
        'Portugal Apple/iTunes Physical (25 and above)',
        'Singapore Apple/iTunes Physical (50 and above)',
        'Spain Apple/iTunes Physical (50 and above)',
        'Swedish Apple/Itunes Physical (100 and above)',
        'Switzerland Apple/iTunes Physical (50 and above)',
        'UAE Apple/Itunes Physical (100 and above)',
        'UK Apple/iTunes Physical (10- 495, Multiples of 5)',
        'UK Apple/iTunes Physical (100, 150, 200, 250 - 500)',
        'UK Apple/iTunes Physical (11-499, Irregular Values)',
        'USA Apple/iTunes Physical (10- 495, Multiples of 5)',
        'USA Apple/iTunes Physical (100 - 450 VERTICAL)',
        'USA Apple/iTunes Physical (100, 150, 200, 300 - 450 horizontal)',
        'USA Apple/iTunes Physical (11-499, Irregular Values)',
        'USA Apple/iTunes Physical (250 horizontal, Single Value)',
        'USA Apple/iTunes Physical (500 horizontal, Single Value)',
        'USA Apple/iTunes Physical (500 VERTICAL)'
      ],
      ecode: [
        'Australia Apple/iTunes Ecode (50 and above)',
        'AUSTRIA Apple/iTunes Ecode (50 and above)',
        'Belgium Apple/iTunes Ecode (50 and above)',
        'Brazil Apple/Itunes Ecode (100 and above)',
        'Canada Apple/iTunes Ecode (50 and above)',
        'Denmark Apple/Itunes Ecode (100 and above)',
        'Finland Apple/iTunes Ecode (50 and above)',
        'France Apple/iTunes Ecode (50 and above)',
        'Germany Apple/iTunes Ecode (50 and above)',
        'Greece Apple/iTunes Ecode (25 and above)',
        'Ireland Apple/iTunes Ecode (50 and above)',
        'Italy Apple/iTunes Ecode (50 and above)',
        'Luxembourg Apple/iTunes Ecode (25 and above)',
        'NETHERLANDS Apple/iTunes Ecode (50 and above)',
        'Norway Apple/Itunes Ecode (100 and above)',
        'NZD Apple/iTunes Ecode (50 and above)',
        'Portugal Apple/iTunes Ecode (25 and above)',
        'Singapore Apple/iTunes Ecode (50 and above)',
        'Spain Apple/iTunes Ecode (50 and above)',
        'Swedish Apple/Itunes Ecode (100 and above)',
        'Switzerland Apple/iTunes Ecode (50 and above)',
        'UAE Apple/Itunes Ecode (100 and above)',
        'UK Apple/iTunes Ecode (100 and above)',
        'USA Apple/iTunes Ecode (10-500; Multiples of 5)',
        'USA Apple/iTunes Ecode (11 to 499, Irregular Values)'
      ]
    },
    'Target Gift Card': {
      physical: ['USA Target Visa Gift Card (100 and above)'],
      ecode: []
    },
    'Walmart Gift Card': {
      physical: ['USA Walmart Physical (100-299)','USA Walmart Physical (300 and above)','USA Walmart Physical (50-99)'],
      ecode: ['USA Walmart Ecode (300 and above)','USA Walmart Ecode (50-299)']
    },
    'PlayStation Gift Card': {
      physical: ['USA PlayStation Gift Card (10-70)','USA PlayStation Gift Card (200 and above )','USA PlayStation Gift Card (71 - 199)'],
      ecode: ['USA PlayStation Gift Card (10-70)','USA PlayStation Gift Card (200 and above )','USA PlayStation Gift Card (71 - 199)']
    },
    'Steam Gift Card': {
      physical: ['($) USA STEAM ECODE','(£) UK Steam Ecode','(€ ) Euro Steam Ecode','Australia Steam Ecode (A$)','CANADA Steam Ecode $','CHF Steam Ecode','NZD Steam Ecode $'],
      ecode: ['($) USA STEAM ECODE','(£) UK Steam Ecode','(€ ) Euro Steam Ecode','Australia Steam Ecode (A$)','CANADA Steam Ecode $','CHF Steam Ecode','NZD Steam Ecode $']
    },
    'Razer Gold': {
      physical: ['($) Green Razer Gift Card USA (10 and above)','($) USA Razer Gold Gift Card','(£) UK Razer Gold Gift Card (10 and above)','(€ ) Euro Razer Gold Gift Card (10 and above)','Australian Razer Gold Gift Card','Brazilian Razer Gold Gift Card (10 and above)','Canada Razer Gold Gift Card','Malaysian Razergold (25 and above)','Mexican Razer Gold Gift Card','NZD Razer Gold Gift Card (10 and above)','Singapore Razer Gold Gift Card (10 and above)'],
      ecode: ['($) Green Razer Gift Card USA (10 and above)','($) USA Razer Gold Gift Card','(£) UK Razer Gold Gift Card (10 and above)','(€ ) Euro Razer Gold Gift Card (10 and above)','Australian Razer Gold Gift Card','Brazilian Razer Gold Gift Card ( 10 and above)','Canada Razer Gold Gift Card','Malaysian Razergold (25 and above)','Mexican Razer Gold Gift Card','NZD Razer Gold Gift Card (10 and above)','Singapore Razer Gold Gift Card (10 and above)']
    },
    'Sephora Gift Card': {
      physical: ['CAD Sephora Physical (100-299)','CAD Sephora Physical (300 and above)','USA Sephora Physical - 6347 6330 (100-299)','USA Sephora Physical - 6347 6330 (300 and above)','USA Sephora Physical (50-99)','USA Sephora Physical 6318 6348 6320 6340 6353 6346 (300 above)','USA Sephora Physical- 6318 6348 6320 6340 6346 6353 (100-299)'],
      ecode: ['USA Sephora Ecode (100 and above)','USA Sephora Ecode (50-99)']
    }
  };
  var overlay = null, previousFocus = null, activeKeyHandler = null;
  var overlay = null, previousFocus = null, activeKeyHandler = null;
  var css = '.vt-visa-overlay{position:fixed;inset:0;z-index:10050;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.58);backdrop-filter:blur(5px)}' +
    '.vt-visa-panel{width:min(100%,520px);max-height:min(760px,calc(100dvh - 36px));display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--line,#e5e5e5);border-radius:20px;background:var(--bg,#fff);color:var(--text,#171717);box-shadow:0 24px 80px rgba(0,0,0,.25)}' +
    '.vt-visa-head{display:flex;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid var(--line,#e5e5e5)}' +
    '.vt-visa-head button{width:34px;height:34px;flex:none;border:0;border-radius:50%;background:var(--pill,#f3f3f3);color:inherit;font-size:20px;cursor:pointer}' +
    '.vt-visa-head strong{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:17px;font-weight:800}' +
    '.vt-visa-body{padding:20px;overflow:auto}' +
    '.vt-visa-intro{margin:0 0 14px;color:var(--muted,#737373);font-size:14px}' +
    '.vt-visa-types{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
    '.vt-visa-type{min-height:86px;padding:18px;border:1px solid var(--line,#e5e5e5);border-radius:14px;background:var(--soft,#fafafa);color:inherit;text-align:left;font:inherit;font-weight:750;cursor:pointer}' +
    '.vt-visa-type span{display:block;margin-top:5px;color:var(--muted,#737373);font-size:12px;font-weight:500}' +
    '.vt-visa-search{display:flex;align-items:center;gap:10px;margin:0 0 14px;padding:0 14px;border:1px solid var(--line,#e5e5e5);border-radius:12px;background:var(--soft,#fafafa)}' +
    '.vt-visa-search input{width:100%;height:46px;border:0;outline:0;background:transparent;color:inherit;font:inherit}' +
    '.vt-visa-list{display:grid;gap:8px}' +
    '.vt-visa-option{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:14px;border:1px solid var(--line,#e5e5e5);border-radius:12px;background:var(--bg,#fff);color:inherit;text-align:left;font:inherit;font-size:14px;font-weight:650;cursor:pointer;white-space:nowrap;overflow:hidden}' +
    '.vt-visa-label{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.vt-visa-option>span:last-child{flex:none}' +
    '.vt-visa-option:hover,.vt-visa-type:hover{border-color:#E11D2E;background:color-mix(in srgb,#E11D2E 5%,var(--bg,#fff))}' +
    '.vt-visa-empty{padding:22px 10px;color:var(--muted,#737373);text-align:center;font-size:14px}' +
    '@media(max-width:520px){.vt-visa-overlay{padding:10px}.vt-visa-panel{max-height:calc(100dvh - 20px);border-radius:18px}.vt-visa-body{padding:16px}.vt-visa-types{grid-template-columns:1fr}}';
  function addStyle() {
    if (document.getElementById('vtVisaPickerStyle')) return;
    var s = document.createElement('style'); s.id = 'vtVisaPickerStyle'; s.textContent = css; document.head.appendChild(s);
  }
  function close() {
    if (!overlay) return;
    if (activeKeyHandler) { document.removeEventListener('keydown', activeKeyHandler); activeKeyHandler = null; }
    overlay.remove(); overlay = null;
    document.documentElement.style.removeProperty('overflow');
    if (previousFocus && previousFocus.focus) previousFocus.focus({ preventScroll: true });
  }
  function open(cardName, onSelect) {
    addStyle();
    if (overlay) close();
    previousFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'vt-visa-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    var catalog = catalogs[cardName] || catalogs['Visa Gift Card'];
    overlay.setAttribute('aria-label', 'Choose ' + cardName + ' type');
    var panel = document.createElement('div'); panel.className = 'vt-visa-panel';
    var head = document.createElement('div'); head.className = 'vt-visa-head';
    var back = document.createElement('button'); back.type = 'button'; back.textContent = '‹'; back.setAttribute('aria-label', 'Back'); back.hidden = true;
    var title = document.createElement('strong'); title.textContent = cardName;
    var closeBtn = document.createElement('button'); closeBtn.type = 'button'; closeBtn.textContent = '×'; closeBtn.setAttribute('aria-label', 'Close');
    head.append(back, title, closeBtn);
    var body = document.createElement('div'); body.className = 'vt-visa-body';
    panel.append(head, body); overlay.appendChild(panel); document.body.appendChild(overlay);
    document.documentElement.style.overflow = 'hidden';
    function showTypes() {
      back.hidden = true; title.textContent = cardName; body.innerHTML = '';
      var p = document.createElement('p'); p.className = 'vt-visa-intro'; p.textContent = 'Choose whether your ' + cardName + ' is Physical or E-code.';
      var types = document.createElement('div'); types.className = 'vt-visa-types';
      [['Physical','Plastic card'],['E-code','Digital code']].forEach(function (entry) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'vt-visa-type'; b.textContent = entry[0];
        var small = document.createElement('span'); small.textContent = entry[1]; b.appendChild(small);
        b.addEventListener('click', function () {
          if (/^Target Gift Card$/i.test(cardName) && entry[0] === 'E-code') {
            close();
            if (typeof onSelect === 'function') onSelect({ type: 'E-code', subcategory: null });
            return;
          }
          showSubcategories(entry[0]);
        });
        types.appendChild(b);
      });
      body.append(p, types);
    }
    function showSubcategories(kind) {
      back.hidden = false; title.textContent = 'Select Gift card Subcategory'; body.innerHTML = '';
      var search = document.createElement('input'); search.type = 'search'; search.className = 'vt-visa-search-input';
      search.placeholder = 'Search Sub-category'; search.setAttribute('aria-label','Search Sub-category'); search.autocomplete = 'off';
      var searchWrap = document.createElement('label'); searchWrap.className = 'vt-visa-search';
      var icon = document.createElement('span'); icon.textContent = '⌕'; icon.setAttribute('aria-hidden','true'); searchWrap.append(icon,search);
      var list = document.createElement('div'); list.className = 'vt-visa-list';
      var items = kind === 'Physical' ? catalog.physical : catalog.ecode;
      function draw() {
        var q = search.value.trim().toLowerCase();
        var matches = items.filter(function (item) { return item.toLowerCase().indexOf(q) !== -1; });
        list.innerHTML = '';
        if (!matches.length) { var empty = document.createElement('div'); empty.className = 'vt-visa-empty'; empty.textContent = 'No matching subcategories found.'; list.appendChild(empty); return; }
        matches.forEach(function (item) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'vt-visa-option';
          var label = document.createElement('span'); label.className = 'vt-visa-label'; label.textContent = item; b.appendChild(label);
          var arrow = document.createElement('span'); arrow.textContent = '›'; arrow.setAttribute('aria-hidden','true'); b.appendChild(arrow);
          b.addEventListener('click', function () {
            var selected = { type: kind, subcategory: item };
            close();
            if (typeof onSelect === 'function') onSelect(selected);
          });
          list.appendChild(b);
        });
      }
      search.addEventListener('input', draw); draw(); body.append(searchWrap,list); search.focus({preventScroll:true});
    }
    back.addEventListener('click', showTypes); closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    function keydown(e) { if (e.key === 'Escape') close(); }
    activeKeyHandler = keydown;
    document.addEventListener('keydown', keydown);
    showTypes();
  }
  window.VTVisaPicker = { open: open, close: close, getSubcategories: function (cardName, kind) { var c = catalogs[cardName]; return c ? (kind === 'Physical' ? c.physical.slice() : c.ecode.slice()) : []; } };
})();