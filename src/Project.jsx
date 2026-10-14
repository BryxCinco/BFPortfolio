import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Globe,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  MousePointerClick,
  ArrowUpRight,
} from 'lucide-react';

import Carousel from './Carousel';
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
// SECTION EYEBROW
// ============================================================================

const SectionEyebrow = ({ label, icon }) => (
  <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
    <h3 className="text-[9px] sm:text-[11px] md:text-[12px] font-black text-[#00f0ff] uppercase tracking-[0.3em] sm:tracking-[0.6em] md:tracking-[1em] whitespace-nowrap">
      {label}
    </h3>
    <div className="h-[1px] flex-1 bg-[#00f0ff]/20 min-w-[20px]" />
    {icon}
  </div>
);

// ============================================================================
// GOOEY BUBBLE VACUUM
// ============================================================================

const OPEN_MS = 400;
const SUCK_MS = 2600;
const FLASH_MS = 180;
const RESTORE_MS = 800;

const useVacuumTransition = () => {
  const [target, setTarget] = useState(null);
  const [stage, setStage] = useState('idle');
  const arrivedRef = useRef(false);

  const trigger = useCallback((site) => {
    arrivedRef.current = false;
    setTarget(site);
    setStage('opening');
  }, []);

  useEffect(() => {
    if (stage !== 'opening') return undefined;
    const t = setTimeout(() => setStage('sucking'), OPEN_MS);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'sucking') return undefined;
    const t = setTimeout(() => setStage('flash'), SUCK_MS);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'flash') return undefined;
    const t = setTimeout(() => {
      if (!arrivedRef.current && target) {
        arrivedRef.current = true;
        if (target.url && target.url !== '#') {
          window.open(target.url, '_blank', 'noopener,noreferrer');
        }
      }
      setStage('restoring');
    }, FLASH_MS);
    return () => clearTimeout(t);
  }, [stage, target]);

  useEffect(() => {
    if (stage !== 'restoring') return undefined;
    const t = setTimeout(() => {
      setStage('idle');
      setTarget(null);
    }, RESTORE_MS);
    return () => clearTimeout(t);
  }, [stage]);

  return { target, stage, trigger };
};

