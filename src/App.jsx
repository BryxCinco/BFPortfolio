import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sun,
  Moon,
  Truck,
  Music,
  Anchor,
  Coffee,
  Download,
  MessageSquare,
  Globe,
  ExternalLink,
  X,
  Home,
  User,
  Mail,
  Menu,
  Quote,
  Lock,
  Award,
  Box,
  Layers
} from 'lucide-react';

// Import ang Components
import Carousel from './Carousel';
import About from './About';
import Contact from './Contact';
import Chatbot from './Chatbot';
import Certifications, { CertificationsPreview } from './Certifications';
import Project from './Project';
import Stacks from './Stacks';

// CV / Resume Import
import brianCV from './assets/Brian_Paul_Francisco_CV.pdf';

// Local Assets Import
import brian1 from './assets/Brian1.png';
import brian2 from './assets/Brian2.png';
import brian3 from './assets/Brian3.png';
import brian4 from './assets/Brian4.png';
import brian5 from './assets/Brian5.png';
import brian6 from './assets/Brian6.png';

// Project & Tool Images
import sweepImg from './assets/SweepXpress.png';
import soundImg from './assets/Soundlify.png';
import maritimeImg from './assets/Grandline.png';
import doughImg from './assets/Dough Re Mi.png';
import vsCodeLogo from './assets/VSCODE.png';
import canvaLogo from './assets/Canva.png';
import cssLogo from './assets/CSS.png';

// ============================================================================
// THEME TRANSITION & ANIMATION ENGINE
// ============================================================================

const THEME_TRANSITION_DURATION_MS = 650;
const THEME_TRANSITION_EASING = 'cubic-bezier(0.83, 0, 0.17, 1)';

const themeTransitionStyles = `
  ::view-transition-group(root) {
    animation-duration: ${THEME_TRANSITION_DURATION_MS}ms;
  }

  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
    display: block;
  }

  ::view-transition-old(root) {
    z-index: 1;
  }

  ::view-transition-new(root) {
    z-index: 9999;
  }

  @keyframes circleExpand {
    0% { clip-path: circle(0% at 50% 50%); }
    100% { clip-path: circle(150% at 50% 50%); }
  }

  .animate-circle-expand {
    animation: circleExpand 1s cubic-bezier(0.83, 0, 0.17, 1) forwards;
  }

  @keyframes bulletinPop {
    0% { opacity: 0; transform: scale(0.7) translateY(10px); filter: brightness(2.4); }
    40% { opacity: 1; transform: scale(1.08) translateY(0); filter: brightness(1.4); }
    100% { opacity: 1; transform: scale(1) translateY(0); filter: brightness(1); }
  }

  .animate-bulletin-pop {
    animation: bulletinPop 150ms ease-out forwards;
  }

  @media (prefers-reduced-motion: reduce) {
    ::view-transition-group(root) {
      animation-duration: 0.01ms !important;
    }
  }
`;

const ThemeTransitionStyles = () => <style>{themeTransitionStyles}</style>;

