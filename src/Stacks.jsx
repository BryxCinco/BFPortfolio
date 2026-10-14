import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  Workflow,
  Play,
  Pause,
  Box,
  Tag,
  Hand,
  Orbit,
  Sun,
  X,
} from 'lucide-react';

import { rgba, getPalette, cssVars } from './theme';

// ============================================================================
// STACKS.JSX — "My Tech Universe"
// The toolkit rendered as a solar system: the sun is the stack itself, each
// category is an orbit, and every tool is a planet travelling around it.
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

// Ordered innermost orbit → outermost. Outer orbits are longer, so the
// categories with the most tools sit furthest out.
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

// Orbit geometry: radius as a % of the system's width, and seconds per lap.
const ORBIT_RADII = [14, 21.5, 28.5, 35.5, 42.5, 49];
const ORBIT_PERIODS = [24, 34, 46, 60, 76, 94];

const orbits = stackCategories.map((category, i) => ({
  ...category,
  ring: i,
  radius: ORBIT_RADII[i],
  period: ORBIT_PERIODS[i],
  dir: i % 2 === 0 ? 1 : -1,
  planets: category.items.map((tool, j) => ({
    ...tool,
    key: `${category.id}-${j}`,
    category,
    ring: i,
    // spread planets evenly and stagger each ring so they don't line up
    theta: (j / category.items.length) * Math.PI * 2 + i * 0.7,
  })),
}));

const allTools = orbits.flatMap((o) => o.planets);
const TOOL_COUNT = allTools.length;
const pad2 = (n) => String(n).padStart(2, '0');

// deterministic star field so it doesn't reshuffle on every render
const STARS = (() => {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 90 }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    s: 1 + rand() * 1.8,
    d: rand() * 4,
    t: 2.5 + rand() * 3.5,
  }));
})();

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
    @keyframes sc-twinkle { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.9; } }
    @keyframes sc-spin { to { transform: rotate(360deg); } }
    @keyframes sc-corona { 0%, 100% { transform: scale(1); opacity: 0.55; } 50% { transform: scale(1.12); opacity: 0.85; } }
    @keyframes sc-ping { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.9); opacity: 0; } }
    @keyframes sc-shoot {
      0% { transform: translate(0, 0) rotate(-35deg); opacity: 0; }
      4% { opacity: 1; }
      12% { transform: translate(-340px, 240px) rotate(-35deg); opacity: 0; }
      100% { transform: translate(-340px, 240px) rotate(-35deg); opacity: 0; }
    }
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

const ToolLogo = ({ tool, className = '' }) => {
  const [failed, setFailed] = useState(!tool.logo);
  if (failed) {
    return (
      <span className="sc-dark font-black leading-none tracking-tight" style={{ fontSize: '0.95em' }}>
        {tool.glyph ?? tool.name.slice(0, 2)}
      </span>
    );
  }
  return (
    <img
      src={tool.logo}
      alt=""
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className={`w-full h-full object-contain pointer-events-none ${className}`}
    />
  );
};

