import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

// ============================================================================
// STACKS.JSX — "The Tech Tree"
// The toolkit as an illustrated, living tree: each category is a leafy crown
// on its own branch and every tool is a fruit hanging from it. The cursor is
// the wind, the trunk shakes leaves loose, and the sign replants the tree.
// Night (dark mode) brings the moon and fireflies; day brings sun and clouds.
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
      { name: 'Vercel', logo: SIMPLE('vercel', '000000'), usedIn: ['TIDE', 'Poopipoo', 'Neo Chess XD'] },
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
      { name: 'React', logo: DEVICON('react'), usedIn: ['Poopipoo', 'Neo Chess XD', PORTFOLIO] },
      { name: 'Next.js', logo: SIMPLE('nextdotjs', '000000'), usedIn: ['Poopipoo'] },
      { name: 'TypeScript', logo: DEVICON('typescript') },
      { name: 'JavaScript', logo: DEVICON('javascript'), usedIn: ['Neo Chess XD', PORTFOLIO] },
      { name: 'Vite', logo: DEVICON('vitejs'), usedIn: ['Neo Chess XD', PORTFOLIO] },
      { name: 'Tailwind', logo: DEVICON('tailwindcss'), usedIn: ['SweepXpress', PORTFOLIO] },
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
// Groups are drawn in DRAW_ORDER so the mobile cluster sits in front of the
// frontend branch that passes behind it.
// ============================================================================

const DRAW_ORDER = ['ai', 'design', 'backend', 'ship', 'frontend', 'mobile'];
const FRUIT = 44;

