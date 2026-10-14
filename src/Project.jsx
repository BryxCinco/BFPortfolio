import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Globe,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  MousePointerClick,
  ArrowUpRight,
  Rocket,
  Zap,
} from 'lucide-react';

import Carousel from './Carousel';
import { rgba, getPalette, cssVars } from './theme';
import tideSite from './assets/Tide.png';
import poopipooSite from './assets/Poopipoo.png';
import neoChessSite from './assets/NeoChessXD.png';
import sweepXpressSite from './assets/SweepXpress.png';

import adventurePoster from './assets/Keep On Keeping On.png';
import lamboPoster from './assets/Lambo Poster.png';
import dronePoster from './assets/Drown Poster.png';
import matchaPoster from './assets/Matcha Poster.png';
import musicFestPoster from './assets/Music Fest Poster.png';

// ============================================================================
// DATA
// ============================================================================

const websites = [
  {
    name: 'TIDE',
    subtitle: 'Time · Interest · Diary · Entry',
    tag: 'AI Productivity App',
    desc: 'A personal productivity coach that brings focus sessions, journaling, tasks, and habit tracking into one calm dashboard — with an AI coach that turns your routine into daily quests worth showing up for.',
    highlights: [
      'Gamified daily quests with XP, rarity tiers, and streaks',
      'Focus timer, journal, tasks, and activity insights in one place',
      'Built-in AI Coach for reflection and quest generation',
    ],
    stack: ['React Native', 'Expo', 'AI Integration', 'Vercel'],
    image: tideSite,
    url: 'https://tide-rust.vercel.app/',
    featured: true,
  },
  {
    name: 'Poopipoo',
    subtitle: 'Crowdsourced Toilet Finder',
    tag: 'Community Map App',
    desc: 'When nature calls in Metro Manila, Poopipoo shows you the nearest public restroom. Users pin, browse, and rate toilets on a live map, so the community keeps the data fresh.',
    highlights: [
      'Interactive map with search and one-tap “Near Me”',
      'Community-submitted restroom pins with map and list views',
      'Mobile-first layout with an AI assistant shortcut',
    ],
    stack: ['Next.js', 'React', 'OpenStreetMap', 'Vercel'],
    image: poopipooSite,
    url: 'https://poopipoo.vercel.app/',
  },
  {
    name: 'Neo Chess XD',
    subtitle: '8-Bit Chess Game',
    tag: 'Retro Browser Game',
    desc: 'Classic chess wrapped in a pixel-arcade shell. Pick your mode, set the clock, and hit “Push Start” — then pick up where you left off with saved matches.',
    highlights: [
      'Local 1v1 PvP or a match against the CPU',
      'Six time-control presets, from 30-second blitz to no limit',
      'Saved-match data and toggleable chiptune audio',
    ],
    stack: ['React', 'Vite', 'JavaScript', 'Vercel'],
    image: neoChessSite,
    url: 'https://neo-chess-xd.vercel.app/',
  },
  {
    name: 'SweepXpress',
    subtitle: 'Logistics Admin Dashboard',
    tag: 'Logistics System',
    desc: 'A secured admin control panel for monitoring orders, inventory, and customers in real time, with audit-logged sign-ins for accountability.',
    highlights: [
      'Real-time order, inventory, and customer monitoring',
      'Audit-logged admin sign-ins',
    ],
    stack: ['PHP', 'MySQL', 'Tailwind'],
    image: sweepXpressSite,
    url: '#',
  },
];

const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
};

const posters = [
  {
    name: 'Adventure Awaits',
    tag: 'Travel & Outdoor',
    desc: 'A warm, layered forest silhouette poster built around a hand-lettered script mark — made to invite wanderlust at a glance.',
    image: adventurePoster,
  },
  {
    name: 'Huracán — Instinctive Technology',
    tag: 'Automotive Print Ad',
    desc: 'A moody, high-contrast automotive spread pairing a matte hero shot with a macro detail — precision engineering rendered in near-black tones.',
    image: lamboPoster,
  },
  {
    name: 'Advanced Drone System',
    tag: 'Product & E-Commerce',
    desc: 'A specs-first product poster over a coastal sunset backdrop, built to sell performance features and a limited-time offer at a glance.',
    image: dronePoster,
  },
  {
    name: 'HookieCoofie — Matcha Special',
    tag: 'Cafe Promo Poster',
    desc: 'A breezy, leaf-strewn promo for a seasonal matcha menu, priced clearly and finished with a bold savings callout.',
    image: matchaPoster,
  },
  {
    name: 'Eclipse — Midnight Music Fest',
    tag: 'Event Poster',
    desc: 'A neon-drenched rave flyer built around a lunar eclipse motif, with tiered ticketing laid out for fast scanning on the go.',
    image: musicFestPoster,
  },
];

// ============================================================================
// STYLES
// ============================================================================