const ControlButton = ({ on, onClick, label, children }) => (
  <button
    onClick={onClick}
    aria-pressed={on}
    title={label}
    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-[10px] font-black uppercase tracking-[0.18em] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)] ${
      on
        ? 'bg-[color:var(--acc)] border-[color:var(--acc)]'
        : 'border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--acc-line)]'
    }`}
  >
    <span className="sc-tc flex items-center gap-2" style={{ '--tc': on ? 'var(--acc-ink)' : 'var(--ink)' }}>
      {children}
    </span>
  </button>
);

// ============================================================================
// SOLAR SYSTEM — rAF-driven orbits, drag to spin, optional 3D tilt
// ============================================================================

const TILT_3D = 58;

const SolarSystem = ({ darkMode, reduced, playing, speed, tilted, showLabels, selected, focusCat, onSelect, onSunClick }) => {
  const wrapRef = useRef(null);
  const planeRef = useRef(null);
  const sunRef = useRef(null);
  const ringRefs = useRef([]);
  const billboardRefs = useRef({});
  const anglesRef = useRef(orbits.map((_, i) => i * 37));
  const multRef = useRef(0);
  const tiltRef = useRef(0);
  const hoverRef = useRef(false);
  const spinRef = useRef(0);
  const dragRef = useRef(null);
  const suppressClick = useRef(false);
  const liveRef = useRef({ playing, speed, tilted, reduced });
  liveRef.current = { playing, speed, tilted, reduced };

  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    let raf;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const live = liveRef.current;

      const targetMult = live.reduced || !live.playing ? 0 : live.speed * (hoverRef.current ? 0.06 : 1);
      multRef.current += (targetMult - multRef.current) * 0.07;
      const targetTilt = live.tilted ? TILT_3D : 0;
      tiltRef.current += (targetTilt - tiltRef.current) * 0.08;
      if (!dragRef.current) spinRef.current *= 0.94;

      const tilt = tiltRef.current;
      if (planeRef.current) planeRef.current.style.transform = `rotateX(${tilt}deg)`;
      if (sunRef.current) sunRef.current.style.transform = `rotateX(${-tilt}deg)`;

      orbits.forEach((o, i) => {
        anglesRef.current[i] += (360 / o.period) * o.dir * multRef.current * dt + spinRef.current;
        const a = anglesRef.current[i];
        const ring = ringRefs.current[i];
        if (ring) ring.style.transform = `rotate(${a}deg)`;
        o.planets.forEach((p) => {
          const el = billboardRefs.current[p.key];
          if (el) el.style.transform = `rotate(${-a}deg) rotateX(${-tilt}deg)`;
        });
      });

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // drag anywhere on the system to spin every orbit, with inertia on release
  const pointerAngle = (e) => {
    const r = wrapRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const squash = Math.max(0.35, Math.cos((tiltRef.current * Math.PI) / 180));
    return (Math.atan2((e.clientY - cy) / squash, e.clientX - cx) * 180) / Math.PI;
  };

  const onPointerDown = (e) => {
    dragRef.current = { last: pointerAngle(e), startX: e.clientX, startY: e.clientY };
    suppressClick.current = false;
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    if (!suppressClick.current && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) {
      suppressClick.current = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    if (!suppressClick.current) return;
    const a = pointerAngle(e);
    let delta = a - d.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.last = a;
    orbits.forEach((_, i) => {
      anglesRef.current[i] += delta;
    });
    spinRef.current = Math.max(-6, Math.min(6, delta));
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  const setHover = (key) => {
    hoverRef.current = !!key;
    setHovered(key);
  };

  const sunGradient = darkMode
    ? 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #7DFFE0 18%, #00FFB3 42%, #A700FF 100%)'
    : 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #FFD36E 20%, #FF8A00 45%, #FF007A 100%)';
  const sunGlow = darkMode ? 'rgba(0,255,179,0.55)' : 'rgba(255,0,122,0.45)';

  return (
    <div
      ref={wrapRef}
      className="relative w-full select-none touch-pan-y cursor-grab active:cursor-grabbing"
      style={{ paddingBottom: tilted ? '64%' : '100%', transition: 'padding-bottom 800ms cubic-bezier(0.22,1,0.36,1)' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1600px' }}>
        <div className="relative w-full aspect-square pointer-events-none" style={{ transformStyle: 'preserve-3d' }} ref={planeRef}>
          {/* orbits + planets — every wrapper is click-through so stacked ring
              boxes and the tilted plane never swallow clicks meant for a planet */}
          {orbits.map((o, i) => {
            const dim = focusCat && focusCat !== o.id;
            const lit = focusCat === o.id;
            return (
              <div
                key={o.id}
                ref={(el) => {
                  ringRefs.current[i] = el;
                }}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${50 - o.radius}%`,
                  top: `${50 - o.radius}%`,
                  width: `${o.radius * 2}%`,
                  height: `${o.radius * 2}%`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    border: `${lit ? 2 : 1}px ${lit ? 'solid' : 'dashed'} ${rgba(o.color, lit ? 0.8 : darkMode ? 0.32 : 0.4)}`,
                    boxShadow: lit ? `0 0 24px ${rgba(o.color, 0.45)}, inset 0 0 24px ${rgba(o.color, 0.25)}` : 'none',
                    opacity: dim ? 0.35 : 1,
                    transition: 'opacity 300ms, box-shadow 300ms',
                  }}
                />
                {o.planets.map((p) => {
                  const isSel = selected?.key === p.key;
                  const isHover = hovered === p.key;
                  const pDim = (focusCat && focusCat !== o.id) || (hovered && !isHover && !isSel);
                  const labelOn = showLabels || isHover || isSel;
                  return (
                    <div
                      key={p.key}
                      className="absolute pointer-events-none"
                      style={{
                        left: `calc(${50 + 50 * Math.cos(p.theta)}% - var(--planet) / 2)`,
                        top: `calc(${50 + 50 * Math.sin(p.theta)}% - var(--planet) / 2)`,
                        width: 'var(--planet)',
                        height: 'var(--planet)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <div
                        ref={(el) => {
                          billboardRefs.current[p.key] = el;
                        }}
                        className="relative w-full h-full pointer-events-none"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {isSel && (
                          <span
                            className="sc-anim absolute -inset-1.5 rounded-full pointer-events-none"
                            style={{ border: `2px solid ${o.color}`, animation: 'sc-ping 1.6s ease-out infinite' }}
                          />
                        )}
                        <button
                          onClick={() => {
                            if (suppressClick.current) return;
                            onSelect(isSel ? null : p);
                          }}
                          onPointerEnter={() => setHover(p.key)}
                          onPointerLeave={() => setHover(null)}
                          onFocus={() => setHover(p.key)}
                          onBlur={() => setHover(null)}
                          aria-label={`${p.name} — ${o.title}`}
                          aria-pressed={isSel}
                          className="pointer-events-auto relative w-full h-full rounded-full bg-white flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
                          style={{
                            padding: '20%',
                            fontSize: 'calc(var(--planet) * 0.34)',
                            border: `2px solid ${rgba(o.color, isSel || isHover ? 1 : 0.55)}`,
                            boxShadow:
                              isSel || isHover
                                ? `0 0 0 4px ${rgba(o.color, 0.25)}, 0 0 28px ${rgba(o.color, 0.8)}`
                                : `0 4px 14px ${darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(27,27,42,0.2)'}`,
                            transform: isHover || isSel ? 'scale(1.35)' : 'scale(1)',
                            opacity: pDim ? 0.3 : 1,
                            transition: 'transform 250ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 250ms, opacity 250ms, border-color 250ms',
                          }}
                        >
                          <ToolLogo tool={p} />
                        </button>
                        <span
                          className="sc-ink absolute left-1/2 top-full mt-2 whitespace-nowrap px-1.5 py-0.5 rounded font-black uppercase tracking-wider pointer-events-none"
                          style={{
                            fontSize: 'clamp(8px, 1.1vw, 10px)',
                            background: isHover || isSel ? rgba(o.color, 0.9) : darkMode ? 'rgba(11,11,22,0.75)' : 'rgba(255,255,255,0.85)',
                            opacity: labelOn ? (pDim ? 0.4 : 1) : 0,
                            transform: `translateX(-50%) translateY(${labelOn ? 0 : -4}px)`,
                            transition: 'opacity 200ms, transform 200ms',
                          }}
                        >
                          {p.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* sun */}
          <div className="absolute left-1/2 top-1/2 w-[17%] aspect-square -ml-[8.5%] -mt-[8.5%] pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
            <div ref={sunRef} className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
              <span
                className="sc-anim absolute -inset-[35%] rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${sunGlow} 0%, transparent 65%)`, animation: 'sc-corona 4s ease-in-out infinite' }}
              />
              <span
                className="sc-anim absolute -inset-[12%] rounded-full pointer-events-none opacity-70"
                style={{
                  background: darkMode
                    ? 'conic-gradient(from 0deg, transparent, rgba(0,255,179,0.6), transparent 30%, rgba(167,0,255,0.6), transparent 60%, rgba(0,255,179,0.6), transparent)'
                    : 'conic-gradient(from 0deg, transparent, rgba(255,138,0,0.6), transparent 30%, rgba(255,0,122,0.6), transparent 60%, rgba(255,138,0,0.6), transparent)',
                  animation: 'sc-spin 12s linear infinite',
                  filter: 'blur(6px)',
                }}
              />
              <button
                onClick={() => {
                  if (!suppressClick.current) onSunClick();
                }}
                aria-label="Reset the system view"
                className="pointer-events-auto relative w-full h-full rounded-full flex flex-col items-center justify-center text-center outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
                style={{ background: sunGradient, boxShadow: `0 0 60px ${sunGlow}, inset -8px -10px 24px rgba(0,0,0,0.25)` }}
              >
                <span className="sc-dark font-black leading-none tracking-tighter" style={{ fontSize: 'clamp(14px, 3.4vw, 34px)' }}>
                  {TOOL_COUNT}
                </span>
                <span className="sc-dark font-black uppercase leading-none mt-0.5" style={{ fontSize: 'clamp(5px, 0.9vw, 9px)', letterSpacing: '0.18em' }}>
                  My Stack
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MISSION CONTROL — details for the selected planet / orbit legend
// ============================================================================

const MissionControl = ({ selected, focusCat, onFocusCat, onClear }) => {
  const orbit = selected ? orbits[selected.ring] : null;
  return (
    <div className="flex flex-col gap-6 p-6 sm:p-7 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-md h-full">
      <div className="flex items-center justify-between">
        <p className="sc-acc font-mono text-[10px] uppercase tracking-[0.35em]">Mission Control</p>
        <span className="relative flex h-2 w-2">
          <span className="sc-anim animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--acc)] opacity-70" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--acc)]" />
        </span>
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={selected.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 shrink-0 rounded-full bg-white flex items-center justify-center p-3.5"
                style={{ fontSize: 22, border: `2px solid ${orbit.color}`, boxShadow: `0 0 24px ${rgba(orbit.color, 0.6)}` }}
              >
                <ToolLogo tool={selected} />
              </div>
              <div className="min-w-0">
                <h4 className="sc-ink text-2xl font-black tracking-tight leading-tight">{selected.name}</h4>
                <p className="sc-cat text-[10px] font-black uppercase tracking-[0.2em]" style={{ '--c': orbit.color }}>
                  {orbit.title}
                </p>
              </div>
              <button
                onClick={onClear}
                aria-label="Clear selection"
                className="ml-auto p-1.5 rounded-full border border-[color:var(--line)] text-[color:var(--ink)] hover:border-[color:var(--acc)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-[10px] uppercase tracking-[0.15em]">
              <div className="p-3 rounded-md border border-[color:var(--line)]">
                <p className="sc-ink opacity-50">Orbit</p>
                <p className="sc-ink font-black text-sm mt-1">#{pad2(orbit.ring + 1)}</p>
              </div>
              <div className="p-3 rounded-md border border-[color:var(--line)]">
                <p className="sc-ink opacity-50">Lap time</p>
                <p className="sc-ink font-black text-sm mt-1">{orbit.period}s</p>
              </div>
            </div>

            <p className="sc-ink text-sm opacity-75 leading-relaxed">{orbit.subtitle}.</p>

            {selected.usedIn?.length > 0 && (
              <div className="space-y-2">
                <p className="sc-ink font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">Spotted in</p>
                <div className="flex flex-wrap gap-2">
                  {selected.usedIn.map((proj) => (
                    <span
                      key={proj}
                      className="sc-acc px-2.5 py-1 rounded-md border border-[color:var(--acc-line)] bg-[color:var(--acc-soft)] text-[10px] font-black uppercase tracking-widest"
                    >
                      {proj}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-2"
          >
            <h4 className="sc-ink text-xl font-black tracking-tight">Pick a planet.</h4>
            <p className="sc-ink text-sm opacity-70 leading-relaxed">
              Every planet is a tool I build with. Click one to scan it, drag the system to spin it, or lock onto an
              orbit below.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto space-y-1.5 pt-5 border-t border-[color:var(--line)]">
        <p className="sc-ink font-mono text-[10px] uppercase tracking-[0.25em] opacity-50 mb-2">Orbits</p>
        {orbits.map((o) => {
          const on = focusCat === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onFocusCat(on ? null : o.id)}
              aria-pressed={on}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                on ? 'bg-[color:var(--acc-soft)]' : 'hover:bg-[color:var(--surface-strong)]'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: o.color, boxShadow: `0 0 8px ${o.color}` }} />
              <span className="sc-ink text-xs sm:text-sm font-black flex-1 truncate">{o.title}</span>
              <span className="sc-ink font-mono text-[10px] opacity-60">{pad2(o.planets.length)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN
// ============================================================================

function Stacks({ darkMode = true }) {
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [tilted, setTilted] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );
  const [showLabels, setShowLabels] = useState(false);
  const [selected, setSelected] = useState(null);
  const [focusCat, setFocusCat] = useState(null);
  const systemRef = useRef(null);

  const palette = getPalette(darkMode);
  const vars = useMemo(
    () => ({
      ...cssVars(palette),
      '--planet': 'clamp(26px, 5.2vw, 50px)',
    }),
    // palette is derived from darkMode alone
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [darkMode]
  );

  const selectTool = useCallback((tool) => {
    setSelected(tool);
    if (tool) setFocusCat(null);
  }, []);

  const pickFromManifest = (tool) => {
    selectTool(tool);
    systemRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  };

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        };

  const spaceBg = darkMode
    ? 'radial-gradient(ellipse at 50% 45%, rgba(167,0,255,0.18), transparent 60%), radial-gradient(ellipse at 50% 50%, #12122a 0%, #07070f 75%)'
    : 'radial-gradient(ellipse at 50% 45%, rgba(255,0,122,0.12), transparent 60%), radial-gradient(ellipse at 50% 50%, #FFFDF5 0%, #F6EEFF 80%)';

  return (
    <div className="sc-scope space-y-16 sm:space-y-20 pt-6 sm:pt-10" style={vars}>
      <StackStyles />

      {/* ================= HEADER ================= */}
      <header className="space-y-5 sm:space-y-6">
        <motion.p {...reveal(0)} className="sc-acc font-mono text-[11px] uppercase tracking-[0.4em]">
          ~/stack
        </motion.p>
        <motion.h2 {...reveal(0.08)} className="sc-ink text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.95]">
          My Tech <span className="sc-acc">Universe.</span>
        </motion.h2>
        <motion.p {...reveal(0.16)} className="sc-ink text-sm sm:text-lg opacity-70 max-w-2xl leading-relaxed">
          {TOOL_COUNT} tools in {orbits.length} orbits — frontend, backend, mobile, design, AI and shipping — all
          circling the same goal: turning ideas into real, deployed products.
        </motion.p>
      </header>

      {/* ================= SOLAR SYSTEM ================= */}
      <motion.section {...reveal(0)} className="space-y-6">
        <SectionEyebrow label="The System" icon={<Orbit size={16} />} />

        <div className="flex flex-wrap items-center gap-2">
          <ControlButton on={!playing} onClick={() => setPlaying((p) => !p)} label={playing ? 'Pause orbits' : 'Play orbits'}>
            {playing ? <Pause size={13} /> : <Play size={13} />}
            <span className="sc-tc">{playing ? 'Pause' : 'Play'}</span>
          </ControlButton>
          {[0.5, 1, 3].map((s) => (
            <ControlButton key={s} on={speed === s && playing} onClick={() => { setSpeed(s); setPlaying(true); }} label={`${s}× speed`}>
              <span className="sc-tc">{s}×</span>
            </ControlButton>
          ))}
          <span className="w-px h-6 bg-[color:var(--line)] mx-1" />
          <ControlButton on={tilted} onClick={() => setTilted((t) => !t)} label="Toggle 3D tilt">
            <Box size={13} />
            <span className="sc-tc">3D</span>
          </ControlButton>
          <ControlButton on={showLabels} onClick={() => setShowLabels((l) => !l)} label="Toggle labels">
            <Tag size={13} />
            <span className="sc-tc">Labels</span>
          </ControlButton>
          <span className="sc-ink hidden md:flex items-center gap-2 ml-auto font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
            <Hand size={12} /> Drag to spin · hover to slow time · click to scan
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div
            ref={systemRef}
            className="relative overflow-hidden rounded-2xl border border-[color:var(--line)] p-3 sm:p-8"
            style={{ background: spaceBg }}
          >
            {/* star field */}
            <div className="absolute inset-0 pointer-events-none">
              {STARS.map((s, i) => (
                <span
                  key={i}
                  className="sc-anim absolute rounded-full"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: s.s,
                    height: s.s,
                    background: darkMode ? '#FFFFFF' : '#A700FF',
                    opacity: darkMode ? 0.6 : 0.35,
                    animation: `sc-twinkle ${s.t}s ease-in-out ${s.d}s infinite`,
                  }}
                />
              ))}
              <span
                className="sc-anim absolute top-[8%] right-[6%] w-28 h-px rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${darkMode ? '#FFFFFF' : '#FF007A'})`,
                  animation: 'sc-shoot 9s ease-in 2s infinite',
                }}
              />
            </div>

            <div className="relative mx-auto max-w-[820px]">
              <SolarSystem
                darkMode={darkMode}
                reduced={reduced}
                playing={playing}
                speed={speed}
                tilted={tilted}
                showLabels={showLabels}
                selected={selected}
                focusCat={focusCat}
                onSelect={selectTool}
                onSunClick={() => {
                  setSelected(null);
                  setFocusCat(null);
                }}
              />
            </div>

            <p className="sc-ink md:hidden relative mt-2 text-center font-mono text-[9px] uppercase tracking-[0.25em] opacity-50">
              Drag to spin · tap a planet to scan
            </p>
          </div>

          <MissionControl
            selected={selected}
            focusCat={focusCat}
            onFocusCat={(id) => {
              setFocusCat(id);
              if (id) setSelected(null);
            }}
            onClear={() => setSelected(null)}
          />
        </div>
      </motion.section>

      {/* ================= FLIGHT MANIFEST ================= */}
      <motion.section {...reveal(0)} className="space-y-8">
        <SectionEyebrow label="Flight Manifest" icon={<Sun size={16} />} />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {orbits.map((o, oi) => (
            <motion.div
              key={o.id}
              {...reveal(oi * 0.06)}
              className="relative overflow-hidden p-6 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-md space-y-5"
            >
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${o.color}, transparent)` }} />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: rgba(o.color, 0.14), border: `1px solid ${rgba(o.color, 0.4)}`, color: o.color }}
                  >
                    <o.Icon size={18} />
                  </span>
                  <div>
                    <h4 className="sc-ink text-lg font-black tracking-tight leading-tight">{o.title}</h4>
                    <p className="sc-ink text-xs opacity-60">{o.subtitle}</p>
                  </div>
                </div>
                <span className="sc-cat font-mono text-[10px] font-black uppercase tracking-widest shrink-0" style={{ '--c': o.color }}>
                  Orbit {pad2(oi + 1)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {o.planets.map((p) => {
                  const on = selected?.key === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => pickFromManifest(p)}
                      className={`inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all hover:-translate-y-0.5 ${
                        on ? 'border-transparent' : 'border-[color:var(--line)] hover:border-[color:var(--acc-line)]'
                      }`}
                      style={on ? { background: rgba(o.color, 0.18), borderColor: o.color } : undefined}
                    >
                      <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-1" style={{ fontSize: 9 }}>
                        <ToolLogo tool={p} />
                      </span>
                      <span className="sc-ink text-[11px] font-black">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================= MISSION PROTOCOLS ================= */}
      <motion.section {...reveal(0)} className="space-y-8">
        <SectionEyebrow label="Mission Protocols" icon={<Workflow size={16} />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 sm:gap-5">
          {methodologies.map((m, i) => (
            <motion.div
              key={m.name}
              {...reveal(i * 0.06)}
              className="group p-5 sm:p-6 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-md flex flex-col items-center text-center gap-3 transition-all hover:border-[color:var(--acc-line)] hover:-translate-y-1"
            >
              <span className="w-12 h-12 rounded-full flex items-center justify-center bg-[color:var(--acc-soft)] border border-[color:var(--acc-line)] text-[color:var(--acc)] transition-transform duration-500 group-hover:rotate-[360deg]">
                <m.Icon size={20} />
              </span>
              <p className="sc-acc text-[11px] font-black uppercase tracking-widest">{m.name}</p>
              <p className="sc-ink text-xs opacity-60 leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

export default Stacks;
