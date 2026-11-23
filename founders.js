// Nav + mobile menu
const nav = document.querySelector('.nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });
const burger = document.getElementById('burger');
const links = document.getElementById('links');
const setMenu = open => {
  links.classList.toggle('open', open);
  burger.classList.toggle('x', open);
  document.body.classList.toggle('locked', open);
};
burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// Bottom bar on phones after the hero
const mbar = document.getElementById('mbar');
new IntersectionObserver(([e]) => mbar.classList.toggle('show', !e.isIntersecting)).observe(document.querySelector('.fhero'));

// Reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 5) * 80 + 'ms'; io.observe(el); });

// Count-up stats
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cio = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) return;
    const t0 = performance.now(), dur = 1200;
    const tick = t => {
      const k = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
      el.textContent = pre + v + suf;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));
