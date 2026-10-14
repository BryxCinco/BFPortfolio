import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
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
  GitFork,
  Waves,
  LayoutDashboard,
  Workflow as WorkflowIcon,
  Route,
  RotateCcw,
} from 'lucide-react';

import { rgba, getPalette, cssVars } from './theme';

// ============================================================================
// STACKS.JSX — "The Tech Tree"
// The toolkit drawn as a skill tree: one root, a branch per category, and a
// leaf per tool. Branches grow in on scroll, sap pulses flow root → leaf, and
// hovering a leaf (or tracing a project) lights its whole path.
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

// Grouped by theme; BRANCH_ORDER below sets the left → right order in the tree.
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

// Left → right branch order for the tree (data above stays grouped by theme).
const BRANCH_ORDER = ['frontend', 'backend', 'mobile', 'design', 'ai', 'ship'];

const branches = BRANCH_ORDER.map((id) => stackCategories.find((c) => c.id === id)).map((category, ci) => ({
  ...category,
  ci,
  tools: category.items.map((tool, ti) => ({
    ...tool,
    key: `${category.id}-${ti}`,
    ti,
    category,
  })),
}));

const allTools = branches.flatMap((b) => b.tools);
const TOOL_COUNT = allTools.length;
const PROJECTS = ['TIDE', 'Poopipoo', 'Neo Chess XD', 'SweepXpress', PORTFOLIO];
const pad2 = (n) => String(n).padStart(2, '0');

// Breakpoint (container width) where the six branches fit side by side;
// below it the tree is drawn as a vertical, file-explorer style tree.
const TREE_MIN_WIDTH = 1100;

// ============================================================================
// STYLES — scoped colour classes beat the global `.light/.dark h1..span`
// `!important` overrides in index.css.
// ============================================================================

