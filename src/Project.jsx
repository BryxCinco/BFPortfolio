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
import doughRemiSite from './assets/Dough Re Mi.png';
import soundlifySite from './assets/Soundlify.png';
import sweepXpressSite from './assets/SweepXpress.png';
import grandlineSite from './assets/Grandline.png';

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
    name: 'Dough Re Mi',
    tag: 'Bakery & Caramel E-Commerce',
    desc: 'A full-stack ordering platform for a home bakery brand — browsing, bagging, and checkout built around a soft, dessert-forward visual identity.',
    image: doughRemiSite,
    url: 'https://www.facebook.com/Bryx.Francisco111',
  },
  {
    name: 'Soundlify',
    tag: 'Community & Resident Portal',
    desc: 'A registration and login gateway for a community services platform, designed to keep members securely connected to local programs and records.',
    image: soundlifySite,
    url: 'https://www.facebook.com/Bryx.Francisco111',
  },
  {
    name: 'SweepXpress',
    tag: 'Logistics Admin Dashboard',
    desc: 'A secured admin control panel for monitoring orders, inventory, and customers in real time, with audit-logged sign-ins for accountability.',
    image: sweepXpressSite,
    url: 'https://www.facebook.com/Bryx.Francisco111',
  },
  {
    name: 'Grandline Maritime',
    tag: 'LMS Portal for Maritime Training',
    desc: 'A certification and training management portal for maritime professionals, pairing a secure login flow with live system status at a glance.',
    image: grandlineSite,
    url: 'https://www.facebook.com/Bryx.Francisco111',
  },
];

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
// TV STATIC CANVAS
// ============================================================================

const TVStatic = ({ active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const idata = ctx.createImageData(w, h);
      const buffer32 = new Uint32Array(idata.data.buffer);
      for (let i = 0; i < buffer32.length; i++) {
        // noise with very low opacity (cyberpunk blue tint)
        const noise = Math.random() < 0.5 ? 0xff001020 : 0xff000810;
        buffer32[i] = noise;
      }
      ctx.putImageData(idata, 0, 0);
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.12, mixBlendMode: 'screen' }}
    />
  );
};

// ============================================================================
// CYBERPUNK CIRCLE LOADER OVERLAY
// ============================================================================

const OPEN_MS = 400;
const LOAD_MS = 2200;
const FLASH_MS = 150;
const RESTORE_MS = 600;

const usePortalTransition = () => {
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
    const t = setTimeout(() => setStage('loading'), OPEN_MS);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'loading') return undefined;
    const t = setTimeout(() => setStage('flash'), LOAD_MS);
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

