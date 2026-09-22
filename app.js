/* ==========================================================================
   GreenSpark Energy Ireland — concept site
   Modules: utils · icons · scene · nav · reveal · charts · sections · present
   ========================================================================== */
(() => {
'use strict';

/* ------------------------------ utilities ------------------------------ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => motionQuery.matches;
const fmt = (n, d = 0) => Number(n).toLocaleString('en-IE', { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (n, d = 0) => (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n), d);

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Monotone cubic path through points — smooth without overshoot */
function monotone(pts) {
  const n = pts.length;
  if (n < 2) return '';
  const dx = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1][0] - pts[i][0] || 1e-6;
    m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i];
  }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${(pts[i][0] + h).toFixed(1)},${(pts[i][1] + t[i] * h).toFixed(1)} ${(pts[i + 1][0] - h).toFixed(1)},${(pts[i + 1][1] - t[i + 1] * h).toFixed(1)} ${pts[i + 1][0].toFixed(1)},${pts[i + 1][1].toFixed(1)}`;
  }
  return d;
}

function tweenNumber(el, to, { dur = 700, d = 0, prefix = '', suffix = '', sign = false } = {}) {
  const from = el._v ?? 0;
  el._v = to;
  cancelAnimationFrame(el._raf);
  const write = v => { el.textContent = prefix + (sign ? signed(v, d) : fmt(v, d)) + suffix; };
  if (reduced() || dur === 0) { write(to); return; }
  const t0 = performance.now();
  const step = now => {
    const p = clamp((now - t0) / dur, 0, 1);
    write(lerp(from, to, easeOut(p)));
    if (p < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}

/* ------------------------------- icons -------------------------------- */
const ICONS = {
  wind: ['M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2', 'M9.6 4.6A2 2 0 1 1 11 8H2', 'M12.6 19.4A2 2 0 1 0 14 16H2'],
  zap: ['M13 2 3 14h9l-1 8 10-12h-9l1-8z'],
  server: ['<rect width="20" height="8" x="2" y="2" rx="2"/>', '<rect width="20" height="8" x="2" y="14" rx="2"/>', 'M6 6h.01', 'M6 18h.01'],
  cpu: ['<rect width="16" height="16" x="4" y="4" rx="2"/>', '<rect width="6" height="6" x="9" y="9"/>', 'M15 2v2', 'M15 20v2', 'M2 15h2', 'M2 9h2', 'M20 15h2', 'M20 9h2', 'M9 2v2', 'M9 20v2'],
  briefcase: ['M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', '<rect width="20" height="14" x="2" y="6" rx="2"/>'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', '<circle cx="9" cy="7" r="4"/>', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  droplet: ['M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z'],
  thermo: ['M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z'],
  refresh: ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
  activity: ['M22 12h-4l-3 9L9 3l-3 9H2'],
  gauge: ['m12 14 4-4', 'M3.34 19a10 10 0 1 1 17.32 0'],
  eye: ['M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', '<circle cx="12" cy="12" r="3"/>'],
  cloud: ['M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2', 'M16 14v6', 'M8 14v6', 'M12 16v6'],
  leaf: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z', 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'],
  coins: ['<circle cx="8" cy="8" r="6"/>', 'M18.09 10.37A6 6 0 1 1 10.34 18', 'M7 6h1v4', 'm16.71 13.88.7.71-2.82 2.82'],
  message: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  trend: ['M22 7 13.5 15.5 8.5 10.5 2 17', 'M16 7h6v6'],
  check: ['M20 6 9 17l-5-5'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  left: ['m15 18-6-6 6-6'],
  right: ['m9 18 6-6-6-6'],
  present: ['M2 3h20', 'M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3', 'm7 21 5-5 5 5'],
  info: ['<circle cx="12" cy="12" r="10"/>', 'M12 16v-4', 'M12 8h.01'],
  database: ['<ellipse cx="12" cy="5" rx="9" ry="3"/>', 'M3 5V19A9 3 0 0 0 21 19V5', 'M3 12A9 3 0 0 0 21 12'],
  search: ['<circle cx="11" cy="11" r="8"/>', 'm21 21-4.3-4.3'],
  scale: ['m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z', 'm2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z', 'M7 21h10', 'M12 3v18', 'M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2'],
  chart: ['M3 3v16a2 2 0 0 0 2 2h16', 'M7 16v-3', 'M12 16V8', 'M17 16v-5'],
  sparkle: ['M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z'],
  building: ['<rect width="16" height="20" x="4" y="2" rx="2"/>', 'M9 22v-4h6v4', 'M8 6h.01', 'M16 6h.01', 'M12 6h.01', 'M12 10h.01', 'M12 14h.01', 'M16 10h.01', 'M16 14h.01', 'M8 10h.01', 'M8 14h.01'],
  layers: ['m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z', 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65', 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65']
};
function icon(name, size = 20) {
  const parts = (ICONS[name] || []).map(d => d.startsWith('<') ? d : `<path d="${d}"/>`).join('');
  return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${parts}</svg>`;
}
function hydrateIcons(root = document) {
  $$('[data-icon]', root).forEach(el => { if (!el.firstChild) el.innerHTML = icon(el.dataset.icon, +el.dataset.size || 20); });
}

/* ----------------------- hero scene (procedural) ---------------------- */
const SCENE_W = 1600, SCENE_H = 900;
function ridge(base, comps, seed) {
  const r = rng(seed);
  const c = comps.map(([a, f]) => [a, f, r() * 6.28]);
  return x => base + c.reduce((s, [a, f, p]) => s + a * Math.sin(x * f + p), 0);
}
function hillPath(fn, step = 40) {
  const pts = [];
  for (let x = -40; x <= SCENE_W + 40; x += step) pts.push([x, fn(x)]);
  return monotone(pts) + `L${SCENE_W + 40},${SCENE_H + 40}L-40,${SCENE_H + 40}Z`;
}
function bladePoints(x, y, L, deg) {
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [[-.026, -.03], [.02, -.03], [.006, -1], [-.005, -1]]
    .map(([u, v]) => `${(x + u * L * c - v * L * s).toFixed(1)},${(y + u * L * s + v * L * c).toFixed(1)}`).join(' ');
}
function turbine(x, gy, h, { fill = '#0a1a13', phase = 0, dur = 14, opacity = 1, beacon = false } = {}) {
  const hy = gy - h, L = h * .6, tw = h * .03, tt = h * .011;
  let blades = '';
  for (let k = 0; k < 3; k++) blades += `<polygon points="${bladePoints(x, hy, L, phase + k * 120)}"/>`;
  return `<g fill="${fill}" opacity="${opacity}">
    <path d="M${x - tw},${gy + 3}L${x - tt},${hy}L${x + tt},${hy}L${x + tw},${gy + 3}Z"/>
    <rect x="${x - h * .022}" y="${hy - h * .011}" width="${h * .06}" height="${h * .022}" rx="${h * .008}"/>
    <g class="rotor" style="transform-origin:${x}px ${hy}px;animation-duration:${dur}s;animation-delay:-${(phase * .09).toFixed(2)}s">${blades}</g>
    <circle cx="${x}" cy="${hy}" r="${h * .017}"/>
    ${beacon ? `<circle class="beacon" cx="${x + h * .034}" cy="${hy - h * .014}" r="${Math.max(1.6, h * .006)}" fill="#ff7a66" style="animation-delay:-${(phase % 7) * .4}s"/>` : ''}
  </g>`;
}

