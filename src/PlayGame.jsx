import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { X, Layers, RotateCcw, Sparkles, Trophy, Flame, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getPalette, cssVars } from './theme';

// ============================================================================
// PLAYGAME.JSX — "Stack Game": a 3D tower of tech blocks. Each block slides
// in from alternating sides and carries a real logo; the overhang gets chopped
// off and tumbles away, perfect drops build a combo, and the sky changes as
// the tower climbs. The 3D scene lives in Stack3D.js (three.js), loaded only
// when the game opens; this file owns scoring, the career ladder and the UI.
// ============================================================================

// ============================================================================
// CONFIG
// ============================================================================

// the playfield's design size; it is scaled to fit the screen
const PLAYFIELD_WIDTH = 400;
const FIELD_HEIGHT = 480;
const GROW_HINT = 'four'; // perfect drops in a row before the block grows (Stack3D GROW_AFTER)

// Career milestones — reached in order as the stack grows.
const MILESTONES = [
  { score: 10, title: 'Entry' },
  { score: 20, title: 'Junior' },
  { score: 30, title: 'Mid' },
  { score: 50, title: 'Senior' },
  { score: 80, title: 'Principal' },
  { score: 100, title: 'CTO' },
];

const BEST_KEY = 'bp_stackgame_best';

function currentTitleForScore(score) {
  let title = 'Unemployed';
  for (const m of MILESTONES) {
    if (score >= m.score) title = m.title;
  }
  return title;
}

function nextMilestone(score) {
  return MILESTONES.find((m) => m.score > score) || null;
}

function prevMilestoneScore(score) {
  let s = 0;
  for (const m of MILESTONES) if (score >= m.score) s = m.score;
  return s;
}

// Every block that lands gets the next technology in this list, so the tower
// reads like a real stack from markup through AI to deployment, then loops.
// Each game starts at a random point in it. Logos come from CORS-enabled CDNs
// so the 3D blocks can paint them into textures.
const DEVICON = (name, variant = 'original') =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/${name}/${name}-${variant}.svg`;
const LOBE = (name) => `https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg@1.95.1/icons/${name}.svg`;
const SIMPLE = (name) => `https://cdn.jsdelivr.net/npm/simple-icons@16.33.0/icons/${name}.svg`;

