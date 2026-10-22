import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import {
  Code2,
  Server,
  Smartphone,
  Palette,
  Sparkles,
  Rocket,
  Zap,
  RefreshCw,
  GitBranch,
  Waves,
  LayoutDashboard,
  Workflow as WorkflowIcon,
  Route,
  Wind,
  Sprout,
  Tag,
  TreeDeciduous,
} from 'lucide-react';

import { rgba, getPalette, cssVars } from './theme';
import { HandStyles, HandNote, Doodle, StickyNote } from './HandTouch';

// ============================================================================
// STACKS.JSX — "The Tech Tree"
// The toolkit as an illustrated tree drawn straight onto the page: each
// category is a leafy crown on its own branch and every tool is a fruit.
// Built for smoothness — the trunk is one static drawing, each crown is its
// own GPU layer swayed by CSS, and the cursor (wind) only nudges six
// transforms. Hover a fruit, shake the trunk, trace a project, replant.
// ============================================================================

// ----------------------------------------------------------------------------
// DATA — every logo is pulled from a public CDN so no local assets are needed.
// SIMPLE: single-color brand marks, recolored on the fly via cdn.simpleicons.org
// DEVICON: multi-color "original" brand marks from devicons/devicon via jsDelivr
// LOBE: AI-native brand marks (Codex, ChatGPT, CapCut...) from lobehub/lobe-icons
// A tool with no logo renders its `glyph` initials instead.
// ----------------------------------------------------------------------------

const SIMPLE = (slug, color) => `https://cdn.simpleicons.org/${slug}/${color}`;
const DEVICON = (name, variant = 'original') =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/${name}/${name}-${variant}.svg`;
const LOBE = (slug) =>
  `https://cdn.jsdelivr.net/gh/lobehub/lobe-icons@master/packages/static-svg/icons/${slug}.svg`;

const PORTFOLIO = 'This portfolio';