const LAYOUTS = {
  wide: {
    w: 1200,
    h: 830,
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
    sign: [790, 738],
    sun: [1110, 88],
    moon: [92, 88],
  },
  tall: {
    w: 600,
    h: 1110,
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
    sign: [452, 1018],
    sun: [540, 62],
    moon: [62, 62],
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
const taperedPath = (p0, p1, p2, p3, w0, w1, steps = 28) => {
  const left = [];
  const right = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = cubic(p0, p1, p2, p3, t);
    const q = cubic(p0, p1, p2, p3, Math.min(1, t + 0.01));
    const r = cubic(p0, p1, p2, p3, Math.max(0, t - 0.01));
    const dx = q[0] - r[0];
    const dy = q[1] - r[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
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
    const thick = id === 'frontend' ? 30 : 24;
    const n = category.items.length;
    const rand = seeded(id.length * 97 + n * 13);

    const fruits = category.items.map((tool, j) => {
      const rr = R * 0.74 * Math.sqrt((j + 0.6) / n);
      const th = j * 2.39996 + id.length;
      const x = cx + Math.cos(th) * rr;
      const y = cy + Math.sin(th) * rr * 0.92;
      const mx = (end[0] + x) / 2;
      const my = (end[1] + y) / 2;
      const bend = (j % 2 ? 1 : -1) * 14;
      const dx = x - end[0];
      const dy = y - end[1];
      const dl = Math.hypot(dx, dy) || 1;
      return {
        ...tool,
        key: `${id}-${j}`,
        j,
        category,
        x,
        y,
        twig: `M${end[0].toFixed(1)},${end[1].toFixed(1)} Q${(mx - (dy / dl) * bend).toFixed(1)},${(my + (dx / dl) * bend).toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`,
      };
    });

    const blobs = [[cx, cy, R * 0.66]];
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + 0.3;
      blobs.push([cx + Math.cos(a) * R * 0.48, cy + Math.sin(a) * R * 0.42, R * (0.46 + rand() * 0.12)]);
    }
    const leaves = Array.from({ length: 16 }, () => {
      const a = rand() * Math.PI * 2;
      const d = R * (0.35 + rand() * 0.6);
      return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.9, r: rand() * 360, s: 0.8 + rand() * 0.8 };
    });

    return {
      id,
      category,
      color: category.color,
      cx,
      cy,
      R,
      base: [bx, by],
      end,
      branch: taperedPath([bx, by], p1, p2, end, thick, 7),
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
    `M${x - 10},${gy} C${x - 20},${gy + 14} ${x - 40},${gy + 22} ${x - 60},${gy + 30}`,
  ];
  const bark = [
    `M${x - 14},${gy - 30} C${x - 20},${gy - 120} ${x - 8},${ty + 150} ${x - 12},${ty + 60}`,
    `M${x + 12},${gy - 50} C${x + 18},${gy - 140} ${x + 6},${ty + 170} ${x + 10},${ty + 80}`,
    `M${x - 2},${gy - 80} C${x + 4},${gy - 150} ${x - 4},${ty + 200} ${x},${ty + 130}`,
  ];

  return { groups, trunk, roots, bark };
};

const TREES = { wide: buildTree(LAYOUTS.wide), tall: buildTree(LAYOUTS.tall) };
const allTools = TREES.wide.groups.flatMap((g) => g.fruits);
const TOOL_COUNT = allTools.length;
const PROJECTS = ['TIDE', 'Poopipoo', 'Neo Chess XD', 'SweepXpress', PORTFOLIO];
const pad2 = (n) => String(n).padStart(2, '0');
const LEAF_PATH = 'M0,-7 C5,-5 6,3 0,8 C-6,3 -5,-5 0,-7 Z';

// ============================================================================
// STYLES — scoped colour classes beat the global `.light/.dark h1..span`
// `!important` overrides in index.css; keyframes drive the ambient scenery.
// ============================================================================

const StackStyles = () => (
  <style>{`
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-acc { color: var(--acc) !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-ink { color: var(--ink) !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-dark { color: #1B1B2A !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-cat { color: var(--c) !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-tc { color: var(--tc) !important; }
    .sc-tree .grow { transform-box: view-box; transition: transform 800ms cubic-bezier(0.34,1.4,0.64,1), opacity 500ms ease; }
    .sc-tree .fruit-pop { transform-box: fill-box; transform-origin: center; transition: transform 380ms cubic-bezier(0.34,1.56,0.64,1), opacity 250ms ease; }
    @keyframes sc-fall {
      0% { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
      8% { opacity: 1; }
      85% { opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; }
    }
    @keyframes sc-flutter { 0%, 100% { transform: rotate(-35deg) scaleX(1); } 50% { transform: rotate(35deg) scaleX(0.6); } }
    @keyframes sc-ff { 0% { transform: translate(0px, 0px); } 100% { transform: translate(var(--fx), var(--fy)); } }
    @keyframes sc-blink { 0%, 100% { opacity: 0.15; } 50% { opacity: 1; } }
    @keyframes sc-cloud { 0% { transform: translateX(-260px); } 100% { transform: translateX(var(--cw)); } }
    @keyframes sc-spin { to { transform: rotate(360deg); } }
    @keyframes sc-ping { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.9); opacity: 0; } }
    @keyframes sc-burst { 0% { transform: translate(0px, 0px) scale(1); opacity: 1; } 100% { transform: translate(var(--bx), var(--by)) scale(0.2); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .sc-anim { animation: none !important; } }
  `}</style>
);

// ============================================================================
// SHARED PIECES
// ============================================================================

const SectionEyebrow = ({ label, icon }) => (
  <div className="flex items-center gap-4 sm:gap-6">
    <h3 className="sc-acc text-[10px] sm:text-[11px] md:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] whitespace-nowrap">
      {label}
    </h3>
    <div className="h-px flex-1 bg-[color:var(--acc-line)]" />
    <span className="sc-acc shrink-0">{icon}</span>
  </div>
);

const ToolLogo = ({ tool }) => {
  const [failed, setFailed] = useState(!tool.logo);
  if (failed) {
    return <span className="sc-dark font-black leading-none tracking-tight text-[10px]">{tool.glyph ?? tool.name.slice(0, 2)}</span>;
  }
  return (
    <img
      src={tool.logo}
      alt=""
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className="w-full h-full object-contain pointer-events-none"
    />
  );
};

const PanelButton = ({ onClick, on, children, label }) => (
  <button
    onClick={onClick}
    aria-pressed={on}
    title={label}
    className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-[10px] font-black uppercase tracking-[0.18em] transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)] ${
      on ? 'bg-[color:var(--acc)] border-[color:var(--acc)]' : 'border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--acc-line)]'
    }`}
  >
    <span className="sc-tc flex items-center gap-2" style={{ '--tc': on ? 'var(--acc-ink)' : 'var(--ink)' }}>
      {children}
    </span>
  </button>
);

// ============================================================================
// THE TREE SCENE
// ============================================================================

const FruitNode = ({ fruit, grown, delay, lit, dim, pinned, darkMode, onEnter, onLeave, onPick }) => {
  const s = FRUIT;
  const big = lit || pinned;
  return (
    <g
      transform={`translate(${fruit.x.toFixed(1)},${fruit.y.toFixed(1)})`}
      role="button"
      tabIndex={0}
      aria-label={`${fruit.name} — ${fruit.category.title}`}
      aria-pressed={pinned}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={(e) => {
        e.stopPropagation();
        onPick();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPick();
        }
      }}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <g
        className="fruit-pop"
        style={{
          transform: grown ? `scale(${big ? 1.32 : 1})` : 'scale(0)',
          opacity: dim ? 0.3 : 1,
          transitionDelay: grown && delay ? `${delay}ms` : '0ms',
        }}
      >
        {pinned && (
          <circle
            className="sc-anim"
            r={s / 2 + 4}
            fill="none"
            stroke={fruit.category.color}
            strokeWidth="2.5"
            style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'sc-ping 1.6s ease-out infinite' }}
          />
        )}
        <circle r={s / 2 + 5} fill={fruit.category.color} opacity={big ? 0.55 : 0.22} filter={big ? 'url(#sc-soft)' : undefined} />
        <circle r={s / 2} fill="#FFFFFF" stroke={fruit.category.color} strokeWidth={big ? 3.5 : 2.5} />
        <ellipse cx={-s * 0.16} cy={-s * 0.2} rx={s * 0.14} ry={s * 0.08} fill="#FFFFFF" opacity="0.9" />
        {/* SVG <image> has no reliable error event in React, so a tool without a logo
            URL (NativeWind) renders its glyph instead; every CDN logo was checked */}
        {!fruit.logo ? (
          <text textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="900" fill="#1B1B2A">
            {fruit.glyph ?? fruit.name.slice(0, 2)}
          </text>
        ) : (
          <image
            href={fruit.logo}
            x={-s * 0.3}
            y={-s * 0.3}
            width={s * 0.6}
            height={s * 0.6}
            preserveAspectRatio="xMidYMid meet"
          />
        )}
        {/* stem nub so it reads as fruit hanging from the twig */}
        <path d={`M0,${-s / 2} q2,-6 7,-8`} stroke={darkMode ? '#7DFFE0' : '#3E8E5A'} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

// Labels live in their own layer above every fruit in the branch, so a
// neighbouring fruit never covers a name.
const FruitLabel = ({ fruit, big, darkMode }) => {
  const w = Math.max(44, fruit.name.length * (big ? 7 : 6) + 16);
  const h = big ? 20 : 16;
  return (
    <g transform={`translate(${fruit.x.toFixed(1)},${(fruit.y + FRUIT / 2 + (big ? 20 : 11)).toFixed(1)})`} style={{ pointerEvents: 'none' }}>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={h / 2}
        fill={big ? fruit.category.color : darkMode ? 'rgba(11,11,22,0.88)' : 'rgba(255,255,255,0.94)'}
        stroke={big ? 'none' : fruit.category.color}
        strokeOpacity="0.6"
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={big ? 12 : 10}
        fontWeight="900"
        letterSpacing="0.4"
        fill={big || darkMode ? '#FFFFFF' : '#1B1B2A'}
      >
        {fruit.name}
      </text>
    </g>
  );
};

const TreeScene = ({ darkMode, reduced, layoutKey, grown, settled, lit, pinned, showLabels, leaves, sparks, onHover, onPick, onPickCat, onShake, onReplant, onWind, groupRefs, trunkRef }) => {
  const L = LAYOUTS[layoutKey];
  const T = TREES[layoutKey];
  const ids = `sc-${layoutKey}`;

  const sky = darkMode
    ? ['#06061a', '#140b33', '#2a0f3f']
    : ['#bfe8ff', '#ffe3f1', '#fff4cf'];
  const barkA = darkMode ? '#5b4363' : '#a8713f';
  const barkB = darkMode ? '#2b1d33' : '#6b4122';
  const crown = darkMode ? '#123b33' : '#86d9a4';
  const groundA = darkMode ? '#17123a' : '#9fe3b2';
  const groundB = darkMode ? '#0b0a1d' : '#5fc285';

  const stars = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: 55 }, () => ({ x: r() * L.w, y: r() * (L.groundY - 120), s: 0.6 + r() * 1.4, d: r() * 4, t: 2 + r() * 3 }));
  }, [L]);
  const fireflies = useMemo(() => {
    const r = seeded(29);
    return Array.from({ length: 24 }, () => ({
      x: L.w * 0.08 + r() * L.w * 0.84,
      y: L.h * 0.1 + r() * (L.groundY - L.h * 0.15),
      fx: (r() - 0.5) * 120,
      fy: (r() - 0.5) * 90,
      t: 4 + r() * 5,
      d: r() * 4,
    }));
  }, [L]);

  const g = (delay) => ({
    transitionDelay: grown && !settled ? `${delay}ms` : '0ms',
  });

  return (
    <svg
      viewBox={`0 0 ${L.w} ${L.h}`}
      className="sc-tree block w-full h-auto select-none"
      onPointerMove={onWind}
      role="img"
      aria-label="Tech stack drawn as a tree — each fruit is a tool"
    >
      <defs>
        <linearGradient id={`${ids}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky[0]} />
          <stop offset="60%" stopColor={sky[1]} />
          <stop offset="100%" stopColor={sky[2]} />
        </linearGradient>
        <linearGradient id={`${ids}-bark`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={barkB} />
          <stop offset="45%" stopColor={barkA} />
          <stop offset="100%" stopColor={barkB} />
        </linearGradient>
        <linearGradient id={`${ids}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={groundA} />
          <stop offset="100%" stopColor={groundB} />
        </linearGradient>
        {T.groups.map((grp) => (
          <radialGradient key={grp.id} id={`${ids}-leaf-${grp.id}`} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor={grp.color} stopOpacity={darkMode ? 0.95 : 0.75} />
            <stop offset="70%" stopColor={grp.color} stopOpacity={darkMode ? 0.45 : 0.4} />
            <stop offset="100%" stopColor={grp.color} stopOpacity={darkMode ? 0.15 : 0.12} />
          </radialGradient>
        ))}
        <filter id="sc-soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`${ids}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={darkMode ? 14 : 8} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ---- sky ---- */}
      <rect width={L.w} height={L.h} fill={`url(#${ids}-sky)`} />
      {darkMode ? (
        <>
          {stars.map((s, i) => (
            <circle
              key={i}
              className="sc-anim"
              cx={s.x}
              cy={s.y}
              r={s.s}
              fill="#FFFFFF"
              style={{ animation: `sc-blink ${s.t}s ease-in-out ${s.d}s infinite` }}
            />
          ))}
          <g transform={`translate(${L.moon[0]},${L.moon[1]})`}>
            <circle r="56" fill="#FFF6D8" opacity="0.08" />
            <circle r="34" fill="#FFF6D8" />
            <circle cx="-10" cy="-6" r="7" fill="#E8DDB8" />
            <circle cx="9" cy="10" r="5" fill="#E8DDB8" />
            <circle cx="12" cy="-12" r="3.5" fill="#E8DDB8" />
          </g>
        </>
      ) : (
        <>
          <g transform={`translate(${L.sun[0]},${L.sun[1]})`}>
            <g className="sc-anim" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'sc-spin 40s linear infinite' }}>
              {Array.from({ length: 12 }, (_, i) => (
                <rect key={i} x="-3" y="-78" width="6" height="22" rx="3" fill="#FFB547" opacity="0.7" transform={`rotate(${i * 30})`} />
              ))}
            </g>
            <circle r="44" fill="#FFD36E" />
            <circle r="44" fill="#FFB547" opacity="0.35" filter="url(#sc-soft)" />
          </g>
          {[0, 1].map((i) => (
            <g
              key={i}
              className="sc-anim"
              style={{ '--cw': `${L.w + 260}px`, animation: `sc-cloud ${70 + i * 30}s linear ${-i * 35}s infinite` }}
            >
              <g transform={`translate(0,${90 + i * 120}) scale(${1 - i * 0.25})`} fill="#FFFFFF" opacity="0.85">
                <ellipse cx="60" cy="20" rx="60" ry="22" />
                <ellipse cx="105" cy="8" rx="42" ry="28" />
                <ellipse cx="145" cy="22" rx="46" ry="20" />
              </g>
            </g>
          ))}
        </>
      )}

      {/* ---- ground ---- */}
      <path
        d={`M0,${L.groundY + 10} Q${L.w * 0.25},${L.groundY - 24} ${L.w / 2},${L.groundY - 6} T${L.w},${L.groundY + 6} V${L.h} H0 Z`}
        fill={`url(#${ids}-ground)`}
      />
      <path
        d={`M0,${L.groundY + 10} Q${L.w * 0.25},${L.groundY - 24} ${L.w / 2},${L.groundY - 6} T${L.w},${L.groundY + 6}`}
        fill="none"
        stroke={darkMode ? 'rgba(0,255,179,0.45)' : 'rgba(62,142,90,0.6)'}
        strokeWidth="2"
      />
      {Array.from({ length: Math.round(L.w / 26) }, (_, i) => {
        const x = 10 + i * 26;
        const y = L.groundY + 2 + Math.sin(i) * 6;
        return (
          <path
            key={i}
            d={`M${x},${y} q-3,-9 -6,-14 M${x},${y} q1,-11 2,-17 M${x},${y} q4,-8 8,-12`}
            stroke={darkMode ? 'rgba(0,255,179,0.35)' : '#4FA86E'}
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        );
      })}

      {/* ---- sign ---- */}
      <g
        transform={`translate(${L.sign[0]},${L.sign[1]})`}
        role="button"
        tabIndex={0}
        aria-label="Replant the tree"
        onClick={onReplant}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onReplant();
          }
        }}
        style={{ cursor: 'pointer', outline: 'none' }}
      >
        <rect x="-4" y="0" width="8" height="40" fill={barkB} />
        <rect x="-92" y="-38" width="184" height="44" rx="6" fill={barkA} stroke={barkB} strokeWidth="3" />
        <text textAnchor="middle" y="-20" fontSize="13" fontWeight="900" letterSpacing="1.5" fill="#FFF6D8">
          BRIAN&apos;S STACK
        </text>
        <text textAnchor="middle" y="-4" fontSize="10" fontWeight="700" letterSpacing="2" fill="#FFF6D8" opacity="0.8">
          {TOOL_COUNT} TOOLS · REPLANT ↻
        </text>
      </g>

      {/* ---- the tree (trunk sway group holds every branch) ---- */}
      <g ref={trunkRef}>
        <g
          className="grow"
          style={{
            transformOrigin: `${L.trunkX}px ${L.groundY}px`,
            transform: grown ? 'scale(1)' : 'scale(0.15, 0)',
            ...g(0),
          }}
        >
          {T.roots.map((d, i) => (
            <path key={i} d={d} stroke={`url(#${ids}-bark)`} strokeWidth={14 - i * 3} fill="none" strokeLinecap="round" />
          ))}
          <path
            d={T.trunk}
            fill={`url(#${ids}-bark)`}
            stroke={darkMode ? 'rgba(0,255,179,0.25)' : 'rgba(0,0,0,0.12)'}
            strokeWidth="1.5"
            onClick={onShake}
            style={{ cursor: 'pointer' }}
          />
          {T.bark.map((d, i) => (
            <path key={i} d={d} stroke={barkB} strokeOpacity="0.55" strokeWidth="2.2" fill="none" strokeLinecap="round" style={{ pointerEvents: 'none' }} />
          ))}
          <g transform={`translate(${L.trunkX},${L.groundY - 150})`} style={{ pointerEvents: 'none' }}>
            <path d="M0,10 C-14,-2 -12,-16 0,-9 C12,-16 14,-2 0,10 Z" fill="none" stroke="#FFF6D8" strokeOpacity="0.55" strokeWidth="2" />
            <text textAnchor="middle" y="30" fontSize="12" fontWeight="900" letterSpacing="2" fill="#FFF6D8" opacity="0.6">
              BF
            </text>
          </g>
        </g>

        {T.groups.map((grp, gi) => {
          const catLit = lit.cats.has(grp.id);
          const catDim = lit.any && !catLit;
          return (
            <g
              key={grp.id}
              ref={(el) => {
                groupRefs.current[grp.id] = el;
              }}
            >
              {/* branch */}
              <g
                className="grow"
                style={{
                  transformOrigin: `${grp.base[0]}px ${grp.base[1]}px`,
                  transform: grown ? 'scale(1)' : 'scale(0)',
                  ...g(550 + gi * 110),
                }}
              >
                <path d={grp.branch} fill={`url(#${ids}-bark)`} />
              </g>

              {/* crown */}
              <g
                className="grow"
                onClick={(e) => {
                  e.stopPropagation();
                  onPickCat(grp.id);
                }}
                onPointerEnter={() => onHover({ type: 'cat', id: grp.id })}
                onPointerLeave={() => onHover(null)}
                style={{
                  cursor: 'pointer',
                  transformOrigin: `${grp.cx}px ${grp.cy}px`,
                  transform: grown ? 'scale(1)' : 'scale(0)',
                  opacity: catDim ? 0.35 : 1,
                  ...g(1000 + gi * 120),
                }}
              >
                {grp.blobs.map(([x, y, r], i) => (
                  <circle key={`u${i}`} cx={x} cy={y} r={r * 1.08} fill={crown} />
                ))}
                <g filter={catLit || darkMode ? `url(#${ids}-glow)` : undefined}>
                  {grp.blobs.map(([x, y, r], i) => (
                    <circle key={i} cx={x} cy={y} r={r} fill={`url(#${ids}-leaf-${grp.id})`} />
                  ))}
                </g>
                {grp.leaves.map((lf, i) => (
                  <path
                    key={`l${i}`}
                    d={LEAF_PATH}
                    transform={`translate(${lf.x.toFixed(1)},${lf.y.toFixed(1)}) rotate(${lf.r.toFixed(0)}) scale(${lf.s.toFixed(2)})`}
                    fill={grp.color}
                    opacity={darkMode ? 0.55 : 0.5}
                  />
                ))}
                {catLit && (
                  <circle
                    cx={grp.cx}
                    cy={grp.cy}
                    r={grp.R * 1.02}
                    fill="none"
                    stroke={grp.color}
                    strokeWidth="2.5"
                    strokeDasharray="6 8"
                    className="sc-anim"
                    style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'sc-spin 18s linear infinite' }}
                  />
                )}
              </g>

              {/* twigs */}
              <g
                style={{
                  opacity: grown ? (catDim ? 0.25 : 1) : 0,
                  transition: 'opacity 500ms ease',
                  transitionDelay: grown && !settled ? `${1350 + gi * 120}ms` : '0ms',
                  pointerEvents: 'none',
                }}
              >
                {grp.fruits.map((f) => (
                  <path
                    key={f.key}
                    d={f.twig}
                    stroke={lit.tools.has(f.key) ? grp.color : barkA}
                    strokeWidth={lit.tools.has(f.key) ? 4 : 3}
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                ))}
              </g>

              {/* fruits */}
              {grp.fruits.map((f) => (
                <FruitNode
                  key={f.key}
                  fruit={f}
                  grown={grown}
                  delay={settled ? 0 : 1500 + gi * 120 + f.j * 60}
                  lit={lit.tools.has(f.key)}
                  dim={lit.any && !lit.tools.has(f.key)}
                  pinned={pinned?.type === 'tool' && pinned.tool.key === f.key}
                  darkMode={darkMode}
                  onEnter={() => onHover({ type: 'tool', tool: f })}
                  onLeave={() => onHover(null)}
                  onPick={() => onPick(f)}
                />
              ))}

              {/* labels: hovered / pinned fruits always; with "Labels" on, every
                  fruit — or only the lit ones while something is highlighted */}
              {grown &&
                grp.fruits.map((f) => {
                  const isLit = lit.tools.has(f.key);
                  const isPinned = pinned?.type === 'tool' && pinned.tool.key === f.key;
                  const big = (isLit && lit.tools.size === 1) || isPinned;
                  const show = big || (showLabels && (!lit.any || isLit)) || (isLit && lit.tools.size <= 12);
                  return show ? <FruitLabel key={`lb-${f.key}`} fruit={f} big={big} darkMode={darkMode} /> : null;
                })}
            </g>
          );
        })}
      </g>

      {/* ---- falling leaves ---- */}
      {leaves.map((lf) => (
        <g key={lf.id} transform={`translate(${lf.x.toFixed(1)},${lf.y.toFixed(1)})`} style={{ pointerEvents: 'none' }}>
          <g
            style={{
              '--dx': `${lf.dx}px`,
              '--dy': `${lf.dy}px`,
              '--rot': `${lf.rot}deg`,
              animation: `sc-fall ${lf.dur}s cubic-bezier(0.45,0.05,0.55,0.95) forwards`,
            }}
          >
            <path
              d={LEAF_PATH}
              fill={lf.color}
              style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `sc-flutter ${0.9 + (lf.id % 5) * 0.15}s ease-in-out infinite` }}
            />
          </g>
        </g>
      ))}

      {/* ---- pick sparkles ---- */}
      {sparks.map((sp) => (
        <g key={sp.id} transform={`translate(${sp.x.toFixed(1)},${sp.y.toFixed(1)})`} style={{ pointerEvents: 'none' }}>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return (
              <circle
                key={i}
                r="4"
                fill={i % 2 ? sp.color : '#FFFFFF'}
                style={{
                  '--bx': `${Math.cos(a) * 46}px`,
                  '--by': `${Math.sin(a) * 46}px`,
                  animation: 'sc-burst 700ms ease-out forwards',
                }}
              />
            );
          })}
        </g>
      ))}

      {/* ---- fireflies (night only) ---- */}
      {darkMode &&
        !reduced &&
        fireflies.map((f, i) => (
          <g key={i} transform={`translate(${f.x.toFixed(0)},${f.y.toFixed(0)})`} style={{ pointerEvents: 'none' }}>
            <g style={{ '--fx': `${f.fx}px`, '--fy': `${f.fy}px`, animation: `sc-ff ${f.t}s ease-in-out ${-f.d}s infinite alternate` }}>
              <circle
                r="7"
                fill="#E8FF7A"
                opacity="0.35"
                filter="url(#sc-soft)"
                style={{ animation: `sc-blink ${1.5 + (i % 4) * 0.5}s ease-in-out ${f.d}s infinite` }}
              />
              <circle r="2.2" fill="#F6FFB8" style={{ animation: `sc-blink ${1.5 + (i % 4) * 0.5}s ease-in-out ${f.d}s infinite` }} />
            </g>
          </g>
        ))}
    </svg>
  );
};