const GooeyVacuum = ({ stage, name, darkMode }) => {
  const active = stage !== 'idle' && stage !== 'restoring';
  const sucking = stage === 'sucking' || stage === 'flash';
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(0);
  const suckStartRef = useRef(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 640
  );

  const isDark = darkMode !== false;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (stage === 'sucking') {
      suckStartRef.current = performance.now();
    }
  }, [stage]);

  useEffect(() => {
    if (!active) {
      particlesRef.current = [];
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const isMobile = window.innerWidth < 640;
    // Cap device pixel ratio on mobile so we're not pushing 3x resolution
    // canvases through a heavy blur filter on weaker GPUs.
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    const darkColors = [
      '#00f0ff', '#00d9ec', '#1af2ff',
      '#00c2d6', '#33f4ff', '#00e0f0',
      '#0af0ff', '#00b8cc', '#66f6ff',
      '#00a8bf',
    ];
    const lightColors = [
      '#ff0033', '#ff1a53', '#ff3366',
      '#ff477e', '#ff6699', '#ff85a7',
      '#e60039', '#ff0055', '#ff99bb',
      '#ffffff',
    ];
    const colors = isDark ? darkColors : lightColors;

    const BUBBLE_COUNT = isMobile ? 40 : 320;

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < BUBBLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * Math.max(w, h) * 0.6;
        particlesRef.current.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          baseSize: 14 + Math.random() * 34,
          size: 14 + Math.random() * 34,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0.6 + Math.random() * 0.4,
          angle,
          dist,
          spiralSpeed: 0.01 + Math.random() * 0.03,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.05,
          vx: 0,
          vy: 0,
        });
      }
    }

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      particlesRef.current.forEach((p) => {
        if (sucking) {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angleToCenter = Math.atan2(dy, dx);

          const attraction = 3.5 + (1000 / (dist + 25));
          const swirl = 1.8 + (400 / (dist + 50));

          p.vx += Math.cos(angleToCenter) * attraction * 0.18;
          p.vy += Math.sin(angleToCenter) * attraction * 0.18;
          p.vx += Math.cos(angleToCenter + Math.PI / 2) * swirl * 0.1;
          p.vy += Math.sin(angleToCenter + Math.PI / 2) * swirl * 0.1;

          p.vx *= 0.92;
          p.vy *= 0.92;

          p.x += p.vx;
          p.y += p.vy;

          const shrinkFactor = Math.min(1, Math.max(0.06, dist / 90));
          p.size = p.baseSize * shrinkFactor;
          p.opacity = Math.min(1, dist / 45) * 0.95;

          if (dist < 16 || p.size < 1) {
            const spawnAngle = Math.random() * Math.PI * 2;
            const spawnDist = Math.max(w, h) * 0.48 + Math.random() * 300;
            p.x = cx + Math.cos(spawnAngle) * spawnDist;
            p.y = cy + Math.sin(spawnAngle) * spawnDist;
            p.vx = 0;
            p.vy = 0;
            p.size = p.baseSize;
            p.opacity = 0.7 + Math.random() * 0.3;
          }
        } else {
          p.wobblePhase += p.wobbleSpeed;
          p.x += Math.cos(p.wobblePhase) * 0.6;
          p.y += Math.sin(p.wobblePhase * 0.7) * 0.5;
          p.size = p.baseSize + Math.sin(p.wobblePhase * 2) * 3;
          p.opacity = 0.6 + Math.sin(p.wobblePhase) * 0.3;
        }

        if (p.size > 0.5 && p.opacity > 0.01) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fill();

          if (!isMobile) {
            ctx.beginPath();
            ctx.arc(
              p.x - p.size * 0.28,
              p.y - p.size * 0.28,
              p.size * 0.28,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.globalAlpha = p.opacity;
            ctx.fill();
          }

          if (!isMobile) {
            ctx.beginPath();
            ctx.arc(
              p.x + p.size * 0.15,
              p.y + p.size * 0.25,
              p.size * 0.12,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.globalAlpha = p.opacity * 0.6;
            ctx.fill();
          }
        }
      });

      if (sucking) {
        // Core radius grows the longer we've been collecting bubbles, so the
        // vacuum visibly swells as it fills up instead of staying static.
        const elapsed = suckStartRef.current ? performance.now() - suckStartRef.current : 0;
        const progress = Math.min(1, Math.max(0, elapsed / SUCK_MS));
        const growth = 1 + progress * 3.2;
        const pulse = (18 + Math.sin(frameRef.current * 0.12) * 5) * growth;

        ctx.beginPath();
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.globalAlpha = 0.7;
        ctx.fill();

        const rimColor = isDark
          ? 'rgba(0,240,255,0.32)'
          : 'rgba(255,0,64,0.35)';
        const rimMid = isDark
          ? 'rgba(0,240,255,0.11)'
          : 'rgba(255,0,64,0.12)';

        const rimGrad = ctx.createRadialGradient(cx, cy, pulse * 0.7, cx, cy, pulse * 3.5);
        rimGrad.addColorStop(0, rimColor);
        rimGrad.addColorStop(0.4, rimMid);
        rimGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, pulse * 3.5, 0, Math.PI * 2);
        ctx.globalAlpha = 0.6;
        ctx.fill();
      }

      frameRef.current++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [active, sucking, isDark]);

  if (!active) return null;

  // Text color is forced via the .vacuum-force-white CSS class (with
  // !important) further down, not inline style — inline style values
  // can't carry !important reliably, so if any global CSS in the host
  // app was overriding text color, this guarantees white wins.

  const labelShadow = isDark
    ? '0 0 8px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,60,80,0.6)'
    : '0 2px 4px rgba(0,0,0,0.8), 0 0 14px rgba(0,0,0,0.55)';

  const titleShadow = isDark
    ? '0 0 10px rgba(0,0,0,1), 0 0 25px rgba(0,0,0,0.95), 0 0 50px rgba(0,60,80,0.7), 0 0 100px rgba(0,60,80,0.4)'
    : '0 3px 6px rgba(0,0,0,0.85), 0 0 20px rgba(0,0,0,0.6)';

  const statusShadow = isDark
    ? '0 0 8px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,60,80,0.5)'
    : '0 2px 4px rgba(0,0,0,0.8), 0 0 14px rgba(0,0,0,0.55)';

  return (
    <div className="fixed inset-0 z-[2000] pointer-events-none overflow-hidden flex items-center justify-center">
      <style>{`
        @keyframes drain-grow {
          0% { width: 65px; height: 65px; }
          100% { width: 280px; height: 280px; }
        }
        .vacuum-force-white {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: isDark
            ? 'radial-gradient(circle at center, rgba(0,240,255,0.04) 0%, rgba(0,0,0,0.25) 100%)'
            : 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
          opacity: active ? 1 : 0,
          backdropFilter: 'blur(1px)',
          WebkitBackdropFilter: 'blur(1px)',
        }}
      />

      {/* SVG Gooey Filter */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="gooey-vacuum">
            <feGaussianBlur in="SourceGraphic" stdDeviation={isMobile ? 6 : 16} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -13"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Bubble canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: active ? 1 : 0,
          transition: 'opacity 0.8s ease',
          filter: 'url(#gooey-vacuum)',
        }}
      />

      {/* Center drain — radius grows as it swallows more bubbles */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: sucking ? undefined : '0px',
          height: sucking ? undefined : '0px',
          transition: sucking ? 'none' : 'width 0.6s ease, height 0.6s ease',
          animation:
            stage === 'sucking'
              ? `drain-grow ${SUCK_MS}ms cubic-bezier(0.3,0,0.6,1) forwards`
              : 'none',
          background: 'radial-gradient(circle at 35% 35%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.85) 60%)',
          boxShadow: isDark
            ? '0 0 50px 12px rgba(0,240,255,0.12), inset 0 0 25px rgba(0,240,255,0.08)'
            : '0 0 50px 12px rgba(255,0,64,0.15), inset 0 0 25px rgba(255,0,64,0.1)',
          border: isDark ? '1px solid rgba(0,240,255,0.2)' : '1px solid rgba(255,0,64,0.2)',
        }}
      />

      {/* Text — explicit white, no dark shadows in light mode */}
      <div
        className="relative flex flex-col items-center justify-center transition-all duration-700"
        style={{
          opacity: active ? 1 : 0,
          transform: active ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
        }}
      >
        <div className="text-center space-y-3">
          <div
            className="vacuum-force-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.5em]"
            style={{ textShadow: labelShadow }}
          >
            Vacuum Sequence
          </div>

          {name && (
            <h2
              className="vacuum-force-white text-2xl sm:text-4xl font-black uppercase tracking-[0.2em]"
              style={{ textShadow: titleShadow }}
            >
              {name}
            </h2>
          )}

          <div className="flex items-center justify-center gap-2 mt-3">
            <div
              className="vacuum-force-white w-2 h-2 rounded-full"
              style={{
                backgroundColor: '#ffffff',
                animation: 'vacuum-pulse 1.2s ease-in-out infinite',
                boxShadow: isDark
                  ? '0 0 10px 2px rgba(255,255,255,0.9), 0 0 20px 4px rgba(0,240,255,0.3)'
                  : '0 0 10px 2px rgba(255,255,255,0.9), 0 0 20px 4px rgba(0,0,0,0.35)',
              }}
            />
            <span
              className="vacuum-force-white text-[9px] sm:text-[10px] font-mono tracking-widest uppercase"
              style={{ textShadow: statusShadow }}
            >
              {sucking ? 'Compressing matter...' : 'Matter collapsed'}
            </span>
          </div>
        </div>
      </div>

      {/* Flash */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          backgroundColor: isDark ? '#00f0ff' : '#ff3366',
          opacity: stage === 'flash' ? 0.12 : 0,
          transitionDuration: stage === 'flash' ? '60ms' : `${FLASH_MS + 200}ms`,
        }}
      />
    </div>
  );
};

// ============================================================================
// VISIT LINK
// ============================================================================

const VisitLink = ({ site, darkMode, onVisit }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const hasLiveLink = site.url && site.url !== '#';

  return (
    <button
      onClick={() => hasLiveLink && onVisit(site)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={!hasLiveLink}
      title={hasLiveLink ? `Launch ${site.name}` : 'Live link coming soon'}
      className={`
        inline-flex items-center gap-2
        px-5 py-2.5 sm:px-6 sm:py-3 rounded-md
        text-[11px] sm:text-[12px] font-black uppercase tracking-[0.18em]
        bg-white/5 border
        transition-all duration-200 ease-out
        outline-none focus:outline-none focus:ring-0
        ${hasLiveLink
          ? darkMode
            ? 'border-[#00f0ff]/20 text-[#00f0ff] hover:bg-[#00f0ff] hover:text-[#1B1B2A] hover:border-[#00f0ff]'
            : 'border-[#ff3366]/30 text-[#ff3366] hover:bg-[#ff3366] hover:text-white hover:border-[#ff3366]'
          : 'opacity-30 cursor-not-allowed border border-white/10 text-white/30'
        }
        ${isPressed ? 'scale-[0.96]' : isHovered ? 'scale-[1.02]' : 'scale-100'}
      `}
    >
      <Globe size={14} className={`transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} />
      <span>{hasLiveLink ? 'Launch Site' : 'Coming Soon'}</span>
      <ArrowUpRight
        size={13}
        className={`transition-all duration-300 ${isHovered ? 'translate-x-[2px] -translate-y-[2px] opacity-100' : 'opacity-40'}`}
      />
    </button>
  );
};