// Grouped by theme; LAYOUTS below place each category's crown on the tree.
const stackCategories = [
  {
    id: 'mobile',
    title: 'Mobile',
    subtitle: 'Cross-platform apps from a single codebase',
    color: '#FF8A00',
    Icon: Smartphone,
    items: [
      { name: 'React Native', logo: DEVICON('react'), usedIn: ['TIDE'] },
      { name: 'Expo', logo: SIMPLE('expo', '000020'), usedIn: ['TIDE'] },
      { name: 'NativeWind', logo: null, glyph: 'NW' },
    ],
  },
  {
    id: 'design',
    title: 'Design & Motion',
    subtitle: 'Visual, video & prototyping tools',
    color: '#FF007A',
    Icon: Palette,
    items: [
      { name: 'Canva', logo: DEVICON('canva') },
      { name: 'CapCut', logo: LOBE('capcut') },
      { name: 'Figma', logo: DEVICON('figma') },
      { name: 'Framer', logo: SIMPLE('framer', '0055FF') },
      { name: 'Photoshop', logo: DEVICON('photoshop') },
      { name: 'DaVinci', logo: SIMPLE('davinciresolve', '233A51') },
    ],
  },
  {
    id: 'ai',
    title: 'AI Collaborators',
    subtitle: 'Models & assistants in the daily loop',
    color: '#A700FF',
    Icon: Sparkles,
    items: [
      { name: 'Claude', logo: SIMPLE('claude', 'D97757') },
      { name: 'ChatGPT', logo: LOBE('openai') },
      { name: 'Gemini', logo: SIMPLE('googlegemini', '8E75B2') },
      { name: 'Copilot', logo: SIMPLE('githubcopilot', '000000') },
      { name: 'Codex', logo: LOBE('codex-color') },
      { name: 'Perplexity', logo: SIMPLE('perplexity', '1FB8CD') },
      { name: 'DeepSeek', logo: SIMPLE('deepseek', '4D6BFE') },
    ],
  },
  {
    id: 'backend',
    title: 'Backend & Data',
    subtitle: 'Servers, APIs, databases & realtime',
    color: '#00C48C',
    Icon: Server,
    items: [
      { name: 'Node.js', logo: DEVICON('nodejs'), usedIn: [PORTFOLIO] },
      { name: 'Express', logo: SIMPLE('express', '000000'), usedIn: [PORTFOLIO] },
      { name: 'Socket.IO', logo: SIMPLE('socketdotio', '010101'), usedIn: [PORTFOLIO] },
      { name: 'Supabase', logo: SIMPLE('supabase', '3FCF8E') },
      { name: 'PostgreSQL', logo: DEVICON('postgresql') },
      { name: 'MySQL', logo: DEVICON('mysql'), usedIn: ['SweepXpress'] },
      { name: 'PHP', logo: DEVICON('php'), usedIn: ['SweepXpress'] },
      { name: 'Python', logo: DEVICON('python') },
      { name: 'JSON', logo: DEVICON('json') },
    ],
  },
  {
    id: 'ship',
    title: 'Ship & Workspace',
    subtitle: 'Deployment, version control & daily-driver apps',
    color: '#E0A800',
    Icon: Rocket,
    items: [
      { name: 'Vercel', logo: SIMPLE('vercel', '000000'), usedIn: ['TIDE', 'Poopipoo', 'Neo Chess XD', 'Snapzy'] },
      { name: 'GitHub', logo: SIMPLE('github', '181717'), usedIn: [PORTFOLIO] },
      { name: 'Git', logo: DEVICON('git'), usedIn: [PORTFOLIO] },
      { name: 'VS Code', logo: DEVICON('vscode') },
      { name: 'Replit', logo: SIMPLE('replit', 'F26207') },
      { name: 'PyCharm', logo: DEVICON('pycharm') },
      { name: 'Notepad++', logo: SIMPLE('notepadplusplus', '90E59A') },
      { name: 'Drive', logo: SIMPLE('googledrive', '4285F4') },
      { name: 'Discord', logo: SIMPLE('discord', '5865F2') },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    subtitle: 'Languages, frameworks & build tools for the web',
    color: '#00B8D9',
    Icon: Code2,
    items: [
      { name: 'React', logo: DEVICON('react'), usedIn: ['Poopipoo', 'Neo Chess XD', 'Snapzy', PORTFOLIO] },
      { name: 'Next.js', logo: SIMPLE('nextdotjs', '000000'), usedIn: ['Poopipoo', 'Snapzy'] },
      { name: 'TypeScript', logo: DEVICON('typescript') },
      { name: 'JavaScript', logo: DEVICON('javascript'), usedIn: ['Neo Chess XD', PORTFOLIO] },
      { name: 'Vite', logo: DEVICON('vitejs'), usedIn: ['Neo Chess XD', PORTFOLIO] },
      { name: 'Tailwind', logo: DEVICON('tailwindcss'), usedIn: ['SweepXpress', 'Snapzy', PORTFOLIO] },
      { name: 'lucide-react', logo: SIMPLE('lucide', 'F56565'), usedIn: [PORTFOLIO] },
      { name: 'HTML', logo: DEVICON('html5') },
      { name: 'CSS', logo: DEVICON('css3') },
      { name: 'Bootstrap', logo: DEVICON('bootstrap') },
    ],
  },
];

// Methodologies have no brand logos — represented with icon badges instead.
const methodologies = [
  { name: 'Agile', Icon: Zap, desc: 'Iterative delivery in short, feedback-driven cycles.' },
  { name: 'Scrum', Icon: RefreshCw, desc: 'Sprints, standups & backlog grooming.' },
  { name: 'SDLC', Icon: GitBranch, desc: 'Plan, build, test, deploy, maintain.' },
  { name: 'Waterfall', Icon: Waves, desc: 'Sequential phases for fixed-scope work.' },
  { name: 'Kanban', Icon: LayoutDashboard, desc: 'Visualizing flow with a living task board.' },
];

// ============================================================================
// TREE GEOMETRY
// Two hand-tuned layouts in SVG user units: a wide crown for desktop and a
// tall one for phones (so every fruit stays big enough to tap).
// clusters: [x, y, radius] of each category's leaf crown
// bases:    where that branch leaves the trunk
// ============================================================================

const DRAW_ORDER = ['ai', 'design', 'backend', 'ship', 'frontend', 'mobile'];
const FRUIT = 44;

const LAYOUTS = {
  wide: {
    w: 1200,
    h: 820,
    groundY: 770,
    trunkTop: 495,
    trunkX: 600,
    clusters: {
      frontend: [600, 165, 145],
      backend: [330, 240, 130],
      ship: [870, 240, 130],
      ai: [175, 445, 110],
      design: [1028, 445, 105],
      mobile: [600, 392, 74],
    },
    bases: {
      frontend: [600, 500],
      mobile: [604, 522],
      backend: [592, 548],
      ship: [608, 542],
      ai: [588, 612],
      design: [612, 602],
    },
  },
  tall: {
    w: 600,
    h: 1100,
    groundY: 1050,
    trunkTop: 780,
    trunkX: 300,
    clusters: {
      frontend: [300, 175, 150],
      backend: [150, 432, 125],
      ship: [450, 432, 125],
      ai: [128, 690, 108],
      design: [472, 690, 104],
      mobile: [300, 592, 74],
    },
    bases: {
      frontend: [300, 785],
      mobile: [302, 805],
      backend: [292, 820],
      ship: [308, 815],
      ai: [290, 880],
      design: [310, 870],
    },
  },
};

const cubic = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
};

// a filled, tapering branch along a cubic bezier (SVG strokes can't taper)
const taperedPath = (p0, p1, p2, p3, w0, w1, steps = 24) => {
  const left = [];
  const right = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = cubic(p0, p1, p2, p3, t);
    const q = cubic(p0, p1, p2, p3, Math.min(1, t + 0.01));
    const r = cubic(p0, p1, p2, p3, Math.max(0, t - 0.01));
    const len = Math.hypot(q[0] - r[0], q[1] - r[1]) || 1;
    const nx = -(q[1] - r[1]) / len;
    const ny = (q[0] - r[0]) / len;
    const w = (w0 + (w1 - w0) * t) / 2;
    left.push(`${(p[0] + nx * w).toFixed(1)},${(p[1] + ny * w).toFixed(1)}`);
    right.push(`${(p[0] - nx * w).toFixed(1)},${(p[1] - ny * w).toFixed(1)}`);
  }
  return `M${left.join(' L')} L${right.reverse().join(' L')} Z`;
};