const StackStyles = () => (
  <style>{`
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-acc { color: var(--acc) !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-ink { color: var(--ink) !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-white { color: #ffffff !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-dark { color: #1B1B2A !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-cat { color: var(--c) !important; }
    .sc-scope :is(h1,h2,h3,h4,p,span,li).sc-tc { color: var(--tc) !important; }
    @keyframes sc-spin { to { transform: rotate(360deg); } }
    @keyframes sc-halo { 0%, 100% { transform: scale(1); opacity: 0.55; } 50% { transform: scale(1.18); opacity: 0.9; } }
    @keyframes sc-ping { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.2); opacity: 0; } }
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
    return (
      <span className="sc-dark font-black leading-none tracking-tight text-[9px]">{tool.glyph ?? tool.name.slice(0, 2)}</span>
    );
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

// position of `el` relative to `root`, ignoring CSS transforms (so the
// pop-in scale animation never skews the measured branch endpoints)
const offsetWithin = (el, root) => {
  let x = 0;
  let y = 0;
  let n = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
};

// ============================================================================
// TECH TREE
// ============================================================================

const TechTree = ({ darkMode, reduced }) => {
  const wrapRef = useRef(null);
  const rootRef = useRef(null);
  const catRefs = useRef({});
  const toolRefs = useRef({});
  const blockRefs = useRef({});

  const [mode, setMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= TREE_MIN_WIDTH + 120 ? 'tree' : 'list'
  );
  const [geo, setGeo] = useState({ w: 0, h: 0, edges: [] });
  const [grown, setGrown] = useState(false);
  const [settled, setSettled] = useState(false);
  const [growKey, setGrowKey] = useState(0);
  const [hover, setHover] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [trace, setTrace] = useState(null);

  const inView = useInView(wrapRef, { once: true, margin: '-120px' });

  // grow once scrolled into view, and again whenever "Replay" is pressed
  useEffect(() => {
    if (!inView) return undefined;
    if (reduced) {
      setGrown(true);
      setSettled(true);
      return undefined;
    }
    setGrown(false);
    setSettled(false);
    const t1 = setTimeout(() => setGrown(true), 60);
    // after the last leaf lands, drop the stagger so hover feedback is instant
    const t2 = setTimeout(() => setSettled(true), 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [inView, reduced, growKey]);

  // measure nodes → build branch paths; re-run on resize and layout mode changes
  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const rootEl = rootRef.current;
    if (!wrap || !rootEl) return;
    const nextMode = wrap.offsetWidth >= TREE_MIN_WIDTH ? 'tree' : 'list';
    if (nextMode !== mode) {
      setMode(nextMode);
      return;
    }
    const r = offsetWithin(rootEl, wrap);
    const edges = [];

    branches.forEach((b) => {
      const catEl = catRefs.current[b.id];
      if (!catEl) return;
      const c = offsetWithin(catEl, wrap);
      const stemX = c.x + 22;

      if (mode === 'tree') {
        const x1 = r.x + r.w / 2;
        const y1 = r.y + r.h;
        const x2 = c.x + c.w / 2;
        const y2 = c.y;
        const my = (y1 + y2) / 2;
        edges.push({ id: `root-${b.id}`, kind: 'root', catId: b.id, color: b.color, d: `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`, delay: b.ci * 90 });
        b.tools.forEach((t) => {
          const el = toolRefs.current[t.key];
          if (!el) return;
          const p = offsetWithin(el, wrap);
          const ty = p.y + p.h / 2;
          edges.push({
            id: `leaf-${t.key}`,
            kind: 'leaf',
            catId: b.id,
            toolKey: t.key,
            color: b.color,
            d: `M${stemX},${c.y + c.h} V${ty - 10} Q${stemX},${ty} ${stemX + 10},${ty} H${p.x}`,
            delay: 650 + b.ci * 90 + t.ti * 55,
          });
        });
      } else {
        const trunkX = r.x + 28;
        const cy = c.y + c.h / 2;
        edges.push({
          id: `root-${b.id}`,
          kind: 'root',
          catId: b.id,
          color: b.color,
          d: `M${trunkX},${r.y + r.h} V${cy - 12} Q${trunkX},${cy} ${trunkX + 12},${cy} H${c.x}`,
          delay: b.ci * 110,
        });
        const blockEl = blockRefs.current[b.id];
        if (blockEl) {
          const k = offsetWithin(blockEl, wrap);
          edges.push({
            id: `stem-${b.id}`,
            kind: 'stem',
            catId: b.id,
            color: b.color,
            d: `M${stemX},${c.y + c.h} V${k.y + k.h - 6}`,
            delay: 500 + b.ci * 110,
          });
        }
      }
    });

    setGeo({ w: wrap.offsetWidth, h: wrap.offsetHeight, edges });
  }, [mode]);

  useLayoutEffect(() => {
    measure();
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === 'undefined') return undefined;
    let raf;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    });
    ro.observe(wrap);
    document.fonts?.ready?.then(measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [measure]);

  // ---- what is lit right now -------------------------------------------------
  const focus = hover ?? pinned;
  const lit = useMemo(() => {
    const tools = new Set();
    const cats = new Set();
    if (focus?.type === 'tool') {
      tools.add(focus.tool.key);
      cats.add(focus.tool.category.id);
    } else if (focus?.type === 'cat') {
      cats.add(focus.id);
      branches.find((b) => b.id === focus.id)?.tools.forEach((t) => tools.add(t.key));
    } else if (trace) {
      allTools.forEach((t) => {
        if (t.usedIn?.includes(trace)) {
          tools.add(t.key);
          cats.add(t.category.id);
        }
      });
    }
    return { tools, cats, any: tools.size > 0 || cats.size > 0 };
  }, [focus, trace]);

  const edgeLit = (e) => (e.kind === 'leaf' ? lit.tools.has(e.toolKey) : lit.cats.has(e.catId));

  const inspected = focus?.type === 'tool' ? focus.tool : null;
  const inspectedBranch = focus?.type === 'cat' ? branches.find((b) => b.id === focus.id) : null;
  const tracedCount = trace ? allTools.filter((t) => t.usedIn?.includes(trace)).length : 0;

  const baseStroke = darkMode ? 'rgba(255,255,255,0.13)' : 'rgba(27,27,42,0.16)';
  const nodeIn = (delay) => ({
    opacity: grown ? 1 : 0,
    transform: grown ? 'none' : 'scale(0.6) translateY(10px)',
    transition:
      reduced || !grown
        ? 'none'
        : settled
          ? 'opacity 250ms ease, transform 250ms ease, translate 250ms ease, border-color 250ms, background 250ms, box-shadow 250ms'
          : `opacity 500ms ease ${delay}ms, transform 600ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms, translate 250ms ease, border-color 250ms, background 250ms, box-shadow 250ms`,
  });

  const resetAll = () => {
    setPinned(null);
    setTrace(null);
    setHover(null);
  };

  return (
    <div className="space-y-5">
      {/* ---- controls: project tracer + inspector ---- */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(0,440px)] gap-4">
        <div className="p-4 sm:p-5 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="sc-acc flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]">
              <Route size={12} /> Trace a project
            </p>
            <button
              onClick={() => setGrowKey((k) => k + 1)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[color:var(--line)] text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--ink)] hover:border-[color:var(--acc)] transition-colors"
            >
              <RotateCcw size={11} /> Replay growth
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROJECTS.map((proj) => {
              const on = trace === proj;
              return (
                <button
                  key={proj}
                  onClick={() => {
                    setPinned(null);
                    setTrace(on ? null : proj);
                  }}
                  aria-pressed={on}
                  className={`px-3 py-1.5 rounded-md border text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] transition-all ${
                    on
                      ? 'bg-[color:var(--acc)] border-[color:var(--acc)] shadow-[0_0_20px_var(--acc-glow)]'
                      : 'border-[color:var(--line)] hover:border-[color:var(--acc-line)]'
                  }`}
                  style={{ color: on ? 'var(--acc-ink)' : 'var(--ink)' }}
                >
                  {proj}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden p-4 sm:p-5 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-md min-h-[104px] flex items-center">
          <AnimatePresence mode="wait">
            {inspected ? (
              <motion.div
                key={inspected.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-4 w-full"
              >
                <span
                  className="w-14 h-14 shrink-0 rounded-xl bg-white flex items-center justify-center p-3"
                  style={{ border: `2px solid ${inspected.category.color}`, boxShadow: `0 0 22px ${rgba(inspected.category.color, 0.55)}` }}
                >
                  <ToolLogo tool={inspected} />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="sc-ink text-lg font-black leading-tight truncate">{inspected.name}</p>
                  <p className="sc-cat text-[10px] font-black uppercase tracking-[0.2em]" style={{ '--c': inspected.category.color }}>
                    {inspected.category.title}
                  </p>
                  <p className="sc-ink text-[11px] opacity-65 truncate">
                    {inspected.usedIn?.length ? `Used in ${inspected.usedIn.join(' · ')}` : inspected.category.subtitle}
                  </p>
                </div>
              </motion.div>
            ) : inspectedBranch ? (
              <motion.div
                key={inspectedBranch.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-4 w-full"
              >
                <span
                  className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center"
                  style={{ background: rgba(inspectedBranch.color, 0.16), border: `2px solid ${inspectedBranch.color}`, color: inspectedBranch.color }}
                >
                  <inspectedBranch.Icon size={22} />
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="sc-ink text-lg font-black leading-tight">{inspectedBranch.title}</p>
                  <p className="sc-ink text-[11px] opacity-65">
                    {inspectedBranch.tools.length} tools · {inspectedBranch.subtitle}
                  </p>
                </div>
              </motion.div>
            ) : trace ? (
              <motion.div
                key={`trace-${trace}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-1"
              >
                <p className="sc-acc font-mono text-[10px] uppercase tracking-[0.3em]">Tracing</p>
                <p className="sc-ink text-lg font-black leading-tight">
                  {trace} runs on {pad2(tracedCount)} {tracedCount === 1 ? 'branch tip' : 'branch tips'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-1"
              >
                <p className="sc-acc font-mono text-[10px] uppercase tracking-[0.3em]">Inspector</p>
                <p className="sc-ink text-sm opacity-75 leading-relaxed">
                  Hover or tap a leaf to light up its path back to the root — or trace a project to see what it&apos;s
                  built from.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ---- the tree ---- */}
      <div
        ref={wrapRef}
        className="relative rounded-2xl border border-[color:var(--line)] p-4 sm:p-8 xl:p-10 overflow-hidden"
        style={{
          background: darkMode
            ? 'radial-gradient(ellipse at 50% 0%, rgba(0,255,179,0.10), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(167,0,255,0.12), transparent 60%), rgba(255,255,255,0.02)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(255,0,122,0.08), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(167,0,255,0.08), transparent 60%), rgba(255,255,255,0.55)',
        }}
        onPointerLeave={() => setHover(null)}
      >
        {/* blueprint grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: `linear-gradient(${baseStroke} 1px, transparent 1px), linear-gradient(90deg, ${baseStroke} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)',
          }}
        />

        {/* branches */}
        <svg
          className="absolute left-0 top-0 pointer-events-none overflow-visible"
          width={geo.w}
          height={geo.h}
          aria-hidden="true"
        >
          <defs>
            <filter id="sc-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {geo.edges.map((e) => {
            const on = edgeLit(e);
            const dim = lit.any && !on;
            const rootish = e.kind !== 'leaf';
            return (
              <path
                key={e.id}
                d={e.d}
                fill="none"
                pathLength="1"
                strokeDasharray="1"
                strokeLinecap="round"
                strokeDashoffset={grown ? 0 : 1}
                stroke={on ? e.color : rootish ? rgba(e.color, darkMode ? 0.55 : 0.6) : baseStroke}
                strokeWidth={on ? 2.6 : rootish ? 2 : 1.4}
                filter={on ? 'url(#sc-glow)' : undefined}
                style={{
                  opacity: dim ? 0.22 : 1,
                  transition: reduced || !grown
                    ? 'none'
                    : `stroke-dashoffset ${rootish ? 900 : 650}ms cubic-bezier(0.65,0,0.35,1) ${e.delay}ms, stroke 250ms, stroke-width 250ms, opacity 250ms`,
                }}
              />
            );
          })}
          {/* sap: pulses travelling from the root out to the leaves */}
          {grown &&
            !reduced &&
            geo.edges.map((e, i) => {
              const on = edgeLit(e);
              if (lit.any && !on) return null;
              if (!lit.any && e.kind === 'leaf' && i % 3 !== 0) return null;
              const dur = e.kind === 'leaf' ? 1.6 + (i % 5) * 0.25 : 2.4 + (i % 4) * 0.3;
              return (
                <circle
                  key={`pulse-${e.id}-${on ? 'on' : 'off'}`}
                  r={on ? 3.6 : 2.4}
                  fill={on ? '#FFFFFF' : e.color}
                  opacity={on ? 1 : 0.75}
                  style={{ filter: `drop-shadow(0 0 ${on ? 6 : 3}px ${e.color})` }}
                >
                  <animateMotion dur={`${on ? dur * 0.7 : dur}s`} begin={`${(i % 7) * 0.35}s`} repeatCount="indefinite" path={e.d} />
                </circle>
              );
            })}
        </svg>

        {/* root */}
        <div className={`relative flex ${mode === 'tree' ? 'justify-center' : 'justify-start'}`}>
          <button
            ref={rootRef}
            onClick={resetAll}
            aria-label="Reset the tree"
            className="relative z-10 flex items-center gap-4 pl-2 pr-6 py-2 rounded-full border border-[color:var(--acc-line)] bg-[color:var(--surface-strong)] backdrop-blur-md shadow-[0_0_40px_var(--acc-glow)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
            style={nodeIn(0)}
          >
            <span className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <span
                className="sc-anim absolute -inset-2 rounded-full"
                style={{ background: 'radial-gradient(circle, var(--acc-glow), transparent 70%)', animation: 'sc-halo 3s ease-in-out infinite' }}
              />
              <span
                className="sc-anim absolute -inset-0.5 rounded-full"
                style={{ background: 'conic-gradient(from 0deg, var(--acc), var(--acc2), transparent 60%, var(--acc))', animation: 'sc-spin 4s linear infinite' }}
              />
              <span className="absolute inset-[3px] rounded-full flex items-center justify-center bg-[color:var(--acc)]">
                <span className="sc-tc font-black text-sm sm:text-base tracking-tighter" style={{ '--tc': 'var(--acc-ink)' }}>
                  BF
                </span>
              </span>
            </span>
            <span className="text-left">
              <span className="sc-ink block text-sm sm:text-base font-black leading-tight">Brian Francisco</span>
              <span className="sc-acc block font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.25em]">
                root · {TOOL_COUNT} tools
              </span>
            </span>
          </button>
        </div>

        {/* branches + leaves */}
        <div
          className={
            mode === 'tree'
              ? 'relative grid grid-cols-6 gap-4 mt-20'
              : 'relative flex flex-col gap-8 mt-8 pl-10 sm:pl-14'
          }
        >
          {branches.map((b) => {
            const catLit = lit.cats.has(b.id);
            const catDim = lit.any && !catLit;
            const pinnedCat = pinned?.type === 'cat' && pinned.id === b.id;
            return (
              <div key={b.id} className="relative min-w-0">
                <button
                  ref={(el) => {
                    catRefs.current[b.id] = el;
                  }}
                  onClick={() => {
                    setTrace(null);
                    setPinned(pinnedCat ? null : { type: 'cat', id: b.id });
                  }}
                  onPointerEnter={() => setHover({ type: 'cat', id: b.id })}
                  onPointerLeave={() => setHover(null)}
                  aria-pressed={pinnedCat}
                  className="relative z-10 w-full flex items-center gap-3 p-2 pr-3 rounded-xl border text-left backdrop-blur-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
                  style={{
                    ...nodeIn(250 + b.ci * 90),
                    opacity: grown ? (catDim ? 0.35 : 1) : 0,
                    borderColor: catLit ? b.color : rgba(b.color, 0.35),
                    background: `linear-gradient(135deg, ${rgba(b.color, catLit ? 0.28 : 0.14)}, ${rgba(b.color, 0.03)})`,
                    boxShadow: catLit ? `0 0 28px ${rgba(b.color, 0.45)}` : 'none',
                  }}
                >
                  <span
                    className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg flex items-center justify-center"
                    style={{ background: b.color, color: '#FFFFFF' }}
                  >
                    <b.Icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="sc-ink block text-xs sm:text-sm font-black leading-tight truncate">{b.title}</span>
                    <span className="sc-cat block font-mono text-[9px] uppercase tracking-[0.2em]" style={{ '--c': b.color }}>
                      {pad2(b.tools.length)} leaves
                    </span>
                  </span>
                </button>

                <div
                  ref={(el) => {
                    blockRefs.current[b.id] = el;
                  }}
                  className={
                    mode === 'tree'
                      ? 'flex flex-col gap-2.5 mt-6 pl-10'
                      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 mt-4 pl-8 sm:pl-10'
                  }
                >
                  {b.tools.map((t) => {
                    const on = lit.tools.has(t.key);
                    const dim = lit.any && !on;
                    const isPinned = pinned?.type === 'tool' && pinned.tool.key === t.key;
                    return (
                      <button
                        key={t.key}
                        ref={(el) => {
                          toolRefs.current[t.key] = el;
                        }}
                        onClick={() => {
                          setTrace(null);
                          setPinned(isPinned ? null : { type: 'tool', tool: t });
                        }}
                        onPointerEnter={() => setHover({ type: 'tool', tool: t })}
                        onPointerLeave={() => setHover(null)}
                        onFocus={() => setHover({ type: 'tool', tool: t })}
                        onBlur={() => setHover(null)}
                        aria-pressed={isPinned}
                        className="group relative z-10 flex items-center gap-2 sm:gap-2.5 p-1.5 pr-2.5 sm:pr-3 rounded-lg border text-left backdrop-blur-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
                        style={{
                          ...nodeIn(900 + b.ci * 90 + t.ti * 55),
                          opacity: grown ? (dim ? 0.3 : 1) : 0,
                          borderColor: on ? b.color : 'var(--line)',
                          background: on ? rgba(b.color, 0.16) : 'var(--surface-strong)',
                          boxShadow: on ? `0 0 22px ${rgba(b.color, 0.5)}` : 'none',
                          translate: on ? '4px 0' : '0 0',
                        }}
                      >
                        {isPinned && (
                          <span
                            className="sc-anim absolute inset-0 rounded-lg pointer-events-none"
                            style={{ border: `2px solid ${b.color}`, animation: 'sc-ping 1.6s ease-out infinite' }}
                          />
                        )}
                        <span className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-md bg-white flex items-center justify-center p-1 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                          <ToolLogo tool={t} />
                        </span>
                        <span className={`sc-ink text-[11px] sm:text-xs font-black leading-tight ${mode === 'tree' ? 'truncate' : 'break-words min-w-0'}`}>{t.name}</span>
                        {t.usedIn?.length > 0 && (
                          <span
                            className="ml-auto w-1.5 h-1.5 shrink-0 rounded-full"
                            style={{ background: b.color }}
                            title={`Used in ${t.usedIn.join(', ')}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="sc-ink relative mt-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--acc)]" /> dot = shipped in a live project
        </p>
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
  const vars = useMemo(
    () => cssVars(getPalette(darkMode)),
    [darkMode]
  );

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
          {TOOL_COUNT} tools growing from one root — {branches.length} branches spanning frontend, backend, mobile,
          design, AI and shipping. Every leaf is something I actually build with.
        </motion.p>
      </header>

      <section className="space-y-6">
        <SectionEyebrow label="Skill Tree" icon={<GitFork size={16} />} />
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