const TECH_STACK = [
  { name: 'HTML', bg: '#E44D26', fg: '#ffffff', logo: DEVICON('html5') },
  { name: 'CSS', bg: '#2965F1', fg: '#ffffff', logo: DEVICON('css3') },
  { name: 'JavaScript', bg: '#F0DB4F', fg: '#1B1B2A', logo: DEVICON('javascript') },
  { name: 'TypeScript', bg: '#3178C6', fg: '#ffffff', logo: DEVICON('typescript') },
  { name: 'React', bg: '#149ECA', fg: '#ffffff', logo: DEVICON('react') },
  { name: 'Next.js', bg: '#111111', fg: '#ffffff', logo: DEVICON('nextjs') },
  { name: 'Nuxt.js', bg: '#00DC82', fg: '#0B1120', logo: DEVICON('nuxtjs') },
  { name: 'Tailwind', bg: '#38BDF8', fg: '#0B1120', logo: DEVICON('tailwindcss') },
  { name: 'Vite', bg: '#8B5CF6', fg: '#ffffff', logo: DEVICON('vitejs') },
  { name: 'Node.js', bg: '#3C873A', fg: '#ffffff', logo: DEVICON('nodejs') },
  { name: 'Express', bg: '#2D2D2D', fg: '#ffffff', logo: DEVICON('express') },
  { name: 'PHP', bg: '#777BB4', fg: '#ffffff', logo: DEVICON('php') },
  { name: 'Python', bg: '#3776AB', fg: '#ffffff', logo: DEVICON('python') },
  { name: 'GPT', bg: '#10A37F', fg: '#ffffff', logo: LOBE('openai') },
  { name: 'Gemini', bg: '#1A73E8', fg: '#ffffff', logo: LOBE('gemini-color') },
  { name: 'Claude Code', bg: '#D97757', fg: '#ffffff', logo: LOBE('claudecode-color') },
  { name: 'Codex', bg: '#1E1E24', fg: '#ffffff', logo: LOBE('codex-color') },
  { name: 'Groq', bg: '#F55036', fg: '#ffffff', logo: LOBE('groq') },
  { name: 'Hugging Face', bg: '#FFB000', fg: '#1B1B2A', logo: LOBE('huggingface-color') },
  { name: 'LangChain', bg: '#1C3C3C', fg: '#ffffff', logo: LOBE('langchain-color') },
  { name: 'CrewAI', bg: '#FF5A50', fg: '#ffffff', logo: LOBE('crewai-color') },
  { name: 'MySQL', bg: '#00618A', fg: '#ffffff', logo: DEVICON('mysql') },
  { name: 'PostgreSQL', bg: '#336791', fg: '#ffffff', logo: DEVICON('postgresql') },
  { name: 'MongoDB', bg: '#13AA52', fg: '#ffffff', logo: DEVICON('mongodb') },
  { name: 'Oracle', bg: '#C74634', fg: '#ffffff', logo: DEVICON('oracle') },
  { name: 'Supabase', bg: '#1F9D6B', fg: '#ffffff', logo: DEVICON('supabase') },
  { name: 'Firebase', bg: '#FFA611', fg: '#1B1B2A', logo: DEVICON('firebase') },
  { name: 'Figma', bg: '#A259FF', fg: '#ffffff', logo: DEVICON('figma') },
  { name: 'Git', bg: '#F1502F', fg: '#ffffff', logo: DEVICON('git') },
  { name: 'GitHub', bg: '#24292F', fg: '#ffffff', logo: DEVICON('github') },
  { name: 'Docker', bg: '#2496ED', fg: '#ffffff', logo: DEVICON('docker') },
  { name: 'Google Cloud', bg: '#4285F4', fg: '#ffffff', logo: DEVICON('googlecloud') },
  { name: 'AWS', bg: '#FF9900', fg: '#1B1B2A', logo: DEVICON('amazonwebservices', 'original-wordmark') },
  { name: 'Azure', bg: '#0078D4', fg: '#ffffff', logo: DEVICON('azure') },
  { name: 'Hostinger', bg: '#673DE6', fg: '#ffffff', logo: SIMPLE('hostinger') },
  { name: 'Postman', bg: '#FF6C37', fg: '#ffffff', logo: DEVICON('postman') },
  { name: 'Vercel', bg: '#000000', fg: '#ffffff', logo: DEVICON('vercel') },
];

let uid = 0;
const nextId = () => ++uid;

// ============================================================================
// DESKTOP-ONLY DETECTION (same rule as the Typing Test — real desktop/laptop
// browsers only, not touch tablets that happen to report a wide viewport)
// ============================================================================

const DESKTOP_QUERY = '(min-width: 1024px) and (pointer: fine) and (hover: hover)';

function useIsDesktopOnly() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_QUERY).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
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
// NAV TRIGGER — bare icon + label, same treatment as TypingTestTrigger.
// Desktop-only: renders nothing (not just hidden) on touch/tablet/mobile.
// ============================================================================

export const PlayGameTrigger = ({ darkMode, onClick, className = '' }) => {
  const isDesktop = useIsDesktopOnly();
  if (!isDesktop) return null;

  const accent = darkMode ? '#00FFB3' : '#007A59';

  return (
    <button
      onClick={onClick}
      aria-label="Open Stack Game"
      title="Play Game"
      className={`cursor-target inline-flex items-center gap-2 opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 transition-all duration-300 ${className}`}
      style={{ color: accent }}
    >
      <Layers size={18} />
      <span className="text-[0.625rem] font-black uppercase tracking-widest whitespace-nowrap">Play Game</span>
    </button>
  );
};

// ============================================================================
// STYLES — scoped through the overlay id so the site's global
// `.light/.dark p,span { color: !important }` rules can't recolor the game.
// ============================================================================