function buildScene() {
  const svgOpen = '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" focusable="false">';
  const r = rng(11);

  /* sky */
  $('#L-sky').innerHTML = `${svgOpen}
    <defs>
      <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#030806"/><stop offset=".36" stop-color="#091a13"/><stop offset=".66" stop-color="#163227"/><stop offset=".86" stop-color="#37574a"/><stop offset="1" stop-color="#76866f"/>
      </linearGradient>
      <radialGradient id="gGlow" cx="1180" cy="620" r="640" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#f1e0b0" stop-opacity=".4"/><stop offset=".4" stop-color="#cbc590" stop-opacity=".13"/><stop offset="1" stop-color="#cbc590" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="gCloud"><stop offset="0" stop-color="#d7e6d8" stop-opacity=".2"/><stop offset=".6" stop-color="#d7e6d8" stop-opacity=".07"/><stop offset="1" stop-color="#d7e6d8" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#gSky)"/><rect width="1600" height="900" fill="url(#gGlow)"/>
    <g class="cloud"><ellipse cx="380" cy="400" rx="420" ry="46" fill="url(#gCloud)"/><ellipse cx="1050" cy="330" rx="360" ry="36" fill="url(#gCloud)"/></g>
    <g class="cloud b"><ellipse cx="760" cy="500" rx="520" ry="42" fill="url(#gCloud)"/><ellipse cx="1420" cy="450" rx="300" ry="30" fill="url(#gCloud)"/><ellipse cx="120" cy="290" rx="300" ry="30" fill="url(#gCloud)"/></g>
  </svg>`;

  /* far hills */
  const far = ridge(600, [[26, .0042], [14, .011], [7, .023]], 3);
  let farT = '';
  [[140, 84, 2], [260, 96, 40], [430, 88, 80], [560, 100, 10], [720, 92, 60], [880, 104, 100], [1040, 90, 20], [1190, 98, 70], [1340, 86, 30], [1490, 94, 90]].forEach(([x, h, ph], i) =>
    farT += turbine(x, far(x) + 2, h, { fill: '#2a4b3d', phase: ph, dur: 17 + (i % 4) * 2.5, opacity: .9 }));
  $('#L-far').innerHTML = `${svgOpen}
    <defs><linearGradient id="gFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b6150"/><stop offset=".5" stop-color="#22443a"/><stop offset="1" stop-color="#14302a"/></linearGradient>
    <linearGradient id="gMist1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b4cdb8" stop-opacity="0"/><stop offset=".55" stop-color="#b4cdb8" stop-opacity=".16"/><stop offset="1" stop-color="#b4cdb8" stop-opacity="0"/></linearGradient></defs>
    <path d="${hillPath(far)}" fill="url(#gFar)"/>${farT}
    <rect x="0" y="600" width="1600" height="140" fill="url(#gMist1)"/></svg>`;

  /* mid hills */
  const mid = ridge(690, [[34, .0033], [18, .0088], [8, .02]], 8);
  let midT = '';
  [[220, 176, 20], [470, 196, 75], [700, 168, 35], [930, 204, 95], [1150, 178, 5], [1400, 190, 55]].forEach(([x, h, ph], i) =>
    midT += turbine(x, mid(x) + 3, h, { fill: '#173629', phase: ph, dur: 13 + i * 1.7, opacity: .95, beacon: i % 3 === 0 }));
  let hedges = '';
  for (let i = 0; i < 9; i++) { const x = 60 + i * 190 + r() * 60; const y0 = mid(x) + 6; hedges += `<path d="M${x},${y0}Q${x + 70 + r() * 60},${y0 + 90} ${x + 150 + r() * 80},${y0 + 230}" />`; }
  $('#L-mid').innerHTML = `${svgOpen}
    <defs><linearGradient id="gMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d4132"/><stop offset=".55" stop-color="#112a21"/><stop offset="1" stop-color="#0b1e17"/></linearGradient>
    <linearGradient id="gMist2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5c4ae" stop-opacity="0"/><stop offset=".6" stop-color="#a5c4ae" stop-opacity=".13"/><stop offset="1" stop-color="#a5c4ae" stop-opacity="0"/></linearGradient></defs>
    <path d="${hillPath(mid)}" fill="url(#gMid)"/>
    <g fill="none" stroke="#2f5a46" stroke-opacity=".28" stroke-width="1.2">${hedges}</g>${midT}
    <rect x="0" y="690" width="1600" height="150" fill="url(#gMist2)"/></svg>`;

  /* near hills, turbines, proposed data centre */
  const near = ridge(742, [[28, .0031], [14, .0094], [6, .021]], 21);
  const dcX0 = 1120, dcX1 = 1400, dcBase = Math.round((near(dcX0) + near(dcX1)) / 2) + 6;
  let nearT = '';
  [[640, 330, 10, 12], [900, 292, 50, 15], [1560, 372, 85, 13]].forEach(([x, h, ph, du], i) =>
    nearT += turbine(x, near(x) + 4, h, { fill: '#0a1c15', phase: ph, dur: du, beacon: true }));
  let poles = '', wireTop = [];
  [960, 1000, 1040, 1080].forEach(x => { const gy = near(x) + 2; poles += `<path d="M${x},${gy}V${gy - 34}M${x - 8},${gy - 30}H${x + 8}"/>`; wireTop.push([x, gy - 30]); });
  wireTop.push([dcX0 + 6, dcBase - 34]);
  const wire = monotone(wireTop);
  let slits = '';
  for (let row = 0; row < 3; row++) slits += `<line x1="${dcX0 + 14}" x2="${dcX1 - 14}" y1="${dcBase - 50 + row * 15}" y2="${dcBase - 50 + row * 15}" stroke="#8fe8b8" stroke-width="2.6" stroke-dasharray="${16 + row * 3} 7" opacity=".55" class="window-glow" style="animation-delay:-${row * 1.7}s"/>`;
  let roof = '';
  for (let i = 0; i < 6; i++) roof += `<rect x="${dcX0 + 22 + i * 42}" y="${dcBase - 76}" width="26" height="10" rx="1.5"/>`;
  let mast = '';
  for (let i = 0; i < 9; i++) { const x = dcX0 - 18 + i * 36; mast += `<path d="M${x},${dcBase + 14}v-14"/>`; }
  $('#L-near').innerHTML = `${svgOpen}
    <defs><linearGradient id="gNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f261c"/><stop offset=".5" stop-color="#0a1b14"/><stop offset="1" stop-color="#07130e"/></linearGradient>
    <radialGradient id="gDc" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8fe8b8" stop-opacity=".26"/><stop offset="1" stop-color="#8fe8b8" stop-opacity="0"/></radialGradient></defs>
    <path d="${hillPath(near)}" fill="url(#gNear)"/>
    ${nearT}
    <ellipse cx="${(dcX0 + dcX1) / 2}" cy="${dcBase - 34}" rx="260" ry="80" fill="url(#gDc)"/>
    <g fill="#08150f"><rect x="${dcX0}" y="${dcBase - 66}" width="${dcX1 - dcX0}" height="82" rx="2"/><rect x="${dcX0 + 60}" y="${dcBase - 92}" width="120" height="30" rx="2"/>${roof}</g>
    ${slits}
    <g stroke="#0c1f17" stroke-width="1.2" fill="none">${mast}</g>
    <g stroke="#0c1f17" stroke-width="2" fill="none">${poles}</g>
    <path d="${wire}" fill="none" stroke="#8fe8b8" stroke-opacity=".5" stroke-width="1.6" stroke-dasharray="3 9" class="wire"/>
    </svg>`;

  /* foreground */
  const fore = ridge(842, [[18, .0038], [8, .012]], 33);
  let grass = '';
  for (let i = 0; i < 46; i++) { const x = r() * 1600, y = fore(x) + 6, h = 8 + r() * 16; grass += `<path d="M${x},${y}q${(r() - .5) * 6},${-h * .6} ${(r() - .5) * 10},${-h}"/>`; }
  $('#L-fore').innerHTML = `${svgOpen}
    <path d="${hillPath(fore)}" fill="#040b08"/>
    <g fill="none" stroke="#040b08" stroke-width="1.4" stroke-linecap="round">${grass}</g>
    </svg>`;

  /* mobile framing: show the cluster of turbines and the data centre */
}