function useThemeTransition(setDarkMode) {
  const isAnimating = useRef(false);

  const supportsViewTransitions = useCallback(() => {
    return typeof document !== 'undefined' && typeof document.startViewTransition === 'function';
  }, []);

  const prefersReducedMotion = useCallback(() => {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const toggleTheme = useCallback(
    (event) => {
      if (isAnimating.current) return;

      const originX = event?.clientX ?? window.innerWidth / 2;
      const originY = event?.clientY ?? window.innerHeight / 2;

      const endRadius = Math.hypot(
        Math.max(originX, window.innerWidth - originX),
        Math.max(originY, window.innerHeight - originY)
      );

      const applyTheme = () => setDarkMode((prev) => !prev);

      if (!supportsViewTransitions() || prefersReducedMotion()) {
        applyTheme();
        return;
      }

      isAnimating.current = true;

      const transition = document.startViewTransition(() => {
        applyTheme();
      });

      transition.ready
        .then(() => {
          const clipPath = [
            `circle(0px at ${originX}px ${originY}px)`,
            `circle(${endRadius}px at ${originX}px ${originY}px)`,
          ];

          document.documentElement.animate(
            { clipPath },
            {
              duration: THEME_TRANSITION_DURATION_MS,
              easing: THEME_TRANSITION_EASING,
              pseudoElement: '::view-transition-new(root)',
            }
          );
        })
        .catch(() => {});

      transition.finished.finally(() => {
        isAnimating.current = false;
      });
    },
    [setDarkMode, supportsViewTransitions, prefersReducedMotion]
  );

  return { toggleTheme };
}

const RevealOnScroll = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 transform ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-20 scale-95"
      }`}
    >
      {children}
    </div>
  );
};

const SectionEyebrow = ({ label, icon }) => (
  <div className="flex items-center gap-4 sm:gap-6">
    <h3 className="text-[9px] sm:text-[11px] md:text-[12px] font-black text-[#00FFB3] uppercase tracking-[0.3em] sm:tracking-[0.6em] md:tracking-[1em] whitespace-nowrap">
      {label}
    </h3>
    <div className="h-[1px] flex-1 bg-[#00FFB3]/20"></div>
    {icon}
  </div>
);

// ============================================================================
// ANIMATED NAVIGATION BAR
// ============================================================================

const AnimatedNavBar = ({ darkMode, activeSection, navItems, goToSection, toggleTheme, chatbotRef, setIsSidebarOpen, isDesktop }) => {
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const [loaded, setLoaded] = useState(false);

  // Nav accent color: pink/red (matches the "Download CV" button) in light mode, cyan in dark mode
  const navAccent = darkMode ? '#00FFB3' : '#FF007A';
  const navAccentShadow = darkMode ? 'rgba(0,255,179,0.9)' : 'rgba(255,0,122,0.9)';
  const navAccentGlow = darkMode ? 'rgba(0,255,179,0.35)' : 'rgba(255,0,122,0.35)';

  // Entrance animation trigger
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Sliding underline tracker
  useEffect(() => {
    const container = navRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-nav="${activeSection}"]`);
    if (!activeBtn) return;

    setIndicator({
      left: activeBtn.offsetLeft,
      width: activeBtn.offsetWidth,
      opacity: 1,
    });
  }, [activeSection]);

  // Recalculate on resize
  useEffect(() => {
    const handleResize = () => {
      const container = navRef.current;
      if (!container) return;
      const activeBtn = container.querySelector(`[data-nav="${activeSection}"]`);
      if (!activeBtn) return;
      setIndicator({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
        opacity: 1,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSection]);

  return (
    <nav
      className={`fixed top-0 w-full z-[100] p-4 sm:p-6 flex justify-between items-center px-4 sm:px-6 md:px-10 backdrop-blur-xl border-b transition-all duration-700 ${
        loaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      } ${darkMode ? 'bg-[#1B1B2A]/30 border-[#00FFB3]/10' : 'bg-white/60 border-[#FF007A]/20'}`}
    >
      {/* Logo */}
      <button
        onClick={() => goToSection('home')}
        aria-label="Go to home"
        className={`cursor-target backdrop-blur-xl border px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-black tracking-tighter text-lg sm:text-xl hover:scale-105 active:scale-95 transition-all duration-300 shrink-0 ${
          darkMode ? 'bg-white/5 border-[#00FFB3]/20 hover:border-[#00FFB3]/60 hover:shadow-[0_0_30px_rgba(0,255,179,0.25)]' : 'bg-white/70 border-[#FFEA00] hover:shadow-[0_0_30px_rgba(255,234,0,0.35)]'
        }`}
      >
        Brian<span className="text-[#00FFB3]" style={{textShadow: "0 0 15px rgba(0,255,179,0.6)"}}> Francisco</span>
      </button>

      {/* Desktop Nav with Sliding Underline */}
      <div
        ref={navRef}
        className={`hidden lg:flex items-center gap-1 backdrop-blur-xl border rounded-full px-2 py-2 relative ${
          darkMode ? 'bg-white/5 border-[#00FFB3]/20' : 'bg-white/70 border-[#FFEA00]'
        }`}
      >
        {/* THE SLIDING INDICATOR — bright neon underline */}
        <div
          className="absolute bottom-1.5 h-[2px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none"
          style={{
            left: indicator.left,
            width: indicator.width,
            opacity: indicator.opacity,
            backgroundColor: navAccent,
            boxShadow: `0 0 6px ${navAccentShadow}, 0 0 2px ${navAccentShadow}`,
          }}
        />

        {navItems.map((item, idx) => (
          <button
            key={item.name}
            data-nav={item.id}
            onClick={() => goToSection(item.id)}
            className={`cursor-target relative flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
              activeSection === item.id ? '' : 'opacity-60 hover:opacity-100'
            } ${loaded ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'}`}
            style={{
              transitionDelay: loaded ? `${idx * 60 + 100}ms` : '0ms',
              color: activeSection === item.id ? navAccent : undefined,
              boxShadow: activeSection === item.id ? `0 0 8px ${navAccentGlow}` : 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = navAccent;
              e.currentTarget.style.backgroundColor = darkMode
                ? 'rgba(0,255,179,0.12)'
                : 'rgba(255,0,122,0.12)';
              if (activeSection !== item.id) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = activeSection === item.id ? navAccent : '';
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span className={`transition-transform duration-300 ${activeSection === item.id ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            {item.name}
          </button>
        ))}

        {/* Ask Me — opens the chat modal, sits right after Contact Me */}
        <button
          onClick={() => chatbotRef.current?.open()}
          aria-label="Open chat assistant"
          className={`cursor-target relative flex items-center gap-2 ml-1 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${
            loaded ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
          }`}
          style={{
            transitionDelay: loaded ? `${navItems.length * 60 + 100}ms` : '0ms',
            backgroundColor: darkMode ? 'rgba(0,255,179,0.12)' : 'rgba(255,0,122,0.12)',
            color: navAccent,
            boxShadow: `0 0 0 1px ${navAccentGlow}`,
          }}
        >
          <MessageSquare size={16} />
          Ask Me
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open navigation menu"
          title="Menu"
          className={`cursor-target lg:hidden p-3 rounded-full backdrop-blur-xl border hover:scale-110 active:scale-95 transition-all duration-300 ${
            darkMode
              ? 'bg-white/5 border-[#00FFB3]/20 hover:border-[#00FFB3]/50'
              : 'bg-white/70 border-[#FFEA00] hover:border-[#FF007A]/60 hover:bg-[#FF007A]/10'
          }`}
        >
          <Menu size={20} className={darkMode ? 'text-[#00FFB3]' : 'text-[#A700FF]'} />
        </button>

        {/* Ask Me + theme toggle live inside the mobile sidebar drawer only; desktop keeps this capsule switch here */}
        {isDesktop && <ThemeSwitch darkMode={darkMode} toggleTheme={toggleTheme} />}
      </div>
    </nav>
  );
};

const ThemeSwitch = ({ darkMode, toggleTheme, className = '' }) => (
  <button
    onClick={toggleTheme}
    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    className={`cursor-target relative inline-flex items-center shrink-0 w-14 h-7 sm:w-16 sm:h-8 rounded-full border transition-colors duration-300 ${
      darkMode ? 'bg-[#00FFB3]/10 border-[#00FFB3]/40' : 'bg-[#FF007A]/10 border-[#FF007A]/40'
    } ${className}`}
  >
    <Moon
      size={12}
      className={`absolute left-1.5 sm:left-2 transition-opacity duration-300 ${darkMode ? 'opacity-0' : 'opacity-50 text-[#FF007A]'}`}
    />
    <Sun
      size={12}
      className={`absolute right-1.5 sm:right-2 transition-opacity duration-300 ${darkMode ? 'opacity-50 text-[#00FFB3]' : 'opacity-0'}`}
    />
    <span
      className={`absolute top-0.5 left-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-md transition-transform duration-300 ${
        darkMode ? 'translate-x-0 bg-[#1B1B2A]' : 'translate-x-[28px] sm:translate-x-[32px] bg-white'
      }`}
    >
      {darkMode ? (
        <Moon size={13} className="text-[#00FFB3]" />
      ) : (
        <Sun size={13} className="text-[#FF007A]" />
      )}
    </span>
  </button>
);

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handleChange = (e) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    if (mq.addEventListener) {
      mq.addEventListener('change', handleChange);
      return () => mq.removeEventListener('change', handleChange);
    }
    mq.addListener(handleChange);
    return () => mq.removeListener(handleChange);
  }, []);

  return isDesktop;
}

// ============================================================================
// DESKTOP-ONLY SIDE DECORATION — Cherry Blossom Cyber Trees (light) /
// Cyber City Lights (dark). Fixed to one side only, purely decorative,
// and hidden below the `lg` breakpoint so it naturally disappears when
// the desktop browser is zoomed in (the CSS px viewport shrinks below
// the breakpoint and the media query stops matching).
// ============================================================================

const CherryBlossomCyberTrees = () => {
  const trunks = [
    { path: 'M40 900 C 44 700, 30 560, 55 430 C 70 340, 50 240, 75 140', w: 7, c: '#FF007A', op: 0.6 },
    { path: 'M170 900 C 175 800, 160 720, 180 640 C 195 560, 178 480, 200 400', w: 5.5, c: '#00FFB3', op: 0.45 },
    { path: 'M-10 900 C -6 780, -18 660, 5 560', w: 4.5, c: '#A700FF', op: 0.4 },
  ];

  const branches = [
    'M55 430 C 90 400, 120 390, 150 360',
    'M60 560 C 20 540, -10 520, -30 500',
    'M70 240 C 110 220, 140 200, 175 170',
    'M63 340 C 40 320, 15 310, -15 300',
    'M180 640 C 200 610, 215 590, 230 560',
    'M190 480 C 165 460, 145 450, 120 430',
    'M5 560 C 30 540, 50 535, 75 515',
    'M200 400 C 180 380, 165 370, 145 350',
  ];

  const blossomClusters = [
    [75, 140, 24], [110, 108, 15], [55, 88, 13], [140, 163, 11], [175, 168, 22],
    [150, 360, 18], [120, 388, 13], [90, 398, 11], [15, 300, 14], [-15, 300, 16],
    [-30, 500, 20], [10, 520, 13], [-5, 468, 11], [75, 515, 12], [50, 535, 15],
    [230, 560, 18], [215, 588, 12], [200, 610, 11], [120, 430, 14], [145, 350, 12],
    [200, 400, 15], [180, 380, 10], [5, 560, 13],
  ];

  const petals = [
    [30, 260, 4, 20], [95, 340, 3, -15], [10, 480, 4.5, 40], [140, 560, 3.5, -30],
    [190, 420, 4, 10], [60, 700, 3, 25], [150, 780, 4, -20], [200, 200, 3.5, 15],
    [45, 620, 3, -10], [175, 260, 4, 35], [-25, 380, 3.5, -25], [110, 650, 3, 5],
    [20, 820, 4, -35], [165, 700, 3.5, 20], [80, 200, 3, -5],
  ];

  const lanterns = [ [175, 170], [-30, 500], [230, 560], [15, 300] ];

  return (
    <svg viewBox="0 0 220 900" preserveAspectRatio="xMidYMin slice" className="w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id="blossomGlowPink" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF007A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF007A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blossomGlowCyan" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00FFB3" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#00FFB3" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blossomGlowPurple" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A700FF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#A700FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFEA00" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FFEA00" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFEA00" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ambient glow blobs */}
      <circle cx="60" cy="120" r="150" fill="url(#blossomGlowPink)" />
      <circle cx="170" cy="600" r="170" fill="url(#blossomGlowCyan)" />
      <circle cx="0" cy="560" r="130" fill="url(#blossomGlowPurple)" />

      {/* ground mist glow */}
      <ellipse cx="80" cy="895" rx="160" ry="30" fill="url(#blossomGlowPink)" opacity="0.5" />

      {/* trunks — layered double-stroke bark effect */}
      {trunks.map((t, i) => (
        <g key={`trunk-${i}`}>
          <path d={t.path} stroke={t.c} strokeOpacity={t.op * 0.4} strokeWidth={t.w + 4} fill="none" strokeLinecap="round" />
          <path d={t.path} stroke={t.c} strokeOpacity={t.op} strokeWidth={t.w} fill="none" strokeLinecap="round" />
        </g>
      ))}

      {/* branches */}
      {branches.map((d, i) => (
        <path key={`br-${i}`} d={d} stroke="#FF007A" strokeOpacity={0.32 + (i % 3) * 0.06} strokeWidth={3.5 - (i % 3) * 0.5} fill="none" strokeLinecap="round" />
      ))}

      {/* blossom clusters — layered sakura petals with neon centers */}
      {blossomClusters.map(([cx, cy, r], i) => (
        <g key={`bl-${i}`}>
          <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" fillOpacity="0.16" />
          <circle cx={cx - r * 0.35} cy={cy - r * 0.2} r={r * 0.55} fill="#FFD9EC" fillOpacity="0.22" />
          <circle cx={cx + r * 0.3} cy={cy + r * 0.25} r={r * 0.4} fill="#FFFFFF" fillOpacity="0.18" />
          <circle
            cx={cx}
            cy={cy}
            r={r * 0.42}
            fill={i % 4 === 0 ? '#A700FF' : '#FF007A'}
            fillOpacity="0.65"
            style={{ filter: `drop-shadow(0 0 7px ${i % 4 === 0 ? 'rgba(167,0,255,0.65)' : 'rgba(255,0,122,0.65)'})` }}
          />
        </g>
      ))}

      {/* paper lantern nodes hanging on the tree — extra detail */}
      {lanterns.map(([cx, cy], i) => (
        <g key={`lt-${i}`}>
          <circle cx={cx} cy={cy + 26} r="22" fill="url(#lanternGlow)" />
          <rect x={cx - 6} y={cy + 16} width="12" height="18" rx="5" fill="#FFEA00" fillOpacity="0.55" stroke="#FFEA00" strokeOpacity="0.7" strokeWidth="1" />
          <line x1={cx} y1={cy} x2={cx} y2={cy + 16} stroke="#FFEA00" strokeOpacity="0.4" strokeWidth="1" />
        </g>
      ))}

      {/* falling petals, gently rotated */}
      {petals.map(([x, y, r, rot], i) => (
        <ellipse key={`pt-${i}`} cx={x} cy={y} rx={r} ry={r * 0.55} fill="#FF007A" fillOpacity="0.5" transform={`rotate(${rot} ${x} ${y})`} />
      ))}

      {/* tiny sparkle accents */}
      {[[100, 250], [30, 450], [190, 320], [60, 620], [150, 700], [10, 700], [180, 150]].map(([x, y], i) => (
        <g key={`sp-${i}`} opacity="0.55">
          <line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke="#FFFFFF" strokeWidth="1" />
          <line x1={x} y1={y - 5} x2={x} y2={y + 5} stroke="#FFFFFF" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
};

const CyberCityLights = () => {
  const buildings = [
    { x: -20, y: 420, w: 60, h: 480, style: 'flat' },
    { x: 30, y: 300, w: 50, h: 600, style: 'antenna' },
    { x: 75, y: 500, w: 45, h: 400, style: 'stepped' },
    { x: 110, y: 220, w: 55, h: 680, style: 'tank' },
    { x: 160, y: 360, w: 60, h: 540, style: 'antenna' },
    { x: 5, y: 620, w: 40, h: 280, style: 'flat' },
    { x: 205, y: 470, w: 40, h: 430, style: 'stepped' },
  ];

  const windowRects = [];
  buildings.forEach((b, bi) => {
    const cols = 3;
    const rowH = 26;
    const rows = Math.floor((b.h - 30) / rowH);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lit = (bi * 13 + r * 7 + c * 5) % 5 !== 0;
        if (!lit) continue;
        const colors = ['#00FFB3', '#FFEA00', '#A700FF', '#FF007A'];
        const color = colors[(bi + r + c) % colors.length];
        windowRects.push({
          x: b.x + 8 + c * ((b.w - 16) / (cols - 1)),
          y: b.y + 18 + r * rowH,
          color,
          op: 0.35 + ((bi + r + c) % 3) * 0.12,
        });
      }
    }
  });

  return (
    <svg viewBox="0 0 220 900" preserveAspectRatio="xMidYMin slice" className="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="citySky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A700FF" stopOpacity="0.10" />
          <stop offset="45%" stopColor="#00FFB3" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#00FFB3" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cityMoonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00FFB3" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#00FFB3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="buildingFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00FFB3" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#00FFB3" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="groundFog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B1B2A" stopOpacity="0" />
          <stop offset="100%" stopColor="#00FFB3" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* sky wash */}
      <rect x="0" y="0" width="220" height="900" fill="url(#citySky)" />

      {/* stars */}
      {[
        [20, 40], [60, 20], [100, 60], [140, 30], [180, 50], [15, 90], [190, 100],
        [50, 130], [120, 100], [200, 20], [10, 150], [170, 140],
      ].map(([x, y], i) => (
        <circle key={`star-${i}`} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1} fill="#FFFFFF" fillOpacity={0.4 + (i % 3) * 0.15} />
      ))}

      {/* moon with glow ring */}
      <circle cx="150" cy="90" r="130" fill="url(#cityMoonGlow)" />
      <circle cx="150" cy="90" r="26" fill="#00FFB3" fillOpacity="0.18" stroke="#00FFB3" strokeOpacity="0.4" strokeWidth="1.5" />
      <circle cx="142" cy="82" r="6" fill="#00FFB3" fillOpacity="0.15" />

      {/* skyline silhouettes with varied rooftop details */}
      {buildings.map((b, i) => (
        <g key={`b-${i}`}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="url(#buildingFade)" stroke="#00FFB3" strokeOpacity="0.22" strokeWidth="1" />
          {b.style === 'antenna' && (
            <>
              <line x1={b.x + b.w / 2} y1={b.y} x2={b.x + b.w / 2} y2={b.y - 40} stroke="#00FFB3" strokeOpacity="0.4" strokeWidth="1.5" />
              <circle cx={b.x + b.w / 2} cy={b.y - 42} r="3" fill="#FF007A" fillOpacity="0.8" style={{ filter: 'drop-shadow(0 0 5px rgba(255,0,122,0.8))' }} />
            </>
          )}
          {b.style === 'tank' && (
            <rect x={b.x + b.w / 2 - 8} y={b.y - 18} width="16" height="18" fill="#1B1B2A" fillOpacity="0.4" stroke="#A700FF" strokeOpacity="0.35" strokeWidth="1" />
          )}
          {b.style === 'stepped' && (
            <rect x={b.x + b.w * 0.2} y={b.y - 24} width={b.w * 0.6} height="24" fill="url(#buildingFade)" stroke="#00FFB3" strokeOpacity="0.22" strokeWidth="1" />
          )}
        </g>
      ))}

      {/* window lights */}
      {windowRects.map((w, i) => (
        <rect key={`w-${i}`} x={w.x} y={w.y} width="4.5" height="7" fill={w.color} fillOpacity={w.op} />
      ))}

      {/* vertical neon sign strips */}
      <path d="M137 250 L137 900" stroke="#A700FF" strokeOpacity="0.28" strokeWidth="2.5" />
      <path d="M155 250 L155 900" stroke="#00FFB3" strokeOpacity="0.22" strokeWidth="1.5" />
      <path d="M46 350 L46 900" stroke="#FF007A" strokeOpacity="0.2" strokeWidth="1.5" />

      {/* small holographic ad glyphs on a tower face */}
      <g opacity="0.5">
        <rect x="115" y="260" width="34" height="14" rx="2" fill="none" stroke="#FFEA00" strokeOpacity="0.5" strokeWidth="1" />
        <line x1="120" y1="267" x2="144" y2="267" stroke="#FFEA00" strokeOpacity="0.5" strokeWidth="1" />
        <rect x="115" y="282" width="20" height="8" rx="2" fill="#FFEA00" fillOpacity="0.15" />
      </g>

      {/* drifting drone lights with trail */}
      {[[190, 200], [30, 260], [210, 420]].map(([x, y], i) => (
        <g key={`dr-${i}`}>
          <line x1={x} y1={y} x2={x - 18} y2={y + 4} stroke="#00FFB3" strokeOpacity="0.3" strokeWidth="1.5" />
          <circle cx={x} cy={y} r="2.5" fill="#00FFB3" fillOpacity="0.9" style={{ filter: 'drop-shadow(0 0 5px rgba(0,255,179,0.8))' }} />
        </g>
      ))}

      {/* ground fog glow at the base */}
      <rect x="0" y="760" width="220" height="140" fill="url(#groundFog)" />
    </svg>
  );
};

const SIDE_FADE_MASK =
  'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)';

const SideDecoration = ({ darkMode, side = 'right' }) => (
  <div
    className={`hidden lg:block fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-screen w-56 xl:w-72 2xl:w-80 pointer-events-none z-0 overflow-hidden opacity-50`}
    style={{
      transform: side === 'left' ? 'scaleX(-1)' : undefined,
      WebkitMaskImage: SIDE_FADE_MASK,
      maskImage: SIDE_FADE_MASK,
    }}
    aria-hidden="true"
  >
    {darkMode ? <CyberCityLights /> : <CherryBlossomCyberTrees />}
  </div>
);

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : true;
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatbotRef = useRef(null);

  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('activeSection') || 'home';
  });

  const [showIntro, setShowIntro] = useState(() =>
    !sessionStorage.getItem('hasAnimated') && activeSection === 'home'
  );

  const [currentGreeting, setCurrentGreeting] = useState("Hello");
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const greetings = [
    "Hello", "¡Hola!", "Bonjour", "Hallo", "Ciao", "こんにちは", "नमस्ते",
    "مرحبا", "你好", "안녕하세요", "Привет", "שלום", "Merhaba",
    "Szia", "Hej", "Zdravo", "Hei", "Ahoj", "Goddag", "Γεια"
  ];

  useEffect(() => {
    if (!showIntro) return;

    const runSequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));

      for (let i = 0; i < greetings.length; i++) {
        setCurrentGreeting(greetings[i]);
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      setCurrentGreeting("Kamusta");
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsAnimatingOut(true);
      setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('hasAnimated', 'true');
      }, 1000);
    };

    runSequence();
  }, [showIntro]);

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const { toggleTheme } = useThemeTransition(setDarkMode);
  const isDesktop = useIsDesktop();

  const skills = [
    { name: 'HTML', logo: 'https://cdn.simpleicons.org/html5/E34F26' },
    { name: 'CSS', logo: cssLogo },
    { name: 'Javascript', logo: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
    { name: 'React', logo: 'https://cdn.simpleicons.org/react/61DAFB' },
    { name: 'PHP', logo: 'https://cdn.simpleicons.org/php/777BB4' },
    { name: 'Python', logo: 'https://cdn.simpleicons.org/python/3776AB' },
    { name: 'JSON', logo: 'https://cdn.simpleicons.org/json/000000' },
    { name: 'Bootstrap', logo: 'https://cdn.simpleicons.org/bootstrap/7952B3' },
    { name: 'Tailwind', logo: 'https://cdn.simpleicons.org/tailwindcss/06B6D4' },
    { name: 'MySQL', logo: 'https://cdn.simpleicons.org/mysql/4479A1' },
  ];

  const projects = [
    {
      name: 'SweepXpress',
      role: 'Logistics System',
      desc: 'Real-time supply chain efficiency and tracking solutions.',
      icon: <Truck size={28} className="text-[#00FFB3]" />,
      image: sweepImg
    },
    {
      name: 'Soundlify',
      role: 'Streaming Platform',
      desc: 'Modern music interface with seamless audio playback.',
      icon: <Music size={28} className="text-[#00FFB3]" />,
      image: soundImg
    },
    {
      name: 'Maritime LMS',
      role: 'Learning Portal',
      desc: 'Secure environment for maritime students.',
      icon: <Anchor size={28} className="text-[#00FFB3]" />,
      image: maritimeImg
    },
    {
      name: 'Dough Re Mi',
      role: 'Coffee & Bakery',
      desc: 'Full-stack e-commerce system using PHP and MySQL.',
      icon: <Coffee size={28} className="text-[#00FFB3]" />,
      image: doughImg
    },
  ];

  const info = [
    { label: "Status", val: "Fresh Graduate IT Student" },
    { label: "Education", val: "BSIT - National Teachers College" },
    { label: "Location", val: "Sta Cruz, Manila, PH" },
    { label: "Specialization", val: "Full-Stack Developer & UI/UX" }
  ];

  const galleryImages = [brian2, brian3, brian4, brian5, brian6];

  const navItems = [
    { name: 'Home', icon: <Home size={18}/>, id: 'home' },
    { name: 'About', icon: <User size={18}/>, id: 'about' },
    { name: 'Certificates', icon: <Award size={18}/>, id: 'certificates' },
    { name: 'Projects', icon: <Box size={18}/>, id: 'projects' },
    { name: 'Stacks', icon: <Layers size={18}/>, id: 'stacks' },
    { name: 'Contact Me', icon: <Mail size={18}/>, id: 'contact' }
  ];

  const goToSection = (id) => {
    setActiveSection(id);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {showIntro && (
        <div className={`fixed inset-0 z-[9999] ${isAnimatingOut ? 'pointer-events-none' : ''}`}>
          {/* top slice panel */}
          <div
            className={`absolute top-0 left-0 w-full h-1/2 bg-[#1B1B2A] transition-transform duration-[900ms] ease-[cubic-bezier(0.83,0,0.17,1)] ${isAnimatingOut ? '-translate-y-full' : 'translate-y-0'}`}
          />
          {/* bottom slice panel */}
          <div
            className={`absolute bottom-0 left-0 w-full h-1/2 bg-[#1B1B2A] transition-transform duration-[900ms] ease-[cubic-bezier(0.83,0,0.17,1)] ${isAnimatingOut ? 'translate-y-full' : 'translate-y-0'}`}
          />
          {/* greeting text */}
          <div className={`absolute inset-0 flex items-center justify-center px-4 transition-opacity duration-300 ${isAnimatingOut ? 'opacity-0' : 'opacity-100'}`}>
            <h1
              key={currentGreeting}
              className="animate-bulletin-pop text-white text-4xl sm:text-6xl md:text-8xl font-black text-center"
              style={{textShadow: "0 0 50px rgba(255,255,255,0.7), 0 0 100px rgba(255,255,255,0.35)"}}
            >
              {currentGreeting}
            </h1>
          </div>
        </div>
      )}
      <div className={darkMode ? 'dark bg-[#1B1B2A] text-[#FFEA00]' : 'light bg-[#FFEA00] text-[#1B1B2A]'}>
      <ThemeTransitionStyles />
      <div className="min-h-screen relative transition-colors duration-700 selection:bg-[#00FFB3] selection:text-white pb-20 overflow-x-hidden bg-inherit">

        <div className="fixed top-[-10%] left-[-10%] w-[70%] h-[70%] sm:w-[50%] sm:h-[50%] rounded-full bg-[#FF007A]/20 blur-[80px] sm:blur-[120px] pointer-events-none animate-pulse" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[70%] h-[70%] sm:w-[50%] sm:h-[50%] rounded-full bg-[#A700FF]/20 blur-[80px] sm:blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Desktop-only one-sided decoration: Cherry Blossom Cyber Trees (light) /
            Cyber City Lights (dark). isDesktop tracks a `min-width:1024px` media
            query, so this also vanishes automatically when zooming in on desktop. */}
        {isDesktop && (
          <>
            <SideDecoration darkMode={darkMode} side="left" />
            <SideDecoration darkMode={darkMode} side="right" />
          </>
        )}

        {selectedImage && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button className="cursor-target absolute top-6 right-6 sm:top-10 sm:right-10 text-white hover:text-[#00FFB3] transition-colors z-[1001]" aria-label="Close preview">
              <X size={32} className="sm:hidden" />
              <X size={40} className="hidden sm:block" />
            </button>
            <div className="relative rounded-md shadow-2xl animate-scale-in">
              <img
                src={selectedImage}
                className="max-w-full max-h-[85vh] object-contain"
                alt="Preview"
              />
            </div>
          </div>
        )}

        {/* Mobile / tablet slide-in drawer — desktop uses the inline top nav instead */}
        <div className={`fixed inset-0 z-[1000] transition-all duration-500 lg:hidden ${isSidebarOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <div className={`absolute left-4 sm:left-6 top-20 sm:top-24 bottom-4 sm:bottom-6 w-[78vw] max-w-[280px] sm:w-72 backdrop-blur-2xl border rounded-md sm:rounded-md p-7 sm:p-10 flex flex-col transition-all duration-500 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[130%]'} ${darkMode ? 'bg-[#1B1B2A]/40 border-[#00FFB3]/20 text-[#FFEA00]' : 'bg-white/90 border-[#FFEA00] text-[#1B1B2A]'}`}>
            <div className="flex justify-between items-center mb-10 sm:mb-12">
              <span className="font-black text-lg sm:text-xl tracking-tighter">NAV<span className="text-[#00FFB3]">IGATION</span></span>
              <button onClick={() => setIsSidebarOpen(false)} aria-label="Close navigation" className={`cursor-target p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-[#FFEA00]'}`}>
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4 sm:gap-6 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => goToSection(item.id)}
                  className={`cursor-target flex items-center gap-4 text-xs sm:text-sm font-black uppercase tracking-widest transition-all group ${activeSection === item.id ? 'opacity-100 text-[#00FFB3]' : 'opacity-60 hover:opacity-100'}`}
                >
                  <span className={`p-3 border rounded-md group-hover:bg-[#00FFB3]/20 transition-all ${activeSection === item.id ? 'bg-[#00FFB3]/20 border-[#00FFB3]' : 'bg-black/5 border-[#00FFB3]/10'}`}>{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
            {/* Divider line right after Contact Me, then Ask Me + the theme switch sit up here instead of at the bottom */}
            <div className={`pt-6 sm:pt-8 mt-6 sm:mt-8 border-t space-y-4 sm:space-y-5 ${darkMode ? 'border-[#00FFB3]/10' : 'border-[#FFEA00]'}`}>
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  chatbotRef.current?.open();
                }}
                aria-label="Open chat assistant"
                className="cursor-target w-full flex items-center gap-4 text-xs sm:text-sm font-black uppercase tracking-widest transition-all group opacity-90 hover:opacity-100"
              >
                <span className="p-3 border rounded-md bg-[#00FFB3]/20 border-[#00FFB3] group-hover:bg-[#00FFB3]/30 transition-all">
                  <MessageSquare size={18} className="text-[#00FFB3]" />
                </span>
                Ask Me
              </button>

              <div className="w-full flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest opacity-90">
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
                <ThemeSwitch darkMode={darkMode} toggleTheme={toggleTheme} />
              </div>
            </div>

            <div className="mt-auto pt-6">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Ready for</p>
              <p className="text-xs font-black text-[#00FFB3] uppercase">Deployment 2026</p>
            </div>
          </div>
        </div>

        {/* NEW ANIMATED NAV */}
        <AnimatedNavBar
          darkMode={darkMode}
          activeSection={activeSection}
          navItems={navItems}
          goToSection={goToSection}
          toggleTheme={toggleTheme}
          chatbotRef={chatbotRef}
          setIsSidebarOpen={setIsSidebarOpen}
          isDesktop={isDesktop}
        />

        <div key={activeSection} className="w-full max-w-[1800px] mx-auto pt-24 sm:pt-32 px-4 sm:px-6 lg:px-12 space-y-6">

          {activeSection === 'home' ? (
            <>
              <RevealOnScroll>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                  <header className="lg:col-span-9 bg-white/5 dark:bg-[#1B1B2A]/10 backdrop-blur-md border border-[#00FFB3]/10 rounded-md sm:rounded-md lg:rounded-md p-6 sm:p-10 md:p-16 lg:p-20 flex flex-col md:flex-row items-center gap-8 sm:gap-12 relative group animate-fade-in-up overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                    <div className="absolute top-0 right-0 p-6 sm:p-12 text-[8rem] sm:text-[12rem] md:text-[18rem] font-black opacity-[0.03] text-[#00FFB3] pointer-events-none uppercase leading-none">Code</div>
                    <div className="relative shrink-0 animate-scale-in">
                      <div className="w-36 h-36 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-md sm:rounded-md overflow-hidden shadow-[0_0_40px_rgba(0,255,179,0.2)] border-4 border-[#00FFB3]/20 rotate-2">
                        <img src={brian1} alt="Brian" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-[#FF007A] text-white px-5 sm:px-8 py-2 sm:py-3 rounded-md font-black text-[10px] sm:text-xs uppercase shadow-[0_10px_20px_rgba(0,255,179,0.3)]">Software Engineer</div>
                    </div>
                    <div className="text-center md:text-left space-y-4 sm:space-y-6 flex-1 relative z-10">
                      <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none text-[#1B1B2A] dark:text-white" style={{textShadow: "0 0 30px rgba(0,255,179,0.3)"}}>Brian Paul<span className="text-[#00FFB3]" style={{textShadow: "0 0 40px rgba(0,255,179,0.6)"}}>.</span></h1>
                      <p className="text-base sm:text-xl md:text-2xl font-bold opacity-70 max-w-2xl leading-relaxed">
                        An aspiring <span className="text-[#00FFB3]" style={{textShadow: "0 0 12px rgba(0,255,179,0.4)"}}>Full-Stack Engineer</span> with a focus on UI/UX design, AI integration, and APIs — someone who wants to build things and turn ideas into real-world solutions.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 justify-center md:justify-start">
                        <a
                          href={brianCV}
                          download="Brian_Paul_Francisco_CV.pdf"
                          className="cursor-target flex items-center justify-center gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-[#FF007A] text-white rounded-md font-black text-xs uppercase tracking-widest hover:bg-[#00FFB3] transition-all shadow-[0_10px_25px_rgba(0,255,179,0.4)]"
                        >
                          <Download size={16} /> Download CV
                        </a>
                        <button
                          onClick={() => {
                            setActiveSection('about');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`cursor-target flex items-center justify-center gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-white/5 border rounded-md font-black text-xs uppercase tracking-widest transition-all ${
                            darkMode
                              ? 'border-[#00FFB3]/20 text-[#00FFB3] hover:bg-[#00FFB3] hover:text-[#1B1B2A] hover:border-[#00FFB3]'
                              : 'border-[#FF007A]/30 text-[#FF007A] hover:bg-[#FF007A] hover:text-white hover:border-[#FF007A]'
                          }`}
                        >
                          <User size={16} /> About Me
                        </button>
                      </div>
                    </div>
                  </header>

                  <div className="lg:col-span-3 flex flex-col gap-6">
                    <section className="flex-1 bg-gradient-to-br from-[#FF007A] to-[#A700FF] rounded-md sm:rounded-md p-7 sm:p-10 shadow-[0_15px_35px_rgba(0,255,179,0.3)] animate-fade-in-up">
                      <div className="flex items-center gap-2 mb-5 sm:mb-6 opacity-80 uppercase font-black text-[10px] tracking-widest !text-white">
                        <Globe size={14} className="!text-white" /> Location
                      </div>
                      <p className="text-3xl sm:text-4xl font-black italic leading-tight mb-3 sm:mb-4 tracking-tighter !text-white">"Manila, PH."</p>
                      <p className="text-sm opacity-90 !text-white">Ready for high-level software deployments and integrations.</p>
                    </section>
                    <section className="bg-white/5 backdrop-blur-md border border-[#00FFB3]/10 rounded-md sm:rounded-md p-7 sm:p-8 flex flex-wrap gap-2 shadow-lg animate-fade-in-up">
                      {['Fast Learner', 'Problem Solver', 'UI Expert', 'Secure'].map((t) => (
                        <span key={t} className="px-4 py-2 bg-[#00FFB3]/10 border border-[#00FFB3]/20 rounded-md text-[10px] font-black uppercase text-[#00FFB3] tracking-widest">{t}</span>
                      ))}
                    </section>
                  </div>
                </div>
              </RevealOnScroll>

              <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
                <section className="lg:col-span-4 flex flex-col gap-6">
                  <RevealOnScroll>
                    <div className="bg-white/5 backdrop-blur-md border border-[#00FFB3]/10 rounded-md sm:rounded-md lg:rounded-md p-7 sm:p-10 lg:p-12 space-y-6 sm:space-y-10 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                      <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-[#00FFB3]" style={{textShadow: "0 0 10px rgba(0,255,179,0.5)"}}>Curriculum Vitae</h3>
                      <div className="space-y-6 sm:space-y-8">
                        {info.map((i) => (
                          <div key={i.label} className="group">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#00FFB3]/60 transition-colors">{i.label}</p>
                            <p className="text-base sm:text-lg font-black">{i.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </RevealOnScroll>
                  <RevealOnScroll>
                    <div className="flex-1 bg-gradient-to-br from-[#A700FF]/40 via-[#A700FF]/20 to-transparent backdrop-blur-xl border border-[#00FFB3]/30 rounded-md sm:rounded-md lg:rounded-md p-7 sm:p-10 lg:p-14 relative overflow-hidden group shadow-2xl">
                      <Quote className="absolute top-8 right-8 sm:top-10 sm:right-10 opacity-10 transition-all duration-700" size={64} />
                      <div className="relative z-10 space-y-6 sm:space-y-8">
                        <p className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#00FFB3]">Dev & Life Philosophy</p>
                        <div className="space-y-4 sm:space-y-6">
                          <h4 className="text-2xl sm:text-3xl md:text-4xl font-black italic leading-[1.1] tracking-tighter">
                            "Turning complex logic into <span className="text-[#00FFB3] underline decoration-[#00FFB3]/30 underline-offset-8" style={{textShadow: "0 0 15px rgba(0,255,179,0.5)"}}>seamless</span> user experiences."
                          </h4>
                          <p className="text-base sm:text-lg md:text-xl font-bold opacity-80 leading-relaxed italic">
                            "Innovation is not just about writing code; it's about solving real-world problems with <span className="text-[#00FFB3]">precision</span> and <span className="text-[#00FFB3]">purpose</span>."
                          </p>
                        </div>
                        <div className="pt-4 sm:pt-6 flex items-center gap-4">
                          <div className="h-[2px] w-12 bg-[#00FFB3]/50"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Persistence Over Perfection</span>
                        </div>
                      </div>
                      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#00FFB3]/10 blur-[100px] rounded-full transition-all duration-1000"></div>
                    </div>
                  </RevealOnScroll>
                </section>

                <section className="lg:col-span-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-[#00FFB3]">Selected Work</h3>
                    <button
                      onClick={() => {
                        setActiveSection('projects');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="cursor-target text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#00FFB3]/70 hover:text-[#00FFB3] transition-colors"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((p, idx) => (
                    <RevealOnScroll key={idx}>
                      <div
                        className="cursor-target bg-white/5 backdrop-blur-md border border-[#00FFB3]/10 rounded-md sm:rounded-md p-6 sm:p-8 transition-all duration-500 shadow-lg cursor-pointer h-full"
                        onClick={() => setSelectedImage(p.image)}
                      >
                        <div className="relative h-44 sm:h-56 rounded-md sm:rounded-md overflow-hidden mb-6 sm:mb-8 border border-[#00FFB3]/10">
                          <img src={p.image} className="w-full h-full object-cover transition-all duration-1000" alt={p.name} />
                          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-[#A700FF]/80 backdrop-blur-md rounded-md flex items-center justify-center text-white shadow-xl">
                            {p.icon}
                          </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <h4 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-[#1B1B2A] dark:text-white">{p.name}</h4>
                          <p className="text-sm opacity-60 font-medium">{p.desc}</p>
                        </div>
                      </div>
                    </RevealOnScroll>
                  ))}
                  </div>
                </section>

                <section className="lg:col-span-12">
                  <RevealOnScroll>
                    <div className="bg-white/5 backdrop-blur-md border border-[#00FFB3]/10 rounded-md sm:rounded-md lg:rounded-md p-7 sm:p-12 md:p-20 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
                      <div className="flex flex-col lg:flex-row gap-10 sm:gap-16 items-center">
                        <div className="lg:w-1/3 text-center lg:text-left space-y-4 sm:space-y-6">
                          <h3 className="text-[10px] sm:text-[11px] font-black text-[#00FFB3] uppercase tracking-[0.3em] sm:tracking-[0.5em]">Skillset</h3>
                          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-[#1B1B2A] dark:text-white">Modern Stack.</h2>
                          <p className="opacity-60 text-base sm:text-lg">Specializing in high-performance web applications and databases.</p>
                        </div>
                        <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 sm:gap-8">
                          {skills.map((s, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-3 sm:gap-4">
                              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/5 border border-[#00FFB3]/10 rounded-md sm:rounded-md flex items-center justify-center transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
                                <img src={s.logo} alt="" className="w-7 h-7 sm:w-10 sm:h-10 transition-transform" />
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 text-[#00FFB3] text-center">{s.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </RevealOnScroll>
                </section>

                <section className="lg:col-span-12 pt-6 sm:pt-10">
                  <CertificationsPreview
                    darkMode={darkMode}
                    count={4}
                    onViewAll={() => {
                      setActiveSection('certificates');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </section>
              </main>

              <RevealOnScroll>
                <section className="pt-14 sm:pt-20 space-y-8 sm:space-y-10 overflow-hidden">
                  <h3 className="text-[10px] sm:text-[12px] font-black text-[#00FFB3] uppercase tracking-[0.3em] sm:tracking-[1em] text-center">Visual Archives</h3>

                  {/* Mobile: swipeable carousel */}
                  <div className="sm:hidden">
                    <Carousel
                      items={galleryImages}
                      darkMode={darkMode}
                      cardWidth="78vw"
                      maxWidth={360}
                      renderItem={(img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(img)}
                          aria-label="Preview archive image"
                          className="cursor-target block w-full aspect-[4/3] bg-white/5 border border-[#00FFB3]/10 rounded-md overflow-hidden"
                        >
                          <img src={img} className="w-full h-full object-cover" alt="" />
                        </button>
                      )}
                    />
                  </div>

                  {/* Desktop / tablet: infinite marquee */}
                  <div className="hidden sm:flex animate-infinite-scroll gap-5 sm:gap-8 w-max pb-10">
                    {[...galleryImages, ...galleryImages].map((img, idx) => (
                      <div key={idx} className="cursor-target w-[350px] h-60 md:w-[450px] md:h-72 bg-white/5 border border-[#00FFB3]/10 rounded-md overflow-hidden shrink-0 relative cursor-pointer" onClick={() => setSelectedImage(img)}>
                        <img src={img} className="absolute inset-0 w-full h-full object-cover transition-all duration-500" alt="" />
                      </div>
                    ))}
                  </div>
                </section>
              </RevealOnScroll>
            </>
          ) : activeSection === 'about' ? (
            <div className="animate-fade-in">
               <About darkMode={darkMode} />
            </div>
          ) : activeSection === 'certificates' ? (
            <div className="animate-fade-in">
               <Certifications darkMode={darkMode} />
            </div>
          ) : activeSection === 'projects' ? (
            <div className="animate-fade-in">
               <Project darkMode={darkMode} />
            </div>
          ) : activeSection === 'stacks' ? (
            <div className="animate-fade-in">
               <Stacks darkMode={darkMode} />
            </div>
          ) : (
            <div className="animate-fade-in">
               <Contact darkMode={darkMode} />
            </div>
          )}

          <RevealOnScroll>
            <footer className="pt-14 sm:pt-20 border-t border-[#00FFB3]/10 text-center space-y-6 sm:space-y-8 pb-10 px-4">
              <div className="flex flex-wrap justify-center gap-6 sm:gap-12 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] opacity-60">
                 <a href="https://github.com/BryxCinco" target="_blank" rel="noopener noreferrer" className="cursor-target hover:text-[#00FFB3] transition-colors">Github</a>
                 <a href="https://www.linkedin.com/in/brianfrancisco10/" target="_blank" rel="noopener noreferrer" className="cursor-target hover:text-[#00FFB3] transition-colors">LinkedIn</a>
                 <a href="https://www.facebook.com/Bryx.Francisco111/" target="_blank" rel="noopener noreferrer" className="cursor-target hover:text-[#00FFB3] transition-colors">Facebook</a>
              </div>
              <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[1em] opacity-20 text-[#00FFB3]">
                 © {new Date().getFullYear()} Brian Paul Francisco
              </p>
            </footer>
          </RevealOnScroll>

          <Chatbot ref={chatbotRef} darkMode={darkMode} />
        </div>
      </div>
      </div>
    </>
  );
}

export default App;