const GameStyles = () => (
  <style>{`
    #claude-play-game-overlay :is(h2,h3,p,span).pg-ink { color: var(--ink) !important; }
    #claude-play-game-overlay :is(h2,h3,p,span).pg-acc { color: var(--acc) !important; }
    #claude-play-game-overlay :is(h2,h3,p,span).pg-on { color: var(--acc-ink) !important; }
    #claude-play-game-overlay :is(p,span).pg-fg { color: var(--fg) !important; }
    #claude-play-game-overlay :is(p,span).pg-white { color: #fff !important; }

    .pg-chip { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.25); }


    @keyframes pg-pop { 0% { transform: translate(-50%, 0) scale(0.6); opacity: 0; } 20% { transform: translate(-50%, -10px) scale(1.1); opacity: 1; } 100% { transform: translate(-50%, -64px) scale(1); opacity: 0; } }
    .pg-pop { animation: pg-pop 0.95s ease-out forwards; }

    @keyframes pg-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-9px) rotate(-0.6deg); } 40% { transform: translateX(8px) rotate(0.5deg); } 60% { transform: translateX(-5px); } 80% { transform: translateX(3px); } }
    .pg-shake { animation: pg-shake 0.45s ease-out; }

    @keyframes pg-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    .pg-bob { animation: pg-bob 1.6s ease-in-out infinite; }

    @keyframes pg-twinkle { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }

    @media (prefers-reduced-motion: reduce) {
      .pg-shake, .pg-bob, .pg-pop { animation: none !important; }
    }
  `}</style>
);

// a logo on a white chip; falls back to a monogram if the image fails
const TechLogo = ({ tech, size = 22 }) => {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className="pg-chip relative z-[1] shrink-0 rounded-full flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      {failed ? (
        <span className="text-[0.5rem] font-black" style={{ color: tech.bg }}>
          {tech.name.slice(0, 2)}
        </span>
      ) : (
        <img
          src={tech.logo}
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
          style={{ width: size * 0.66, height: size * 0.66 }}
          className="object-contain"
        />
      )}
    </span>
  );
};