function initHero() {
  buildScene();
  const hero = $('#top');
  const layers = $$('.scene-layer');
  const copy = $('#heroCopy');
  let ticking = false, visible = true;
  const apply = () => {
    ticking = false;
    const y = window.scrollY, h = hero.offsetHeight;
    if (y > h * 1.15) return;
    if (!reduced()) {
      layers.forEach(l => { l.style.transform = `translate3d(0,${(y * +l.dataset.speed).toFixed(1)}px,0)`; });
      const p = clamp(y / (h * .7), 0, 1);
      copy.style.transform = `translate3d(0,${(y * .18).toFixed(1)}px,0)`;
      copy.style.opacity = String(1 - p * 1.1 > 0 ? 1 - p * 1.1 : 0);
    }
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }, { passive: true });
  apply();
  // pause hero animation when out of view
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      hero.querySelectorAll('.rotor,.cloud,.wire,.beacon,.window-glow').forEach(n => { n.style.animationPlayState = visible ? 'running' : 'paused'; });
    }, { threshold: 0 }).observe(hero);
  }
}

/* ---------------------- topographic backgrounds ----------------------- */
function topo(el, { seed = 1, lines = 15 } = {}) {
  if (!el) return;
  const r = rng(seed), W = 1600, H = 900, p1 = r() * 6, p2 = r() * 6, p3 = r() * 6;
  let d = '';
  for (let k = 0; k < lines; k++) {
    const y0 = (k + 1) * H / (lines + 1), pts = [];
    for (let x = -40; x <= W + 40; x += 80)
      pts.push([x, y0 + Math.sin(x * .004 + p1 + k * .35) * 38 + Math.sin(x * .0095 + p2 + k * .2) * 16 + Math.sin(x * .0021 + p3) * (28 + k * 2)]);
    d += `<path d="${monotone(pts)}"/>`;
  }
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke">${d}</g></svg>`;
}
function ctaHills() {
  const el = $('#ctaHills');
  if (!el) return;
  const a = ridge(120, [[40, .004], [16, .011]], 5), b = ridge(190, [[28, .0035], [10, .012]], 9);
  const path = fn => { const pts = []; for (let x = -40; x <= 1640; x += 40) pts.push([x, fn(x)]); return monotone(pts) + 'L1640,400L-40,400Z'; };
  el.innerHTML = `<svg viewBox="0 0 1600 300" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${path(a)}" fill="#0a2c21" opacity=".8"/><path d="${path(b)}" fill="#071f17"/></svg>`;
}

/* ------------------------------ navigation ---------------------------- */
function initNav() {
  const nav = $('#nav'), toggle = $('#navToggle'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 32);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = open => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.innerHTML = icon(open ? 'x' : 'menu', 20);
    document.body.classList.toggle('menu-open', open);
    $$('a', menu).forEach(a => { a.tabIndex = open ? 0 : -1; });
    if (open) $('a', menu).focus();
  };
  setMenu(false);
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); toggle.focus(); } });
  window.matchMedia('(min-width:1021px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  // scroll-spy across grouped sections
  const links = $$('.nav-links a');
  const secs = $$('[data-nav]');
  let raf = 0;
  const spy = () => {
    raf = 0;
    const mark = window.innerHeight * .4;
    let current = '';
    secs.forEach(s => { const r = s.getBoundingClientRect(); if (r.top <= mark && r.bottom > mark) current = s.dataset.nav; });
    links.forEach(a => { if (a.dataset.group === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(spy); }, { passive: true });
  spy();
}

/* --------------------------- reveal on scroll -------------------------- */
function initReveal() {
  document.documentElement.classList.add('js');
  const els = $$('[data-reveal]');
  els.forEach(el => el.style.setProperty('--d', (+el.dataset.reveal || 0) * 90 + 'ms'));
  if (!('IntersectionObserver' in window) || reduced()) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08, rootMargin: '0px 0px -5% 0px' });
  els.forEach(e => io.observe(e));
}

/* --------------- method phases: data → insight → decision → action ----- */
function initPhases() {
  const order = [['data', 'Data'], ['insight', 'Insight'], ['decision', 'Decision'], ['action', 'Action']];
  $$('.phases').forEach(el => {
    const cur = el.dataset.phase;
    el.setAttribute('aria-label', `Method stage: ${order.find(o => o[0] === cur)[1]}`);
    el.innerHTML = order.map(([k, l]) => `<span class="${k === cur ? 'on' : ''}" ${k === cur ? 'aria-current="true"' : ''}>${l}</span>`).join('');
  });
}

/* --------------------------- tabs helper (ARIA) ------------------------ */
function tabs(list, panel, onSelect, { start = 0 } = {}) {
  const items = $$('[role="tab"]', list);
  const uid = list.id || 'tabs' + Math.random().toString(36).slice(2, 6);
  items.forEach((t, i) => { t.id = t.id || `${uid}-t${i}`; });
  function select(i, focus) {
    items.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle('is-active', on);
      if (on && panel) panel.setAttribute('aria-labelledby', t.id);
    });
    if (focus) items[i].focus();
    onSelect(i, items[i]);
  }
  items.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', e => {
      const n = items.length; let k = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') k = (i + 1) % n;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') k = (i - 1 + n) % n;
      else if (e.key === 'Home') k = 0;
      else if (e.key === 'End') k = n - 1;
      if (k !== null) { e.preventDefault(); select(k, true); }
    });
  });
  select(start);
  return { select };
}

/* ============================ chart engine ============================ */
function niceStep(range, target = 4) {
  const raw = range / target, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
}
function niceDomain(min, max, target = 4) {
  if (max - min < 1e-9) max = min + 1;
  const pad = (max - min) * .14;
  let lo = min - pad, hi = max + pad;
  const step = niceStep(hi - lo, target);
  return { lo: Math.floor(lo / step) * step, hi: Math.ceil(hi / step) * step, step };
}
function resample(vals, n) {
  if (vals.length === n) return vals.slice();
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i * (vals.length - 1) / (n - 1) : 0, a = Math.floor(t), b = Math.min(vals.length - 1, a + 1);
    out.push(lerp(vals[a], vals[b], t - a));
  }
  return out;
}