const ProjectStyles = () => (
  <style>{`
    @keyframes pj-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    @keyframes pj-scan { 0% { transform: translateY(-120%); } 100% { transform: translateY(320%); } }
    @keyframes pj-spin { to { transform: rotate(360deg); } }
    @keyframes pj-blink { 50% { opacity: 0; } }
    @keyframes pj-glitch {
      0%, 100% { clip-path: inset(100% 0 0 0); transform: translate(0); }
      15% { clip-path: inset(10% 0 62% 0); transform: translate(-4px, 1px); }
      30% { clip-path: inset(52% 0 18% 0); transform: translate(4px, -1px); }
      45% { clip-path: inset(100% 0 0 0); }
      70% { clip-path: inset(30% 0 44% 0); transform: translate(-3px, 0); }
      85% { clip-path: inset(72% 0 4% 0); transform: translate(3px, 1px); }
    }
    @keyframes pj-log-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
    .pj-scope :is(h1,h2,h3,h4,p,span,li).pj-acc { color: var(--acc) !important; }
    .pj-scope :is(h1,h2,h3,h4,p,span,li).pj-hi { color: var(--acc-hi) !important; }
    .pj-scope :is(h1,h2,h3,h4,p,span,li).pj-acc2 { color: var(--acc2) !important; }
    .pj-scope :is(h1,h2,h3,h4,p,span,li).pj-ink { color: var(--ink) !important; }
    .pj-scope :is(h1,h2,h3,h4,p,span,li).pj-white { color: #ffffff !important; }
    .pj-scope :is(h1,h2,h3,h4,p,span,li).pj-inherit { color: inherit !important; }
    .pj-shimmer::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, var(--acc-soft), transparent);
      animation: pj-shimmer 1.4s infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .pj-anim, .pj-shimmer::after { animation: none !important; }
    }
  `}</style>
);

// ============================================================================
// HOOKS
// ============================================================================

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.(REDUCED_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia?.(REDUCED_QUERY);
    if (!mq?.addEventListener) return undefined;
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
};

const useInViewOnce = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, inView]);
  return [ref, inView];
};

// ============================================================================
// SECTION EYEBROW
// ============================================================================

const SectionEyebrow = ({ label, icon }) => (
  <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
    <h3 className="pj-acc text-[10px] sm:text-[11px] md:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] whitespace-nowrap">
      {label}
    </h3>
    <div className="h-px flex-1 bg-[color:var(--acc-line)] min-w-5" />
    <span className="pj-acc">{icon}</span>
  </div>
);

// ============================================================================
// REVEAL IMAGE — shimmer + grid skeleton until loaded, then blur-to-sharp
// ============================================================================