const CyberLoader = ({ stage, name }) => {
  const active = stage !== 'idle' && stage !== 'restoring';
  const loading = stage === 'loading';
  const progress = loading ? 100 : 0;

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[2000] pointer-events-none overflow-hidden flex items-center justify-center">
      {/* dark cyberpunk backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at center, #0a0a1a 0%, #050510 100%)',
          opacity: active ? 1 : 0,
        }}
      />
      
      {/* scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.03) 2px, rgba(0,240,255,0.03) 4px)',
          opacity: active ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* TV static noise */}
      <TVStatic active={loading} />

      {/* vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0,10,30,0.8) 100%)',
          opacity: active ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* center loader */}
      <div
        className="relative flex flex-col items-center justify-center transition-all duration-500"
        style={{
          opacity: active ? 1 : 0,
          transform: active ? 'scale(1)' : 'scale(0.8)',
        }}
      >
        {/* outer rotating ring */}
        <div className="relative w-[200px] h-[200px] sm:w-[260px] sm:h-[260px]">
          {/* outer glow ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '1px solid rgba(0,240,255,0.3)',
              boxShadow: '0 0 40px rgba(0,240,255,0.15), inset 0 0 40px rgba(0,240,255,0.05)',
              animation: loading ? 'cyber-spin 8s linear infinite' : 'none',
            }}
          />
          
          {/* middle segmented ring */}
          <div
            className="absolute inset-[15px] rounded-full"
            style={{
              border: '2px dashed rgba(0,240,255,0.4)',
              animation: loading ? 'cyber-spin-reverse 12s linear infinite' : 'none',
            }}
          />

          {/* inner progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(0,240,255,0.08)"
              strokeWidth="1"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.89} 289`}
              style={{
                filter: 'drop-shadow(0 0 6px rgba(0,240,255,0.8))',
                transition: loading ? 'stroke-dasharray 2.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              }}
            />
          </svg>

          {/* glitchy center circle */}
          <div
            className="absolute inset-[45px] sm:inset-[55px] rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(0,240,255,0.15) 0%, transparent 70%)',
              border: '1px solid rgba(0,240,255,0.25)',
              boxShadow: '0 0 30px rgba(0,240,255,0.1), inset 0 0 20px rgba(0,240,255,0.05)',
            }}
          >
            <Globe size={32} className="text-[#00f0ff] opacity-60" style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.6))' }} />
          </div>

          {/* orbiting dot */}
          {loading && (
            <div
              className="absolute left-1/2 top-1/2 w-full h-full"
              style={{ animation: 'cyber-spin 3s linear infinite' }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#00f0ff]"
                style={{ boxShadow: '0 0 10px 2px rgba(0,240,255,0.8)' }}
              />
            </div>
          )}
        </div>

        {/* destination name with glitch effect */}
        {name && (
          <div className="mt-10 sm:mt-14 text-center space-y-3">
            <div
              className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-[#00f0ff]/50"
              style={{ textShadow: '0 0 10px rgba(0,240,255,0.3)' }}
            >
              Establishing Uplink
            </div>
            <div className="relative">
              <h2
                className="text-xl sm:text-3xl font-black uppercase tracking-[0.15em] text-white relative z-10"
                style={{
                  textShadow: '0 0 20px rgba(0,240,255,0.5), 0 0 40px rgba(0,240,255,0.2)',
                }}
              >
                {name}
              </h2>
              {/* glitch layers */}
              {loading && (
                <>
                  <span
                    className="absolute inset-0 text-xl sm:text-3xl font-black uppercase tracking-[0.15em] text-[#00f0ff] opacity-40 z-0"
                    style={{
                      clipPath: 'inset(0 0 55% 0)',
                      transform: 'translateX(-3px)',
                      animation: 'glitch-1 2s infinite linear alternate-reverse',
                    }}
                  >
                    {name}
                  </span>
                  <span
                    className="absolute inset-0 text-xl sm:text-3xl font-black uppercase tracking-[0.15em] text-[#0080ff] opacity-40 z-0"
                    style={{
                      clipPath: 'inset(45% 0 0 0)',
                      transform: 'translateX(3px)',
                      animation: 'glitch-2 3s infinite linear alternate-reverse',
                    }}
                  >
                    {name}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" style={{ boxShadow: '0 0 6px rgba(0,240,255,0.8)' }} />
              <span className="text-[9px] sm:text-[10px] font-mono text-[#00f0ff]/40 tracking-widest uppercase">
                {loading ? 'Routing...' : 'Complete'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* flash */}
      <div
        className="absolute inset-0 bg-[#00f0ff] transition-opacity"
        style={{
          opacity: stage === 'flash' ? 0.15 : 0,
          transitionDuration: stage === 'flash' ? '40ms' : `${FLASH_MS + 150}ms`,
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
        px-5 py-2.5 rounded-md
        text-[11px] sm:text-[12px] font-black uppercase tracking-[0.18em]
        transition-all duration-200 ease-out
        outline-none focus:outline-none focus:ring-0
        ${hasLiveLink
          ? darkMode
            ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/25 hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/18 hover:text-white'
            : 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/18 hover:text-white'
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

const WebsiteCard = ({ site, darkMode, onPreview, onVisit }) => (
  <div className="bg-white/5 backdrop-blur-md border border-[#00f0ff]/10 rounded-md overflow-hidden shadow-lg transition-all duration-500 hover:border-[#00f0ff]/30 group">
    <button
      onClick={() => onPreview(site)}
      className="relative w-full aspect-video overflow-hidden block outline-none focus:outline-none"
      aria-label={`Preview ${site.name}`}
    >
      <img
        src={site.image}
        alt={site.name}
        className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-6">
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-[#00f0ff] mb-1">
          {site.tag}
        </p>
        <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tighter leading-none">
          {site.name}
        </h4>
      </div>
    </button>

    <div className="p-6 sm:p-8 space-y-4 sm:space-y-5">
      <p className="text-sm opacity-60 font-medium leading-relaxed">{site.desc}</p>
      <VisitLink site={site} darkMode={darkMode} onVisit={onVisit} />
    </div>
  </div>
);

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
  const { target: portalTarget, stage: portalStage, trigger: visitWebsite } = usePortalTransition();

  const openWebsite = (site) => setActive({ item: site, list: null, index: null });
  const openPoster = (poster, index) => setActive({ item: poster, list: posters, index });

  const navigate = (dir) => {
    setActive((prev) => {
      if (!prev || !prev.list) return prev;
      const nextIndex = (prev.index + dir + prev.list.length) % prev.list.length;
      return { item: prev.list[nextIndex], list: prev.list, index: nextIndex };
    });
  };

  const zoomingIn = portalStage === 'loading' || portalStage === 'flash';

  return (
    <div className="relative">
      <style>{`
        @keyframes cyber-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes cyber-spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes glitch-1 {
          0% { clip-path: inset(20% 0 60% 0); transform: translateX(-2px); }
          20% { clip-path: inset(10% 0 80% 0); transform: translateX(2px); }
          40% { clip-path: inset(50% 0 30% 0); transform: translateX(-1px); }
          60% { clip-path: inset(80% 0 5% 0); transform: translateX(3px); }
          80% { clip-path: inset(40% 0 40% 0); transform: translateX(-2px); }
          100% { clip-path: inset(15% 0 70% 0); transform: translateX(1px); }
        }
        @keyframes glitch-2 {
          0% { clip-path: inset(60% 0 20% 0); transform: translateX(2px); }
          20% { clip-path: inset(30% 0 50% 0); transform: translateX(-3px); }
          40% { clip-path: inset(80% 0 10% 0); transform: translateX(1px); }
          60% { clip-path: inset(10% 0 70% 0); transform: translateX(-2px); }
          80% { clip-path: inset(50% 0 30% 0); transform: translateX(2px); }
          100% { clip-path: inset(25% 0 55% 0); transform: translateX(-1px); }
        }
      `}</style>

      <Lightbox active={active} onClose={() => setActive(null)} onNav={navigate} />
      <CyberLoader stage={portalStage} name={portalTarget?.name} />

      <div
        style={{
          transform: zoomingIn
            ? 'scale(0.96)'
            : 'scale(1)',
          transformOrigin: '50% 50%',
          opacity: zoomingIn ? 0.3 : 1,
          filter: zoomingIn ? 'blur(6px) brightness(0.7)' : 'blur(0px) brightness(1)',
          transitionProperty: 'transform, opacity, filter',
          transitionDuration: portalStage === 'restoring' ? `${RESTORE_MS}ms` : `${LOAD_MS}ms`,
          transitionTimingFunction:
            portalStage === 'restoring' ? 'cubic-bezier(0.16,1,0.3,1)' : 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="space-y-16 sm:space-y-24 animate-fade-in"
      >
        {/* ================= WEBSITES ================= */}
        <section>
          <SectionEyebrow label="Websites" icon={<Globe size={16} className="text-[#00f0ff]" />} />
          <p className="text-sm sm:text-base opacity-60 max-w-2xl mb-8 sm:mb-10">
            Full-stack builds spanning e-commerce, admin dashboards, and secure portals. Click
            a thumbnail for a closer look, or launch a site and watch reality fold in on itself.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {websites.map((site) => (
              <WebsiteCard
                key={site.name}
                site={site}
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