function LineChart(el, opts = {}) {
  const o = Object.assign({ h: 300, pad: { t: 14, r: 14, b: 28, l: 42 }, fmtV: v => fmt(v, 0), area: true, label: 'Chart' }, opts);
  const uid = 'g' + Math.random().toString(36).slice(2, 7);
  el.classList.add('chart');
  el.tabIndex = 0;
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', `${o.label}. Use the left and right arrow keys to read values.`);
  el.innerHTML = `<svg height="${o.h}" aria-hidden="true" focusable="false"></svg><div class="chart-tip" hidden></div><div class="sr-only" data-live aria-live="polite"></div><table class="sr-only"></table>`;
  const svg = $('svg', el), tip = $('.chart-tip', el), live = $('[data-live]', el), table = $('table', el);
  let W = el.clientWidth || 640, labels = [], target = [], cur = null, raf = 0, hi = -1;

  function render() {
    if (!cur || !labels.length) return;
    const { t, r, b, l } = o.pad, iw = Math.max(10, W - l - r), ih = o.h - t - b, n = labels.length;
    const { lo, hi: top, step } = cur.dom;
    const X = i => l + (n > 1 ? i * iw / (n - 1) : iw / 2);
    const Y = v => t + (1 - (v - lo) / ((top - lo) || 1)) * ih;
    let s = '';
    const first = Math.ceil(lo / step - 1e-9) * step;
    for (let k = 0; k < 12; k++) {
      const v = first + k * step;
      if (v > top + 1e-9) break;
      const y = Y(v);
      s += `<line class="gl" x1="${l}" x2="${W - r}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/><text class="gt" x="${l - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end">${fmt(v, step < 1 ? 1 : 0)}</text>`;
    }
    const maxLabels = Math.max(2, Math.floor(iw / 74)), stride = Math.ceil(n / maxLabels);
    for (let i = 0; i < n; i += stride) s += `<text class="gt" x="${X(i).toFixed(1)}" y="${o.h - 6}" text-anchor="${i === 0 ? 'start' : 'middle'}">${labels[i]}</text>`;
    if (n > 1) {
      cur.sv.forEach((vals, i) => {
        const d = monotone(vals.map((v, k) => [X(k), Y(v)]));
        if (o.area && i === 0) s += `<path d="${d}L${X(n - 1).toFixed(1)},${t + ih}L${X(0).toFixed(1)},${t + ih}Z" fill="url(#${uid})"/>`;
        s += `<path class="ln s${i}${target[i] && target[i].dashed ? ' dash' : ''}" d="${d}"/>`;
      });
    }
    if (hi >= 0 && hi < n) {
      const x = X(hi);
      s += `<line class="hv" x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${t}" y2="${t + ih}"/>`;
      cur.sv.forEach((vals, i) => { s += `<circle class="dot s${i}" cx="${x.toFixed(1)}" cy="${Y(vals[hi]).toFixed(1)}" r="4.5"/>`; });
    }
    const defs = o.area ? `<defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--c1);stop-opacity:.26"/><stop offset="1" style="stop-color:var(--c1);stop-opacity:0"/></linearGradient></defs>` : '';
    svg.innerHTML = defs + s;
    if (hi >= 0 && hi < n) {
      tip.hidden = false;
      tip.style.left = clamp(X(hi), 74, Math.max(74, W - 74)) + 'px';
      tip.innerHTML = `<b>${labels[hi]}</b>` + target.map((sr, i) => `<div><span><i style="background:var(--c${i + 1})"></i>${sr.name}</span><strong>${o.fmtV(sr.vals[hi])}</strong></div>`).join('');
    } else tip.hidden = true;
  }

  function announce() {
    if (hi < 0) return;
    live.textContent = `${labels[hi]}: ` + target.map(sr => `${sr.name} ${o.fmtV(sr.vals[hi])}`).join(', ');
  }

  function update(series, lbls, extra = {}) {
    labels = lbls; target = series;
    const all = series.flatMap(s => s.vals);
    const nd = niceDomain(Math.min(...all), Math.max(...all));
    const n = lbls.length;
    const from = series.map((s, i) => cur && cur.sv[i] ? resample(cur.sv[i], n) : s.vals.map(() => nd.lo));
    const fromDom = cur ? { lo: cur.dom.lo, hi: cur.dom.hi } : { lo: nd.lo, hi: nd.hi };
    const dur = (reduced() || extra.animate === false) ? 0 : (extra.dur || 650);
    const t0 = performance.now();
    cancelAnimationFrame(raf);
    const frame = now => {
      const p = dur ? easeOut(clamp((now - t0) / dur, 0, 1)) : 1;
      cur = {
        sv: series.map((s, i) => s.vals.map((v, k) => lerp(from[i][k] ?? nd.lo, v, p))),
        dom: { lo: lerp(fromDom.lo, nd.lo, p), hi: lerp(fromDom.hi, nd.hi, p), step: nd.step }
      };
      render();
      if (dur && p < 1) raf = requestAnimationFrame(frame);
    };
    frame(t0);
    if (n <= 60) {
      table.innerHTML = `<caption>${o.label}</caption><thead><tr><th scope="col">Period</th>${series.map(s => `<th scope="col">${s.name}</th>`).join('')}</tr></thead><tbody>${lbls.map((lb, i) => `<tr><th scope="row">${lb}</th>${series.map(s => `<td>${o.fmtV(s.vals[i])}</td>`).join('')}</tr>`).join('')}</tbody>`;
    }
    if (extra.label) el.setAttribute('aria-label', `${extra.label}. Use the left and right arrow keys to read values.`);
  }

  el.addEventListener('pointermove', e => {
    if (!labels.length) return;
    const rect = svg.getBoundingClientRect(), n = labels.length, { l, r } = o.pad, iw = Math.max(10, W - l - r);
    const i = clamp(Math.round((e.clientX - rect.left - l) / iw * (n - 1)), 0, n - 1);
    if (i !== hi) { hi = i; render(); }
  });
  el.addEventListener('pointerleave', () => { hi = -1; render(); });
  el.addEventListener('blur', () => { hi = -1; render(); });
  el.addEventListener('keydown', e => {
    const n = labels.length;
    if (e.key === 'ArrowRight') hi = hi < 0 ? 0 : clamp(hi + 1, 0, n - 1);
    else if (e.key === 'ArrowLeft') hi = hi < 0 ? n - 1 : clamp(hi - 1, 0, n - 1);
    else if (e.key === 'Escape') hi = -1;
    else return;
    e.preventDefault(); render(); announce();
  });
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { const w = el.clientWidth; if (w && Math.abs(w - W) > 1) { W = w; render(); } }).observe(el);
  }
  return { update };
}

