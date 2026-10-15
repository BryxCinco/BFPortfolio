import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring, animate } from 'framer-motion';
import { Download, ArrowRight, ArrowUpRight, MapPin, Sparkles, Coffee, Heart, MousePointer2 } from 'lucide-react';

import { getPalette, cssVars } from './theme';
import { CertificationsPreview } from './Certifications';

import brianCV from './assets/Brian_Paul_Francisco_CV.pdf';
import brian1 from './assets/Brian1.png';
import brian2 from './assets/Brian2.png';
import brian3 from './assets/Brian3.png';
import brian4 from './assets/Brian4.png';
import brian5 from './assets/Brian5.png';
import brian6 from './assets/Brian6.png';
import tideImg from './assets/Tide.png';
import poopipooImg from './assets/Poopipoo.png';
import neoChessImg from './assets/NeoChessXD.png';
import sweepImg from './assets/SweepXpress.png';

// ============================================================================
// HOME.JSX — modern layout with a hand-made feel: handwritten notes, doodles
// that draw themselves, a taped polaroid with draggable stickers, and a
// scattered photo wall. Every animation is transform/opacity only.
// ============================================================================

// a draggable sticker pinned to the polaroid. Its spot is a percentage of the
// polaroid, so it scales with it; after a resize or browser zoom it springs
// back home instead of staying at an old pixel offset away from the photo.
const HeroSticker = ({ sticker: s, index, reduced, constraints }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    let t = 0;
    const home = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 26 });
        animate(y, 0, { type: 'spring', stiffness: 300, damping: 26 });
      }, 120);
    };
    window.addEventListener('resize', home);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', home);
    };
  }, [x, y]);

  return (
    <motion.div
      drag={!reduced}
      dragConstraints={constraints}
      dragElastic={0.18}
      dragMomentum={false}
      whileDrag={{ scale: 1.12, rotate: 0, zIndex: 30, boxShadow: '0 18px 30px rgba(0,0,0,0.3)' }}
      initial={reduced ? false : { opacity: 0, scale: 0.4, rotate: s.rot * 3 }}
      animate={{ opacity: 1, scale: 1, rotate: s.rot }}
      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.9 + index * 0.12 }}
      className="cursor-target absolute z-20 cursor-grab active:cursor-grabbing touch-none select-none px-3.5 py-2 rounded-lg shadow-lg"
      style={{ ...s.pos, x, y, background: s.bg }}
    >
      <span className="hm-dark text-[0.6875rem] sm:text-xs font-black whitespace-nowrap">{s.label}</span>
    </motion.div>
  );
};

const ROLES = ['Full-stack developer', 'UI/UX designer', 'Mobile app builder', 'Coffee-powered problem solver'];

const STICKERS = [
  { label: '⭐ 1.25 GWA', bg: '#FFE873', rot: -8, pos: { left: '-8%', top: '8%' } },
  { label: '🎓 BSIT grad', bg: '#FFB8D9', rot: 6, pos: { right: '-10%', top: '22%' } },
  { label: '💼 Intern @ Grandline', bg: '#B8FFE4', rot: -4, pos: { left: '-12%', bottom: '24%' } },
  { label: '🚀 3 apps shipped', bg: '#D4C2FF', rot: 7, pos: { right: '-6%', bottom: '8%' } },
];

const TOOLS = [
  ['React', 'https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/react/react-original.svg'],
  ['Next.js', 'https://cdn.simpleicons.org/nextdotjs/000000'],
  ['TypeScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/typescript/typescript-original.svg'],
  ['Expo', 'https://cdn.simpleicons.org/expo/000020'],
  ['Node.js', 'https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/nodejs/nodejs-original.svg'],
  ['Supabase', 'https://cdn.simpleicons.org/supabase/3FCF8E'],
  ['PostgreSQL', 'https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/postgresql/postgresql-original.svg'],
  ['PHP', 'https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/php/php-original.svg'],
  ['MySQL', 'https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/mysql/mysql-original.svg'],
  ['Tailwind', 'https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/tailwindcss/tailwindcss-original.svg'],
  ['Figma', 'https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/figma/figma-original.svg'],
  ['Vercel', 'https://cdn.simpleicons.org/vercel/000000'],
];