const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

const buildTree = (L) => {
  const groups = DRAW_ORDER.map((id) => {
    const category = stackCategories.find((c) => c.id === id);
    const [cx, cy, R] = L.clusters[id];
    const [bx, by] = L.bases[id];
    const end = [cx, cy + R * 0.22];
    const p1 = [bx + (end[0] - bx) * 0.1, by - (by - end[1]) * 0.55];
    const p2 = [bx + (end[0] - bx) * 0.72, end[1] + (by - end[1]) * 0.3];
    const n = category.items.length;
    const rand = seeded(id.length * 97 + n * 13);

    // each crown is its own layer; `box` is its square in tree coordinates
    const pad = R * 1.2;
    const box = { x: cx - pad, y: cy - pad, size: pad * 2 };

    const fruits = category.items.map((tool, j) => {
      const rr = R * 0.74 * Math.sqrt((j + 0.6) / n);
      const th = j * 2.39996 + id.length;
      const x = cx + Math.cos(th) * rr;
      const y = cy + Math.sin(th) * rr * 0.92;
      const mx = (end[0] + x) / 2;
      const my = (end[1] + y) / 2;
      const bend = (j % 2 ? 1 : -1) * 14;
      const dl = Math.hypot(x - end[0], y - end[1]) || 1;
      return {
        ...tool,
        key: `${id}-${j}`,
        j,
        category,
        left: ((x - box.x) / box.size) * 100,
        top: ((y - box.y) / box.size) * 100,
        twig: `M${end[0].toFixed(1)},${end[1].toFixed(1)} Q${(mx - ((y - end[1]) / dl) * bend).toFixed(1)},${(my + ((x - end[0]) / dl) * bend).toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`,
      };
    });

    const blobs = [[cx, cy, R * 0.66]];
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + 0.3;
      blobs.push([cx + Math.cos(a) * R * 0.48, cy + Math.sin(a) * R * 0.42, R * (0.46 + rand() * 0.12)]);
    }
    const leaves = Array.from({ length: 14 }, () => {
      const a = rand() * Math.PI * 2;
      const d = R * (0.35 + rand() * 0.6);
      return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.9, r: rand() * 360, s: 0.8 + rand() * 0.8 };
    });

    return {
      id,
      category,
      color: category.color,
      R,
      box,
      origin: [((end[0] - box.x) / box.size) * 100, ((end[1] - box.y) / box.size) * 100],
      branch: taperedPath([bx, by], p1, p2, end, id === 'frontend' ? 30 : 24, 7),
      fruits,
      blobs,
      leaves,
    };
  });

  const x = L.trunkX;
  const gy = L.groundY;
  const ty = L.trunkTop;
  const trunk = [
    `M${x - 110},${gy + 4}`,
    `C${x - 62},${gy - 6} ${x - 42},${gy - 36} ${x - 38},${gy - 92}`,
    `C${x - 34},${gy - 160} ${x - 30},${ty + 90} ${x - 22},${ty + 22}`,
    `Q${x - 18},${ty - 6} ${x - 6},${ty - 14}`,
    `L${x + 6},${ty - 14}`,
    `Q${x + 18},${ty - 6} ${x + 22},${ty + 22}`,
    `C${x + 30},${ty + 90} ${x + 34},${gy - 160} ${x + 38},${gy - 92}`,
    `C${x + 42},${gy - 36} ${x + 62},${gy - 6} ${x + 110},${gy + 4}`,
    'Z',
  ].join(' ');
  const roots = [
    `M${x - 30},${gy - 10} C${x - 70},${gy + 4} ${x - 120},${gy + 2} ${x - 160},${gy + 18}`,
    `M${x + 30},${gy - 10} C${x + 74},${gy + 6} ${x + 118},${gy + 4} ${x + 168},${gy + 20}`,
  ];
  const bark = [
    `M${x - 14},${gy - 30} C${x - 20},${gy - 120} ${x - 8},${ty + 150} ${x - 12},${ty + 60}`,
    `M${x + 12},${gy - 50} C${x + 18},${gy - 140} ${x + 6},${ty + 170} ${x + 10},${ty + 80}`,
  ];
  return { groups, trunk, roots, bark };
};

const TREES = { wide: buildTree(LAYOUTS.wide), tall: buildTree(LAYOUTS.tall) };
const allTools = TREES.wide.groups.flatMap((g) => g.fruits);
const TOOL_COUNT = allTools.length;
const PROJECTS = ['TIDE', 'Poopipoo', 'Neo Chess XD', 'Snapzy', 'SweepXpress', PORTFOLIO];
const pad2 = (n) => String(n).padStart(2, '0');
const LEAF_PATH = 'M0,-7 C5,-5 6,3 0,8 C-6,3 -5,-5 0,-7 Z';

// deterministic firefly spots (night only), in % of the tree box
const FIREFLIES = (() => {
  const r = seeded(29);
  return Array.from({ length: 10 }, () => ({
    x: 8 + r() * 84,
    y: 6 + r() * 70,
    fx: Math.round((r() - 0.5) * 80),
    fy: Math.round((r() - 0.5) * 60),
    t: (4 + r() * 4).toFixed(1),
    d: (r() * 4).toFixed(1),
  }));
})();