function sparkSVG(vals, { fill = true, min, max } = {}) {
  const w = 120, h = 36, n = vals.length;
  const lo = min ?? Math.min(...vals), top = max ?? Math.max(...vals);
  const d = monotone(vals.map((v, i) => [i * (w / (n - 1)), h - 3 - ((v - lo) / ((top - lo) || 1)) * (h - 6)]));
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${fill ? `<path class="f" d="${d}L${w},${h}L0,${h}Z"/>` : ''}<path class="a" d="${d}"/></svg>`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* =============================== energy =============================== */
function initEnergy() {
  const items = [
    { k: 'Renewable generation', tag: 'Output', icon: 'zap',
      d: 'Electricity produced by the wind farm. It follows the weather, not the clock.',
      why: 'Wind output rises and falls. Any plan to power computing from it has to account for the gaps as well as the peaks.',
      how: 'Output over time, compared with demand hour by hour.',
      vals: [132, 108, 124, 92, 96, 70, 78, 86, 84, 118, 110, 134] },
    { k: 'Wind resource', tag: 'Input', icon: 'wind',
      d: 'The wind available at the site across the seasons.',
      why: 'Atlantic weather tends to bring stronger wind in winter. Seasonal shape matters as much as the annual average.',
      how: 'Wind speed records and turbine availability, by season.',
      vals: [122, 118, 110, 100, 90, 82, 80, 86, 96, 108, 116, 124] },
    { k: 'Grid connection', tag: 'Constraint', icon: 'layers',
      d: 'The link between the site and the national grid.',
      why: 'The connection sets how much power can flow in when wind is low, and out when it is high.',
      how: 'Import and export at peak times, and how often the connection is constrained.',
      vals: [96, 90, 84, 78, 74, 70, 68, 72, 80, 88, 94, 98] },
    { k: 'Energy demand', tag: 'Load', icon: 'server',
      d: 'What the proposed data centre would draw.',
      why: 'Demand depends on design, phasing and workload. A phased build changes the balance year by year.',
      how: 'Consumption by phase, and efficiency per unit of computing.',
      vals: [70, 72, 76, 80, 86, 92, 98, 104, 110, 114, 118, 120] }
  ];
  const list = $('#energyTabs'), panel = $('#energyPanel');
  list.innerHTML = items.map(it => `<button class="ecard" role="tab" type="button" aria-controls="energyPanel"><span class="k"><span>${it.tag}</span><span data-icon="${it.icon}" data-size="20"></span></span><b>${it.k}</b>${sparkSVG(it.vals)}</button>`).join('');
  hydrateIcons(list);
  panel.innerHTML = `
    <div><h3 class="h-md" id="ep-t"></h3><p class="body-c" id="ep-d"></p>
      <dl><div><dt>Why it matters</dt><dd id="ep-w"></dd></div><div><dt>How it would be measured</dt><dd id="ep-h"></dd></div></dl></div>
    <div><div class="chart-cap"><span class="badge warm"><span class="pip"></span>Illustrative scenario</span><span class="small">Index across a year. 100 is the annual average.</span></div><div id="energyChart"></div></div>`;
  const chart = LineChart($('#energyChart'), { h: 260, label: 'Illustrative energy index by month' });
  let first = true;
  tabs(list, panel, i => {
    const it = items[i];
    $('#ep-t').textContent = it.k; $('#ep-d').textContent = it.d; $('#ep-w').textContent = it.why; $('#ep-h').textContent = it.how;
    chart.update([{ name: it.k, vals: it.vals }], MONTHS, { label: `${it.k}, illustrative index by month`, animate: !first });
    first = false;
  });
  // draw the first chart when it scrolls into view
  const host = $('#energyChart');
  if ('IntersectionObserver' in window && !reduced()) {
    const it = items[0];
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); chart.update([{ name: $('#ep-t').textContent, vals: (items.find(x => x.k === $('#ep-t').textContent) || it).vals }], MONTHS, { label: 'Illustrative energy index by month' }); } }, { threshold: .3 });
    io.observe(host);
  }
}

/* ============================== data centre ============================= */
function initDataCentre() {
  const nodes = [
    { k: 'Renewable energy', s: 'Supply', icon: 'wind',
      d: 'Wind power generated nearby would feed the site. Supply is variable, so matching it to demand is a design problem, not an afterthought.',
      watch: 'How much demand wind can meet, hour by hour.',
      q: ['How closely does wind output track demand?', 'What fills the gaps when the wind drops?', 'Could some computing shift to follow supply?'] },
    { k: 'Data centre', s: 'Facility', icon: 'server',
      d: 'Servers, cooling and power systems. The largest resource questions, electricity and water, live here.',
      watch: 'Electricity and water drawn per unit of computing.',
      q: ['How efficiently is power converted into computing?', 'How much water does cooling need in summer?', 'What happens to waste heat?'] },
    { k: 'AI computing', s: 'Workload', icon: 'cpu',
      d: 'Workloads that turn electricity into analysis, models and services. Efficiency here can be measured per task.',
      watch: 'Energy used per unit of useful work.',
      q: ['Which workloads could run when power is cleanest?', 'How is efficiency tracked as hardware changes?', 'What is reported, and how often?'] },
    { k: 'Businesses', s: 'Customers', icon: 'building',
      d: 'Companies that would use the capacity, from local start-ups to larger technology firms. Their needs shape demand.',
      watch: 'Who the customers are, and what they commit to.',
      q: ['Who is the intended customer base?', 'What efficiency and reporting terms come with a contract?', 'How do customers\' own sustainability goals connect?'] },
    { k: 'Jobs and economic activity', s: 'Local benefit', icon: 'users',
      d: 'Construction, operations and supply-chain work. What counts as local should be defined and tracked.',
      watch: 'How local jobs and local spend are defined and counted.',
      q: ['How are local jobs defined?', 'What skills pathways exist for residents?', 'How much spend stays in the region?'] }
  ];
  const list = $('#dcTabs'), panel = $('#dcPanel');
  list.innerHTML = nodes.map((n, i) => `<button class="flow-node" role="tab" type="button" aria-controls="dcPanel"><span class="ico-wrap" data-icon="${n.icon}" data-size="22"></span><span><b>${n.k}</b><small>${n.s}</small></span></button>${i < nodes.length - 1 ? `<span class="flow-link" style="--fd:${(i * .45).toFixed(2)}s" role="presentation" aria-hidden="true"></span>` : ''}`).join('');
  hydrateIcons(list);
  tabs(list, panel, i => {
    const n = nodes[i];
    panel.innerHTML = `<div style="display:flex;flex-direction:column;gap:18px"><div><span class="badge warm" style="margin-bottom:16px"><span class="pip"></span>Proposed</span><h3 class="h-md">${n.k}</h3></div><p class="body-c">${n.d}</p><div class="watch"><b>What to watch</b><span class="muted">${n.watch}</span></div></div>
      <div><h4 class="h-sm" style="margin-bottom:12px">Questions this raises</h4><ul style="display:grid">${n.q.map(q => `<li style="padding:14px 0;border-top:1px solid var(--line);color:var(--muted)">${q}</li>`).join('')}</ul></div>`;
    $$('.flow-link', list).forEach((lk, j) => lk.style.opacity = j < i ? '1' : '.55');
  });
}

/* ================================= water ================================ */
function initWater() {
  const strategies = [
    { k: 'Cooling efficiency', stage: 'cooling',
      a: 'Design the cooling system around the lowest practical water demand per unit of computing.',
      m: 'Water per unit of computing, and the electricity overhead of cooling.' },
    { k: 'Water recycling', stage: 'reuse',
      a: 'Treat cooling water and reuse it within the site loop wherever feasible.',
      m: 'Share of water recycled, and make-up water drawn.' },
    { k: 'Rainwater capture', stage: 'input',
      a: 'Collect rainfall from roofs and hard surfaces to offset drawn water.',
      m: 'Volume captured against volume used, across wet and dry months.' },
    { k: 'Alternative cooling systems', stage: 'cooling',
      a: 'Evaluate air, closed-loop and hybrid systems that trade water use against energy use.',
      m: 'The water and energy trade-off, season by season.' },
    { k: 'Continuous monitoring', stage: 'monitor',
      a: 'Meter water at every stage and publish summaries in plain language.',
      m: 'Metering coverage, reporting frequency, and issues resolved.' }
  ];
  const list = $('#stratTabs'), panel = $('#stratPanel'), flow = $('#waterFlow');
  list.innerHTML = strategies.map(s => `<button role="tab" type="button" aria-controls="stratPanel">${s.k}</button>`).join('');
  tabs(list, panel, i => {
    const s = strategies[i];
    panel.innerHTML = `<h4 class="h-sm">${s.k}</h4><dl><div><dt>Proposed approach</dt><dd>${s.a}</dd></div><div style="margin-top:14px"><dt>How it would be measured</dt><dd>${s.m}</dd></div></dl>`;
    flow.classList.add('has-active');
    $$('.wstage', flow).forEach(st => st.classList.toggle('is-hl', st.dataset.stage === s.stage));
  });
}

/* ================================= carbon =============================== */
function initCarbon() {
  const sets = [
    { k: 'Energy demand', base: [92, 94, 98, 101, 104, 108, 110, 109, 105, 101, 97, 94], ramp: .16,
      shows: 'How electricity demand moves through the year, and how much efficiency measures could trim it.',
      asks: 'Are we using less energy for the same computing?' },
    { k: 'Carbon intensity', base: [96, 92, 90, 94, 100, 108, 112, 110, 104, 98, 96, 98], ramp: .26,
      shows: 'Emissions per unit of computing. Intensity rises when wind falls short and the grid fills the gap.',
      asks: 'Is each unit of computing getting cleaner over time?' },
    { k: 'Water use', base: [78, 76, 82, 90, 101, 116, 128, 126, 110, 94, 83, 79], ramp: .24,
      shows: 'Summer cooling pushes water use up. Recycling and better cooling design flatten the peak.',
      asks: 'Is the summer peak shrinking, and does it fit local availability?' }
  ];
  const list = $('#carbonTabs'), chart = LineChart($('#carbonChart'), { h: 340, label: 'Illustrative baseline versus improved scenario' });
  let first = true, started = false;
  const draw = i => {
    const s = sets[i];
    const improved = s.base.map((v, k) => v * (1 - s.ramp * (.25 + .75 * k / 11)));
    $('#carbonTitle').textContent = `${s.k}. Baseline against improved scenario`;
    $('#carbonLegend').innerHTML = `<span><i></i>Improved scenario</span><span class="l1 dashed"><i></i>Baseline</span><span class="small">Index, baseline average = 100</span>`;
    tweenNumber($('#carbonGap'), s.base.reduce((a, v, k) => a + (v - improved[k]), 0) / 12, { d: 1, dur: 600 });
    $('#carbonShows').textContent = s.shows; $('#carbonAsks').textContent = s.asks;
    chart.update([{ name: 'Improved', vals: improved }, { name: 'Baseline', vals: s.base, dashed: true }], MONTHS, { label: `${s.k}, illustrative baseline versus improved scenario by month`, animate: started });
  };
  const t = tabs(list, $('#carbonPanel'), i => { if (started || first) draw(i); first = false; });
  // first paint waits until visible so the chart grows into view
  const host = $('#carbonChart');
  if ('IntersectionObserver' in window && !reduced()) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); started = true; draw(+($('[role=tab][aria-selected=true]', list).id.split('-t')[1])); } }, { threshold: .25 });
    io.observe(host);
    // ensure something exists before intersection
    draw(0); started = false;
  } else { started = true; draw(0); }
}

/* =============================== performance ============================ */
function initPerformance() {
  const cards = [
    { k: 'Energy', icon: 'zap', p: 'Is renewable supply matched to demand when it is needed?', i: ['Renewable share of consumption', 'Generation against demand, hour by hour', 'Reliance on the grid at peak times'] },
    { k: 'Water', icon: 'droplet', p: 'How much water is drawn, and how much is returned?', i: ['Water per unit of computing', 'Share recycled or recovered', 'Seasonal draw against local availability'] },
    { k: 'Carbon', icon: 'leaf', p: 'What does building and operating this add, and what does it avoid?', i: ['Operational emissions', 'Carbon intensity of supply', 'Embodied carbon in construction'] },
    { k: 'Community', icon: 'users', p: 'Do residents see benefits, and do they have a say?', i: ['Local employment', 'Resident feedback and response times', 'Investment against agreed priorities'] }
  ];
  const grid = $('#pgrid');
  grid.innerHTML = cards.map((c, n) => `<article class="pcard${n === 0 ? ' open' : ''}">
    <button class="pcard-head" type="button" aria-expanded="${n === 0}" aria-controls="pb-${n}"><span class="pcard-num"><span>0${n + 1}</span><span data-icon="${c.icon}" data-size="22"></span></span><span class="pcard-title">${c.k}</span></button>
    <div class="pcard-body" id="pb-${n}" role="region" aria-label="${c.k} indicators"><div><p>${c.p}</p><h4>Indicators worth tracking</h4><ul>${c.i.map(x => `<li>${x}</li>`).join('')}</ul></div></div></article>`).join('');
  hydrateIcons(grid);
  const els = $$('.pcard', grid);
  const open = n => els.forEach((el, i) => { el.classList.toggle('open', i === n); $('.pcard-head', el).setAttribute('aria-expanded', String(i === n)); });
  els.forEach((el, n) => {
    $('.pcard-head', el).addEventListener('click', () => open(n));
    el.addEventListener('mouseenter', () => { if (window.matchMedia('(min-width:981px) and (hover:hover)').matches) open(n); });
  });
}

/* ============================== console (data & AI) ===================== */
function initConsole() {
  const chart = LineChart($('#liveChart'), { h: 260, label: 'Simulated generation and consumption' });
  const tiles = $('#tiles');
  const tileDefs = [
    { k: 'Generation', icon: 'zap', unit: 'idx', base: 104 },
    { k: 'Consumption', icon: 'server', unit: 'idx', base: 96 },
    { k: 'Renewable share', icon: 'wind', unit: '%', base: 62 },
    { k: 'Water intensity', icon: 'droplet', unit: 'idx', base: 88 }
  ];
  tiles.innerHTML = tileDefs.map(t => `<div class="tile"><div class="t"><span data-icon="${t.icon}" data-size="16"></span>${t.k}</div><div class="v" id="tv-${t.k.replace(/\s/g, '')}">–</div><div class="d" id="td-${t.k.replace(/\s/g, '')}"></div><div class="spark" id="ts-${t.k.replace(/\s/g, '')}"></div></div>`).join('');
  hydrateIcons(tiles);

  const rr = rng(77);
  let genHist = Array.from({ length: 24 }, (_, i) => 100 + Math.sin(i / 3) * 14 + (rr() - .5) * 8);
  let conHist = Array.from({ length: 24 }, (_, i) => 92 + Math.sin(i / 4 + 1) * 10 + (rr() - .5) * 6);
  const labels = () => genHist.map((_, i) => `${(23 - i)}h ago`).map((l, i, a) => i === a.length - 1 ? 'Now' : l);

  function paint(animate) {
    chart.update([{ name: 'Generation', vals: genHist }, { name: 'Consumption', vals: conHist }], labels(), { label: 'Simulated generation and consumption, last 24 hours', animate });
    const gen = genHist.at(-1), con = conHist.at(-1), share = clamp(Math.round((gen / con) * 55), 20, 96), water = Math.round(78 + (con - 90) * .6);
    tweenNumber($('#tv-Generation'), gen, { d: 0, suffix: '', dur: animate ? 500 : 0 }); $('#td-Generation').textContent = 'index, live';
    tweenNumber($('#tv-Consumption'), con, { d: 0, dur: animate ? 500 : 0 }); $('#td-Consumption').textContent = 'index, live';
    tweenNumber($('#tv-Renewableshare'), share, { d: 0, suffix: '%', dur: animate ? 500 : 0 }); $('#td-Renewableshare').textContent = 'of demand this hour';
    tweenNumber($('#tv-Waterintensity'), water, { d: 0, dur: animate ? 500 : 0 }); $('#td-Waterintensity').textContent = 'index, live';
    $('#ts-Generation').innerHTML = sparkSVG(genHist.slice(-12));
    $('#ts-Consumption').innerHTML = sparkSVG(conHist.slice(-12));
    $('#ts-Renewableshare').innerHTML = sparkSVG(genHist.slice(-12).map((g, i) => clamp((g / conHist.slice(-12)[i]) * 55, 20, 96)));
    $('#ts-Waterintensity').innerHTML = sparkSVG(conHist.slice(-12).map(c => 78 + (c - 90) * .6));
  }
  paint(false);

  let liveTimer = null;
  const sw = $('#liveSwitch'), status = $('#liveStatus');
  function setLive(on) {
    sw.setAttribute('aria-checked', String(on));
    status.classList.toggle('on', on);
    $('span:last-child', status).textContent = on ? 'Live' : 'Paused';
    status.querySelector('i') && status.querySelector('i').classList.toggle('live', on);
    if (on && !reduced()) {
      liveTimer = setInterval(() => {
        genHist = [...genHist.slice(1), clamp(genHist.at(-1) + (rr() - .5) * 9, 60, 150)];
        conHist = [...conHist.slice(1), clamp(conHist.at(-1) + (rr() - .5) * 6, 60, 130)];
        paint(true);
      }, 1800);
    } else clearInterval(liveTimer);
  }
  sw.addEventListener('click', () => setLive(sw.getAttribute('aria-checked') !== 'true'));
  setLive(false);
}

/* ================================ scenario =============================== */
function initScenario() {
  const ids = ['wind', 'demand', 'water', 'grid'];
  const inputs = Object.fromEntries(ids.map(k => [k, $(`#s-${k}`)]));
  const outs = Object.fromEntries(ids.map(k => [k, $(`#o-${k}`)]));
  const presets = [
    { name: 'Baseline', wind: 100, demand: 100, water: 40, grid: 50 },
    { name: 'High wind year', wind: 140, demand: 100, water: 40, grid: 50 },
    { name: 'Full build-out', wind: 100, demand: 150, water: 55, grid: 60 },
    { name: 'Water-first design', wind: 100, demand: 110, water: 90, grid: 55 }
  ];
  $('#presets').innerHTML = presets.map((p, i) => `<button type="button" aria-pressed="${i === 0}">${p.name}</button>`).join('');
  const presetBtns = $$('#presets button');

  function paintTrack(el) { el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%'); }

  function compute() {
    const wind = +inputs.wind.value, demand = +inputs.demand.value, water = +inputs.water.value, grid = +inputs.grid.value;
    const matched = Math.min(wind * .8, demand);
    const shortfall = Math.max(0, demand - matched);
    const renShare = clamp(Math.round(((matched + shortfall * (grid / 100)) / demand) * 100), 0, 100);
    const balance = Math.round(wind - demand);
    const waterIdx = Math.round(clamp(100 - water * .55 + (demand - 100) * .18, 25, 150));
    const carbon = Math.round(clamp(shortfall * (1 - grid / 100) * 1.15, 0, 140));
    return { wind, demand, water, grid, renShare, balance, waterIdx, carbon, shortfall };
  }

  function paint(animate) {
    ids.forEach(k => { outs[k].textContent = (k === 'wind' || k === 'demand' || k === 'grid') ? inputs[k].value + '%' : inputs[k].value; paintTrack(inputs[k]); });
    const r = compute();
    const dur = animate ? 650 : 0;
    tweenNumber($('#rShare'), r.renShare, { suffix: '%', dur });
    const C = 364.4, off = C * (1 - r.renShare / 100);
    $('#ringFg').style.strokeDashoffset = String(off);
    if (reduced()) $('#ringFg').style.transition = 'none';

    tweenNumber($('#rBal'), r.balance, { sign: true, dur });
    const balPct = clamp(50 + r.balance / 2, 4, 96);
    $('#barBal').style.left = (r.balance < 0 ? balPct : 50) + '%';
    $('#barBal').style.width = Math.abs(balPct - 50) + '%';
    $('#barBal').classList.toggle('warn', r.balance < 0);

    tweenNumber($('#rWat'), r.waterIdx, { dur });
    $('#barWat').style.width = clamp(r.waterIdx / 1.6, 3, 100) + '%';
    $('#barWat').classList.toggle('warn', r.waterIdx > 100);
    $('#mkWat').style.left = clamp(100 / 1.6, 3, 100) + '%';

    tweenNumber($('#rCar'), r.carbon, { dur });
    $('#rCarBand').textContent = r.carbon < 25 ? ' low' : r.carbon < 70 ? ' moderate' : ' elevated';
    $('#barCar').style.width = clamp(r.carbon / 1.4, 3, 100) + '%';
    $('#barCar').classList.toggle('warn', r.carbon > 70);
    $('#mkCar').style.left = clamp(60 / 1.4, 3, 100) + '%';

    const r1 = r.shortfall <= 1
      ? `Renewable supply meets demand in this scenario, with ${fmt(Math.max(0, -r.balance))} index points of wind to spare.`
      : `Wind covers an estimated ${fmt(100 - Math.round(r.shortfall / r.demand * 100))}% of demand directly; the rest draws on the grid at ${r.grid}% renewable.`;
    const r2 = r.waterIdx > 100
      ? `Water intensity sits above the illustrative baseline — efficiency measures would need to work harder at this demand level.`
      : `Water intensity sits at or below the illustrative baseline for this combination.`;
    $('#readout1').textContent = r1; $('#readout2').textContent = r2;
  }

  ids.forEach(k => inputs[k].addEventListener('input', () => { presetBtns.forEach(b => b.setAttribute('aria-pressed', 'false')); paint(false); }));
  presetBtns.forEach((b, i) => b.addEventListener('click', () => {
    presetBtns.forEach((x, j) => x.setAttribute('aria-pressed', String(i === j)));
    const p = presets[i]; ids.forEach(k => { inputs[k].value = p[k]; });
    paint(true);
  }));
  $('#scReset').addEventListener('click', () => { presetBtns[0].click(); });
  paint(false);

  if ('IntersectionObserver' in window && !reduced()) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); paint(true); } }, { threshold: .3 });
    io.observe($('#scenario'));
  }
}

