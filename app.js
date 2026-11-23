// Nav shadow + mobile menu
const nav = document.querySelector('.nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });
const burger = document.getElementById('burger');
const links = document.getElementById('links');
const setMenu = open => {
  links.classList.toggle('open', open);
  burger.classList.toggle('x', open);
  document.body.classList.toggle('locked', open);
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// Mobile bottom bar: show after the hero, hide when the audit form is on screen
const mbar = document.getElementById('mbar');
const hero = document.querySelector('.hero');
const audit = document.getElementById('audit');
let pastHero = false, atAudit = false;
const syncBar = () => mbar.classList.toggle('show', pastHero && !atAudit);
new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; syncBar(); }).observe(hero);
new IntersectionObserver(([e]) => { atAudit = e.isIntersecting; syncBar(); }, { threshold: 0.15 }).observe(audit);

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 80 + 'ms';
  io.observe(el);
});

// Margin calculator
const $ = id => document.getElementById(id);
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const RETURNS_PCT = 3; // returns and damage, % of MRP

function calc() {
  const mrp = Math.max(1, +$('mrp').value || 0);
  const cost = Math.max(0, +$('cost').value || 0);
  const platPct = +$('plat').value;
  const gstRate = +$('gst').value;
  const adsPct = +$('ads').value;
  const del = Math.max(0, +$('del').value || 0);
  $('adsv').textContent = adsPct + '%';
  $('mrpv').textContent = Math.round(mrp).toLocaleString('en-IN');

  const gst = mrp - mrp / (1 + gstRate / 100);
  const rows = [
    ['Your cost', cost, '#C9C2B2'],
    ['Platform cut', mrp * platPct / 100, '#E8664A'],
    ['Ads', mrp * adsPct / 100, '#F0A08C'],
    ['Delivery, inward', del, '#F0A08C'],
    ['GST', gst, '#C9C2B2'],
    ['Returns, damage', mrp * RETURNS_PCT / 100, '#F0A08C'],
  ];
  const spent = rows.reduce((s, r) => s + r[1], 0);
  const keep = mrp - spent;

  let left = 0;
  $('bars').innerHTML = rows.map(([label, v, col]) => {
    const w = Math.max(0, v / mrp * 100);
    const html = `<div class="bar"><span>${label}</span><div class="tr"><div class="fl" style="left:${Math.min(left, 100)}%;width:${Math.min(w, 100 - Math.min(left, 100))}%;background:${col}"></div></div><b>${inr(v)}</b></div>`;
    left += w;
    return html;
  }).join('');

  const pct = keep / mrp * 100;
  $('keep').textContent = (keep < 0 ? '−' : '') + inr(Math.abs(keep));
  $('keeppct').textContent = Math.round(pct) + '% of MRP';
  const box = $('keep').closest('.keep');
  box.classList.toggle('bad', pct < 10);
  $('verdict').textContent =
    pct < 0 ? 'You lose money on every unit. Pricing or pack size needs fixing before you list.' :
    pct < 10 ? 'Too thin. One bad week of returns wipes this out. Let us fix the pricing first.' :
    pct < 20 ? 'Workable, but tight. Smarter ads and pricing can push this up.' :
    'Healthy margin. You are ready to grow on quick commerce.';
}
['mrp', 'cost', 'plat', 'gst', 'ads', 'del'].forEach(id => $(id).addEventListener('input', calc));
calc();

// Audit form (no backend yet: shows a thank-you state)
$('auditform').addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  console.log('Audit request', data);
  $('thanks').hidden = false;
});

// Problems chat
const PROBLEMS = [
  {em:'📦', q:'Product achha hai, par online nahi bikta.', short:'Product achha, par online nahi bikta', a:"Let's get you on the apps your buyers already use.", d:'We list you on Blinkit, Zepto, Instamart, and Amazon where it fits.', tag:'⚡ Live in about 30 days'},
  {em:'📄', q:'Blinkit pe list kaise karein? GST, barcode, kuch samajh nahi aata.', short:'GST, barcode, kuch samajh nahi aata', a:'Leave the paperwork to us.', d:'GST for each state, barcodes, FSSAI if food. We make the checklist and talk to the platform team for you.', tag:'📋 Paperwork handled'},
  {em:'📉', q:'List toh ho gaya, order nahi aate.', short:'List ho gaya, order nahi aate', a:'Listing is step one. Selling is the real job.', d:'AI product photos, sharper titles, platform ads and a ratings push so buyers actually find you.', tag:'📸 Ads + AI photos'},
  {em:'💸', q:'Commission ke baad kuch bachta hi nahi.', short:'Commission ke baad kuch nahi bachta', a:'We do the margin maths before you list.', d:'Commission, ads, delivery, GST, every rupee counted. If the numbers do not work, we tell you straight.', tag:'₹ Try the margin check', href:'#calculator'},
  {em:'😤', q:'Agency ko paise diye, report mili, sale nahi.', short:'Agency ko paise diye, sale nahi', a:'You get rupees, not likes.', d:'Every Friday on WhatsApp: orders, sales, ad cost and profit. Nothing hidden.', tag:'📊 Weekly rupee report'},
  {em:'😩', q:'Sab kuch khud karna padta hai.', short:'Sab kuch khud karna padta hai', a:'Let AI take the boring work.', d:'WhatsApp auto-replies, stock reorder alerts and a simple sales dashboard. You run the business, not the busywork.', tag:'🤖 AI tools'},
];
(() => {
  const list = document.getElementById('plist'), body = document.getElementById('chatbody'), status = document.getElementById('cstatus');
  if (!list || !body) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, auto = !reduce, timer, timers = [];
  list.innerHTML = PROBLEMS.map((p, i) => `<button class="pbtn${i === 0 ? ' on' : ''}" role="tab" aria-selected="${i === 0}" data-i="${i}"><span class="em">${p.em}</span><span>${p.short}</span><span class="n">0${i + 1}</span><span class="bar"></span></button>`).join('');
  const btns = [...list.children];
  const clock = (m) => `10:${String(2 + m).padStart(2, '0')}`;
  function show(i) {
    cur = i; timers.forEach(clearTimeout); timers = [];
    btns.forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('auto', auto && k === i); b.setAttribute('aria-selected', k === i); });
    if (innerWidth <= 760 && auto === false) btns[i].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    const p = PROBLEMS[i];
    body.innerHTML = `<div class="msg in"><span class="who">Business owner</span>"${p.q}"<time>${clock(i * 2)}</time></div>`;
    const reply = () => {
      const tag = p.href ? `<a class="tagp" href="${p.href}">${p.tag} →</a>` : `<span class="tagp">${p.tag}</span>`;
      body.querySelector('.typing')?.remove();
      body.insertAdjacentHTML('beforeend', `<div class="msg out"><b>${p.a}</b>${p.d}${tag}<time>${clock(i * 2 + 1)} ✓✓</time></div>`);
      status.textContent = 'online';
    };
    if (reduce) return reply();
    timers.push(setTimeout(() => { status.textContent = 'typing…'; body.insertAdjacentHTML('beforeend', '<div class="typing"><i></i><i></i><i></i></div>'); }, 450));
    timers.push(setTimeout(reply, 1500));
  }
  function loop() { clearInterval(timer); if (auto) timer = setInterval(() => show((cur + 1) % PROBLEMS.length), 6000); }
  list.addEventListener('click', e => { const b = e.target.closest('.pbtn'); if (!b) return; auto = false; clearInterval(timer); show(+b.dataset.i); });
  // start when the section scrolls into view
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { show(0); loop(); o.disconnect(); } }, { threshold: .3 }).observe(body);
})();