// ============================================================================
// STYLES — scoped colour classes beat the global `.light/.dark h1..span`
// `!important` overrides in index.css. Every animation here only touches
// transform/opacity so it runs on the compositor (no per-frame repaint).
// ============================================================================

const StackStyles = () => (
  <style>{`
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-acc { color: var(--acc) !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-ink { color: var(--ink) !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-dark { color: #1B1B2A !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-white { color: #FFFFFF !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-cat { color: var(--c) !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-tc { color: var(--tc) !important; }
    @keyframes sc-sway { 0%, 100% { transform: rotate(-1.4deg); } 50% { transform: rotate(1.4deg); } }
    @keyframes sc-shake {
      0% { transform: rotate(0deg); } 15% { transform: rotate(-7deg); } 30% { transform: rotate(6deg); }
      45% { transform: rotate(-4deg); } 60% { transform: rotate(3deg); } 80% { transform: rotate(-1.5deg); } 100% { transform: rotate(0deg); }
    }
    @keyframes sc-fall {
      0% { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      85% { opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; }
    }
    @keyframes sc-flutter { 0%, 100% { transform: rotate(-30deg); } 50% { transform: rotate(30deg); } }
    @keyframes sc-ff { 0% { transform: translate(0px, 0px); } 100% { transform: translate(var(--fx), var(--fy)); } }
    @keyframes sc-blink { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
    @keyframes sc-ring { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.7); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .sc-anim { animation: none !important; } }
  `}</style>
);

// ============================================================================
// SHARED PIECES
// ============================================================================

const SectionEyebrow = ({ label, icon }) => (
  <div className="flex items-center gap-4 sm:gap-6">
    <h3 className="sc-acc text-[0.625rem] sm:text-[0.6875rem] md:text-[0.75rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] whitespace-nowrap">
      {label}
    </h3>
    <div className="h-px flex-1 bg-[color:var(--acc-line)]" />
    <span className="sc-acc shrink-0">{icon}</span>
  </div>
);

const Pill = ({ on, onClick, children, label, color }) => (
  <button
    onClick={onClick}
    aria-pressed={on}
    title={label}
    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-[0.625rem] sm:text-[0.6875rem] font-black uppercase tracking-[0.16em] transition-colors active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
    style={{
      borderColor: on ? color ?? 'var(--acc)' : 'var(--line)',
      background: on ? color ?? 'var(--acc)' : 'transparent',
    }}
  >
    <span className="sc-tc flex items-center gap-2" style={{ '--tc': on ? (color ? '#FFFFFF' : 'var(--acc-ink)') : 'var(--ink)' }}>
      {children}
    </span>
  </button>
);

// ============================================================================
// FALLING LEAVES — owns its own state so spawning never re-renders the tree
// ============================================================================

let leafSeq = 0;

const LeafFall = forwardRef(({ reduced }, ref) => {
  const [leaves, setLeaves] = useState([]);

  useImperativeHandle(
    ref,
    () => ({
      spawn(spots, heightPx) {
        if (reduced || !spots.length) return;
        const fresh = spots.map(({ x, y, color }) => ({
          id: ++leafSeq,
          x,
          y,
          color,
          dx: Math.round((Math.random() - 0.4) * 140),
          dy: Math.round(((100 - y) / 100) * heightPx * 0.92),
          rot: Math.round((Math.random() - 0.5) * 540),
          dur: (2.8 + Math.random() * 2.2).toFixed(2),
        }));
        setLeaves((prev) => [...prev.slice(-24), ...fresh]);
      },
    }),
    [reduced]
  );

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {leaves.map((lf) => (
        <span
          key={lf.id}
          className="absolute"
          style={{
            left: `${lf.x}%`,
            top: `${lf.y}%`,
            '--dx': `${lf.dx}px`,
            '--dy': `${lf.dy}px`,
            '--rot': `${lf.rot}deg`,
            animation: `sc-fall ${lf.dur}s cubic-bezier(0.45,0.05,0.55,0.95) forwards`,
            willChange: 'transform, opacity',
          }}
          onAnimationEnd={() => setLeaves((prev) => prev.filter((l) => l.id !== lf.id))}
        >
          <svg width="12" height="16" viewBox="-7 -8 14 17" style={{ animation: `sc-flutter ${0.9 + (lf.id % 4) * 0.2}s ease-in-out infinite` }}>
            <path d={LEAF_PATH} fill={lf.color} />
          </svg>
        </span>
      ))}
    </div>
  );
});
LeafFall.displayName = 'LeafFall';

// ============================================================================
// THE TREE
// ============================================================================