/* =============================== community =============================== */
function initCommunity() {
  const r = rng(5);
  const vals = Array.from({ length: 10 }, () => 30 + r() * 60);
  const max = Math.max(...vals);
  $('#cdMini').innerHTML = vals.map(v => `<i style="height:${Math.round(v / max * 100)}%"></i>`).join('');
}

/* =============================== insights platform ========================= */
function initInsights() {
  const scenarios = ['Current proposal', 'High wind year', 'Full build-out', 'Water-first design'];
  const sel = $('#pfScen');
  sel.innerHTML = scenarios.map(s => `<option>${s}</option>`).join('');
  const today = new Date('2026-09-21');
  const fmtDate = d => d.toISOString().slice(0, 10);
  $('#pfFrom').value = fmtDate(new Date(today.getTime() - 30 * 864e5));
  $('#pfTo').value = fmtDate(today);

  const rEnergy = rng(1), rWater = rng(2), rCarbon = rng(3);
  function series(days, rr, base, amp, trend = 0) {
    return Array.from({ length: days }, (_, i) => Math.round(base + Math.sin(i / (days / 6)) * amp + trend * i / days * amp + (rr() - .5) * amp * .4));
  }
  function labelsFor(days) {
    if (days <= 31) return Array.from({ length: days }, (_, i) => String(i + 1));
    if (days <= 90) return Array.from({ length: days }, (_, i) => i % 7 === 0 ? `W${Math.floor(i / 7) + 1}` : '').filter((v, i) => i % 7 === 0 || true);
    return MONTHS;
  }

  const chEnergy = LineChart($('#chEnergy'), { h: 220, label: 'Generation and consumption' });
  const chWater = LineChart($('#chWater'), { h: 220, label: 'Water use and recovered share' });
  const chCarbon = LineChart($('#chCarbon'), { h: 220, label: 'Carbon intensity against illustrative target' });

  function periodDays() { const v = $('#pfPeriod').value; return v === 'custom' ? 30 : (v === '365' ? 12 : +v); }

  function repaint(animate) {
    const days = periodDays(), isMonths = $('#pfPeriod').value === '365';
    const labels = isMonths ? MONTHS : Array.from({ length: days }, (_, i) => days <= 14 ? `Day ${i + 1}` : (i % Math.ceil(days / 8) === 0 ? `Day ${i + 1}` : ''));
    const gen = series(days, rEnergy, 104, 18), con = series(days, rEnergy, 94, 14, .3);
    const wat = series(days, rWater, 86, 20), rec = series(days, rWater, 52, 12, .4);
    const car = series(days, rCarbon, 90, 16, -.3), target = new Array(days).fill(70);

    chEnergy.update([{ name: 'Generation', vals: gen }, { name: 'Consumption', vals: con }], labels, { animate });
    chWater.update([{ name: 'Water use', vals: wat }, { name: 'Recovered', vals: rec }], labels, { animate });
    chCarbon.update([{ name: 'Carbon intensity', vals: car }, { name: 'Target', vals: target, dashed: true }], labels, { animate });

    const renShare = clamp(Math.round(gen.reduce((a, b) => a + b, 0) / con.reduce((a, b) => a + b, 0) * 58), 0, 100);
    const kpis = [
      { t: 'Renewable share', v: renShare, u: '%', d: '+3 pts vs prior period', good: true },
      { t: 'Energy demand', v: Math.round(con.reduce((a, b) => a + b) / con.length), u: 'idx', d: '−2 vs prior period', good: true },
      { t: 'Water intensity', v: Math.round(wat.reduce((a, b) => a + b) / wat.length), u: 'idx', d: '+4 vs prior period', good: false },
      { t: 'Carbon intensity', v: Math.round(car.reduce((a, b) => a + b) / car.length), u: 'idx', d: '−6 vs prior period', good: true },
      { t: 'Water recovered', v: Math.round(rec.reduce((a, b) => a + b) / rec.length / wat.reduce((a, b) => a + b) * wat.length * 100), u: '%', d: '+2 pts vs prior period', good: true }
    ];
    $('#kpis').innerHTML = kpis.map(k => `<div class="kpi"><div class="t">${k.t}</div><div class="v">${fmt(k.v)}<small>${k.u}</small></div><div class="d ${k.good ? 'good' : 'bad'}">${k.d}</div></div>`).join('');

    const period = $('#pfPeriod option:checked').textContent.toLowerCase();
    $('#pfRange').textContent = `${$('#pfFrom').value} → ${$('#pfTo').value} · ${sel.value}`;
    $('#pfInsight').textContent = `Over the ${period}, the ${sel.value.toLowerCase()} scenario shows renewable share holding near ${renShare}%, with water intensity the metric furthest from its illustrative target. Demo data, generated for this view only.`;
  }

  repaint(false);
  $('#pfPeriod').addEventListener('change', () => { const custom = $('#pfPeriod').value === 'custom'; $('#pfFrom').closest('.fld').style.opacity = custom ? 1 : .55; repaint(true); });
  $('#pfFrom').addEventListener('change', () => repaint(true));
  $('#pfTo').addEventListener('change', () => repaint(true));
  sel.addEventListener('change', () => repaint(true));

  const mBtns = $$('#pfMetric button');
  mBtns.forEach(b => b.addEventListener('click', () => {
    mBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const v = b.dataset.v;
    $$('.pf-chart', $('#pfCharts')).forEach(ch => { ch.hidden = !(v === 'all' || ch.dataset.k === v); });
    $('#pfCharts').classList.toggle('all', v === 'all');
  }));

  if ('IntersectionObserver' in window && !reduced()) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); repaint(true); } }, { threshold: .2 });
    io.observe($('#insights'));
  }
}

