// ============================================================================
// IMPACT.JS — an anime-style impact frame, used sparingly: the LIVE button,
// and earned moments in the games (new best, a perfect streak).
//
// Three frames, ~260ms in all:
//   1. the page turns into an inverted, high-contrast "manga panel" with
//      speed lines rushing toward the point of impact
//   2. it snaps back to a monochrome panel, the lines flip colour
//   3. it fades out while a ring bursts from the point
// One flash, well under the 3-per-second photosensitivity limit, and it never
// plays for people who ask their device for reduced motion.
//
//   impact({ x, y, shake: element, tone: 'launch' | 'win' }) -> Promise
// The promise resolves at the moment of impact (~150ms), so a caller can chain
// the real action (e.g. the warp) right after the hit.
// ============================================================================

const HIT_MS = 150;
const TOTAL_MS = 260;
let busyUntil = 0;

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// speed lines: thin wedges from the screen edge toward the point, leaving a clear core
function speedLines(x, y, w, h) {
  const reach = Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) + 40;
  const n = 64;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
    const core = 90 + Math.random() * 120;
    const spread = 0.004 + Math.random() * 0.012;
    const tipX = x + Math.cos(a) * core;
    const tipY = y + Math.sin(a) * core;
    const l = { x: x + Math.cos(a - spread) * reach, y: y + Math.sin(a - spread) * reach };
    const r = { x: x + Math.cos(a + spread) * reach, y: y + Math.sin(a + spread) * reach };
    d += `M${tipX.toFixed(1)} ${tipY.toFixed(1)}L${l.x.toFixed(1)} ${l.y.toFixed(1)}L${r.x.toFixed(1)} ${r.y.toFixed(1)}Z`;
  }
  return d;
}

export function impact({ x, y, shake, tone = 'launch' } = {}) {
  const now = performance.now();
  if (typeof document === 'undefined' || reduced() || now < busyUntil) return Promise.resolve();
  busyUntil = now + 600;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const cx = x ?? w / 2;
  const cy = y ?? h / 2;
  const dark = document.documentElement.classList.contains('dark');
  // ink for the lines on each frame: frame 1 sits on an inverted page, frame 2 on a normal one
  const accent = tone === 'win' ? '#DDBCEB' : dark ? '#DDBCEB' : '#0F499A';

  const root = document.createElement('div');
  root.className = `impact impact--${tone}`;
  root.setAttribute('aria-hidden', 'true');
  root.style.setProperty('--ix', `${cx}px`);
  root.style.setProperty('--iy', `${cy}px`);
  root.style.setProperty('--accent', accent);
  root.innerHTML = `
    <div class="impact-panel"></div>
    <svg class="impact-lines" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${speedLines(cx, cy, w, h)}"/></svg>
    <div class="impact-ring"></div>`;
  document.body.appendChild(root);

  if (shake) {
    shake.classList.remove('impact-shake');
    void shake.offsetWidth; // restart
    shake.classList.add('impact-shake');
    setTimeout(() => shake.classList.remove('impact-shake'), 320);
  }

  // frame timing is driven by data-frame so the CSS stays declarative
  root.dataset.frame = '1';
  const t2 = setTimeout(() => (root.dataset.frame = '2'), 70);
  const t3 = setTimeout(() => (root.dataset.frame = '3'), HIT_MS);
  setTimeout(() => {
    clearTimeout(t2);
    clearTimeout(t3);
    root.remove();
  }, TOTAL_MS + 40);

  return new Promise((resolve) => setTimeout(resolve, HIT_MS));
}

/** Impact centred on an element (a button that was just pressed). */
export function impactAt(el, opts = {}) {
  const r = el?.getBoundingClientRect?.();
  if (!r) return impact(opts);
  return impact({ x: r.left + r.width / 2, y: r.top + r.height / 2, ...opts });
}