const WORK = [
  { name: 'TIDE', tag: 'AI productivity coach', line: 'Focus timers, journaling and gamified daily quests.', img: tideImg, url: 'https://tide-rust.vercel.app/', note: 'my fave ♥', rot: -1.6 },
  { name: 'Poopipoo', tag: 'Crowdsourced toilet finder', line: 'Community-mapped restrooms around Metro Manila.', img: poopipooImg, url: 'https://poopipoo.vercel.app/', rot: 1.2 },
  { name: 'Neo Chess XD', tag: '8-bit chess game', line: 'Retro chess with PvP, a CPU rival and timed matches.', img: neoChessImg, url: 'https://neo-chess-xd.vercel.app/', rot: -1 },
  { name: 'SweepXpress', tag: 'Logistics dashboard', line: 'Real-time orders, inventory and audit-logged sign-ins.', img: sweepImg, rot: 1.6 },
];

const FACTS = [
  { k: 'Status', v: 'Fresh BSIT graduate' },
  { k: 'School', v: 'National Teachers College' },
  { k: 'Based in', v: 'Sta. Cruz, Manila' },
  { k: 'Focus', v: 'Full-stack & UI/UX' },
];

const NOW = [
  { emoji: '💼', text: 'Interning at Grandline Maritime' },
  { emoji: '🚀', text: 'Shipping TIDE, Poopipoo & Neo Chess XD' },
  { emoji: '📜', text: 'Collecting certificates — 32 and counting' },
];

const GALLERY = [
  { img: brian2, rot: -5, cap: 'snapshot 01' },
  { img: brian3, rot: 4, cap: 'snapshot 02' },
  { img: brian4, rot: -2, cap: 'snapshot 03' },
  { img: brian5, rot: 5, cap: 'snapshot 04' },
  { img: brian6, rot: -4, cap: 'snapshot 05' },
];

// ============================================================================
// STYLES — scoped colour classes beat the global `.light/.dark h1..span`
// `!important` overrides in index.css.
// ============================================================================

const HomeStyles = () => (
  <style>{`
    .hm-scope :is(h1,h2,h3,h4,p,span,li).hm-acc { color: var(--acc) !important; }
    .hm-scope :is(h1,h2,h3,h4,p,span,li).hm-ink { color: var(--ink) !important; }
    .hm-scope :is(h1,h2,h3,h4,p,span,li).hm-dark { color: #1B1B2A !important; }
    .hm-scope :is(h1,h2,h3,h4,p,span,li).hm-white { color: #FFFFFF !important; }
    .hm-scope :is(h1,h2,h3,h4,p,span,li).hm-tc { color: var(--tc) !important; }
    .hm-scope :is(h1,h2,h3,h4,p,span,li).hm-inherit { color: inherit !important; }
    .hm-hand { font-family: 'Caveat', 'Segoe Print', 'Bradley Hand', cursive; font-weight: 700; letter-spacing: 0; }
    @keyframes hm-wave { 0%, 60%, 100% { transform: rotate(0deg); } 10%, 30% { transform: rotate(16deg); } 20% { transform: rotate(-8deg); } 40% { transform: rotate(-4deg); } 50% { transform: rotate(10deg); } }
    @keyframes hm-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes hm-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    @keyframes hm-pulse { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.4); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .hm-anim { animation: none !important; } }
  `}</style>
);

// ============================================================================
// SMALL PIECES
// ============================================================================

const useManilaTime = () => {
  const fmt = () =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const t = setInterval(() => setTime(fmt()), 30000);
    return () => clearInterval(t);
  }, []);
  return time;
};

// headline words slide up out of a mask, one after another
const WordReveal = ({ text, delay = 0, reduced, className = '' }) => (
  <span className={className}>
    {text.split(' ').map((w, i) => (
      <span key={`${w}-${i}`} className="hm-inherit inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
        <motion.span
          className="hm-inherit inline-block"
          initial={reduced ? false : { y: '110%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 0.8, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}&nbsp;
        </motion.span>
      </span>
    ))}
  </span>
);

// a hand-drawn stroke that draws itself in
const Scribble = ({ d, delay = 0, reduced, className = '', viewBox, strokeWidth = 4 }) => (
  <svg viewBox={viewBox} className={className} fill="none" aria-hidden="true" preserveAspectRatio="none">
    <motion.path
      d={d}
      stroke="var(--acc)"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={reduced ? false : { pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ease: 'easeInOut' }}
    />
  </svg>
);

// button that leans toward the cursor
const Magnetic = ({ children, reduced, className = '', style, ...props }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });
  const Tag = props.href ? motion.a : motion.button;
  return (
    <Tag
      {...props}
      className={className}
      style={{ ...style, x: sx, y: sy }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.25);
        y.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </Tag>
  );
};