/* =============================== decision framework ========================= */
function initDecision() {
  const cats = [
    { k: 'Environment', icon: 'leaf',
      know: ['General habitat and land-use context', 'Regional climate and emissions targets'],
      need: ['Baseline biodiversity survey', 'Noise and air-quality monitoring plan', 'Construction-phase impact assessment'],
      consider: ['Cumulative effect with other regional developments', 'Long-term land use after the project\'s lifetime'] },
    { k: 'Energy', icon: 'zap',
      know: ['Wind farm generation capacity', 'Grid connection point and general capacity'],
      need: ['Hour-by-hour matching of supply and demand', 'Grid constraint analysis at peak load'],
      consider: ['How much backup or storage the design should include', 'Whether demand should be allowed to grow ahead of supply'] },
    { k: 'Water', icon: 'droplet',
      know: ['General water availability in the region', 'Typical cooling water needs for similar facilities'],
      need: ['Site-specific water assessment across seasons', 'Cooling system design and its water-energy trade-off'],
      consider: ['Impact on other local water users in dry summers', 'Whether recycling targets should be binding'] },
    { k: 'Community', icon: 'users',
      know: ['Existing local employment and skills base', 'Community concerns raised in early conversations'],
      need: ['Formal consultation results', 'Agreed local-benefit and transparency commitments'],
      consider: ['How disagreements would be resolved', 'What ongoing role residents would have after approval'] },
    { k: 'Economics', icon: 'coins',
      know: ['General regional investment and jobs context', 'Illustrative scale of the proposed facility'],
      need: ['Cost-benefit analysis including resource use', 'Realistic job-creation and local-spend estimates'],
      consider: ['How benefits are distributed locally versus regionally', 'What happens economically if demand does not materialise'] }
  ];
  const list = $('#decTabs'), panel = $('#decPanel');
  list.innerHTML = cats.map(c => `<button role="tab" type="button" aria-controls="decPanel"><span data-icon="${c.icon}" data-size="18"></span>${c.k}</button>`).join('');
  hydrateIcons(list);
  let allChecks = [];
  function updateCoverage() {
    const boxes = $$('#decPanel input[type=checkbox]');
    const checked = boxes.filter(b => b.checked).length;
    const pct = boxes.length ? Math.round(checked / boxes.length * 100) : 0;
    $('#coverBar').style.width = pct + '%';
    $('#coverText').innerHTML = `<b>${checked} of ${boxes.length}</b> measures marked gathered for this category`;
  }
  tabs(list, panel, i => {
    const c = cats[i];
    panel.innerHTML = `<div class="dec-cols">
      <div class="dec-col"><h3 class="h-sm">What we know</h3><ul>${c.know.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="dec-col"><h3 class="h-sm">What needs to be measured</h3><ul>${c.need.map((x, j) => `<li><label class="chk"><input type="checkbox" id="chk-${i}-${j}"><span class="bx">${icon('check', 14)}</span><span class="tx">${x}</span></label></li>`).join('')}</ul></div>
      <div class="dec-col"><h3 class="h-sm">What should be considered</h3><ul>${c.consider.map(x => `<li>${x}</li>`).join('')}</ul></div>
    </div>`;
    $$('#decPanel input[type=checkbox]').forEach(b => b.addEventListener('change', updateCoverage));
    updateCoverage();
  });
}

