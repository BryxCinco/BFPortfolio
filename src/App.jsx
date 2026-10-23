import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sun,
  Moon,
  MessageSquare,
  X,
  Home,
  User,
  Mail,
  Menu,
  Award,
  Box,
  Layers,
  Volume2,
  VolumeX,
  MonitorSmartphone,
  Gamepad2,
  ChevronDown,
  Keyboard
} from 'lucide-react';

// Import ang Components
import About from './About';
import Contact from './Contact';
import Chatbot from './Chatbot';
import TypingTest from './TypingTest';
import PlayGame from './PlayGame';
import { useSoundEffects, useGlobalClickSounds } from './SoundEffects';
import Certifications from './Certifications';
import Project from './Project';
import Stacks from './Stacks';
import HomePage from './Home';
import { useFitScale } from './useFitScale';
import NavDrawer from './NavDrawer';
import IntroSplash from './IntroSplash';
import WarpHost from './WarpHost';
import { useThemePreference } from './useThemePreference';

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

// Sound On / Off button — sits beside the Typing Speed Test trigger.
// Does NOT touch or shift the surrounding layout: it's an inline flex item
// sized to match the other nav-adjacent icon buttons, with no absolute
// positioning or margin changes to neighboring elements.
// "Play" — the side quests (typing test, stack game, typing sounds) in one menu,
// so the nav itself stays about the portfolio
const FunMenu = ({ darkMode, onTypingTest, onPlayGame, soundEnabled, onToggleSound }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const acc = darkMode ? '#2EE6A8' : '#007A59';
  const ink = darkMode ? '#FFFFFF' : '#1B1B2A';
  const sub = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(27,27,42,0.55)';
  const row = `cursor-target w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
    darkMode ? 'hover:bg-white/[0.06]' : 'hover:bg-black/[0.04]'
  }`;
  const tile = `shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-[#2EE6A8]/10' : 'bg-[#007A59]/10'}`;
  const pick = (fn) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Games and extras"
        className={`cursor-target inline-flex items-center gap-2 h-9 px-3.5 rounded-full border text-[0.75rem] font-extrabold uppercase tracking-wider transition-colors ${
          darkMode ? 'border-white/10 hover:border-[#2EE6A8]/50' : 'border-black/10 hover:border-[#007A59]/50'
        }`}
        style={{ color: acc }}
      >
        <Gamepad2 size={16} /> Play
        <ChevronDown size={14} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className={`nav-pop absolute right-0 top-full mt-3 w-64 p-2 rounded-2xl border backdrop-blur-xl shadow-2xl z-[120] ${
            darkMode ? 'bg-[#14141F]/95 border-white/10' : 'bg-white/95 border-black/10'
          }`}
        >
          <button role="menuitem" onClick={pick(onTypingTest)} className={row}>
            <div className={tile} style={{ color: acc }}><Keyboard size={17} /></div>
            <div className="min-w-0">
              <div className="text-sm font-bold" style={{ color: ink }}>Typing Test</div>
              <div className="text-xs font-medium" style={{ color: sub }}>How fast can you type?</div>
            </div>
          </button>
          <button role="menuitem" onClick={pick(onPlayGame)} className={row}>
            <div className={tile} style={{ color: acc }}><Layers size={17} /></div>
            <div className="min-w-0">
              <div className="text-sm font-bold" style={{ color: ink }}>Stack Game</div>
              <div className="text-xs font-medium" style={{ color: sub }}>Stack the tech, climb the ladder</div>
            </div>
          </button>
          <div className={`my-1.5 mx-3 h-px ${darkMode ? 'bg-white/10' : 'bg-black/[0.08]'}`} />
          <button
            role="menuitemcheckbox"
            aria-checked={soundEnabled}
            data-no-sound="true"
            onClick={onToggleSound}
            className={row}
          >
            <div className={tile} style={{ color: acc }}>{soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</div>
            <div className="flex-1 text-sm font-bold" style={{ color: ink }}>Typing sounds</div>
            <div
              className="px-2 py-0.5 rounded-full text-[0.6875rem] font-extrabold"
              style={soundEnabled ? { background: acc, color: darkMode ? '#1B1B2A' : '#FFFFFF' } : { color: sub, boxShadow: `inset 0 0 0 1px ${sub}` }}
            >
              {soundEnabled ? 'On' : 'Off'}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

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

// ============================================================================
// ANIMATED NAVIGATION BAR
// ============================================================================

const AnimatedNavBar = ({ darkMode, activeSection, navItems, goToSection, toggleTheme, followsSystem, onFollowSystem, chatbotRef, typingTestRef, playGameRef, setIsSidebarOpen, isDesktop, soundEnabled, onToggleSound }) => {
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const [loaded, setLoaded] = useState(false);

  // Nav accent: the brand mint — bright in dark mode, deep teal in light mode (matches theme.js)
  const navAccent = darkMode ? '#2EE6A8' : '#007A59';
  const navAccentShadow = darkMode ? 'rgba(0,255,179,0.9)' : 'rgba(0,122,89,0.55)';
  const navAccentGlow = darkMode ? 'rgba(46,230,168,0.35)' : 'rgba(0,122,89,0.25)';

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
      className={`fixed top-0 w-full z-[100] p-4 sm:p-6 grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 md:px-10 backdrop-blur-xl border-b transition-all duration-700 ${
        loaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      } ${darkMode ? 'bg-[#0E0E18]/40 border-[#2EE6A8]/10' : 'bg-white/60 border-black/[0.06]'}`}
    >
      {/* Left: Logo + Typing Speed Test trigger */}
      <div className="flex items-center gap-3 sm:gap-4 justify-self-start">
        <button
          onClick={() => goToSection('home')}
          aria-label="Go to home"
          className={`cursor-target backdrop-blur-xl border px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-black tracking-tighter text-lg sm:text-xl hover:scale-105 active:scale-95 transition-all duration-300 shrink-0 ${
            darkMode ? 'bg-white/5 border-[#2EE6A8]/20 hover:border-[#2EE6A8]/60 hover:shadow-[0_0_30px_rgba(0,255,179,0.25)]' : 'bg-white/70 border-black/10 hover:border-[#007A59]/50 hover:shadow-[0_0_30px_rgba(0,122,89,0.18)]'
          }`}
        >
          <span className="text-[#00FFB3]" style={{textShadow: "0 0 15px rgba(0,255,179,0.6)"}}>Brian Francisco</span>
        </button>

      </div>

      {/* Center: Desktop Nav with Sliding Underline — true-centered via the grid, unaffected by the left/right column widths */}
      <div
        ref={navRef}
        className={`${isDesktop ? 'flex' : 'hidden'} items-center gap-1 backdrop-blur-xl border rounded-full px-2 py-2 relative justify-self-center ${
          darkMode ? 'bg-white/5 border-[#2EE6A8]/20' : 'bg-white/70 border-black/10'
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
            className={`cursor-target relative flex items-center gap-2 px-3.5 py-2 rounded-full text-[0.75rem] font-extrabold uppercase tracking-wider transition-all duration-300 ${
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
                : 'rgba(0,122,89,0.1)';
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
          className={`cursor-target relative flex items-center gap-2 ml-1 px-4 py-2 rounded-full text-[0.75rem] font-extrabold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 ${
            loaded ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
          }`}
          style={{
            transitionDelay: loaded ? `${navItems.length * 60 + 100}ms` : '0ms',
            backgroundColor: darkMode ? 'rgba(46,230,168,0.12)' : 'rgba(0,122,89,0.1)',
            color: navAccent,
            boxShadow: `0 0 0 1px ${navAccentGlow}`,
          }}
        >
          <MessageSquare size={16} />
          Ask Me
        </button>
      </div>

      {/* Right Controls — pinned directly to the true right edge of the nav bar with absolute
          positioning (rather than relying on the grid's 1fr/1fr split) so it can never drift
          toward the middle regardless of how wide the left/center content ends up being */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 md:right-10 flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open navigation menu"
          title="Menu"
          className={`cursor-target ${isDesktop ? 'hidden' : 'block'} p-3 rounded-full backdrop-blur-xl border hover:scale-110 active:scale-95 transition-all duration-300 ${
            darkMode
              ? 'bg-white/5 border-[#2EE6A8]/20 hover:border-[#2EE6A8]/50'
              : 'bg-white/70 border-black/10 hover:border-[#007A59]/50 hover:bg-[#007A59]/10'
          }`}
        >
          <Menu size={20} className={darkMode ? 'text-[#2EE6A8]' : 'text-[#007A59]'} />
        </button>

        {/* Play menu (games + sounds) and the theme controls — desktop only; on smaller
            screens these live in the slide-in drawer */}
        {isDesktop && (
          <div className="flex items-center gap-4 sm:gap-5">
            <FunMenu
              darkMode={darkMode}
              onTypingTest={() => typingTestRef.current?.open()}
              onPlayGame={() => playGameRef.current?.open()}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
            />
            <span className="inline-flex items-center gap-2">
              <AutoThemeButton darkMode={darkMode} active={followsSystem} onClick={onFollowSystem} />
              <ThemeSwitch darkMode={darkMode} toggleTheme={toggleTheme} />
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};

const SoundSwitch = ({ soundEnabled, toggleSound, darkMode, className = '' }) => (
  <button
    onClick={toggleSound}
    data-no-sound="true"
    aria-label={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
    title={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
    className={`cursor-target relative inline-flex items-center shrink-0 w-14 h-7 sm:w-16 sm:h-8 rounded-full border transition-colors duration-300 ${
      darkMode ? 'bg-[#2EE6A8]/10 border-[#2EE6A8]/40' : 'bg-[#007A59]/10 border-[#007A59]/35'
    } ${className}`}
  >
    <VolumeX
      size={12}
      className={`absolute left-1.5 sm:left-2 transition-opacity duration-300 ${soundEnabled ? 'opacity-0' : 'opacity-50 text-[#D6006A]'}`}
    />
    <Volume2
      size={12}
      className={`absolute right-1.5 sm:right-2 transition-opacity duration-300 ${soundEnabled ? 'opacity-50 text-[#2EE6A8]' : 'opacity-0'}`}
    />
    <span
      className={`absolute top-0.5 left-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-md transition-transform duration-300 ${
        soundEnabled ? 'translate-x-[1.75rem] sm:translate-x-[2rem] bg-white' : 'translate-x-0 bg-[#1B1B2A]'
      }`}
    >
      {soundEnabled ? (
        <Volume2 size={13} className="text-[#007A59]" />
      ) : (
        <VolumeX size={13} className="text-[#2EE6A8]" />
      )}
    </span>
  </button>
);

// "Auto" — go back to matching the device's light/dark display
const AutoThemeButton = ({ darkMode, active, onClick, label = false }) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    title={active ? 'Following your device display' : 'Match my device display'}
    className={`cursor-target inline-flex items-center gap-1.5 shrink-0 h-7 sm:h-8 px-2.5 rounded-full border text-[0.6875rem] font-extrabold uppercase tracking-wider transition-colors duration-300 ${
      active
        ? darkMode
          ? 'bg-[#2EE6A8]/15 border-[#2EE6A8] text-[#2EE6A8]'
          : 'bg-[#007A59]/10 border-[#007A59] text-[#007A59]'
        : darkMode
          ? 'border-white/15 text-white/50 hover:text-white hover:border-[#2EE6A8]/50'
          : 'border-black/15 text-[#1B1B2A]/50 hover:text-[#1B1B2A] hover:border-[#007A59]/50'
    }`}
  >
    <MonitorSmartphone size={13} />
    {label ? (active ? 'On' : 'Off') : 'Auto'}
  </button>
);

const ThemeSwitch = ({ darkMode, toggleTheme, className = '' }) => (
  <button
    onClick={toggleTheme}
    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    className={`cursor-target relative inline-flex items-center shrink-0 w-14 h-7 sm:w-16 sm:h-8 rounded-full border transition-colors duration-300 ${
      darkMode ? 'bg-[#2EE6A8]/10 border-[#2EE6A8]/40' : 'bg-[#007A59]/10 border-[#007A59]/35'
    } ${className}`}
  >
    <Moon
      size={12}
      className={`absolute left-1.5 sm:left-2 transition-opacity duration-300 ${darkMode ? 'opacity-0' : 'opacity-50 text-[#D6006A]'}`}
    />
    <Sun
      size={12}
      className={`absolute right-1.5 sm:right-2 transition-opacity duration-300 ${darkMode ? 'opacity-50 text-[#2EE6A8]' : 'opacity-0'}`}
    />
    <span
      className={`absolute top-0.5 left-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-md transition-transform duration-300 ${
        darkMode ? 'translate-x-0 bg-[#1B1B2A]' : 'translate-x-[1.75rem] sm:translate-x-[2rem] bg-white'
      }`}
    >
      {darkMode ? (
        <Moon size={13} className="text-[#2EE6A8]" />
      ) : (
        <Sun size={13} className="text-[#D6006A]" />
      )}
    </span>
  </button>
);

// The full pill nav (logo + typing test + centered pill + Ask Me + theme switch)
// needs about 1750px of layout width. On desktop the page is zoomed to a fixed
// design width (see useFitScale), so this compares against that layout width,
// not the raw window width; touch tablets and narrow windows get the drawer.
const DESKTOP_NAV_MIN_WIDTH = 1750;

function App() {
  // light/dark follows the visitor's device until they pick one themselves
  const { darkMode, setDarkMode, followsSystem, followSystem } = useThemePreference();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const chatbotRef = useRef(null);
  const typingTestRef = useRef(null);
  const playGameRef = useRef(null);
  const { soundEnabled, toggleSound, playClick } = useSoundEffects();
  useGlobalClickSounds(soundEnabled, playClick);

  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('activeSection') || 'home';
  });

  // the intro plays once per browser session; anyone who has seen it before gets the short cut
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem('hasAnimated') && activeSection === 'home';
    } catch {
      return false;
    }
  });
  const [introShort] = useState(() => {
    try {
      return !!localStorage.getItem('bp_intro_seen');
    } catch {
      return false;
    }
  });
  // the page mounts when the intro splits open, so its entrance animations play in view
  const [introOpening, setIntroOpening] = useState(false);
  const openIntro = useCallback(() => setIntroOpening(true), []);

  const finishIntro = useCallback(() => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('hasAnimated', 'true');
      localStorage.setItem('bp_intro_seen', '1');
    } catch {
      /* storage may be unavailable */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

  const { toggleTheme } = useThemeTransition(setDarkMode);
  const { width: layoutWidth } = useFitScale();
  const isDesktop = layoutWidth >= DESKTOP_NAV_MIN_WIDTH;

  const navItems = [
    { name: 'Home', icon: <Home size={18} className="size-[1.125rem]" />, id: 'home' },
    { name: 'About', icon: <User size={18} className="size-[1.125rem]" />, id: 'about' },
    { name: 'Certificates', icon: <Award size={18} className="size-[1.125rem]" />, id: 'certificates' },
    { name: 'Projects', icon: <Box size={18} className="size-[1.125rem]" />, id: 'projects' },
    { name: 'Stacks', icon: <Layers size={18} className="size-[1.125rem]" />, id: 'stacks' },
    { name: 'Contact Me', icon: <Mail size={18} className="size-[1.125rem]" />, id: 'contact' }
  ];

  const goToSection = (id) => {
    setActiveSection(id);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {showIntro && <IntroSplash dark={darkMode} short={introShort} onLeave={openIntro} onDone={finishIntro} />}
      {(!showIntro || introOpening) && (
      <div className={darkMode ? 'dark bg-[#0E0E18] text-white' : 'light bg-[#FCFAF7] text-[#1B1B2A]'}>
      <ThemeTransitionStyles />
      <div className="min-h-screen relative transition-colors duration-700 selection:bg-[#2EE6A8] selection:text-[#1B1B2A] pb-20 overflow-x-hidden bg-inherit">

        <div className="fixed top-[-10%] left-[-10%] w-[70%] h-[70%] sm:w-[50%] sm:h-[50%] rounded-full bg-[#2EE6A8]/[0.14] blur-[5rem] sm:blur-[7.5rem] pointer-events-none animate-pulse" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[70%] h-[70%] sm:w-[50%] sm:h-[50%] rounded-full bg-[#A700FF]/[0.14] blur-[5rem] sm:blur-[7.5rem] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

        {selectedImage && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedImage(null)}>
            <button className="cursor-target absolute top-6 right-6 sm:top-10 sm:right-10 text-white hover:text-[#2EE6A8] transition-colors z-[1001]" aria-label="Close preview">
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

        {/* Phones, tablets and narrow windows: slide-in sheet menu */}
        {!isDesktop && (
          <NavDrawer
            open={isSidebarOpen}
            onClose={closeSidebar}
            darkMode={darkMode}
            navItems={navItems}
            activeSection={activeSection}
            onNavigate={goToSection}
            onAskMe={() => {
              setIsSidebarOpen(false);
              chatbotRef.current?.open();
            }}
            onPlayGame={() => {
              setIsSidebarOpen(false);
              playGameRef.current?.open();
            }}
            soundEnabled={soundEnabled}
            themeSwitch={<ThemeSwitch darkMode={darkMode} toggleTheme={toggleTheme} />}
            autoSwitch={<AutoThemeButton darkMode={darkMode} active={followsSystem} onClick={followSystem} label />}
            soundSwitch={<SoundSwitch soundEnabled={soundEnabled} toggleSound={toggleSound} darkMode={darkMode} />}
          />
        )}

        {/* NEW ANIMATED NAV */}
        <AnimatedNavBar
          darkMode={darkMode}
          activeSection={activeSection}
          navItems={navItems}
          goToSection={goToSection}
          toggleTheme={toggleTheme}
          followsSystem={followsSystem}
          onFollowSystem={followSystem}
          chatbotRef={chatbotRef}
          typingTestRef={typingTestRef}
          playGameRef={playGameRef}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          setIsSidebarOpen={setIsSidebarOpen}
          isDesktop={isDesktop}
        />

        <div key={activeSection} className="w-full max-w-[112.5rem] mx-auto pt-24 sm:pt-32 px-4 sm:px-6 lg:px-12 space-y-6">

          {activeSection === 'home' ? (
            <HomePage
              darkMode={darkMode}
              onNavigate={goToSection}
              onPreview={setSelectedImage}
              onAsk={(q) => (q ? chatbotRef.current?.ask(q) : chatbotRef.current?.open())}
            />
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
               <Contact darkMode={darkMode} soundEnabled={soundEnabled} onTypeTick={playClick} />
            </div>
          )}

          <RevealOnScroll>
            <footer className="pt-14 sm:pt-20 border-t border-[#2EE6A8]/10 text-center space-y-6 sm:space-y-8 pb-10 px-4">
              <div className="flex flex-wrap justify-center gap-6 sm:gap-12 text-[0.75rem] font-extrabold uppercase tracking-[0.2em] opacity-70">
                 <a href="https://github.com/BryxCinco" target="_blank" rel="noopener noreferrer" className="cursor-target hover:text-[#2EE6A8] transition-colors">Github</a>
                 <a href="https://www.linkedin.com/in/brianfrancisco10/" target="_blank" rel="noopener noreferrer" className="cursor-target hover:text-[#2EE6A8] transition-colors">LinkedIn</a>
                 <a href="https://www.facebook.com/Bryx.Francisco111/" target="_blank" rel="noopener noreferrer" className="cursor-target hover:text-[#2EE6A8] transition-colors">Facebook</a>
              </div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.25em] opacity-50">
                 © {new Date().getFullYear()} Brian Paul Francisco
              </p>
            </footer>
          </RevealOnScroll>

          <WarpHost darkMode={darkMode} />
          <Chatbot ref={chatbotRef} darkMode={darkMode} soundEnabled={soundEnabled} onTypeTick={playClick} onNavigate={goToSection} />
          <TypingTest ref={typingTestRef} darkMode={darkMode} soundEnabled={soundEnabled} onKeyPress={playClick} />
          <PlayGame ref={playGameRef} darkMode={darkMode} soundEnabled={soundEnabled} onAction={playClick} />
        </div>
      </div>
      </div>
      )}
    </>
  );
}

export default App;