const Tape = ({ className = '', rot = 0 }) => (
  <span
    className={`absolute h-7 w-24 ${className}`}
    style={{
      transform: `rotate(${rot}deg)`,
      background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0 6px, rgba(255,255,255,0.4) 6px 12px)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
      backdropFilter: 'none',
    }}
  />
);

const SectionHead = ({ title, note, noteRot = -3, children }) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div className="relative">
      <h2 className="hm-ink text-3xl sm:text-5xl font-black tracking-tighter leading-none">{title}</h2>
      {note && (
        <span
          className="hm-hand hm-acc block mt-2 sm:mt-0 sm:absolute sm:-top-7 sm:left-full sm:ml-2 whitespace-nowrap text-xl sm:text-2xl"
          style={{ transform: `rotate(${noteRot}deg)` }}
        >
          {note}
        </span>
      )}
    </div>
    {children}
  </div>
);

// ============================================================================
// MAIN
// ============================================================================

const Home = ({ darkMode = true, onNavigate, onPreview }) => {
  const reduced = useReducedMotion();
  const vars = useMemo(() => cssVars(getPalette(darkMode)), [darkMode]);
  const time = useManilaTime();
  const heroRef = useRef(null);
  const [role, setRole] = useState(0);

  useEffect(() => {
    if (reduced) return undefined;
    const t = setInterval(() => setRole((r) => (r + 1) % ROLES.length), 2600);
    return () => clearInterval(t);
  }, [reduced]);

  const reveal = (delay = 0, y = 28) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        };

  const go = (id) => onNavigate?.(id);

  return (
    <div className="hm-scope space-y-28 sm:space-y-36 pb-10" style={vars}>
      <HomeStyles />

      {/* ================= HERO ================= */}
      <section ref={heroRef} className="relative grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-14 lg:gap-10 items-center pt-6 sm:pt-12">
        <div className="relative space-y-7 sm:space-y-8 text-center lg:text-left">
          <motion.div
            {...reveal(0, 12)}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[color:var(--acc-line)] bg-[color:var(--acc-soft)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="hm-anim absolute inline-flex h-full w-full rounded-full bg-[#00C48C]" style={{ animation: 'hm-pulse 1.8s ease-out infinite' }} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C48C]" />
            </span>
            <span className="hm-ink text-[0.625rem] sm:text-[0.6875rem] font-black uppercase tracking-[0.2em]">
              Available for work · Manila · {time}
            </span>
          </motion.div>

          <div className="relative">
            {/* handwritten aside + doodle arrow pointing at the name */}
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 8, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="hm-hand hm-acc hidden sm:block absolute -top-9 left-[52%] lg:left-[46%] text-2xl sm:text-3xl whitespace-nowrap"
            >
              hey there, nice to meet you!
            </motion.span>
            <Scribble
              viewBox="0 0 80 60"
              className="hidden sm:block absolute -top-4 left-[45%] lg:left-[39%] w-14 h-11"
              d="M70 6 C 50 4, 28 14, 14 44 M14 44 L 10 30 M14 44 L 27 38"
              delay={1.1}
              reduced={reduced}
              strokeWidth={3}
            />

            <h1 className="hm-ink text-5xl sm:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.95]">
              <WordReveal text="Hi, I'm Brian." reduced={reduced} />
              <span
                className="hm-anim inline-block origin-[70%_70%]"
                style={{ animation: 'hm-wave 2.6s ease-in-out 1.2s infinite' }}
                role="img"
                aria-label="waving hand"
              >
                👋
              </span>
            </h1>
          </div>

          <h2 className="hm-ink text-2xl sm:text-4xl xl:text-5xl font-black tracking-tight leading-[1.1] opacity-90">
            <WordReveal text="I build things people" delay={0.35} reduced={reduced} />
            <br className="hidden sm:block" />
            <WordReveal text="actually" delay={0.6} reduced={reduced} />
            <span className="relative inline-block">
              <WordReveal text="enjoy using." delay={0.7} reduced={reduced} className="hm-acc" />
              <Scribble
                viewBox="0 0 300 20"
                className="absolute left-0 -bottom-2 w-[95%] h-3 sm:h-4"
                d="M4 14 C 60 4, 120 18, 180 9 S 260 6, 296 12"
                delay={1.3}
                reduced={reduced}
              />
            </span>
          </h2>

          <div className="hm-ink flex items-center justify-center lg:justify-start gap-2 text-base sm:text-xl font-bold h-8 overflow-hidden">
            <span className="hm-ink opacity-60">—</span>
            <motion.span
              key={role}
              className="hm-acc inline-block"
              initial={reduced ? false : { y: 26, opacity: 0, rotateX: -60 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {ROLES[role]}
            </motion.span>
          </div>

          <motion.p {...reveal(0.5)} className="hm-ink text-sm sm:text-lg leading-relaxed opacity-75 max-w-xl mx-auto lg:mx-0">
            A fresh BSIT grad from Manila who loves turning messy ideas into apps that feel calm, fast and a little
            bit delightful — from React and Next.js on the web to Expo on mobile.
          </motion.p>

          <motion.div {...reveal(0.6)} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
            <Magnetic
              href={brianCV}
              download="Brian_Paul_Francisco_CV.pdf"
              reduced={reduced}
              className="cursor-target group inline-flex items-center gap-3 px-7 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_14px_30px_-10px_var(--acc-glow)]"
              style={{ background: 'var(--acc)', color: 'var(--acc-ink)' }}
            >
              <Download size={16} className="transition-transform group-hover:translate-y-0.5" /> Download CV
            </Magnetic>
            <Magnetic
              onClick={() => go('projects')}
              reduced={reduced}
              className="cursor-target group inline-flex items-center gap-3 px-7 py-4 rounded-full border-2 border-[color:var(--ink)] font-black text-xs uppercase tracking-widest"
              style={{ color: 'var(--ink)' }}
            >
              See my work <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Magnetic>
            <button onClick={() => go('contact')} className="cursor-target hm-hand hm-acc text-2xl hover:underline underline-offset-4 decoration-wavy" style={{ color: 'var(--acc)' }}>
              or just say hi →
            </button>
          </motion.div>
        </div>

        {/* polaroid + draggable stickers */}
        <div className="relative mx-auto w-[72%] sm:w-[60%] lg:w-[80%] max-w-[25rem]">
          <motion.div
            initial={reduced ? false : { opacity: 0, rotate: -14, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, rotate: 3, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.3 }}
            whileHover={reduced ? undefined : { rotate: 0, scale: 1.02 }}
            className="relative bg-white p-3 sm:p-4 pb-16 sm:pb-20 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]"
          >
            <Tape className="-top-3 left-1/2 -ml-12" rot={-4} />
            <div className="aspect-[4/5] overflow-hidden bg-neutral-200">
              <img src={brian1} alt="Brian Paul Francisco" className="w-full h-full object-cover" draggable={false} />
            </div>
            <span className="hm-hand hm-dark absolute bottom-4 sm:bottom-5 inset-x-0 text-center text-2xl sm:text-3xl" style={{ transform: 'rotate(-2deg)' }}>
              me, probably debugging ☕
            </span>
          </motion.div>

          {STICKERS.map((s, i) => (
            <HeroSticker key={s.label} sticker={s} index={i} reduced={reduced} constraints={heroRef} />
          ))}

          <span className="hm-hand hm-ink hidden sm:flex absolute -bottom-14 left-1/2 -translate-x-1/2 items-center gap-1.5 whitespace-nowrap text-xl opacity-60">
            <MousePointer2 size={14} /> psst — drag the stickers
          </span>
        </div>
      </section>

      {/* ================= TOOL MARQUEE ================= */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-12 overflow-hidden py-5 border-y border-[color:var(--line)]" aria-label="Tools I use">
        <div className="hm-anim flex w-max gap-10 sm:gap-14" style={{ animation: 'hm-marquee 38s linear infinite' }}>
          {[...TOOLS, ...TOOLS].map(([name, logo], i) => (
            <span key={`${name}-${i}`} className="flex items-center gap-3 shrink-0">
              <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center p-1.5 shadow-sm">
                <img src={logo} alt="" loading="lazy" className="w-full h-full object-contain" />
              </span>
              <span className="hm-ink text-sm sm:text-base font-black tracking-tight">{name}</span>
              <Sparkles size={14} className="text-[color:var(--acc)] ml-6 sm:ml-8 opacity-70" />
            </span>
          ))}
        </div>
      </section>

      {/* ================= ABOUT BENTO ================= */}
      <section className="space-y-10">
        <motion.div {...reveal(0)}>
          <SectionHead title="The short version." note="(I promise it's short)" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <motion.div
            {...reveal(0.05)}
            className="lg:col-span-2 relative p-7 sm:p-10 rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] overflow-hidden"
          >
            <p className="hm-ink text-lg sm:text-2xl font-bold leading-relaxed">
              I&apos;m Brian Paul Francisco — I fell in love with code the moment a page I wrote actually
              <span className="hm-acc"> did something</span>. Four years of BSIT later, I build full-stack web and
              mobile apps, and I care just as much about how they <span className="hm-acc">feel</span> as how they work.
            </p>
            <div className="mt-8 flex items-end justify-between gap-4">
              <span className="hm-hand hm-acc text-4xl sm:text-5xl" style={{ transform: 'rotate(-4deg)', display: 'inline-block' }}>
                — Brian
              </span>
              <button
                onClick={() => go('about')}
                className="cursor-target inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[color:var(--acc-line)] text-[0.6875rem] font-black uppercase tracking-widest hover:bg-[color:var(--acc-soft)] transition-colors"
                style={{ color: 'var(--acc)' }}
              >
                Full story <ArrowUpRight size={14} />
              </button>
            </div>
          </motion.div>

          <motion.div {...reveal(0.12)} className="p-7 sm:p-8 rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] space-y-5">
            <p className="hm-acc font-mono text-[0.625rem] uppercase tracking-[0.3em]">Quick facts</p>
            {FACTS.map((f) => (
              <div key={f.k} className="flex items-baseline justify-between gap-4 border-b border-dashed border-[color:var(--line)] pb-3 last:border-0 last:pb-0">
                <span className="hm-ink text-[0.6875rem] font-black uppercase tracking-widest opacity-50">{f.k}</span>
                <span className="hm-ink text-sm sm:text-base font-black text-right">{f.v}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            {...reveal(0.08)}
            className="relative p-7 sm:p-8 rounded-3xl shadow-xl"
            style={{ background: '#FFE873', transform: 'rotate(-1.2deg)' }}
          >
            <Tape className="-top-3 right-8" rot={6} />
            <p className="hm-hand hm-dark text-3xl mb-4">right now…</p>
            <ul className="space-y-3">
              {NOW.map((n) => (
                <li key={n.text} className="hm-dark flex items-start gap-3 text-sm sm:text-base font-bold">
                  <span>{n.emoji}</span>
                  <span className="hm-dark">{n.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            {...reveal(0.14)}
            className="lg:col-span-2 relative p-7 sm:p-10 rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FF007A, #A700FF)' }}
          >
            <Heart className="absolute -right-6 -bottom-8 w-44 h-44 text-white opacity-10 -rotate-12" />
            <p className="hm-white font-mono text-[0.625rem] uppercase tracking-[0.3em] opacity-80">How I think about it</p>
            <p className="hm-white mt-4 text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              &ldquo;Turning complex logic into seamless experiences.&rdquo;
            </p>
            <p className="hm-hand hm-white mt-5 text-2xl sm:text-3xl" style={{ transform: 'rotate(-2deg)', display: 'inline-block' }}>
              persistence over perfection ✌️
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= SELECTED WORK ================= */}
      <section className="space-y-10">
        <motion.div {...reveal(0)}>
          <SectionHead title="Things I've made." note="(click one!)" noteRot={-5}>
            <button
              onClick={() => go('projects')}
              className="cursor-target group inline-flex items-center gap-2 text-[0.6875rem] font-black uppercase tracking-widest"
              style={{ color: 'var(--acc)' }}
            >
              View all projects <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </SectionHead>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 sm:gap-6">
          {WORK.map((w, i) => (
            <motion.button
              key={w.name}
              {...reveal(i * 0.08, 40)}
              onClick={() => (w.url ? window.open(w.url, '_blank', 'noopener,noreferrer') : go('projects'))}
              aria-label={w.url ? `Open ${w.name} live site` : `See ${w.name} in projects`}
              whileHover={reduced ? undefined : { rotate: 0, y: -8 }}
              className="cursor-target group relative text-left rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-3 shadow-[0_20px_40px_-25px_rgba(0,0,0,0.5)]"
              style={{ rotate: reduced ? 0 : w.rot }}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-200">
                <img
                  src={w.img}
                  alt={`${w.name} screenshot`}
                  loading="lazy"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                />
                <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all">
                  <ArrowUpRight size={16} className="text-[#1B1B2A]" />
                </span>
              </div>
              <div className="px-3 pt-5 pb-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="hm-acc text-[0.625rem] font-black uppercase tracking-[0.2em]">{w.tag}</p>
                  {w.url && (
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00C48C]" />
                      <span className="hm-ink text-[0.5625rem] font-black uppercase tracking-widest opacity-70">Live</span>
                    </span>
                  )}
                </div>
                <h3 className="hm-ink text-xl font-black tracking-tight">{w.name}</h3>
                <p className="hm-ink text-sm opacity-65 leading-snug">{w.line}</p>
              </div>
              {w.note && (
                <span
                  className="hm-hand absolute -top-5 -left-3 px-3 py-0.5 rounded-md text-xl shadow-md"
                  style={{ background: '#FFB8D9', transform: 'rotate(-8deg)' }}
                >
                  <span className="hm-dark">{w.note}</span>
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      {/* ================= CERTIFICATIONS ================= */}
      <section>
        <CertificationsPreview darkMode={darkMode} count={4} onViewAll={() => go('certificates')} />
      </section>

      {/* ================= LIFE OUTSIDE CODE ================= */}
      <section className="space-y-12">
        <motion.div {...reveal(0)}>
          <SectionHead title="Life outside code." note="(yes, I go outside)" noteRot={-4} />
        </motion.div>
        <div className="flex sm:flex-wrap sm:justify-center gap-6 sm:gap-8 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-6 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none' }}>
          {GALLERY.map((g, i) => (
            <motion.button
              key={g.cap}
              {...reveal(i * 0.07, 30)}
              onClick={() => onPreview?.(g.img)}
              whileHover={reduced ? undefined : { rotate: 0, y: -10, scale: 1.04, zIndex: 10 }}
              className="cursor-target relative shrink-0 snap-center w-[62vw] sm:w-[13.75rem] lg:w-[15rem] bg-white p-2.5 pb-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.45)]"
              style={{ rotate: reduced ? 0 : g.rot }}
              aria-label={`Open ${g.cap}`}
            >
              {i % 2 === 0 && <Tape className="-top-3 left-1/2 -ml-12" rot={i % 4 === 0 ? -6 : 5} />}
              <div className="aspect-square overflow-hidden bg-neutral-200">
                <img src={g.img} alt="" loading="lazy" className="w-full h-full object-cover" />
              </div>
              <span className="hm-hand hm-dark absolute bottom-2.5 inset-x-0 text-center text-xl">{g.cap}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ================= CLOSING CTA ================= */}
      <motion.section {...reveal(0)} className="relative text-center py-10 sm:py-16">
        <p className="hm-acc font-mono text-[0.6875rem] uppercase tracking-[0.35em]">What&apos;s next?</p>
        <h2 className="hm-ink mt-5 text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.95]">
          Got an idea?
          <br />
          <span className="relative inline-block">
            <span className="hm-acc">Let&apos;s build it.</span>
            <Scribble
              viewBox="0 0 300 20"
              className="absolute left-0 -bottom-3 w-full h-4"
              d="M4 12 C 70 2, 140 18, 210 8 S 280 10, 296 6"
              delay={0.3}
              reduced={reduced}
            />
          </span>
        </h2>
        <div className="mt-10 flex flex-col items-center gap-4">
          <Magnetic
            onClick={() => go('contact')}
            reduced={reduced}
            className="cursor-target group inline-flex items-center gap-3 px-9 py-5 rounded-full font-black text-sm uppercase tracking-widest shadow-[0_18px_40px_-12px_var(--acc-glow)]"
            style={{ background: 'var(--acc)', color: 'var(--acc-ink)' }}
          >
            Say hello <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Magnetic>
          <span className="hm-hand hm-ink text-2xl opacity-70" style={{ transform: 'rotate(-2deg)' }}>
            (I usually reply within 24 hours, promise)
          </span>
          <span className="hm-ink flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-50">
            <MapPin size={13} /> Manila, PH <Coffee size={13} className="ml-2" /> powered by coffee
          </span>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
