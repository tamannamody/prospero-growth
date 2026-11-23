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