const Fruit = ({ fruit, grown, delay, active, lit, dim, pinned, showName, onEnter, onLeave, onPick }) => {
  const color = fruit.category.color;
  const big = active || pinned;
  return (
    <button
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onPick}
      aria-label={`${fruit.name} — ${fruit.category.title}`}
      aria-pressed={pinned}
      className="absolute rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
      style={{
        left: `${fruit.left}%`,
        top: `${fruit.top}%`,
        width: `var(--fruit)`,
        height: `var(--fruit)`,
        marginLeft: 'calc(var(--fruit) / -2)',
        marginTop: 'calc(var(--fruit) / -2)',
        zIndex: big ? 5 : 1,
      }}
    >
      <span
        className="absolute inset-0 rounded-full bg-white flex items-center justify-center"
        style={{
          padding: '19%',
          border: `2.5px solid ${color}`,
          boxShadow: lit || big ? `0 0 0 4px ${rgba(color, 0.3)}, 0 6px 18px ${rgba(color, 0.55)}` : '0 3px 8px rgba(0,0,0,0.25)',
          transform: grown ? `scale(${big ? 1.3 : lit ? 1.12 : 1})` : 'scale(0)',
          opacity: dim ? 0.3 : 1,
          transition: `transform 380ms cubic-bezier(0.34,1.56,0.64,1) ${grown && delay ? delay : 0}ms, opacity 250ms ease, box-shadow 250ms ease`,
        }}
      >
        {fruit.logo ? (
          <img src={fruit.logo} alt="" loading="lazy" draggable={false} className="w-full h-full object-contain pointer-events-none" />
        ) : (
          <span className="sc-dark font-black leading-none" style={{ fontSize: 'calc(var(--fruit) * 0.3)' }}>
            {fruit.glyph}
          </span>
        )}
        {pinned && (
          <span
            className="sc-anim absolute -inset-1 rounded-full pointer-events-none"
            style={{ border: `2px solid ${color}`, animation: 'sc-ring 1.5s ease-out infinite' }}
          />
        )}
      </span>

      {/* tooltip rides along with the fruit, so it sways with the crown */}
      {big && grown && (
        <span
          className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 whitespace-nowrap px-3 py-2 rounded-xl text-left pointer-events-none"
          style={{ background: color, boxShadow: `0 10px 24px ${rgba(color, 0.45)}`, zIndex: 10 }}
        >
          <span className="sc-white block text-xs sm:text-sm font-black leading-tight">{fruit.name}</span>
          <span className="sc-white block text-[0.5625rem] font-black uppercase tracking-[0.18em] opacity-85">
            {fruit.usedIn?.length ? `Used in ${fruit.usedIn.join(' · ')}` : fruit.category.title}
          </span>
        </span>
      )}
      {showName && !big && grown && (
        <span
          className="sc-ink absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap font-black pointer-events-none"
          style={{ fontSize: 'clamp(0.5rem, 0.85vw, 0.625rem)', opacity: dim ? 0.3 : 0.9 }}
        >
          {fruit.name}
        </span>
      )}
    </button>
  );
};