/* ================================ presentation mode ======================== */
function initPresent() {
  const steps = [
    { sel: '#top', label: 'Homepage' },
    { sel: '#opportunity', label: 'Opportunity' },
    { sel: '#energy', label: 'Energy' },
    { sel: '#water', label: 'Water' },
    { sel: '#carbon', label: 'Carbon' },
    { sel: '#data-ai', label: 'Data dashboard' },
    { sel: '#scenario', label: 'AI scenario model' },
    { sel: '#community', label: 'Community' },
    { sel: '#decision', label: 'Decision framework' }
  ];
  const toggle = $('#presentToggle'), bar = $('#present'), dots = $('#pDots');
  const prev = $('#pPrev'), next = $('#pNext'), exit = $('#pExit');
  dots.innerHTML = steps.map((s, i) => `<button type="button" aria-label="Go to ${s.label}"></button>`).join('');
  const dotEls = $$('button', dots);
  let idx = 0, active = false;

  function go(i, smooth = true) {
    idx = clamp(i, 0, steps.length - 1);
    $(steps[idx].sel).scrollIntoView({ behavior: smooth && !reduced() ? 'smooth' : 'auto', block: 'start' });
    $('#pCount').textContent = `${idx + 1} of ${steps.length}`;
    $('#pTitle').textContent = steps[idx].label;
    dotEls.forEach((d, j) => { if (j === idx) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
    prev.disabled = idx === 0; next.disabled = idx === steps.length - 1;
  }
  function setActive(on) {
    active = on;
    document.body.classList.toggle('presenting', on);
    toggle.setAttribute('aria-pressed', String(on));
    bar.hidden = !on;
    if (on) go(0, true);
  }
  toggle.addEventListener('click', () => setActive(!active));
  exit.addEventListener('click', () => setActive(false));
  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));
  dotEls.forEach((d, i) => d.addEventListener('click', () => go(i)));
  document.addEventListener('keydown', e => {
    if (!active) return;
    if (e.key === 'Escape') setActive(false);
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(idx + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(idx - 1); }
  });
}

/* =================================== bootstrap ============================= */
function boot() {
  hydrateIcons();
  initHero();
  initNav();
  initPhases();
  topo($('#topo-opp'), { seed: 4 });
  topo($('#topo-about'), { seed: 12 });
  topo($('#topo-cta'), { seed: 19 });
  ctaHills();
  initEnergy();
  initDataCentre();
  initWater();
  initCarbon();
  initPerformance();
  initConsole();
  initScenario();
  initCommunity();
  initInsights();
  initDecision();
  initPresent();
  initReveal();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
