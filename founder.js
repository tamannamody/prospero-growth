// Shared script for founders hub + founder pages
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const onView = (el, fn, threshold = 0.3) => {
  if (!el) return;
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { fn(); o.disconnect(); } }, { threshold }).observe(el);
};

// Nav + menu
const nav = $('.nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });
const burger = $('#burger'), links = $('#links');
const setMenu = open => { links.classList.toggle('open', open); burger.classList.toggle('x', open); document.body.classList.toggle('locked', open); };
burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
$$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));

// Phone bottom bar after the hero
const mbar = $('#mbar'), firstSec = $('section');
if (mbar && firstSec) new IntersectionObserver(([e]) => mbar.classList.toggle('show', !e.isIntersecting)).observe(firstSec);

// Reveal
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
$$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 5) * 80 + 'ms'; io.observe(el); });

// Count-up
$$('[data-count]').forEach(el => onView(el, () => {
  if (reduce) return;
  const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', t0 = performance.now();
  const tick = t => { const k = Math.min(1, (t - t0) / 1300); el.textContent = pre + Math.round(end * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}, .6));

// Before / after switch
$$('.switch').forEach(sw => {
  const grid = document.getElementById(sw.dataset.for);
  const flip = on => { sw.classList.toggle('on', on); grid.classList.toggle('on', on); sw.setAttribute('aria-pressed', on); };
  sw.addEventListener('click', () => flip(!sw.classList.contains('on')));
  onView(grid, () => setTimeout(() => flip(true), reduce ? 0 : 900), .5);
});

// Hub card tilt + glare
$$('.fcard').forEach(c => {
  if (reduce || matchMedia('(hover: none)').matches) return;
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.transform = `perspective(1000px) rotateY(${(x - .5) * 8}deg) rotateX(${(.5 - y) * 8}deg) translateY(-6px)`;
    c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
  });
  c.addEventListener('mouseleave', () => { c.style.transform = ''; });
});

// Career rail progress + buttons
$$('.railwrap').forEach(w => {
  const rail = $('.rail', w), bar = $('.railbar i', w);
  const upd = () => { const m = rail.scrollWidth - rail.clientWidth; bar.style.width = (m > 0 ? 12 + 88 * rail.scrollLeft / m : 100) + '%'; };
  rail.addEventListener('scroll', upd, { passive: true }); upd();
  $$('[data-dir]', w).forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: +b.dataset.dir * 320, behavior: 'smooth' })));
});