// ============================================================================
// WEBSITE CARD
// ============================================================================

const WebsiteCard = ({ site, index, darkMode, onPreview, onVisit }) => {
  const host = site.url && site.url !== '#' ? hostOf(site.url) : null;
  const chipClasses = darkMode
    ? 'bg-[#00f0ff]/10 border-[#00f0ff]/20 text-[#00f0ff]'
    : 'bg-[#1B1B2A]/5 border-[#1B1B2A]/15 text-[#1B1B2A]';
  const bulletColor = darkMode ? 'text-[#00f0ff]' : 'text-[#ff3366]';

  return (
    <article
      className={`backdrop-blur-md border rounded-md overflow-hidden shadow-lg transition-all duration-500 group flex flex-col ${
        site.featured ? 'md:col-span-2 xl:col-span-3 lg:grid lg:grid-cols-[1.25fr_1fr]' : ''
      } ${
        darkMode
          ? 'bg-white/5 border-[#00f0ff]/10 hover:border-[#00f0ff]/40'
          : 'bg-white/60 border-[#1B1B2A]/10 hover:border-[#ff3366]/40'
      } hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.3)]`}
    >
      <button
        onClick={() => onPreview(site)}
        className={`relative w-full overflow-hidden block outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff] ${
          site.featured ? 'aspect-video lg:aspect-auto lg:h-full lg:min-h-[380px]' : 'aspect-video'
        }`}
        aria-label={`Preview ${site.name}`}
      >
        <img
          src={site.image}
          alt={`${site.name} screenshot`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <span className="absolute top-4 left-4 sm:top-5 sm:left-5 px-3 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.25em] text-white">
          {String(index + 1).padStart(2, '0')}
          {site.featured && <span className="text-[#00f0ff]"> · Featured</span>}
        </span>
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-6 text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00f0ff] mb-1">
            {site.tag}
          </p>
          <h4 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter leading-none">
            {site.name}
          </h4>
        </div>
      </button>

      <div className="p-6 sm:p-8 flex flex-col gap-5 flex-1">
        {site.subtitle && (
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">{site.subtitle}</p>
        )}
        <p className="text-sm sm:text-[15px] opacity-75 font-medium leading-relaxed">{site.desc}</p>

        {site.highlights?.length > 0 && (
          <ul className="space-y-2">
            {site.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm opacity-80 leading-snug">
                <ChevronRight size={16} className={`shrink-0 mt-0.5 ${bulletColor}`} />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {site.stack?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {site.stack.map((s) => (
              <span
                key={s}
                className={`px-2.5 py-1 border rounded-md text-[10px] font-black uppercase tracking-widest ${chipClasses}`}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-3">
          <VisitLink site={site} darkMode={darkMode} onVisit={onVisit} />
          {host && <span className="text-[11px] font-mono opacity-50 truncate">{host}</span>}
        </div>
      </div>
    </article>
  );
};

// ============================================================================
// POSTER STACK
// ============================================================================

const PosterStack = ({ items, darkMode, onPreview }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const mid = (items.length - 1) / 2;

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 select-none">
      <div className="relative w-[280px] h-[400px] sm:w-[340px] sm:h-[480px] md:w-[400px] md:h-[560px]">
        {items.map((poster, idx) => {
          const offsetFromCenter = idx - mid;
          const isHovered = hoveredIdx === idx;
          const baseTransform = `translateX(${offsetFromCenter * 92}px) translateY(${Math.abs(offsetFromCenter) * 22}px) rotate(${offsetFromCenter * 7}deg)`;
          const hoverTransform = `translateX(${offsetFromCenter * 92}px) translateY(-36px) rotate(0deg) scale(1.06)`;

          return (
            <div
              key={poster.name}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx((cur) => (cur === idx ? null : cur))}
              onClick={() => onPreview(poster, idx)}
              style={{
                transform: isHovered ? hoverTransform : baseTransform,
                zIndex: isHovered ? 100 : items.length - Math.abs(offsetFromCenter),
              }}
              className={`absolute top-0 left-1/2 -ml-[140px] sm:-ml-[170px] md:-ml-[200px] w-[280px] h-[400px] sm:w-[340px] sm:h-[480px] md:w-[400px] md:h-[560px] overflow-hidden border-2 cursor-pointer transition-all duration-400 ease-out ${
                isHovered
                  ? 'shadow-[0_35px_60px_rgba(0,0,0,0.55)] border-[#00f0ff]/70'
                  : `shadow-[0_15px_30px_rgba(0,0,0,0.35)] ${darkMode ? 'border-[#00f0ff]/20' : 'border-[#00f0ff]/40'}`
              }`}
            >
              <img
                src={poster.image}
                alt={poster.name}
                draggable={false}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
        <MousePointerClick size={12} /> Hover a poster to lift it out · Click for the full view
      </div>
    </div>
  );
};

// ============================================================================
// POSTER CAROUSEL CARD
// ============================================================================

const PosterCarouselCard = ({ poster, darkMode, onPreview }) => (
  <button
    onClick={onPreview}
    aria-label={`Preview ${poster.name}`}
    className={`relative w-full aspect-[3/4] rounded-md overflow-hidden border-2 shadow-[0_15px_30px_rgba(0,0,0,0.35)] block text-left outline-none focus:outline-none ${
      darkMode ? 'border-[#00f0ff]/20' : 'border-[#00f0ff]/40'
    }`}
  >
    <img
      src={poster.image}
      alt={poster.name}
      draggable={false}
      className="w-full h-full object-cover pointer-events-none"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
    <div className="absolute bottom-4 left-4 right-4">
      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#00f0ff] mb-1">
        {poster.tag}
      </p>
      <h4 className="text-lg font-black text-white tracking-tight leading-tight">{poster.name}</h4>
    </div>
  </button>
);

// ============================================================================
// LIGHTBOX
// ============================================================================

const Lightbox = ({ active, onClose, onNav }) => {
  if (!active) return null;
  const { item, list, index } = active;
  const hasNav = Array.isArray(list) && list.length > 1;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close preview"
        className="absolute top-6 right-6 sm:top-10 sm:right-10 text-white hover:text-[#00f0ff] transition-colors z-[1001] outline-none focus:outline-none"
      >
        <X size={32} className="sm:hidden" />
        <X size={40} className="hidden sm:block" />
      </button>

      {hasNav && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(-1); }}
            aria-label="Previous"
            className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-[#00f0ff] transition-colors z-[1001] outline-none focus:outline-none"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(1); }}
            aria-label="Next"
            className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-[#00f0ff] transition-colors z-[1001] outline-none focus:outline-none"
          >
            <ChevronRight size={40} />
          </button>
        </>
      )}

      <div
        className="relative flex flex-col items-center gap-5 sm:gap-6 max-w-[92vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.image}
          alt={item.name}
          className="max-w-full max-h-[72vh] object-contain rounded-md shadow-2xl animate-scale-in"
        />
        <div className="text-center space-y-2 max-w-xl px-2">
          <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">{item.name}</h4>
          <p className="text-sm text-[#00f0ff]/80 font-medium leading-relaxed">{item.desc}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN — Project.jsx
// ============================================================================

const Project = ({ darkMode = true }) => {
  const [active, setActive] = useState(null);
  const { target: portalTarget, stage: portalStage, trigger: visitWebsite } = useVacuumTransition();

  const openWebsite = (site) => setActive({ item: site, list: null, index: null });
  const openPoster = (poster, index) => setActive({ item: poster, list: posters, index });

  const navigate = (dir) => {
    setActive((prev) => {
      if (!prev || !prev.list) return prev;
      const nextIndex = (prev.index + dir + prev.list.length) % prev.list.length;
      return { item: prev.list[nextIndex], list: prev.list, index: nextIndex };
    });
  };

  const zoomingIn = portalStage === 'sucking' || portalStage === 'flash';

  return (
    <div className="relative">
      <style>{`
        @keyframes vacuum-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.4); opacity: 0.3; }
        }
      `}</style>

      <Lightbox active={active} onClose={() => setActive(null)} onNav={navigate} />
      <GooeyVacuum stage={portalStage} name={portalTarget?.name} darkMode={darkMode} />

      <div
        style={{
          transform: zoomingIn
            ? 'scale(0.88) translateY(30px)'
            : 'scale(1) translateY(0)',
          transformOrigin: '50% 50%',
          opacity: zoomingIn ? 0.35 : 1,
          filter: zoomingIn ? 'blur(6px) brightness(0.6)' : 'blur(0px) brightness(1)',
          transitionProperty: 'transform, opacity, filter',
          transitionDuration: portalStage === 'restoring' ? `${RESTORE_MS}ms` : `${SUCK_MS}ms`,
          transitionTimingFunction:
            portalStage === 'restoring' ? 'cubic-bezier(0.16,1,0.3,1)' : 'cubic-bezier(0.7, 0, 0.84, 0)',
        }}
        className="space-y-16 sm:space-y-24 animate-fade-in"
      >
        {/* ================= WEBSITES ================= */}
        <section>
          <SectionEyebrow label="Websites" icon={<Globe size={16} className="text-[#00f0ff]" />} />
          <p className="text-sm sm:text-base opacity-60 max-w-2xl mb-8 sm:mb-10">
            Live, deployed apps — from an AI productivity coach to a community map and a retro
            chess game. Click a screenshot for a closer look, or launch the site to try it yourself.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {websites.map((site, idx) => (
              <WebsiteCard
                key={site.name}
                site={site}
                index={idx}
                darkMode={darkMode}
                onPreview={openWebsite}
                onVisit={visitWebsite}
              />
            ))}
          </div>
        </section>

        {/* ================= POSTER DESIGN ================= */}
        <section>
          <SectionEyebrow label="Poster Design" icon={<Layers size={16} className="text-[#00f0ff]" />} />
          <p className="text-sm sm:text-base opacity-60 max-w-2xl mb-8 sm:mb-10">
            A fanned cascade of print work — hover any poster to lift it clear of the rest, and click it
            for the full view.
          </p>
          <div className="sm:hidden py-6">
            <Carousel
              items={posters}
              darkMode={darkMode}
              renderItem={(poster, idx) => (
                <PosterCarouselCard
                  poster={poster}
                  darkMode={darkMode}
                  onPreview={() => openPoster(poster, idx)}
                />
              )}
            />
          </div>
          <div className="hidden sm:flex justify-center py-10 sm:py-16">
            <PosterStack items={posters} darkMode={darkMode} onPreview={openPoster} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Project;