// ============================================================================
// TECH TREE — state, wind physics and the side panel
// ============================================================================

let leafSeq = 0;

const TechTree = ({ darkMode, reduced }) => {
  const wrapRef = useRef(null);
  const trunkRef = useRef(null);
  const groupRefs = useRef({});
  const windRef = useRef({ lean: 0, leanTarget: 0, amp: 0.8, lastX: null, lastT: 0, lastSpawn: 0 });

  const [layoutKey, setLayoutKey] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 720 ? 'tall' : 'wide'
  );
  const [grown, setGrown] = useState(false);
  const [settled, setSettled] = useState(false);
  const [plantKey, setPlantKey] = useState(0);
  const [hover, setHover] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [trace, setTrace] = useState(null);
  const [showLabels, setShowLabels] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [sparks, setSparks] = useState([]);

  const inView = useInView(wrapRef, { once: true, margin: '-100px' });
  const L = LAYOUTS[layoutKey];
  const T = TREES[layoutKey];

  // pick the wide or tall tree from the container's own width
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => {
      setLayoutKey(entry.contentRect.width < 680 ? 'tall' : 'wide');
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // grow on first view, and again on every replant
  useEffect(() => {
    if (!inView) return undefined;
    if (reduced) {
      setGrown(true);
      setSettled(true);
      return undefined;
    }
    setGrown(false);
    setSettled(false);
    // on a replant, let the old tree sink back into the ground first
    const wait = plantKey > 0 ? 750 : 80;
    const t1 = setTimeout(() => setGrown(true), wait);
    const t2 = setTimeout(() => setSettled(true), wait + 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [inView, reduced, plantKey]);

  const spawnLeaves = useCallback(
    (count, spread = 1) => {
      if (reduced) return;
      const r = Math.random;
      const fresh = Array.from({ length: count }, () => {
        const grp = T.groups[Math.floor(r() * T.groups.length)];
        const a = r() * Math.PI * 2;
        const d = grp.R * (0.2 + r() * 0.8);
        const x = grp.cx + Math.cos(a) * d;
        const y = grp.cy + Math.sin(a) * d * 0.8;
        return {
          id: ++leafSeq,
          x,
          y,
          color: grp.color,
          dx: Math.round((r() - 0.3) * 160 * spread - windRef.current.lean * 30),
          dy: Math.round(L.groundY - y + r() * 18),
          rot: Math.round((r() - 0.5) * 720),
          dur: +(3.2 + r() * 2.6).toFixed(2),
        };
      });
      setLeaves((prev) => [...prev.slice(-60), ...fresh]);
      const longest = Math.max(...fresh.map((l) => l.dur));
      const ids = new Set(fresh.map((l) => l.id));
      setTimeout(() => setLeaves((prev) => prev.filter((l) => !ids.has(l.id))), longest * 1000 + 200);
    },
    [reduced, T, L.groundY]
  );

  // ambient leaf fall
  useEffect(() => {
    if (reduced || !grown) return undefined;
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') spawnLeaves(1);
    }, 1600);
    return () => clearInterval(t);
  }, [reduced, grown, spawnLeaves]);

  // wind + sway loop — writes SVG transform attributes directly each frame
  const spawnRef = useRef(spawnLeaves);
  spawnRef.current = spawnLeaves;
  useEffect(() => {
    if (reduced) return undefined;
    let raf;
    const frame = (now) => {
      const w = windRef.current;
      const t = now / 1000;
      w.lean += (w.leanTarget - w.lean) * 0.035;
      w.amp += (0.8 - w.amp) * 0.018;
      const fast = 1 + Math.min(2.5, w.amp * 0.25);
      if (trunkRef.current) {
        const a = w.lean * 0.22 + Math.sin(t * 0.9 * fast) * w.amp * 0.12;
        trunkRef.current.setAttribute('transform', `rotate(${a.toFixed(3)} ${L.trunkX} ${L.groundY})`);
      }
      T.groups.forEach((grp, i) => {
        const el = groupRefs.current[grp.id];
        if (!el) return;
        const a = w.lean * 0.6 + Math.sin(t * (1.1 + i * 0.17) * fast + i * 1.3) * w.amp * (0.7 + (i % 3) * 0.2);
        el.setAttribute('transform', `rotate(${a.toFixed(3)} ${grp.base[0]} ${grp.base[1]})`);
      });
      if (w.amp > 3 && now - w.lastSpawn > 220) {
        w.lastSpawn = now;
        spawnRef.current(1, 1.6);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced, L, T]);

  const onWind = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const w = windRef.current;
    const now = performance.now();
    if (w.lastX != null) {
      const v = Math.abs(nx - w.lastX) / Math.max(1, now - w.lastT);
      w.amp = Math.min(9, w.amp + v * 260);
    }
    w.lastX = nx;
    w.lastT = now;
    // the cursor is the wind: the crown leans away from it
    w.leanTarget = (0.5 - nx) * 5;
  };
  const calmWind = () => {
    windRef.current.leanTarget = 0;
    windRef.current.lastX = null;
  };

  const shake = useCallback(() => {
    setHover(null);
    windRef.current.amp = 10;
    spawnLeaves(28, 1.4);
  }, [spawnLeaves]);

  const replant = () => {
    setHover(null);
    setPinned(null);
    setTrace(null);
    setPlantKey((k) => k + 1);
  };

  const pickFruit = (f) => {
    setTrace(null);
    const same = pinned?.type === 'tool' && pinned.tool.key === f.key;
    setPinned(same ? null : { type: 'tool', tool: f });
    if (!same && !reduced) {
      // sparkle at the fruit's position in the current layout
      const pos = T.groups.flatMap((g) => g.fruits).find((x) => x.key === f.key);
      const id = ++leafSeq;
      setSparks((prev) => [...prev, { id, x: pos.x, y: pos.y, color: f.category.color }]);
      setTimeout(() => setSparks((prev) => prev.filter((s) => s.id !== id)), 800);
    }
  };

  const pickCat = (id) => {
    setTrace(null);
    setPinned((p) => (p?.type === 'cat' && p.id === id ? null : { type: 'cat', id }));
  };

  // ---- lit sets ----
  const focus = hover ?? pinned;
  const lit = useMemo(() => {
    const tools = new Set();
    const cats = new Set();
    if (focus?.type === 'tool') {
      tools.add(focus.tool.key);
      cats.add(focus.tool.category.id);
    } else if (focus?.type === 'cat') {
      cats.add(focus.id);
      allTools.filter((t) => t.category.id === focus.id).forEach((t) => tools.add(t.key));
    } else if (trace) {
      allTools.forEach((t) => {
        if (t.usedIn?.includes(trace)) {
          tools.add(t.key);
          cats.add(t.category.id);
        }
      });
    }
    return { tools, cats, any: tools.size > 0 };
  }, [focus, trace]);

  const inspectedTool = focus?.type === 'tool' ? focus.tool : null;
  const inspectedCat = focus?.type === 'cat' ? stackCategories.find((c) => c.id === focus.id) : null;
  const tracedCount = trace ? allTools.filter((t) => t.usedIn?.includes(trace)).length : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
      <div
        ref={wrapRef}
        className="relative overflow-hidden rounded-2xl border border-[color:var(--line)] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]"
        onPointerLeave={() => {
          calmWind();
          setHover(null);
        }}
      >
        <TreeScene
          key={layoutKey}
          darkMode={darkMode}
          reduced={reduced}
          layoutKey={layoutKey}
          grown={grown}
          settled={settled}
          lit={lit}
          pinned={pinned}
          showLabels={showLabels}
          leaves={leaves}
          sparks={sparks}
          onHover={setHover}
          onPick={pickFruit}
          onPickCat={pickCat}
          onShake={shake}
          onReplant={replant}
          onWind={onWind}
          groupRefs={groupRefs}
          trunkRef={trunkRef}
        />
        <div className="absolute left-3 bottom-3 sm:left-5 sm:bottom-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md pointer-events-none">
          <Wind size={12} className="text-white" />
          <span className="sc-tc font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em]" style={{ '--tc': '#FFFFFF' }}>
            <span className="sc-tc hidden sm:inline" style={{ '--tc': '#FFFFFF' }}>
              Your cursor is the wind · click the trunk to shake
            </span>
            <span className="sc-tc sm:hidden" style={{ '--tc': '#FFFFFF' }}>
              Tap a fruit · tap the trunk to shake
            </span>
          </span>
        </div>
      </div>

      {/* ---- side panel ---- */}
      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden p-5 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-md min-h-[150px]">
          <p className="sc-acc font-mono text-[10px] uppercase tracking-[0.3em] mb-3">Inspector</p>
          {/* keyed fade-in, no exit: AnimatePresence "wait" mode could stall on a
              stale tool when the hover target changed faster than its exit */}
            {inspectedTool ? (
              <motion.div
                key={inspectedTool.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
               
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-14 h-14 shrink-0 rounded-full bg-white flex items-center justify-center p-3"
                    style={{ border: `3px solid ${inspectedTool.category.color}`, boxShadow: `0 0 24px ${rgba(inspectedTool.category.color, 0.6)}` }}
                  >
                    <ToolLogo tool={inspectedTool} />
                  </span>
                  <div className="min-w-0">
                    <p className="sc-ink text-xl font-black leading-tight">{inspectedTool.name}</p>
                    <p className="sc-cat text-[10px] font-black uppercase tracking-[0.2em]" style={{ '--c': inspectedTool.category.color }}>
                      {inspectedTool.category.title}
                    </p>
                  </div>
                </div>
                {inspectedTool.usedIn?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {inspectedTool.usedIn.map((p) => (
                      <span key={p} className="sc-acc px-2 py-0.5 rounded border border-[color:var(--acc-line)] bg-[color:var(--acc-soft)] text-[9px] font-black uppercase tracking-widest">
                        {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="sc-ink text-xs opacity-65">{inspectedTool.category.subtitle}.</p>
                )}
              </motion.div>
            ) : inspectedCat ? (
              <motion.div
                key={inspectedCat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
               
                transition={{ duration: 0.18 }}
                className="flex items-center gap-3"
              >
                <span
                  className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center"
                  style={{ background: rgba(inspectedCat.color, 0.18), border: `3px solid ${inspectedCat.color}`, color: inspectedCat.color }}
                >
                  <inspectedCat.Icon size={22} />
                </span>
                <div className="min-w-0">
                  <p className="sc-ink text-xl font-black leading-tight">{inspectedCat.title}</p>
                  <p className="sc-ink text-xs opacity-65">
                    {inspectedCat.items.length} fruits · {inspectedCat.subtitle}
                  </p>
                </div>
              </motion.div>
            ) : trace ? (
              <motion.div key={`t-${trace}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                <p className="sc-ink text-xl font-black leading-tight">
                  {trace} grew from {pad2(tracedCount)} {tracedCount === 1 ? 'fruit' : 'fruits'}
                </p>
                <p className="sc-ink text-xs opacity-65 mt-1">The glowing fruits are what it&apos;s built with.</p>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                <p className="sc-ink text-xl font-black leading-tight">Every fruit is a tool.</p>
                <p className="sc-ink text-xs opacity-65 mt-1 leading-relaxed">
                  Hover or tap one to inspect it, tap a leafy crown for its whole branch, or trace a project below.
                </p>
              </motion.div>
            )}

        </div>

        <div className="grid grid-cols-3 gap-2">
          <PanelButton onClick={shake} label="Shake the tree">
            <Wind size={13} />
            <span className="sc-tc">Shake</span>
          </PanelButton>
          <PanelButton onClick={replant} label="Replant the tree">
            <Sprout size={13} />
            <span className="sc-tc">Replant</span>
          </PanelButton>
          <PanelButton on={showLabels} onClick={() => setShowLabels((v) => !v)} label="Toggle labels">
            <Tag size={13} />
            <span className="sc-tc">Labels</span>
          </PanelButton>
        </div>

        <div className="p-5 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-md space-y-3">
          <p className="sc-acc flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]">
            <Route size={12} /> Trace a project
          </p>
          <div className="flex flex-wrap gap-2">
            {PROJECTS.map((proj) => {
              const on = trace === proj;
              return (
                <button
                  key={proj}
                  onClick={() => {
                    setPinned(null);
                    setHover(null);
                    setTrace(on ? null : proj);
                  }}
                  aria-pressed={on}
                  className={`px-2.5 py-1.5 rounded-md border text-[10px] font-black uppercase tracking-[0.14em] transition-all ${
                    on ? 'bg-[color:var(--acc)] border-[color:var(--acc)] shadow-[0_0_18px_var(--acc-glow)]' : 'border-[color:var(--line)] hover:border-[color:var(--acc-line)]'
                  }`}
                  style={{ color: on ? 'var(--acc-ink)' : 'var(--ink)' }}
                >
                  {proj}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-md space-y-1.5">
          <p className="sc-acc font-mono text-[10px] uppercase tracking-[0.3em] mb-2">Branches</p>
          {DRAW_ORDER.map((id) => stackCategories.find((c) => c.id === id))
            .sort((a, b) => b.items.length - a.items.length)
            .map((c) => {
              const on = pinned?.type === 'cat' && pinned.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => pickCat(c.id)}
                  onPointerEnter={() => setHover({ type: 'cat', id: c.id })}
                  onPointerLeave={() => setHover(null)}
                  aria-pressed={on}
                  className={`w-full flex items-center gap-3 px-2.5 py-1.5 rounded-md text-left transition-colors ${on ? 'bg-[color:var(--acc-soft)]' : 'hover:bg-[color:var(--surface-strong)]'}`}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color, boxShadow: `0 0 10px ${c.color}` }} />
                  <span className="sc-ink text-xs sm:text-sm font-black flex-1 truncate">{c.title}</span>
                  <span className="sc-ink font-mono text-[10px] opacity-60">{pad2(c.items.length)}</span>
                </button>
              );
            })}
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
        className="hidden md:block absolute top-8 -mt-[3px] w-1.5 h-1.5 rounded-full bg-[color:var(--acc)] shadow-[0_0_12px_var(--acc)]"
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
          <span className="sc-ink font-mono text-[10px] opacity-50">{pad2(i + 1)}</span>
          <p className="sc-acc text-xs font-black uppercase tracking-[0.2em]">{m.name}</p>
          <p className="sc-ink text-xs opacity-60 leading-relaxed max-w-[200px]">{m.desc}</p>
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

      <header className="space-y-5 sm:space-y-6">
        <motion.p {...reveal(0)} className="sc-acc font-mono text-[11px] uppercase tracking-[0.4em]">
          ~/stack
        </motion.p>
        <motion.h2 {...reveal(0.08)} className="sc-ink text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.95]">
          The Tech <span className="sc-acc">Tree.</span>
        </motion.h2>
        <motion.p {...reveal(0.16)} className="sc-ink text-sm sm:text-lg opacity-70 max-w-2xl leading-relaxed">
          {TOOL_COUNT} tools grown from one root — six branches of frontend, backend, mobile, design, AI and
          shipping. Every fruit is something I actually build with.
        </motion.p>
      </header>

      <section className="space-y-6">
        <SectionEyebrow label="Grown, not installed" icon={<TreeDeciduous size={16} />} />
        <TechTree darkMode={darkMode} reduced={reduced} />
      </section>

      <section className="space-y-10">
        <SectionEyebrow label="How I Work" icon={<WorkflowIcon size={16} />} />
        <Workflow reduced={reduced} />
      </section>
    </div>
  );
}

export default Stacks;
