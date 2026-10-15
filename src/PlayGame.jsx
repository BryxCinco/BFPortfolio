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
// PLAYGAME.JSX — "Stack Game": drop tech blocks on top of each other. Each
// block is a glossy brick carrying a real logo; the overhang gets chopped off
// and falls away, perfect drops build a combo, and the sky changes as the
// tower climbs. The moving block is driven straight from requestAnimationFrame
// (no React re-render per frame), so it stays smooth on any machine.
// ============================================================================

// ============================================================================
// CONFIG
// ============================================================================

const PLAYFIELD_WIDTH = 400;
const BLOCK_HEIGHT = 40;
const VISIBLE_ROWS = 12;
const FIELD_HEIGHT = VISIBLE_ROWS * BLOCK_HEIGHT;
const BASE_WIDTH = 240;
const BASE_SPEED = 90; // px/sec — starts gentle, ramps up per successful stack
const SPEED_STEP = 8; // px/sec added per successful stack
const MAX_SPEED = 330;
const PERFECT_TOLERANCE = 0.97; // overlap this close to full width counts as "perfect"
const MISS_TOLERANCE = 1.5; // px of overlap below which it's a miss

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
// reads like a real stack from markup up to deployment, then loops.
const DEVICON = (name, variant = 'original') =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon@master/icons/${name}/${name}-${variant}.svg`;

const TECH_STACK = [
  { name: 'HTML', bg: '#E44D26', fg: '#ffffff', logo: DEVICON('html5') },
  { name: 'CSS', bg: '#2965F1', fg: '#ffffff', logo: DEVICON('css3') },
  { name: 'JavaScript', bg: '#F0DB4F', fg: '#1B1B2A', logo: DEVICON('javascript') },
  { name: 'TypeScript', bg: '#3178C6', fg: '#ffffff', logo: DEVICON('typescript') },
  { name: 'React', bg: '#149ECA', fg: '#ffffff', logo: DEVICON('react') },
  { name: 'Next.js', bg: '#111111', fg: '#ffffff', logo: DEVICON('nextjs') },
  { name: 'Tailwind', bg: '#38BDF8', fg: '#0B1120', logo: DEVICON('tailwindcss') },
  { name: 'Vite', bg: '#8B5CF6', fg: '#ffffff', logo: DEVICON('vitejs') },
  { name: 'Node.js', bg: '#3C873A', fg: '#ffffff', logo: DEVICON('nodejs') },
  { name: 'Express', bg: '#2D2D2D', fg: '#ffffff', logo: DEVICON('express') },
  { name: 'PHP', bg: '#777BB4', fg: '#ffffff', logo: DEVICON('php') },
  { name: 'Python', bg: '#3776AB', fg: '#ffffff', logo: DEVICON('python') },
  { name: 'MySQL', bg: '#00618A', fg: '#ffffff', logo: DEVICON('mysql') },
  { name: 'PostgreSQL', bg: '#336791', fg: '#ffffff', logo: DEVICON('postgresql') },
  { name: 'MongoDB', bg: '#13AA52', fg: '#ffffff', logo: DEVICON('mongodb') },
  { name: 'Supabase', bg: '#1F9D6B', fg: '#ffffff', logo: DEVICON('supabase') },
  { name: 'Firebase', bg: '#FFA611', fg: '#1B1B2A', logo: DEVICON('firebase') },
  { name: 'Figma', bg: '#A259FF', fg: '#ffffff', logo: DEVICON('figma') },
  { name: 'Git', bg: '#F1502F', fg: '#ffffff', logo: DEVICON('git') },
  { name: 'GitHub', bg: '#24292F', fg: '#ffffff', logo: DEVICON('github') },
  { name: 'Docker', bg: '#2496ED', fg: '#ffffff', logo: DEVICON('docker') },
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

  const accent = darkMode ? '#00FFB3' : '#FF007A';

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

    .pg-brick {
      background: linear-gradient(180deg,
        color-mix(in srgb, var(--bg) 62%, white) 0%,
        var(--bg) 42%,
        color-mix(in srgb, var(--bg) 78%, black) 100%);
      box-shadow:
        inset 0 1.5px 0 rgba(255,255,255,0.45),
        inset 0 -3px 0 rgba(0,0,0,0.22),
        0 3px 8px -2px rgba(0,0,0,0.35);
    }
    .pg-brick::after {
      content: ''; position: absolute; inset: 3px 6px auto 6px; height: 34%;
      border-radius: 6px; background: linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0));
      pointer-events: none;
    }
    .pg-chip { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.25); }

    @keyframes pg-land { 0% { transform: scaleY(0.78) scaleX(1.03); } 60% { transform: scaleY(1.06) scaleX(0.99); } 100% { transform: none; } }
    .pg-land { animation: pg-land 0.28s cubic-bezier(.3,1.6,.5,1) both; transform-origin: 50% 100%; }

    @keyframes pg-glow { 0% { box-shadow: 0 0 0 0 var(--glow), 0 0 26px 6px var(--glow); } 100% { box-shadow: 0 0 0 14px transparent, 0 0 0 0 transparent; } }
    .pg-ring { animation: pg-glow 0.7s ease-out forwards; }

    @keyframes pg-fall-l { to { transform: translate(-60px, 520px) rotate(-38deg); opacity: 0; } }
    @keyframes pg-fall-r { to { transform: translate(60px, 520px) rotate(38deg); opacity: 0; } }
    @keyframes pg-fall-d { to { transform: translate(0, 560px) rotate(8deg); opacity: 0; } }
    .pg-fall-l { animation: pg-fall-l 1s cubic-bezier(.45,0,.9,.5) forwards; }
    .pg-fall-r { animation: pg-fall-r 1s cubic-bezier(.45,0,.9,.5) forwards; }
    .pg-fall-d { animation: pg-fall-d 1.1s cubic-bezier(.45,0,.9,.5) forwards; }

    @keyframes pg-pop { 0% { transform: translate(-50%, 0) scale(0.6); opacity: 0; } 20% { transform: translate(-50%, -10px) scale(1.1); opacity: 1; } 100% { transform: translate(-50%, -64px) scale(1); opacity: 0; } }
    .pg-pop { animation: pg-pop 0.95s ease-out forwards; }

    @keyframes pg-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-9px) rotate(-0.6deg); } 40% { transform: translateX(8px) rotate(0.5deg); } 60% { transform: translateX(-5px); } 80% { transform: translateX(3px); } }
    .pg-shake { animation: pg-shake 0.45s ease-out; }

    @keyframes pg-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    .pg-bob { animation: pg-bob 1.6s ease-in-out infinite; }

    @keyframes pg-twinkle { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }

    @media (prefers-reduced-motion: reduce) {
      .pg-land, .pg-ring, .pg-shake, .pg-bob { animation: none !important; }
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
const BrickFace = ({ tech, width }) => {
  if (!tech || width < 30) return null;
  return (
    <span className="relative z-[1] flex items-center gap-2 px-2 min-w-0">
      <TechLogo tech={tech} size={width < 60 ? 20 : 24} />
      {width >= 116 && (
        <span className="pg-fg text-[0.6875rem] font-black uppercase tracking-wider truncate drop-shadow-sm">
          {tech.name}
        </span>
      )}
    </span>
  );
};

const Brick = ({ block, tech, bottom, darkMode, className = '' }) => (
  <div
    className={`absolute rounded-lg flex items-center justify-center overflow-hidden pg-brick ${className}`}
    style={{
      left: block.x,
      width: block.width,
      height: BLOCK_HEIGHT - 4,
      bottom,
      '--bg': tech ? tech.bg : darkMode ? '#3A4A66' : '#CBD5E1',
      '--fg': tech ? tech.fg : '#fff',
    }}
  >
    {tech ? (
      <BrickFace tech={tech} width={block.width} />
    ) : (
      <span className="pg-white relative z-[1] text-[0.625rem] font-black uppercase tracking-[0.3em] opacity-80">
        npm init
      </span>
    )}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PlayGame = forwardRef(({ darkMode, soundEnabled = true, onAction }, ref) => {
  const isDesktop = useIsDesktopOnly();
  const p = getPalette(darkMode);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | playing | gameover
  const [stack, setStack] = useState([]); // placed blocks, base included
  const [moving, setMoving] = useState({ width: BASE_WIDTH, techIdx: 0 }); // re-rendered only on drop
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [milestoneToast, setMilestoneToast] = useState(null);
  const [comboStreak, setComboStreak] = useState(0);
  const [debris, setDebris] = useState([]);
  const [popups, setPopups] = useState([]);
  const [scale, setScale] = useState(1);

  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const movingElRef = useRef(null);
  const currentRef = useRef({ x: 0, width: BASE_WIDTH, dir: 1, speed: BASE_SPEED, techIdx: 0 });
  const stackRef = useRef([]);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const reachedMilestonesRef = useRef(new Set());
  const toastTimerRef = useRef(null);
  const fieldWrapRef = useRef(null); // measures available space to scale the playfield
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

  // warm the logo cache the first time the game opens, so bricks never pop in
  useEffect(() => {
    if (!isOpen) return;
    TECH_STACK.forEach((t) => {
      const img = new Image();
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

  const placeMoving = () => {
    const el = movingElRef.current;
    if (el) el.style.transform = `translate3d(${currentRef.current.x}px,0,0)`;
  };

  const resetGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    lastTsRef.current = 0;
    reachedMilestonesRef.current = new Set();
    clearTimeout(toastTimerRef.current);
    setMilestoneToast(null);
    setComboStreak(0);
    comboRef.current = 0;
    setScore(0);
    scoreRef.current = 0;
    setNewBest(false);
    setDebris([]);
    setPopups([]);
    const base = { id: nextId(), x: (PLAYFIELD_WIDTH - BASE_WIDTH) / 2, width: BASE_WIDTH, techIdx: null, perfect: false };
    setStack([base]);
    stackRef.current = [base];
    currentRef.current = { x: 0, width: BASE_WIDTH, dir: 1, speed: BASE_SPEED, techIdx: 0 };
    setMoving({ width: BASE_WIDTH, techIdx: 0 });
    setStatusBoth('idle');
  }, []);

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
        cancelAnimationFrame(rafRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // The game keeps its 400×480 logical size (physics untouched); the whole
  // playfield is scaled with a transform to fit the space it's given.
  useEffect(() => {
    if (!isOpen) return;
    const el = fieldWrapRef.current;
    if (!el) return;

    const recompute = () => {
      const availW = el.clientWidth - 8;
      const availH = window.innerHeight - (window.innerWidth >= 1024 ? 190 : 300);
      const next = Math.max(0.55, Math.min(1.35, availW / PLAYFIELD_WIDTH, availH / FIELD_HEIGHT));
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

  // rAF loop — moves the current block by writing its transform directly
  useEffect(() => {
    if (status !== 'playing') return;

    const tick = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
      lastTsRef.current = ts;

      const cur = currentRef.current;
      let nx = cur.x + cur.dir * cur.speed * dt;
      if (nx <= 0) {
        nx = 0;
        cur.dir = 1;
      } else if (nx + cur.width >= PLAYFIELD_WIDTH) {
        nx = PLAYFIELD_WIDTH - cur.width;
        cur.dir = -1;
      }
      cur.x = nx;
      placeMoving();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
    };
  }, [status]);

  // keep the moving block's transform in sync after each React render
  useEffect(() => {
    placeMoving();
  });

  const showMilestoneToast = useCallback((title) => {
    clearTimeout(toastTimerRef.current);
    setMilestoneToast(title);
    toastTimerRef.current = setTimeout(() => setMilestoneToast(null), 1900);
  }, []);

  const addDebris = useCallback((piece) => {
    const id = nextId();
    setDebris((d) => [...d.slice(-6), { ...piece, id }]);
    setTimeout(() => setDebris((d) => d.filter((x) => x.id !== id)), 1200);
  }, []);

  const addPopup = useCallback((popup) => {
    const id = nextId();
    setPopups((list) => [...list.slice(-4), { ...popup, id }]);
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

  const spawnNext = useCallback((prevBlock, dir) => {
    const speed = Math.min(currentRef.current.speed + SPEED_STEP, MAX_SPEED);
    const width = prevBlock.width;
    const x = dir === 1 ? 0 : PLAYFIELD_WIDTH - width;
    const techIdx = (prevBlock.techIdx + 1) % TECH_STACK.length;
    currentRef.current = { x, width, dir, speed, techIdx };
    setMoving({ width, techIdx });
  }, []);

  const handleDrop = useCallback(() => {
    const st = statusRef.current;
    if (st === 'gameover') {
      resetGame();
      return;
    }
    if (st === 'idle') {
      currentRef.current = { x: 0, width: BASE_WIDTH, dir: 1, speed: BASE_SPEED, techIdx: 0 };
      setMoving({ width: BASE_WIDTH, techIdx: 0 });
      setStatusBoth('playing');
      return;
    }

    const prevBlock = stackRef.current[stackRef.current.length - 1];
    const cur = currentRef.current;
    const row = stackRef.current.length;

    const overlapLeft = Math.max(prevBlock.x, cur.x);
    const overlapRight = Math.min(prevBlock.x + prevBlock.width, cur.x + cur.width);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= MISS_TOLERANCE) {
      // the whole block tumbles off
      addDebris({ x: cur.x, width: cur.width, row, techIdx: cur.techIdx, fall: 'd' });
      endGame(scoreRef.current);
      return;
    }

    const isPerfect = overlapWidth >= prevBlock.width * PERFECT_TOLERANCE;
    const newWidth = isPerfect ? prevBlock.width : overlapWidth;
    const newX = isPerfect ? prevBlock.x : overlapLeft;
    const newBlock = { id: nextId(), x: newX, width: newWidth, perfect: isPerfect, techIdx: cur.techIdx };

    // chop the overhang and let it fall on its side
    if (!isPerfect) {
      if (cur.x < overlapLeft) {
        addDebris({ x: cur.x, width: overlapLeft - cur.x, row, techIdx: cur.techIdx, fall: 'l' });
      }
      if (cur.x + cur.width > overlapRight) {
        addDebris({ x: overlapRight, width: cur.x + cur.width - overlapRight, row, techIdx: cur.techIdx, fall: 'r' });
      }
    }

    const nextStack = [...stackRef.current, newBlock];
    stackRef.current = nextStack;
    setStack(nextStack);

    // Perfect stacks escalate: 2, 3, 4, then 5 points; anything else resets.
    let pointsGained;
    if (isPerfect) {
      comboRef.current += 1;
      pointsGained = Math.min(comboRef.current + 1, 5);
    } else {
      comboRef.current = 0;
      pointsGained = 1;
    }
    setComboStreak(comboRef.current);
    addPopup({
      x: newX + newWidth / 2,
      row,
      text: isPerfect ? `Perfect +${pointsGained}` : `+${pointsGained}`,
      perfect: isPerfect,
    });

    const prevScore = scoreRef.current;
    const newScore = prevScore + pointsGained;
    scoreRef.current = newScore;
    setScore(newScore);
    play(isPerfect ? 'toggle' : 'key');

    const milestone = MILESTONES.find(
      (m) => m.score > prevScore && m.score <= newScore && !reachedMilestonesRef.current.has(m.score)
    );
    if (milestone) {
      reachedMilestonesRef.current.add(milestone.score);
      showMilestoneToast(milestone.title);
    }

    // Next block comes from the opposite side, same width, a little faster.
    spawnNext(newBlock, cur.dir === 1 ? -1 : 1);
  }, [addDebris, addPopup, endGame, play, resetGame, showMilestoneToast, spawnNext]);

  // Keydown handler above needs the latest handleDrop without re-binding
  const handleDropRef = useRef(handleDrop);
  useEffect(() => {
    handleDropRef.current = handleDrop;
  }, [handleDrop]);

  const closeGame = () => setIsOpen(false);

  // camera: keep the top of the tower about a third of the way down
  const cameraY = Math.max(0, (stack.length - (VISIBLE_ROWS - 4)) * BLOCK_HEIGHT);
  const title = currentTitleForScore(score);
  const next = nextMilestone(score);
  const fromScore = prevMilestoneScore(score);
  const progress = next ? (score - fromScore) / (next.score - fromScore) : 1;
  const height = Math.max(0, stack.length - 1);

  // the sky drifts through hues as the tower climbs
  const hue = (darkMode ? 230 : 320) + Math.min(height, 60) * 2.2;
  const sky = darkMode
    ? `linear-gradient(180deg, hsl(${hue + 30} 55% 9%) 0%, hsl(${hue} 50% 16%) 60%, hsl(${hue - 20} 45% 22%) 100%)`
    : `linear-gradient(180deg, hsl(${hue + 40} 90% 96%) 0%, hsl(${hue} 85% 92%) 60%, hsl(${hue - 25} 80% 88%) 100%)`;

  const landed = stack.slice(1).map((b) => TECH_STACK[b.techIdx]);
  const uniqueLanded = [...new Map(landed.map((t) => [t.name, t])).values()];
  const movingTech = TECH_STACK[moving.techIdx];

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
            <span className="pg-ink inline-flex items-center gap-2 text-[0.6875rem] sm:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] opacity-60">
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
              className="mx-auto w-full max-w-[60rem] min-h-full flex flex-col lg:flex-row items-center lg:items-center justify-center gap-5 lg:gap-12 py-4 sm:py-6"
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
                  Line blocks up perfectly to build a combo.
                </p>
              </div>

              {/* ---------------- PLAYFIELD ---------------- */}
              <div ref={fieldWrapRef} className="w-full lg:w-auto lg:flex-1 flex justify-center order-2 lg:order-none">
                <div style={{ width: PLAYFIELD_WIDTH * scale, height: FIELD_HEIGHT * scale }} className="relative">
                  <div
                    className="absolute top-0 left-0"
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

                    <div
                      ref={fieldRef}
                      onPointerDown={handleDrop}
                      className={`relative overflow-hidden rounded-3xl border border-[color:var(--line)] cursor-pointer select-none shadow-[0_30px_60px_-25px_rgba(0,0,0,0.5)]`}
                      style={{ width: PLAYFIELD_WIDTH, height: FIELD_HEIGHT, touchAction: 'manipulation', background: sky, transition: 'background 0.8s ease' }}
                    >
                      {/* sky details: stars at night, soft grid by day */}
                      {darkMode ? (
                        [...Array(18)].map((_, i) => (
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
                          className="absolute inset-0 opacity-40"
                          style={{ backgroundImage: 'linear-gradient(rgba(27,27,42,0.07) 1px, transparent 1px)', backgroundSize: `100% ${BLOCK_HEIGHT}px` }}
                        />
                      )}

                      {/* the world: everything in it scrolls down as the tower grows */}
                      <div
                        className="absolute inset-0"
                        style={{ transform: `translate3d(0, ${cameraY}px, 0)`, transition: 'transform 0.45s cubic-bezier(.22,1,.36,1)' }}
                      >
                        {/* alignment guides from the top block's edges */}
                        {status === 'playing' && (
                          <>
                            {[stack[stack.length - 1].x, stack[stack.length - 1].x + stack[stack.length - 1].width].map((gx, gi) => (
                              <span
                                key={gi}
                                className="absolute w-px pointer-events-none"
                                style={{
                                  left: gx,
                                  bottom: (stack.length - 1) * BLOCK_HEIGHT,
                                  height: BLOCK_HEIGHT * 2.2,
                                  background: `linear-gradient(to top, ${darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(27,27,42,0.3)'}, transparent)`,
                                }}
                              />
                            ))}
                          </>
                        )}

                        {stack.map((b, i) => (
                          <div key={b.id}>
                            <Brick
                              block={b}
                              tech={b.techIdx != null ? TECH_STACK[b.techIdx] : null}
                              bottom={i * BLOCK_HEIGHT}
                              darkMode={darkMode}
                              className={i > 0 && i === stack.length - 1 ? 'pg-land' : ''}
                            />
                            {b.perfect && i === stack.length - 1 && (
                              <span
                                className="pg-ring absolute rounded-lg pointer-events-none"
                                style={{
                                  left: b.x,
                                  width: b.width,
                                  height: BLOCK_HEIGHT - 4,
                                  bottom: i * BLOCK_HEIGHT,
                                  '--glow': `${TECH_STACK[b.techIdx].bg}AA`,
                                }}
                              />
                            )}
                          </div>
                        ))}

                        {/* chopped pieces */}
                        {debris.map((d) => (
                          <div key={d.id} className="absolute" style={{ left: 0, bottom: d.row * BLOCK_HEIGHT, width: '100%', height: BLOCK_HEIGHT }}>
                            <div className={`absolute inset-0 pg-fall-${d.fall}`}>
                              <Brick block={{ x: d.x, width: d.width }} tech={TECH_STACK[d.techIdx]} bottom={0} darkMode={darkMode} />
                            </div>
                          </div>
                        ))}

                        {/* the moving block */}
                        {status === 'playing' && (
                          <div
                            ref={movingElRef}
                            className="absolute left-0 will-change-transform"
                            style={{ bottom: stack.length * BLOCK_HEIGHT, width: moving.width, height: BLOCK_HEIGHT }}
                          >
                            <Brick block={{ x: 0, width: moving.width }} tech={movingTech} bottom={0} darkMode={darkMode} />
                          </div>
                        )}

                        {/* score popups */}
                        {popups.map((pp) => (
                          <span
                            key={pp.id}
                            className={`pg-pop absolute whitespace-nowrap font-black uppercase pointer-events-none ${pp.perfect ? 'pg-acc text-base' : 'pg-ink text-sm opacity-80'}`}
                            style={{ left: pp.x, bottom: (pp.row + 1) * BLOCK_HEIGHT + 4, textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
                          >
                            {pp.perfect && <Sparkles size={12} className="inline -mt-0.5 mr-1" />}
                            {pp.text}
                          </span>
                        ))}
                      </div>

                      {/* ground fade */}
                      <div
                        className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
                        style={{ background: `linear-gradient(to top, ${darkMode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.5)'}, transparent)` }}
                      />

                      {/* start card */}
                      {status === 'idle' && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-8 text-center">
                          <div className="pg-bob flex flex-col items-center gap-1">
                            {[TECH_STACK[4], TECH_STACK[8], TECH_STACK[13]].map((t, i) => (
                              <div
                                key={t.name}
                                className="pg-brick relative rounded-lg flex items-center justify-center"
                                style={{ '--bg': t.bg, '--fg': t.fg, width: 150 - i * 20, height: 30, marginLeft: i === 1 ? 18 : 0 }}
                              >
                                <TechLogo tech={t} size={20} />
                              </div>
                            ))}
                          </div>
                          <span
                            className="pg-on text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-lg"
                            style={{ backgroundColor: 'var(--acc)' }}
                          >
                            {isDesktop ? 'Click or Space to start' : 'Tap to start'}
                          </span>
                          <p className="pg-ink text-xs leading-relaxed opacity-60 max-w-[15rem]">
                            Drop each block on the one below. Whatever hangs off gets chopped. Perfect drops build a combo.
                          </p>
                        </div>
                      )}

                      {/* game over card */}
                      <AnimatePresence>
                        {status === 'gameover' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.35 }}
                            className="absolute inset-0 z-20 flex items-center justify-center p-6"
                            style={{ background: darkMode ? 'rgba(10,10,20,0.55)' : 'rgba(255,255,255,0.55)' }}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <motion.div
                              initial={{ y: 30, scale: 0.9 }}
                              animate={{ y: 0, scale: 1 }}
                              transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.4 }}
                              className="w-full rounded-3xl p-6 text-center shadow-2xl border border-[color:var(--line)]"
                              style={{ background: darkMode ? '#1A1A2C' : '#FFFFFF' }}
                            >
                              {newBest && (
                                <span className="pg-on inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full text-[0.625rem] font-black uppercase tracking-widest bg-amber-400">
                                  <Crown size={12} /> New best!
                                </span>
                              )}
                              <p className={statLabel}>Final score</p>
                              <p className="pg-acc text-6xl font-black tabular-nums leading-none mt-1">{score}</p>
                              <p className="pg-ink mt-3 text-sm font-bold opacity-70">
                                {height} floors · retired as <span className="pg-acc">{title}</span>
                              </p>

                              {uniqueLanded.length > 0 && (
                                <div className="mt-5">
                                  <p className={statLabel}>Your stack</p>
                                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                                    {uniqueLanded.map((t) => (
                                      <span key={t.name} title={t.name}>
                                        <TechLogo tech={t} size={28} />
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <button
                                onClick={resetGame}
                                className="cursor-target mt-6 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

PlayGame.displayName = 'PlayGame';

export default PlayGame;