// what a brick shows depends on how much of it is left
const PlayGame = forwardRef(({ darkMode, soundEnabled = true, onAction }, ref) => {
  const isDesktop = useIsDesktopOnly();
  const p = getPalette(darkMode);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | playing | gameover
  const [height, setHeight] = useState(0); // floors placed
  const [landed, setLanded] = useState([]); // tech index of every placed block
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [milestoneToast, setMilestoneToast] = useState(null);
  const [comboStreak, setComboStreak] = useState(0);
  const [popups, setPopups] = useState([]);
  const [scale, setScale] = useState(1);
  const [engine, setEngine] = useState('loading'); // loading | ready | failed

  const engineRef = useRef(null);
  const hostRef = useRef(null); // the 3D canvas lives here
  const darkRef = useRef(darkMode);
  darkRef.current = darkMode;
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const reachedMilestonesRef = useRef(new Set());
  const toastTimerRef = useRef(null);
  const fieldWrapRef = useRef(null); // measures available space to size the playfield
  const statusRef = useRef('idle');
  const fieldRef = useRef(null);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BEST_KEY);
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {
      /* storage may be unavailable */
    }
  }, []);

  // warm the logo cache the first time the game opens (the game-over card uses them too)
  useEffect(() => {
    if (!isOpen) return;
    TECH_STACK.forEach((t) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = t.logo;
    });
  }, [isOpen]);

  const play = useCallback(
    (variant) => {
      if (soundEnabled && typeof onAction === 'function') onAction(variant);
    },
    [soundEnabled, onAction]
  );

  const setStatusBoth = (s) => {
    statusRef.current = s;
    setStatus(s);
  };

  const resetGame = useCallback(() => {
    engineRef.current?.reset();
    reachedMilestonesRef.current = new Set();
    clearTimeout(toastTimerRef.current);
    setMilestoneToast(null);
    setComboStreak(0);
    comboRef.current = 0;
    setScore(0);
    scoreRef.current = 0;
    setNewBest(false);
    setPopups([]);
    setHeight(0);
    setLanded([]);
    setStatusBoth('idle');
  }, []);

  // the 3D engine (three.js) loads only when the game opens
  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    setEngine('loading');
    import('./Stack3D')
      .then(({ createStack3D }) => {
        if (cancelled || !hostRef.current) return;
        engineRef.current = createStack3D(hostRef.current, { techs: TECH_STACK, dark: darkRef.current });
        if (import.meta.env.DEV) window.__stack3d = engineRef.current;
        setEngine('ready');
      })
      .catch(() => {
        if (!cancelled) setEngine('failed');
      });
    return () => {
      cancelled = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    engineRef.current?.setDark(darkMode);
  }, [darkMode, engine]);

  // Fresh board every time the modal opens; lock scroll + wire Space/Esc.
  useEffect(() => {
    if (isOpen) {
      resetGame();
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        } else if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          if (e.repeat) return;
          handleDropRef.current?.();
        }
      };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', onKey);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // The playfield keeps a 400×480 shape and is sized to the space it's given;
  // the 3D canvas renders at that real size, the overlays are scaled to match.
  useEffect(() => {
    if (!isOpen) return;
    const el = fieldWrapRef.current;
    if (!el) return;

    const recompute = () => {
      const availW = el.clientWidth - 8;
      const availH = window.innerHeight - (window.innerWidth >= 1024 ? 190 : 300);
      const next = Math.max(0.55, Math.min(1.45, availW / PLAYFIELD_WIDTH, availH / FIELD_HEIGHT));
      setScale(next);
    };

    recompute();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(recompute) : null;
    ro?.observe(el);
    window.addEventListener('resize', recompute);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [isOpen]);

  const showMilestoneToast = useCallback((title) => {
    clearTimeout(toastTimerRef.current);
    setMilestoneToast(title);
    toastTimerRef.current = setTimeout(() => setMilestoneToast(null), 1900);
  }, []);

  const addPopup = useCallback((popup) => {
    const id = nextId();
    setPopups((list) => [...list.slice(-3), { ...popup, id }]);
    setTimeout(() => setPopups((list) => list.filter((x) => x.id !== id)), 1000);
  }, []);

  const endGame = useCallback(
    (finalScore) => {
      setStatusBoth('gameover');
      const field = fieldRef.current;
      if (field) {
        field.classList.remove('pg-shake');
        void field.offsetWidth; // restart the animation
        field.classList.add('pg-shake');
      }
      play('error');
      setBest((prevBest) => {
        if (finalScore > prevBest) setNewBest(true);
        const next = Math.max(prevBest, finalScore);
        try {
          localStorage.setItem(BEST_KEY, String(next));
        } catch {
          /* storage may be unavailable */
        }
        return next;
      });
    },
    [play]
  );

  const handleDrop = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    const st = statusRef.current;
    if (st === 'gameover') {
      resetGame();
      return;
    }
    if (st === 'idle') {
      eng.start();
      setStatusBoth('playing');
      return;
    }

    const r = eng.drop();
    if (!r) return;
    if (r.type === 'miss') {
      endGame(scoreRef.current);
      return;
    }

    setHeight(r.height);
    setLanded((list) => [...list, r.techIdx]);

    // Perfect stacks escalate: 2, 3, 4, then 5 points; anything else resets.
    let pointsGained;
    if (r.perfect) {
      comboRef.current += 1;
      pointsGained = Math.min(comboRef.current + 1, 5);
    } else {
      comboRef.current = 0;
      pointsGained = 1;
    }
    setComboStreak(comboRef.current);
    addPopup({
      text: r.perfect ? `Perfect +${pointsGained}` : `+${pointsGained}`,
      sub: r.grew ? 'block grows' : TECH_STACK[r.techIdx].name,
      perfect: r.perfect,
    });

    const prevScore = scoreRef.current;
    const newScore = prevScore + pointsGained;
    scoreRef.current = newScore;
    setScore(newScore);
    play(r.perfect ? 'toggle' : 'key');

    const milestone = MILESTONES.find(
      (m) => m.score > prevScore && m.score <= newScore && !reachedMilestonesRef.current.has(m.score)
    );
    if (milestone) {
      reachedMilestonesRef.current.add(milestone.score);
      showMilestoneToast(milestone.title);
    }
  }, [addPopup, endGame, play, resetGame, showMilestoneToast]);

  // Keydown handler above needs the latest handleDrop without re-binding
  const handleDropRef = useRef(handleDrop);
  useEffect(() => {
    handleDropRef.current = handleDrop;
  }, [handleDrop]);

  const closeGame = () => setIsOpen(false);

  const title = currentTitleForScore(score);
  const next = nextMilestone(score);
  const fromScore = prevMilestoneScore(score);
  const progress = next ? (score - fromScore) / (next.score - fromScore) : 1;

  // the sky drifts through hues as the tower climbs
  const hue = (darkMode ? 230 : 160) + Math.min(height, 60) * 2.2;
  const sky = darkMode
    ? `linear-gradient(180deg, hsl(${hue + 30} 55% 9%) 0%, hsl(${hue} 50% 15%) 60%, hsl(${hue - 20} 45% 21%) 100%)`
    : `linear-gradient(180deg, hsl(${hue + 40} 70% 97%) 0%, hsl(${hue} 60% 92%) 60%, hsl(${hue - 25} 55% 86%) 100%)`;

  const uniqueLanded = [...new Map(landed.map((i) => [TECH_STACK[i].name, TECH_STACK[i]])).values()];

  const statLabel = 'pg-ink text-[0.5625rem] sm:text-[0.625rem] font-black uppercase tracking-[0.25em] opacity-55';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="claude-play-game-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[1000] flex flex-col font-sans"
          style={{ ...cssVars(p), background: darkMode ? '#11111E' : '#FFFDF6', color: p.ink }}
        >
          <GameStyles />

          {/* Top bar */}
          <div
            className="relative flex items-center justify-center px-4 sm:px-6 shrink-0"
            style={{ height: 60, marginTop: 'env(safe-area-inset-top)' }}
          >
            <span className="pg-ink inline-flex items-center gap-2 text-[0.6875rem] sm:text-sm font-black uppercase tracking-[0.3em] opacity-60">
              <Layers size={16} /> Stack Game
            </span>
            <button
              onClick={closeGame}
              aria-label="Close game"
              className="cursor-target absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[color:var(--line)] flex items-center justify-center transition-transform hover:rotate-90"
              style={{ color: 'var(--ink)' }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 custom-scrollbar">
            <div
              className="mx-auto w-full max-w-[64rem] min-h-full flex flex-col lg:flex-row items-center lg:items-center justify-center gap-5 lg:gap-12 py-4 sm:py-6"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
            >
              {/* ---------------- HUD ---------------- */}
              <div className="w-full max-w-[25rem] lg:w-64 shrink-0 order-1 lg:order-none">
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-3">
                  <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-3 lg:p-5 text-center lg:text-left">
                    <p className={statLabel}>Score</p>
                    <motion.p
                      key={score}
                      initial={{ scale: 1.25 }}
                      animate={{ scale: 1 }}
                      className="pg-acc text-3xl lg:text-6xl font-black tabular-nums leading-none mt-1 origin-left"
                    >
                      {score}
                    </motion.p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-3 lg:p-5 text-center lg:text-left">
                    <p className={statLabel}>Best</p>
                    <p className="pg-ink text-3xl lg:text-4xl font-black tabular-nums leading-none mt-1 inline-flex items-center gap-2">
                      {best} <Crown size={18} className="hidden lg:block text-amber-400" />
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-3 lg:p-5 text-center lg:text-left">
                    <p className={statLabel}>Height</p>
                    <p className="pg-ink text-3xl lg:text-4xl font-black tabular-nums leading-none mt-1">
                      {height}
                      <span className="pg-ink text-sm opacity-50 ml-1">fl</span>
                    </p>
                  </div>
                </div>

                {/* career ladder */}
                <div className="mt-2 lg:mt-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-3 lg:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className={statLabel}>Level</p>
                    {next && <p className="pg-ink text-[0.625rem] font-black opacity-50 tabular-nums">{next.score - score} to {next.title}</p>}
                  </div>
                  <p className="pg-acc text-lg lg:text-2xl font-black uppercase tracking-wide mt-1">{title}</p>
                  <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: 'var(--acc-soft)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'var(--acc)' }}
                      animate={{ width: `${Math.round(progress * 100)}%` }}
                      transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                    />
                  </div>
                  <div className="hidden lg:flex mt-3 justify-between">
                    {MILESTONES.map((m) => (
                      <span
                        key={m.score}
                        title={`${m.title} at ${m.score}`}
                        className="w-2 h-2 rounded-full"
                        style={{ background: score >= m.score ? 'var(--acc)' : 'var(--line)' }}
                      />
                    ))}
                  </div>
                </div>

                {/* streak */}
                <div
                  className="mt-2 lg:mt-3 flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-opacity"
                  style={{
                    background: 'var(--acc-soft)',
                    color: 'var(--acc)',
                    border: '1px solid var(--acc-line)',
                    opacity: comboStreak > 0 ? 1 : 0.35,
                  }}
                >
                  <Flame size={14} />
                  <span className="pg-acc">{comboStreak > 0 ? `Perfect streak ×${comboStreak}` : 'No streak yet'}</span>
                </div>

                <p className="pg-ink hidden lg:block mt-5 text-xs leading-relaxed opacity-55">
                  {isDesktop ? (
                    <>
                      <kbd className="px-1.5 py-0.5 rounded border border-[color:var(--line)] font-bold">space</kbd> or click to drop ·{' '}
                      <kbd className="px-1.5 py-0.5 rounded border border-[color:var(--line)] font-bold">esc</kbd> to close.
                    </>
                  ) : (
                    'Tap the tower to drop.'
                  )}{' '}
                  Line blocks up perfectly to build a combo; {GROW_HINT} in a row grows the block back.
                </p>
              </div>

              {/* ---------------- PLAYFIELD ---------------- */}
              <div ref={fieldWrapRef} className="w-full lg:w-auto lg:flex-1 flex justify-center order-2 lg:order-none">
                <div style={{ width: PLAYFIELD_WIDTH * scale, height: FIELD_HEIGHT * scale }} className="relative">
                  <div
                    ref={fieldRef}
                    onPointerDown={handleDrop}
                    className="absolute inset-0 overflow-hidden rounded-3xl border border-[color:var(--line)] cursor-pointer select-none shadow-[0_30px_60px_-25px_rgba(0,0,0,0.5)]"
                    style={{ touchAction: 'manipulation', background: sky, transition: 'background 0.8s ease' }}
                  >
                    {/* sky details: stars at night, a soft sun by day */}
                    {darkMode ? (
                      [...Array(22)].map((_, i) => (
                        <span
                          key={i}
                          className="absolute rounded-full bg-white"
                          style={{
                            width: i % 3 ? 2 : 3,
                            height: i % 3 ? 2 : 3,
                            left: `${(i * 53) % 100}%`,
                            top: `${(i * 31) % 70}%`,
                            animation: `pg-twinkle ${2 + (i % 4)}s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))
                    ) : (
                      <div
                        className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full"
                        style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.9), transparent)' }}
                      />
                    )}

                    {/* the 3D tower */}
                    <div ref={hostRef} className="absolute inset-0" />

                    {engine !== 'ready' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="pg-ink text-xs font-bold uppercase tracking-widest opacity-60">
                          {engine === 'failed' ? '3D needs WebGL, which this browser has turned off.' : 'Loading 3D…'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* overlays, drawn at the 400×480 design size and scaled to fit */}
                  <div
                    className="absolute top-0 left-0 pointer-events-none"
                    style={{ width: PLAYFIELD_WIDTH, height: FIELD_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}
                  >
                    {/* Milestone toast */}
                    <AnimatePresence>
                      {milestoneToast && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.7 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.85 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                          className="absolute left-1/2 -translate-x-1/2 top-4 z-30 flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest whitespace-nowrap shadow-xl"
                          style={{ backgroundColor: 'var(--acc)', color: 'var(--acc-ink)' }}
                        >
                          <Trophy size={14} /> <span className="pg-on">Promoted to {milestoneToast}!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* score popups, just above the tower top */}
                    {popups.map((pp) => (
                      <div
                        key={pp.id}
                        className="pg-pop absolute left-1/2 top-[30%] flex flex-col items-center whitespace-nowrap pointer-events-none"
                        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.25)' }}
                      >
                        <span className={`font-black uppercase ${pp.perfect ? 'pg-acc text-lg' : 'pg-ink text-sm opacity-85'}`}>
                          {pp.perfect && <Sparkles size={13} className="inline -mt-0.5 mr-1" />}
                          {pp.text}
                        </span>
                        <span className="pg-ink text-[0.625rem] font-bold uppercase tracking-widest opacity-60">{pp.sub}</span>
                      </div>
                    ))}

                    {/* start card */}
                    {status === 'idle' && engine === 'ready' && (
                      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-8 pb-8 text-center">
                        <span
                          className="pg-on pg-bob text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-lg"
                          style={{ backgroundColor: 'var(--acc)' }}
                        >
                          {isDesktop ? 'Click or Space to start' : 'Tap to start'}
                        </span>
                        <p className="pg-ink text-xs font-semibold leading-relaxed opacity-70 max-w-[17rem]">
                          Drop each block on the one below. Whatever hangs off gets chopped. Perfect drops build a combo.
                        </p>
                      </div>
                    )}

                    {/* game over card: sits low so the whole tower stays in view */}
                    <AnimatePresence>
                      {status === 'gameover' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: 0.6 }}
                          className="absolute inset-x-0 bottom-0 z-20 p-4 pointer-events-auto"
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <motion.div
                            initial={{ y: 40, scale: 0.94 }}
                            animate={{ y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.65 }}
                            className="w-full rounded-3xl p-5 text-center shadow-2xl border border-[color:var(--line)] backdrop-blur-md"
                            style={{ background: darkMode ? 'rgba(26,26,44,0.92)' : 'rgba(255,255,255,0.94)' }}
                          >
                            <div className="flex items-center justify-center gap-5">
                              <div className="text-left">
                                <p className={statLabel}>Final score</p>
                                <p className="pg-acc text-5xl font-black tabular-nums leading-none mt-1">{score}</p>
                              </div>
                              <div className="text-left">
                                {newBest && (
                                  <span className="pg-on inline-flex items-center gap-1.5 mb-1.5 px-2.5 py-0.5 rounded-full text-[0.5625rem] font-black uppercase tracking-widest bg-amber-400">
                                    <Crown size={11} /> New best!
                                  </span>
                                )}
                                <p className="pg-ink text-sm font-bold opacity-75">
                                  {height} floors
                                  <br />
                                  retired as <span className="pg-acc">{title}</span>
                                </p>
                              </div>
                            </div>

                            {uniqueLanded.length > 0 && (
                              <div className="mt-4">
                                <p className={statLabel}>Your stack</p>
                                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                                  {uniqueLanded.slice(0, 16).map((t) => (
                                    <span key={t.name} title={t.name}>
                                      <TechLogo tech={t} size={26} />
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <button
                              onClick={resetGame}
                              className="cursor-target mt-4 inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
                              style={{ backgroundColor: 'var(--acc)', color: 'var(--acc-ink)' }}
                            >
                              <RotateCcw size={15} /> Play again
                            </button>
                            {isDesktop && (
                              <p className="pg-ink mt-2 text-[0.625rem] font-bold uppercase tracking-widest opacity-40">or press space</p>
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

PlayGame.displayName = 'PlayGame';

export default PlayGame;