const TechTree = ({ darkMode, reduced }) => {
  const boxRef = useRef(null);
  const leanRefs = useRef({});
  const leafRef = useRef(null);
  const windRaf = useRef(0);

  const [layoutKey, setLayoutKey] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 720 ? 'tall' : 'wide'
  );
  const [grown, setGrown] = useState(false);
  const [settled, setSettled] = useState(false);
  const [plantKey, setPlantKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [hover, setHover] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [trace, setTrace] = useState(null);
  const [focusCat, setFocusCat] = useState(null);
  const [showNames, setShowNames] = useState(false);

  const inView = useInView(boxRef, { once: true, margin: '-80px' });
  const L = LAYOUTS[layoutKey];
  const T = TREES[layoutKey];

  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setLayoutKey(entry.contentRect.width < 640 ? 'tall' : 'wide'));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // grow on first view; a replant lets the old tree sink first
  useEffect(() => {
    if (!inView) return undefined;
    if (reduced) {
      setGrown(true);
      setSettled(true);
      return undefined;
    }
    setGrown(false);
    setSettled(false);
    const wait = plantKey > 0 ? 650 : 60;
    const t1 = setTimeout(() => setGrown(true), wait);
    const t2 = setTimeout(() => setSettled(true), wait + 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [inView, reduced, plantKey]);

  const dropLeaves = useCallback(
    (count) => {
      const h = boxRef.current?.offsetHeight ?? 600;
      const spots = Array.from({ length: count }, () => {
        const g = T.groups[Math.floor(Math.random() * T.groups.length)];
        const a = Math.random() * Math.PI * 2;
        const d = 0.25 + Math.random() * 0.6;
        const cx = g.box.x + g.box.size / 2 + Math.cos(a) * g.R * d;
        const cy = g.box.y + g.box.size / 2 + Math.sin(a) * g.R * d * 0.8;
        return { x: (cx / L.w) * 100, y: (cy / L.h) * 100, color: g.color };
      });
      leafRef.current?.spawn(spots, h);
    },
    [T, L]
  );

  // a lazy leaf every few seconds while the tree is on screen
  useEffect(() => {
    if (reduced || !settled) return undefined;
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') dropLeaves(1);
    }, 3200);
    return () => clearInterval(t);
  }, [reduced, settled, dropLeaves]);

  // cursor = wind: lean every crown away from the pointer (6 style writes per frame max)
  const setLean = (deg) => {
    cancelAnimationFrame(windRaf.current);
    windRaf.current = requestAnimationFrame(() => {
      DRAW_ORDER.forEach((id, i) => {
        const el = leanRefs.current[id];
        if (el) el.style.transform = `rotate(${(deg * (0.7 + (i % 3) * 0.15)).toFixed(2)}deg)`;
      });
    });
  };
  const onPointerMove = (e) => {
    if (reduced) return;
    const r = boxRef.current.getBoundingClientRect();
    setLean((0.5 - (e.clientX - r.left) / r.width) * 4);
  };

  const shake = () => {
    setHover(null);
    setShakeKey((k) => k + 1);
    dropLeaves(16);
  };
  const replant = () => {
    setHover(null);
    setPinned(null);
    setTrace(null);
    setFocusCat(null);
    setPlantKey((k) => k + 1);
  };

  // ---- what is highlighted ----
  const lit = useMemo(() => {
    const tools = new Set();
    if (trace) allTools.forEach((t) => t.usedIn?.includes(trace) && tools.add(t.key));
    if (focusCat) allTools.forEach((t) => t.category.id === focusCat && tools.add(t.key));
    return tools;
  }, [trace, focusCat]);
  const activeKey = hover ?? (pinned ? pinned.key : null);
  const anyLit = lit.size > 0 || !!activeKey;
  const activeCat = activeKey ? activeKey.split('-')[0] : null;

  const tracedCount = trace ? allTools.filter((t) => t.usedIn?.includes(trace)).length : 0;
  const bark = darkMode ? ['#5b4363', '#2b1d33'] : ['#a8713f', '#6b4122'];
  const crown = darkMode ? '#143d33' : '#9fe0b4';
  const shaking = shakeKey > 0;

  return (
    <div className="space-y-8">
      <div
        ref={boxRef}
        className="relative mx-auto w-full select-none"
        style={{
          maxWidth: layoutKey === 'wide' ? '73.75rem' : '32.5rem',
          aspectRatio: `${L.w} / ${L.h}`,
          '--fruit': `${(FRUIT / L.w) * 100}cqw`,
          containerType: 'inline-size',
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          setLean(0);
          setHover(null);
        }}
      >
        {/* ---- trunk, roots and branches: one static drawing ---- */}
        <svg
          viewBox={`0 0 ${L.w} ${L.h}`}
          className="absolute inset-0 w-full h-full"
          style={{
            clipPath: grown ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
            transition: reduced ? 'none' : `clip-path ${grown ? 1100 : 500}ms cubic-bezier(0.65,0,0.35,1)`,
          }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`sc-bark-${layoutKey}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={bark[1]} />
              <stop offset="45%" stopColor={bark[0]} />
              <stop offset="100%" stopColor={bark[1]} />
            </linearGradient>
            <radialGradient id={`sc-ground-${layoutKey}`} cx="50%" cy="0%" r="60%">
              <stop offset="0%" stopColor={darkMode ? '#00FFB3' : '#5fc285'} stopOpacity={darkMode ? 0.35 : 0.7} />
              <stop offset="100%" stopColor={darkMode ? '#00FFB3' : '#5fc285'} stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx={L.trunkX} cy={L.groundY + 10} rx={L.w * 0.32} ry="34" fill={`url(#sc-ground-${layoutKey})`} />
          {T.roots.map((d, i) => (
            <path key={i} d={d} stroke={bark[1]} strokeWidth={12 - i * 3} fill="none" strokeLinecap="round" />
          ))}
          {T.groups.map((g) => (
            <path key={g.id} d={g.branch} fill={`url(#sc-bark-${layoutKey})`} />
          ))}
          <path d={T.trunk} fill={`url(#sc-bark-${layoutKey})`} />
          {T.bark.map((d, i) => (
            <path key={i} d={d} stroke={bark[1]} strokeOpacity="0.6" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ))}
          <text
            x={L.trunkX}
            y={L.groundY - 140}
            textAnchor="middle"
            fontSize="13"
            fontWeight="900"
            letterSpacing="2"
            fill="#FFF6D8"
            opacity="0.65"
          >
            ♥ BF
          </text>
        </svg>

        {/* trunk hit area — click to shake */}
        <button
          onClick={shake}
          aria-label="Shake the tree"
          className="absolute rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
          style={{
            left: `${((L.trunkX - 40) / L.w) * 100}%`,
            top: `${((L.trunkTop + 40) / L.h) * 100}%`,
            width: `${(80 / L.w) * 100}%`,
            height: `${((L.groundY - L.trunkTop - 40) / L.h) * 100}%`,
            cursor: 'pointer',
          }}
        />

        {/* ---- crowns: each its own GPU layer (lean → grow → sway) ---- */}
        {T.groups.map((g, gi) => {
          const catDim = anyLit && !(activeCat === g.id || g.fruits.some((f) => lit.has(f.key)));
          return (
            <div
              key={g.id}
              ref={(el) => {
                leanRefs.current[g.id] = el;
              }}
              className="absolute"
              style={{
                left: `${(g.box.x / L.w) * 100}%`,
                top: `${(g.box.y / L.h) * 100}%`,
                width: `${(g.box.size / L.w) * 100}%`,
                height: `${(g.box.size / L.h) * 100}%`,
                transformOrigin: `${g.origin[0]}% ${g.origin[1]}%`,
                transition: 'transform 900ms cubic-bezier(0.22,1,0.36,1)',
                zIndex: activeCat === g.id ? 20 : 1,
                pointerEvents: 'none',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  transformOrigin: `${g.origin[0]}% ${g.origin[1]}%`,
                  transform: grown ? 'scale(1)' : 'scale(0)',
                  opacity: grown ? 1 : 0,
                  transition: reduced
                    ? 'none'
                    : `transform 650ms cubic-bezier(0.34,1.4,0.64,1) ${grown && !settled ? 650 + gi * 110 : 0}ms, opacity 400ms ease ${grown && !settled ? 650 + gi * 110 : 0}ms`,
                }}
              >
                <div
                  key={`sway-${shakeKey}`}
                  className="sc-anim absolute inset-0"
                  style={{
                    transformOrigin: `${g.origin[0]}% ${g.origin[1]}%`,
                    animation: reduced
                      ? 'none'
                      : shaking
                        ? `sc-shake 1s ease-out ${gi * 40}ms, sc-sway ${5 + gi * 0.7}s ease-in-out ${1 + gi * 0.04}s infinite`
                        : `sc-sway ${5 + gi * 0.7}s ease-in-out ${-gi * 0.9}s infinite`,
                    willChange: 'transform',
                  }}
                >
                  {/* foliage + twigs: a static picture, cropped to this crown */}
                  <svg
                    viewBox={`${g.box.x} ${g.box.y} ${g.box.size} ${g.box.size}`}
                    className="absolute inset-0 w-full h-full"
                    style={{ opacity: catDim ? 0.35 : 1, transition: 'opacity 250ms ease' }}
                    aria-hidden="true"
                  >
                    <defs>
                      <radialGradient id={`sc-leaf-${layoutKey}-${g.id}`} cx="40%" cy="35%" r="70%">
                        <stop offset="0%" stopColor={g.color} stopOpacity={darkMode ? 0.95 : 0.8} />
                        <stop offset="70%" stopColor={g.color} stopOpacity={darkMode ? 0.5 : 0.45} />
                        <stop offset="100%" stopColor={g.color} stopOpacity={darkMode ? 0.2 : 0.15} />
                      </radialGradient>
                    </defs>
                    {g.blobs.map(([x, y, r], i) => (
                      <circle key={`u${i}`} cx={x} cy={y} r={r * 1.06} fill={crown} />
                    ))}
                    {g.blobs.map(([x, y, r], i) => (
                      <circle key={i} cx={x} cy={y} r={r} fill={`url(#sc-leaf-${layoutKey}-${g.id})`} />
                    ))}
                    {g.leaves.map((lf, i) => (
                      <path
                        key={`l${i}`}
                        d={LEAF_PATH}
                        transform={`translate(${lf.x.toFixed(1)},${lf.y.toFixed(1)}) rotate(${lf.r.toFixed(0)}) scale(${lf.s.toFixed(2)})`}
                        fill={g.color}
                        opacity="0.55"
                      />
                    ))}
                    {g.fruits.map((f) => (
                      <path key={f.key} d={f.twig} stroke={bark[0]} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
                    ))}
                  </svg>

                  <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
                    {g.fruits.map((f) => (
                      <Fruit
                        key={f.key}
                        fruit={f}
                        grown={grown}
                        delay={settled ? 0 : 1050 + gi * 110 + f.j * 45}
                        active={hover === f.key}
                        lit={lit.has(f.key)}
                        dim={anyLit && !(lit.has(f.key) || activeKey === f.key)}
                        pinned={pinned?.key === f.key}
                        showName={showNames}
                        onEnter={() => setHover(f.key)}
                        onLeave={() => setHover((h) => (h === f.key ? null : h))}
                        onPick={() => setPinned((p) => (p?.key === f.key ? null : f))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ---- fireflies (night only) ---- */}
        {darkMode &&
          !reduced &&
          FIREFLIES.map((f, i) => (
            <span
              key={i}
              className="sc-anim pointer-events-none absolute"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                '--fx': `${f.fx}px`,
                '--fy': `${f.fy}px`,
                animation: `sc-ff ${f.t}s ease-in-out -${f.d}s infinite alternate`,
                willChange: 'transform',
              }}
            >
              <span
                className="sc-anim block w-1.5 h-1.5 rounded-full"
                style={{
                  background: '#F3FF9C',
                  boxShadow: '0 0 10px 3px rgba(232,255,122,0.7)',
                  animation: `sc-blink ${1.6 + (i % 4) * 0.5}s ease-in-out ${f.d}s infinite`,
                }}
              />
            </span>
          ))}

        <LeafFall ref={leafRef} reduced={reduced} />
      </div>

      {/* ---- controls: plain rows, no boxes ---- */}
      <div className="flex flex-col items-center gap-5 text-center">
        <p className="sc-ink font-mono text-[0.625rem] sm:text-[0.6875rem] uppercase tracking-[0.25em] opacity-60">
          {trace
            ? `${trace} grew from ${pad2(tracedCount)} ${tracedCount === 1 ? 'fruit' : 'fruits'}`
            : 'Hover a fruit · move your cursor to blow wind · tap the trunk to shake it'}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Pill onClick={shake} label="Shake the tree">
            <Wind size={13} /> Shake
          </Pill>
          <Pill onClick={replant} label="Replant the tree">
            <Sprout size={13} /> Replant
          </Pill>
          <Pill on={showNames} onClick={() => setShowNames((v) => !v)} label="Show every name">
            <Tag size={13} /> Names
          </Pill>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-2">
          <span className="sc-acc flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-[0.25em] mr-1">
            <Route size={12} /> Trace
          </span>
          {PROJECTS.map((proj) => (
            <Pill
              key={proj}
              on={trace === proj}
              onClick={() => {
                setHover(null);
                setPinned(null);
                setFocusCat(null);
                setTrace((t) => (t === proj ? null : proj));
              }}
            >
              {proj}
            </Pill>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {DRAW_ORDER.map((id) => stackCategories.find((c) => c.id === id))
            .sort((a, b) => b.items.length - a.items.length)
            .map((c) => (
              <Pill
                key={c.id}
                on={focusCat === c.id}
                color={c.color}
                onClick={() => {
                  setHover(null);
                  setPinned(null);
                  setTrace(null);
                  setFocusCat((f) => (f === c.id ? null : c.id));
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: focusCat === c.id ? '#FFFFFF' : c.color }} />
                {c.title}
                <span className="sc-tc font-mono opacity-60">{pad2(c.items.length)}</span>
              </Pill>
            ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// WORKFLOW — methodologies as one connected pipeline
// ============================================================================

const Workflow = ({ reduced }) => (
  <div className="relative">
    <div className="hidden md:block absolute left-[10%] right-[10%] top-8 h-px bg-[color:var(--acc-line)]" />
    {!reduced && (
      <motion.span
        className="hidden md:block absolute top-8 -mt-[0.1875rem] w-1.5 h-1.5 rounded-full bg-[color:var(--acc)] shadow-[0_0_12px_var(--acc)]"
        initial={{ left: '10%' }}
        animate={{ left: ['10%', '90%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
      />
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 sm:gap-5">
      {methodologies.map((m, i) => (
        <motion.div
          key={m.name}
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.08 }}
          className="group relative flex flex-col items-center text-center gap-3"
        >
          <span className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center bg-[color:var(--surface-strong)] border-2 border-[color:var(--acc-line)] text-[color:var(--acc)] backdrop-blur-md transition-all duration-500 group-hover:border-[color:var(--acc)] group-hover:shadow-[0_0_30px_var(--acc-glow)] group-hover:rotate-[360deg]">
            <m.Icon size={22} />
          </span>
          <span className="sc-ink font-mono text-[0.625rem] opacity-50">{pad2(i + 1)}</span>
          <p className="sc-acc text-xs font-black uppercase tracking-[0.2em]">{m.name}</p>
          <p className="sc-ink text-xs opacity-60 leading-relaxed max-w-[12.5rem]">{m.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);


// ============================================================================
// MAIN
// ============================================================================

function Stacks({ darkMode = true }) {
  const reduced = useReducedMotion();
  const vars = useMemo(() => cssVars(getPalette(darkMode)), [darkMode]);

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    <div className="sc-scope space-y-16 sm:space-y-20 pt-6 sm:pt-10" style={vars}>
      <StackStyles />

      <header className="relative space-y-5 sm:space-y-6">
        <HandStyles />
        <div className="hidden lg:block absolute right-2 top-0 w-60">
          <StickyNote title="care guide:" rot={3} bg="#D4FFC2">
            water daily with commits 🌱
            <br />
            prune bugs weekly ✂️
          </StickyNote>
        </div>
        <motion.p {...reveal(0)} className="sc-acc font-mono text-[0.6875rem] uppercase tracking-[0.4em]">
          ~/stack
        </motion.p>
        <motion.h2 {...reveal(0.08)} className="sc-ink text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.95]">
          The Tech{' '}
          <span className="relative inline-block">
            <span className="sc-acc">Tree.</span>
            <Doodle type="underline" className="absolute left-0 -bottom-2 w-full h-3 sm:h-4" strokeWidth={4} delay={0.6} />
          </span>
        </motion.h2>
        <HandNote className="text-2xl sm:text-3xl" rot={-2} delay={0.8}>
          (yes, every fruit is a real tool I use)
        </HandNote>
        <motion.p {...reveal(0.16)} className="sc-ink text-sm sm:text-lg opacity-70 max-w-2xl leading-relaxed">
          {TOOL_COUNT} tools grown from one root — six branches of frontend, backend, mobile, design, AI and
          shipping. Every fruit is something I actually build with.
        </motion.p>
      </header>

      <section className="space-y-6">
        <SectionEyebrow label="Grown, not installed" icon={<TreeDeciduous size={16} />} />
        <div className="flex items-start justify-center sm:justify-end gap-1 -mb-2 sm:pr-[12%]">
          <HandNote className="text-2xl sm:text-3xl" rot={4}>
            go on, give it a shake!
          </HandNote>
          <Doodle type="arrowDown" className="w-7 h-10 mt-4" delay={0.4} />
        </div>
        <TechTree darkMode={darkMode} reduced={reduced} />
      </section>

      <section className="space-y-10">
        <SectionEyebrow label="How I Work" icon={<WorkflowIcon size={16} />} />
        <HandNote className="text-2xl -mt-6" rot={-2}>
          (the boring-but-important part)
        </HandNote>
        <Workflow reduced={reduced} />
      </section>
    </div>
  );
}

export default Stacks;

// shared with the chat assistant
export { stackCategories };