const RevealImage = ({ src, alt, active = true, imgClassName = '' }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) setLoaded(true);
  }, [src]);

  const sharp = loaded && active;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {!loaded && (
        <div className="pj-shimmer absolute inset-0 bg-[color:var(--surface-strong)] flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'linear-gradient(var(--acc-soft) 1px, transparent 1px), linear-gradient(90deg, var(--acc-soft) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <span className="pj-acc relative font-mono text-[10px] uppercase tracking-[0.3em]">
            Loading
            <span className="pj-anim pj-inherit" style={{ animation: 'pj-blink 1s steps(1) infinite' }}>_</span>
          </span>
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        draggable={false}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${imgClassName}`}
        style={{
          opacity: loaded ? 1 : 0,
          filter: sharp ? 'blur(0px) saturate(1)' : 'blur(14px) saturate(0.4)',
          transform: sharp ? 'scale(1)' : 'scale(1.08)',
          transition: 'opacity 500ms ease, filter 900ms ease-out, transform 900ms ease-out',
        }}
      />
    </div>
  );
};

// ============================================================================
// LAUNCH BUTTON
// ============================================================================

const LaunchButton = ({ site, live, onLaunch }) => (
  <button
    onClick={(e) => live && onLaunch(site, e)}
    disabled={!live}
    title={live ? `Launch ${site.name}` : 'Live link coming soon'}
    className={`group/btn relative inline-flex items-center overflow-hidden px-5 py-2.5 sm:px-6 sm:py-3 rounded-md border text-[11px] sm:text-[12px] font-black uppercase tracking-[0.18em] transition-[color,border-color,transform] duration-300 active:scale-[0.96] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)] ${
      live
        ? 'border-[color:var(--acc-line)] text-[color:var(--acc)] hover:text-[color:var(--acc-ink)] hover:border-[color:var(--acc)]'
        : 'border-[color:var(--line)] text-[color:var(--ink)] opacity-40 cursor-not-allowed'
    }`}
  >
    {live && (
      <span className="absolute inset-0 bg-[color:var(--acc)] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
    )}
    <span className="pj-inherit relative flex items-center gap-2">
      <Rocket size={14} className="transition-transform duration-300 group-hover/btn:-rotate-12 group-hover/btn:-translate-y-0.5" />
      {live ? 'Launch Site' : 'Coming Soon'}
      <ArrowUpRight size={13} className="opacity-60 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
    </span>
  </button>
);

// ============================================================================
// PROJECT CARD — staggered wipe-in, 3D tilt, cursor spotlight
// ============================================================================

const ProjectCard = ({ site, index, reduced, onPreview, onLaunch }) => {
  const [revealRef, inView] = useInViewOnce(0.15);
  const cardRef = useRef(null);
  const host = hostOf(site.url);
  const live = !!host;
  const shown = inView || reduced;
  const baseDelay = site.featured ? 0 : (index % 3) * 120;

  const handleMove = (e) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const max = site.featured ? 3 : 7;
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
    el.style.transform = `perspective(1100px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-4px)`;
  };

  const handleLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = '';
  };

  const step = (n) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : 'translateY(14px)',
    transition: 'opacity 600ms ease, transform 600ms cubic-bezier(0.22,1,0.36,1)',
    transitionDelay: reduced ? '0ms' : `${baseDelay + 300 + n * 70}ms`,
  });

  return (
    <div
      ref={revealRef}
      className={site.featured ? 'md:col-span-2 xl:col-span-3' : ''}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(40px)',
        transition: 'opacity 800ms ease, transform 800ms cubic-bezier(0.22,1,0.36,1)',
        transitionDelay: reduced ? '0ms' : `${baseDelay}ms`,
      }}
    >
      <article
        ref={cardRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className={`group relative h-full flex flex-col overflow-hidden rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-md shadow-lg transition-[transform,box-shadow,border-color] duration-200 ease-out hover:border-[color:var(--acc-line)] hover:shadow-[0_25px_50px_-12px_var(--acc-glow)] ${
          site.featured ? 'lg:grid lg:grid-cols-[1.25fr_1fr]' : ''
        }`}
      >
        {/* cursor spotlight */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'radial-gradient(460px circle at var(--mx, 50%) var(--my, 50%), var(--acc-soft), transparent 60%)' }}
        />

        <button
          onClick={() => onPreview(site)}
          aria-label={`Preview ${site.name}`}
          className={`relative w-full overflow-hidden block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--acc)] ${
            site.featured ? 'aspect-video lg:aspect-auto lg:h-full lg:min-h-[400px]' : 'aspect-video'
          }`}
          style={{
            clipPath: shown ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
            transition: 'clip-path 1000ms cubic-bezier(0.77,0,0.18,1)',
            transitionDelay: reduced ? '0ms' : `${baseDelay + 120}ms`,
          }}
        >
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
            <RevealImage src={site.image} alt={`${site.name} screenshot`} active={shown} imgClassName="object-top" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div
            className="pj-anim absolute inset-x-0 top-0 h-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(to bottom, transparent, var(--acc-soft), transparent)',
              animation: 'pj-scan 2.4s linear infinite',
            }}
          />
          <span className="absolute top-4 left-4 sm:top-5 sm:left-5 px-3 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.25em] pj-white">
            {String(index + 1).padStart(2, '0')}
            {site.featured && <span className="pj-hi"> · Featured</span>}
          </span>
          {live && (
            <span className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-2 px-3 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] pj-white">
              <span className="relative flex h-2 w-2">
                <span className="pj-anim animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFB3] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFB3]" />
              </span>
              Live
            </span>
          )}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-6 text-left">
            <p className="pj-hi text-[10px] font-black uppercase tracking-[0.25em] mb-1 drop-shadow">
              {site.tag}
            </p>
            <h4 className="pj-white text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter leading-none">
              {site.name}
            </h4>
          </div>
        </button>

        <div className="relative z-20 p-6 sm:p-8 flex flex-col gap-5 flex-1 text-[color:var(--ink)]">
          {site.subtitle && (
            <p style={step(0)} className="pj-acc text-xs font-black uppercase tracking-[0.2em]">
              {site.subtitle}
            </p>
          )}
          <p style={step(1)} className="text-sm sm:text-[15px] opacity-80 font-medium leading-relaxed">
            {site.desc}
          </p>

          {site.highlights?.length > 0 && (
            <ul className="space-y-2">
              {site.highlights.map((h, i) => (
                <li key={h} style={step(2 + i)} className="flex items-start gap-2 text-sm opacity-85 leading-snug">
                  <ChevronRight size={16} className="shrink-0 mt-0.5 text-[color:var(--acc)]" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          {site.stack?.length > 0 && (
            <div style={step(5)} className="flex flex-wrap gap-2">
              {site.stack.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 border rounded-md text-[10px] font-black uppercase tracking-widest bg-[color:var(--acc-soft)] border-[color:var(--acc-line)] pj-acc"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div style={step(6)} className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-3">
            <LaunchButton site={site} live={live} onLaunch={onLaunch} />
            {host && <span className="text-[11px] font-mono opacity-55 truncate">{host}</span>}
          </div>
        </div>
      </article>
    </div>
  );
};

// ============================================================================
// WARP LAUNCH — interactive hyperspace jump before opening a live site
//   move pointer → steer · hold pointer / Space → boost
//   Enter → jump now · Esc → abort
// ============================================================================

const BOOT_MS = 2200;
const JUMP_MS = 520;
const EXIT_MS = 520;

const useWarpLaunch = (reduced) => {
  const [launch, setLaunch] = useState(null);

  const start = useCallback(
    (site, e) => {
      if (reduced) {
        window.open(site.url, '_blank', 'noopener,noreferrer');
        return;
      }
      const r = e?.currentTarget?.getBoundingClientRect?.();
      setLaunch({
        id: Date.now(),
        site,
        origin: r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null,
        stage: 'boot',
      });
    },
    [reduced]
  );

  const setStage = useCallback((stage) => setLaunch((l) => (l ? { ...l, stage } : l)), []);
  const close = useCallback(() => setLaunch(null), []);

  return { launch, start, setStage, close };
};

const WarpLaunch = ({ launch, palette, darkMode, setStage, close }) => {
  const { site, origin, stage } = launch;
  const host = hostOf(site.url);

  const canvasRef = useRef(null);
  const percentRef = useRef(null);
  const barRef = useRef(null);
  const jumpBtnRef = useRef(null);
  const stageRef = useRef(stage);
  const progressRef = useRef(0);
  const boostRef = useRef(false);
  const pointerRef = useRef(null);
  const timersRef = useRef([]);
  const jumpRef = useRef(null);

  const [opened, setOpened] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [logCount, setLogCount] = useState(1);

  const lines = useMemo(
    () => [
      `resolving ${host}`,
      'tls handshake ........ ok',
      `loading ${site.stack?.[0] ?? 'app'} bundle`,
      'calibrating warp drive',
      'jump coordinates locked',
    ],
    [host, site.stack]
  );

  const later = useCallback((fn, ms) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  const finish = useCallback(() => {
    stageRef.current = 'exit';
    setStage('exit');
    later(close, EXIT_MS);
  }, [setStage, later, close]);

  const openSite = useCallback(() => {
    if (stageRef.current !== 'jump') return;
    const win = window.open(site.url, '_blank');
    if (win) {
      try {
        win.opener = null;
      } catch {
        /* cross-origin window — nothing to detach */
      }
      finish();
    } else {
      stageRef.current = 'blocked';
      setStage('blocked');
    }
  }, [site.url, finish, setStage]);

  const jump = useCallback(() => {
    if (stageRef.current !== 'boot') return;
    stageRef.current = 'jump';
    progressRef.current = 1;
    setStage('jump');
    later(openSite, JUMP_MS);
  }, [setStage, later, openSite]);

  const abort = useCallback(() => {
    if (stageRef.current === 'exit') return;
    finish();
  }, [finish]);

  jumpRef.current = jump;

  const setBoost = (on) => {
    boostRef.current = on;
    setBoosting(on);
  };

  // circular reveal from the clicked button, focus, scroll lock, timer cleanup
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpened(true));
    jumpBtnRef.current?.focus({ preventScroll: true });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timers = timersRef.current;
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prevOverflow;
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (e.key === 'Escape') abort();
      else if (e.key === 'Enter') {
        e.preventDefault();
        jump();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (!boostRef.current) setBoost(true);
      }
    };
    const onUp = (e) => {
      if (e.code === 'Space') setBoost(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [abort, jump]);

  // starfield render loop — mounted once per launch, reads live state from refs
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const mobile = window.innerWidth < 640;
    const dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = palette.warpBg;
      ctx.fillRect(0, 0, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = palette.stars;
    const spawn = (z) => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z,
      pz: z,
      c: colors[(Math.random() * colors.length) | 0],
      wd: 0.5 + Math.random() * 1.5,
    });
    const stars = Array.from({ length: mobile ? 220 : 650 }, () => spawn(0.1 + Math.random() * 0.9));
    const vp = { x: origin?.x ?? w / 2, y: origin?.y ?? h / 2 };
    const trail = rgba(palette.warpBg, darkMode ? 0.3 : 0.38);
    const linesLen = lines.length;
    let lastLog = -1;
    let jumpT = 0;
    let last = performance.now();
    let raf;

    const frame = (now) => {
      const dt = Math.min(50, now - last);
      last = now;
      const st = stageRef.current;

      if (st === 'boot') {
        progressRef.current = Math.min(1, progressRef.current + (dt / BOOT_MS) * (boostRef.current ? 2.6 : 1));
        if (progressRef.current >= 1) jumpRef.current?.();
      }
      if (st === 'jump') jumpT = Math.min(1, jumpT + dt / JUMP_MS);
      const p = progressRef.current;

      const ptr = pointerRef.current;
      const tx = w / 2 + (ptr ? (ptr.x - w / 2) * 0.35 : 0);
      const ty = h / 2 + (ptr ? (ptr.y - h / 2) * 0.35 : 0);
      vp.x += (tx - vp.x) * 0.06;
      vp.y += (ty - vp.y) * 0.06;

      let speed = 0.0035 + p * p * 0.028 + (boostRef.current && st === 'boot' ? 0.02 : 0);
      if (st === 'jump') speed = 0.03 + jumpT * 0.09;
      if (st === 'exit' || st === 'blocked') speed = 0.004;
      const k = dt / 16.67;
      const scale = Math.max(w, h) * 0.55;

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = trail;
      ctx.fillRect(0, 0, w, h);
      if (darkMode) ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      for (const s of stars) {
        s.pz = s.z;
        s.z -= speed * k;
        if (s.z <= 0.02) {
          Object.assign(s, spawn(1));
          continue;
        }
        const sx = vp.x + (s.x / s.z) * scale;
        const sy = vp.y + (s.y / s.z) * scale;
        if (sx < -60 || sx > w + 60 || sy < -60 || sy > h + 60) {
          Object.assign(s, spawn(1));
          continue;
        }
        const px = vp.x + (s.x / s.pz) * scale;
        const py = vp.y + (s.y / s.pz) * scale;
        ctx.strokeStyle = s.c;
        ctx.globalAlpha = Math.min(1, (1 - s.z) * 1.4);
        ctx.lineWidth = s.wd * (1 - s.z) * 2.4 + 0.4;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      if (percentRef.current) percentRef.current.textContent = String(Math.round(p * 100)).padStart(2, '0');
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      const li = Math.min(linesLen, Math.floor(p * linesLen) + 1);
      if (li !== lastLog) {
        lastLog = li;
        setLogCount(li);
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
    // the loop reads everything that changes through refs, so it mounts once per launch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ox = origin?.x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const oy = origin?.y ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  const jumping = stage === 'jump';
  const blocked = stage === 'blocked';
  const ink = palette.ink;
  const pillBase =
    'inline-flex items-center gap-2 px-5 py-2.5 rounded-md border font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-200 active:scale-95 outline-none focus-visible:ring-2';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Launching ${site.name}`}
      className="fixed inset-0 z-[2000] overflow-hidden select-none touch-none"
      style={{
        background: palette.warpBg,
        color: ink,
        clipPath: opened ? `circle(150% at ${ox}px ${oy}px)` : `circle(0px at ${ox}px ${oy}px)`,
        opacity: stage === 'exit' ? 0 : 1,
        transition: `clip-path 750ms cubic-bezier(0.77,0,0.18,1), opacity ${EXIT_MS}ms ease`,
      }}
      onPointerMove={(e) => {
        pointerRef.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerDown={(e) => {
        if (e.target.closest('button, a')) return;
        pointerRef.current = { x: e.clientX, y: e.clientY };
        setBoost(true);
      }}
      onPointerUp={() => setBoost(false)}
      onPointerCancel={() => setBoost(false)}
      onPointerLeave={() => setBoost(false)}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* scanlines + vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${rgba(darkMode ? '#000000' : '#1B1B2A', darkMode ? 0.18 : 0.04)} 0 1px, transparent 1px 3px)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at center, transparent 45%, ${rgba(palette.warpBg, 0.85)} 100%)` }}
      />

      {/* top bar */}
      <div className="absolute top-5 sm:top-8 inset-x-0 px-5 sm:px-10 flex items-center justify-between font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.3em]">
        <span className="pj-acc">warp://{host}</span>
        <span className={`flex items-center gap-2 ${boosting ? 'pj-acc' : 'pj-ink'}`} style={{ opacity: boosting ? 1 : 0.5 }}>
          <Zap size={12} />
          {boosting ? 'Boost engaged' : 'Cruise'}
        </span>
      </div>

      {/* HUD */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center pointer-events-none"
        style={{
          transform: jumping ? 'scale(1.6)' : boosting ? 'scale(1.03)' : 'scale(1)',
          filter: jumping ? 'blur(10px)' : 'none',
          opacity: jumping ? 0 : 1,
          transition: `transform ${jumping ? JUMP_MS : 300}ms cubic-bezier(0.7,0,0.84,0), filter ${JUMP_MS}ms ease-in, opacity ${JUMP_MS}ms ease-in`,
        }}
      >
        <div className="relative w-36 h-36 sm:w-48 sm:h-48">
          <div
            className="pj-anim absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${palette.acc}, transparent 30%, ${palette.acc2} 55%, transparent 80%, ${palette.acc})`,
              animation: `pj-spin ${boosting ? 0.6 : 1.4}s linear infinite`,
              boxShadow: `0 0 60px ${rgba(palette.acc, 0.35)}`,
            }}
          />
          <div className="absolute inset-[3px] rounded-full overflow-hidden" style={{ background: palette.warpBg }}>
            <img src={site.image} alt="" className="w-full h-full object-cover object-top opacity-70" />
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(circle, ${rgba(palette.warpBg, 0.55)} 20%, ${rgba(palette.warpBg, 0.9)} 75%)` }}
            />
          </div>
          <div className="absolute inset-0 flex items-baseline justify-center pt-[34%] sm:pt-[36%]">
            <span ref={percentRef} className="pj-ink text-4xl sm:text-5xl font-black tabular-nums tracking-tighter">00</span>
            <span className="pj-acc text-lg font-black">%</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="pj-acc font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.5em]">
            {blocked ? 'Arrived — pop-up blocked' : 'Launching'}
          </p>
          <h2 className="pj-ink relative text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            {site.name}
            <span
              aria-hidden="true"
              className="pj-anim pj-acc absolute inset-0"
              style={{ animation: 'pj-glitch 1.8s steps(2) infinite' }}
            >
              {site.name}
            </span>
            <span
              aria-hidden="true"
              className="pj-anim pj-acc2 absolute inset-0"
              style={{ animation: 'pj-glitch 2.3s steps(2) infinite reverse' }}
            >
              {site.name}
            </span>
          </h2>
        </div>

        <div className="w-64 sm:w-80 h-1 rounded-full overflow-hidden" style={{ background: rgba(palette.acc, 0.15) }}>
          <div
            ref={barRef}
            className="h-full origin-left"
            style={{
              transform: 'scaleX(0)',
              background: `linear-gradient(90deg, ${palette.acc2}, ${palette.acc})`,
              boxShadow: `0 0 12px ${palette.acc}`,
            }}
          />
        </div>

        <ul className="w-64 sm:w-80 space-y-1 text-left font-mono text-[10px] sm:text-[11px] leading-relaxed">
          {lines.slice(0, logCount).map((line, i) => {
            const done = i < logCount - 1 || stage !== 'boot';
            return (
              <li key={line} className="flex items-center gap-2" style={{ animation: 'pj-log-in 300ms ease-out both' }}>
                <span className={done ? 'pj-acc' : 'pj-acc2'}>{done ? '✓' : '›'}</span>
                <span className="pj-ink" style={{ opacity: done ? 0.65 : 1 }}>{line}</span>
                {!done && (
                  <span className="pj-anim pj-acc" style={{ animation: 'pj-blink 0.8s steps(1) infinite' }}>
                    _
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* jump flash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${darkMode ? '#FFFFFF' : palette.acc} 0%, ${rgba(palette.acc, 0.6)} 35%, transparent 75%)`,
          opacity: jumping ? 1 : 0,
          transition: jumping ? `opacity ${JUMP_MS}ms ease-in` : 'opacity 400ms ease-out',
        }}
      />

      {/* controls */}
      <div className="absolute bottom-6 sm:bottom-10 inset-x-0 flex flex-col items-center gap-3 px-4">
        {blocked ? (
          <>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={finish}
              className={pillBase}
              style={{ background: palette.acc, borderColor: palette.acc, color: palette.accInk }}
            >
              Open {host} <ArrowUpRight size={14} />
            </a>
            <button onClick={abort} className={pillBase} style={{ borderColor: rgba(palette.acc, 0.35), color: ink }}>
              Close
            </button>
            <p className="pj-ink font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">
              Your browser blocked the new tab — tap to open it
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-3" style={{ opacity: jumping ? 0 : 1, transition: 'opacity 200ms' }}>
              <button
                ref={jumpBtnRef}
                onClick={jump}
                className={pillBase}
                style={{ background: palette.acc, borderColor: palette.acc, color: palette.accInk }}
              >
                <Rocket size={14} /> Jump now <kbd className="hidden sm:inline opacity-60">↵</kbd>
              </button>
              <button onClick={abort} className={pillBase} style={{ borderColor: rgba(palette.acc, 0.35), color: ink }}>
                <X size={14} /> Abort <kbd className="hidden sm:inline opacity-60">Esc</kbd>
              </button>
            </div>
            <p className="pj-ink font-mono text-[10px] uppercase tracking-[0.25em] opacity-60 text-center">
              <span className="pj-inherit hidden sm:inline">Move to steer · hold click or Space to boost</span>
              <span className="pj-inherit sm:hidden">Drag to steer · hold to boost</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// POSTER STACK — fans out from a single pile when scrolled into view
// ============================================================================

const PosterStack = ({ items, reduced, onPreview }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [ref, inView] = useInViewOnce(0.25);
  const [settled, setSettled] = useState(false);
  const shown = inView || reduced;
  const mid = (items.length - 1) / 2;

  useEffect(() => {
    if (!shown) return undefined;
    const t = setTimeout(() => setSettled(true), items.length * 90 + 900);
    return () => clearTimeout(t);
  }, [shown, items.length]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-6 sm:gap-8 select-none">
      <div className="relative w-[280px] h-[400px] sm:w-[340px] sm:h-[480px] md:w-[400px] md:h-[560px]">
        {items.map((poster, idx) => {
          const offset = idx - mid;
          const isHovered = hoveredIdx === idx;
          const piled = `translateX(0px) translateY(70px) rotate(${offset * 2}deg) scale(0.9)`;
          const fanned = `translateX(${offset * 92}px) translateY(${Math.abs(offset) * 22}px) rotate(${offset * 7}deg)`;
          const lifted = `translateX(${offset * 92}px) translateY(-36px) rotate(0deg) scale(1.06)`;

          return (
            <div
              key={poster.name}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx((cur) => (cur === idx ? null : cur))}
              onClick={() => onPreview(poster, idx)}
              role="button"
              tabIndex={0}
              aria-label={`Preview ${poster.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPreview(poster, idx);
                }
              }}
              onFocus={() => setHoveredIdx(idx)}
              onBlur={() => setHoveredIdx((cur) => (cur === idx ? null : cur))}
              style={{
                transform: !shown ? piled : isHovered ? lifted : fanned,
                opacity: shown ? 1 : 0,
                zIndex: isHovered ? 100 : items.length - Math.abs(offset),
                transitionProperty: 'transform, opacity, box-shadow, border-color',
                transitionDuration: settled ? '400ms' : '900ms',
                transitionTimingFunction: settled ? 'ease-out' : 'cubic-bezier(0.34,1.56,0.64,1)',
                transitionDelay: shown && !settled && !reduced ? `${idx * 90}ms` : '0ms',
              }}
              className={`group/poster absolute top-0 left-1/2 -ml-[140px] sm:-ml-[170px] md:-ml-[200px] w-[280px] h-[400px] sm:w-[340px] sm:h-[480px] md:w-[400px] md:h-[560px] overflow-hidden rounded-md border-2 cursor-pointer outline-none ${
                isHovered
                  ? 'shadow-[0_35px_60px_rgba(0,0,0,0.55)] border-[color:var(--acc)]'
                  : 'shadow-[0_15px_30px_rgba(0,0,0,0.35)] border-[color:var(--acc-line)]'
              }`}
            >
              <RevealImage src={poster.image} alt={poster.name} active={shown} />
              <div
                className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 to-transparent transition-all duration-300"
                style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'none' : 'translateY(12px)' }}
              >
                <p className="pj-hi text-[9px] font-black uppercase tracking-[0.25em]">{poster.tag}</p>
                <p className="pj-white text-base font-black leading-tight">{poster.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 sm:mt-14 flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-[color:var(--ink)]">
        <MousePointerClick size={12} /> Hover a poster to lift it out · Click for the full view
      </div>
    </div>
  );
};

// ============================================================================
// POSTER CAROUSEL CARD (mobile)
// ============================================================================

const PosterCarouselCard = ({ poster, onPreview }) => (
  <button
    onClick={onPreview}
    aria-label={`Preview ${poster.name}`}
    className="relative w-full aspect-[3/4] rounded-md overflow-hidden border-2 border-[color:var(--acc-line)] shadow-[0_15px_30px_rgba(0,0,0,0.35)] block text-left outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
  >
    <RevealImage src={poster.image} alt={poster.name} />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
    <div className="absolute bottom-4 left-4 right-4">
      <p className="pj-hi text-[9px] font-black uppercase tracking-[0.25em] mb-1">{poster.tag}</p>
      <h4 className="pj-white text-lg font-black tracking-tight leading-tight">{poster.name}</h4>
    </div>
  </button>
);

// ============================================================================
// LIGHTBOX — spinner while loading, keyboard: Esc / ← / →
// ============================================================================

const Lightbox = ({ active, onClose, onNav, onLaunch }) => {
  const [loadedSrc, setLoadedSrc] = useState(null);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onNav(1);
      else if (e.key === 'ArrowLeft') onNav(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onClose, onNav]);

  if (!active) return null;
  const { item, list, index } = active;
  const hasNav = Array.isArray(list) && list.length > 1;
  const loaded = loadedSrc === item.image;
  const live = !!hostOf(item.url);
  const navBtn =
    'absolute top-1/2 -translate-y-1/2 z-[1001] p-2 rounded-full bg-black/40 text-white/80 hover:text-[color:var(--acc)] hover:bg-black/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]';

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <button
        onClick={onClose}
        aria-label="Close preview"
        className="absolute top-6 right-6 sm:top-10 sm:right-10 text-white hover:text-[color:var(--acc)] transition-colors z-[1001] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)] rounded-md"
      >
        <X size={36} />
      </button>

      {hasNav && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onNav(-1); }} aria-label="Previous" className={`${navBtn} left-3 sm:left-8`}>
            <ChevronLeft size={36} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNav(1); }} aria-label="Next" className={`${navBtn} right-3 sm:right-8`}>
            <ChevronRight size={36} />
          </button>
        </>
      )}

      <div className="relative flex flex-col items-center gap-5 sm:gap-6 max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center justify-center min-w-[200px] min-h-[200px]">
          {!loaded && (
            <div
              className="pj-anim absolute w-12 h-12 rounded-full border-2 border-white/10 border-t-[color:var(--acc)]"
              style={{ animation: 'pj-spin 0.8s linear infinite' }}
            />
          )}
          <img
            key={item.image}
            src={item.image}
            alt={item.name}
            onLoad={() => setLoadedSrc(item.image)}
            className="max-w-full max-h-[70vh] object-contain rounded-md shadow-2xl"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'scale(1)' : 'scale(0.94)',
              filter: loaded ? 'blur(0px)' : 'blur(8px)',
              transition: 'opacity 400ms ease, transform 500ms cubic-bezier(0.22,1,0.36,1), filter 500ms ease',
            }}
          />
        </div>
        <div className="text-center space-y-2 max-w-xl px-2">
          {hasNav && (
            <p className="pj-white font-mono text-[10px] tracking-[0.3em] opacity-50">
              {String(index + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
            </p>
          )}
          <h4 className="pj-white text-xl sm:text-2xl font-black tracking-tight">{item.name}</h4>
          <p className="pj-white text-sm font-medium leading-relaxed opacity-75">{item.desc}</p>
          {live && (
            <div className="pt-3 flex justify-center">
              <LaunchButton site={item} live onLaunch={onLaunch} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN — Project.jsx
// ============================================================================

const Project = ({ darkMode = true }) => {
  const palette = getPalette(darkMode);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(null);
  const { launch, start, setStage, close } = useWarpLaunch(reduced);
  const [headerRef, headerIn] = useInViewOnce(0.2);
  const headerShown = headerIn || reduced;

  const liveCount = websites.filter((s) => hostOf(s.url)).length;

  const openWebsite = (site) => setActive({ item: site, list: null, index: null });
  const openPoster = (poster, index) => setActive({ item: poster, list: posters, index });
  const closeLightbox = useCallback(() => setActive(null), []);
  const navigate = useCallback((dir) => {
    setActive((prev) => {
      if (!prev || !prev.list) return prev;
      const nextIndex = (prev.index + dir + prev.list.length) % prev.list.length;
      return { item: prev.list[nextIndex], list: prev.list, index: nextIndex };
    });
  }, []);
  const launchFromLightbox = (site, e) => {
    setActive(null);
    start(site, e);
  };

  const warping = launch && (launch.stage === 'boot' || launch.stage === 'jump');
  const headerStep = (n) => ({
    opacity: headerShown ? 1 : 0,
    transform: headerShown ? 'none' : 'translateY(24px)',
    transition: 'opacity 700ms ease, transform 700ms cubic-bezier(0.22,1,0.36,1)',
    transitionDelay: reduced ? '0ms' : `${n * 100}ms`,
  });

  return (
    <div className="pj-scope relative" style={cssVars(palette)}>
      <ProjectStyles />

      <Lightbox active={active} onClose={closeLightbox} onNav={navigate} onLaunch={launchFromLightbox} />
      {launch && (
        <WarpLaunch
          key={launch.id}
          launch={launch}
          palette={palette}
          darkMode={darkMode}
          setStage={setStage}
          close={close}
        />
      )}

      <div
        style={{
          transform: warping ? 'scale(0.94)' : 'none',
          filter: warping ? 'blur(4px)' : 'none',
          transition: 'transform 800ms cubic-bezier(0.16,1,0.3,1), filter 800ms ease',
        }}
        className="space-y-16 sm:space-y-24 text-[color:var(--ink)]"
      >
        {/* ================= HEADER ================= */}
        <header ref={headerRef} className="space-y-5 sm:space-y-6 pt-4">
          <p style={headerStep(0)} className="pj-acc font-mono text-[11px] uppercase tracking-[0.4em]">
            ~/projects
          </p>
          <h2 style={headerStep(1)} className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.95]">
            Things I&apos;ve <span className="pj-acc">shipped.</span>
          </h2>
          <p style={headerStep(2)} className="text-sm sm:text-lg opacity-70 max-w-2xl leading-relaxed">
            Live, deployed apps — from an AI productivity coach to a community map and a retro chess game — plus
            the print design work behind my eye for UI.
          </p>
          <div style={headerStep(3)} className="flex flex-wrap gap-3">
            {[
              `${String(liveCount).padStart(2, '0')} live apps`,
              `${String(posters.length).padStart(2, '0')} poster designs`,
              'Deployed on Vercel',
            ].map((label) => (
              <span
                key={label}
                className="px-3 py-1.5 rounded-md border border-[color:var(--acc-line)] bg-[color:var(--acc-soft)] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] pj-acc"
              >
                {label}
              </span>
            ))}
          </div>
        </header>

        {/* ================= WEBSITES ================= */}
        <section>
          <SectionEyebrow label="Websites & Apps" icon={<Globe size={16} />} />
          <p className="text-sm sm:text-base opacity-65 max-w-2xl mb-8 sm:mb-10">
            Click a screenshot for a closer look, or hit <span className="pj-acc font-black">Launch Site</span> to
            warp straight into the live app.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {websites.map((site, idx) => (
              <ProjectCard
                key={site.name}
                site={site}
                index={idx}
                reduced={reduced}
                onPreview={openWebsite}
                onLaunch={start}
              />
            ))}
          </div>
        </section>

        {/* ================= POSTER DESIGN ================= */}
        <section>
          <SectionEyebrow label="Poster Design" icon={<Layers size={16} />} />
          <p className="text-sm sm:text-base opacity-65 max-w-2xl mb-8 sm:mb-10">
            A fanned cascade of print work — hover any poster to lift it clear of the rest, and click it for the full
            view.
          </p>
          <div className="sm:hidden py-6">
            <Carousel
              items={posters}
              darkMode={darkMode}
              renderItem={(poster, idx) => (
                <PosterCarouselCard poster={poster} onPreview={() => openPoster(poster, idx)} />
              )}
            />
          </div>
          <div className="hidden sm:flex justify-center py-10 sm:py-16">
            <PosterStack items={posters} reduced={reduced} onPreview={openPoster} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Project;