// India distribution map (dot matrix + routes)
const map = $('#indiamap');
if (map) {
  const P = [[68.2,23.7],[70,20.9],[72.6,21],[72.8,19],[73.4,16],[74.6,13],[76,10],[77.5,8.1],[78.2,8.9],[79.3,10.3],[79.9,11.9],[80.3,13.5],[80.2,15.6],[81.3,16.4],[82.4,17],[84.1,18.3],[85.1,19.5],[86.9,20.7],[87,21.6],[88.2,21.6],[89,21.9],[89,25],[92,24],[92.7,22],[93.4,23.8],[94.6,25.5],[95.5,26.8],[97,27.8],[96,29.2],[94,28],[92,27.6],[89.8,26.7],[88.1,26.5],[88.2,27.9],[86,27.9],[84,27.5],[81,28.9],[80,30.3],[78.8,31.3],[79,32.5],[78.3,33.9],[79.5,35.5],[77,35.5],[75,34.6],[74,34],[73.8,32.5],[74.6,31],[73.9,30],[72.5,28.2],[71,27.7],[70,26.5],[70.6,25.7],[68.8,24.3]];
  const K = 16, X = lon => (lon - 67.5) * K, Y = lat => (36.5 - lat) * K;
  const inside = (x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const C = { kol: ['Kolkata', 88.36, 22.57, 'base'], hyd: ['Hyderabad', 78.48, 17.38], blr: ['Bengaluru', 77.59, 12.97], che: ['Chennai', 80.27, 13.08], mum: ['Mumbai', 72.88, 19.07], vij: ['Vijayawada', 80.65, 16.5], guw: ['North East', 91.7, 26.1] };
  const hot = (lon, lat) => Object.values(C).some(([, x, y]) => Math.hypot(lon - x, lat - y) < 1.6);
  let dots = '';
  for (let lat = 35.5; lat > 7.5; lat -= .55) for (let lon = 68; lon < 97.5; lon += .55) if (inside(lon, lat)) dots += `<circle class="d${hot(lon, lat) ? ' hot' : ''}" cx="${X(lon).toFixed(1)}" cy="${Y(lat).toFixed(1)}" r="2.6"/>`;
  const routes = [['kol', 'hyd'], ['hyd', 'blr'], ['hyd', 'che'], ['hyd', 'mum'], ['hyd', 'vij'], ['kol', 'guw']];
  let rs = '', pulses = '';
  routes.forEach(([a, b], i) => {
    const [, x1, y1] = C[a], [, x2, y2] = C[b], ax = X(x1), ay = Y(y1), bx = X(x2), by = Y(y2);
    const mx = (ax + bx) / 2 + (ay - by) * .18, my = (ay + by) / 2 - (bx - ax) * .18;
    const d = `M${ax},${ay} Q${mx},${my} ${bx},${by}`, len = Math.hypot(bx - ax, by - ay) * 1.15;
    rs += `<path id="rt${i}" class="route" d="${d}" style="--len:${len.toFixed(0)};transition-delay:${i * .25}s"/>`;
    if (!reduce) pulses += `<circle class="pulse" r="3.5"><animateMotion dur="${2.4 + i * .3}s" begin="${1.5 + i * .25}s" repeatCount="indefinite"><mpath href="#rt${i}"/></animateMotion></circle>`;
  });
  let cities = '';
  Object.entries(C).forEach(([k, [n, lon, lat, base]], i) => {
    const x = X(lon), y = Y(lat), right = lon < 80 && k !== 'vij';
    cities += `<g class="city" style="transition-delay:${.4 + i * .2}s"><circle class="c1" cx="${x}" cy="${y}" r="7"/><circle class="c0" cx="${x}" cy="${y}" r="${base ? 8 : 6}"/><text x="${right ? x - 12 : x + 12}" y="${y + 4}" text-anchor="${right ? 'end' : 'start'}">${n}${base ? ' · base' : ''}</text></g>`;
  });
  map.innerHTML = dots + rs + pulses + cities;
  map.setAttribute('viewBox', `${X(67.5)} ${Y(36.5)} ${X(98) - X(67.5)} ${Y(7) - Y(36.5)}`);
  onView(map, () => map.classList.add('go'), .35);
}

// Terminal typing synced with the growth brain
const term = $('#termbody');
if (term) {
  const lines = JSON.parse(term.dataset.lines);
  const nodes = $$('.brain .node'), spokes = $$('.brain .spoke');
  const run = async () => {
    term.innerHTML = '';
    for (const [cls, text, node] of lines) {
      const line = document.createElement('div'); line.className = cls; term.appendChild(line);
      if (reduce || cls !== 'p') line.textContent = text;
      else for (const ch of text) { line.textContent += ch; await new Promise(r => setTimeout(r, 28)); }
      if (node !== undefined) { nodes[node]?.classList.add('on'); spokes[node]?.classList.add('on'); }
      await new Promise(r => setTimeout(r, reduce ? 0 : cls === 'p' ? 380 : 260));
    }
    const c = document.createElement('span'); c.className = 'caret'; term.appendChild(c);
  };
  onView(term, run, .4);
}

// GitHub contribution grid
const gh = $('#ghgrid');
if (gh) {
  const weeks = JSON.parse(gh.dataset.weeks);
  let html = '', k = 0;
  weeks.forEach(w => w.forEach(n => {
    const l = n === 0 ? '' : n < 3 ? 'l1' : n < 8 ? 'l2' : n < 15 ? 'l3' : 'l4';
    html += `<i class="${l}" style="transition-delay:${(k++ * 6)}ms" title="${n} contributions"></i>`;
  }));
  gh.innerHTML = html;
  onView(gh, () => gh.classList.add('go'), .3);
}
