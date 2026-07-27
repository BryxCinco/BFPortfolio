import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { X, Layers, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// CONFIG
// ============================================================================

const PLAYFIELD_WIDTH = 400;
const BLOCK_HEIGHT = 42;
const VISIBLE_ROWS = 12;
const BASE_WIDTH = 240;
const BASE_SPEED = 85; // px/sec — starts gentle, ramps up per successful stack
const SPEED_STEP = 8; // px/sec added per successful stack
const MAX_SPEED = 320;
const PERFECT_TOLERANCE = 0.97; // overlap this close to full width counts as "perfect"
const MISS_TOLERANCE = 1.5; // px of overlap below which it's a miss

// Career milestones — reached in order as the stack grows. Score ranges:
// 0-10 Unemployed, 10-20 Entry, 20-30 Junior, 30-50 Mid, 50-80 Senior,
// 80-100 Principal, 100+ CTO. Open-ended: add more rungs and they'll show up.
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

// Tech stack cycle — every block that lands gets stamped with the next
// technology in this list (brand color chip + monogram), so the tower reads
// like an actual stack: HTML → CSS → JS → React → Node → Express → SQL →
// Postgres → Mongo → JSON → Tailwind → a few more common web tools, then loops.
const TECH_STACK = [
  { name: 'HTML', short: 'HTML', bg: '#E44D26', fg: '#ffffff' },
  { name: 'CSS', short: 'CSS', bg: '#2965F1', fg: '#ffffff' },
  { name: 'JavaScript', short: 'JS', bg: '#F0DB4F', fg: '#1B1B2A' },
  { name: 'TypeScript', short: 'TS', bg: '#3178C6', fg: '#ffffff' },
  { name: 'React', short: 'React', bg: '#149ECA', fg: '#ffffff' },
  { name: 'Angular', short: 'Angular', bg: '#DD0031', fg: '#ffffff' },
  { name: 'Node.js', short: 'Node', bg: '#3C873A', fg: '#ffffff' },
  { name: 'Express', short: 'Express', bg: '#2D2D2D', fg: '#ffffff' },
  { name: 'SQL', short: 'SQL', bg: '#00618A', fg: '#ffffff' },
  { name: 'PostgreSQL', short: 'Postgres', bg: '#336791', fg: '#ffffff' },
  { name: 'MongoDB', short: 'Mongo', bg: '#13AA52', fg: '#ffffff' },
  { name: 'Firebase', short: 'Firebase', bg: '#FFA611', fg: '#1B1B2A' },
  { name: 'JSON', short: 'JSON', bg: '#1B1B2A', fg: '#F0DB4F' },
  { name: 'Tailwind CSS', short: 'Tailwind', bg: '#38BDF8', fg: '#0B1120' },
  { name: 'Git', short: 'Git', bg: '#F1502F', fg: '#ffffff' },
  { name: 'Docker', short: 'Docker', bg: '#2496ED', fg: '#ffffff' },
  { name: 'Kubernetes', short: 'K8s', bg: '#326CE5', fg: '#ffffff' },
  { name: 'Postman', short: 'Postman', bg: '#FF6C37', fg: '#ffffff' },
  { name: 'OAuth', short: 'OAuth', bg: '#000000', fg: '#ffffff' },
  { name: 'Cloud', short: 'Cloud', bg: '#4285F4', fg: '#ffffff' },
  { name: 'Vercel', short: 'Vercel', bg: '#000000', fg: '#ffffff' },
  { name: 'AWS', short: 'AWS', bg: '#FF9900', fg: '#1B1B2A' },
];

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
      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Play Game</span>
    </button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PlayGame = forwardRef(({ darkMode, soundEnabled = true, onAction }, ref) => {
  const isDesktop = useIsDesktopOnly();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | playing | gameover
  const [stack, setStack] = useState([]); // placed blocks, base included
  const [currentBlock, setCurrentBlock] = useState({ x: 0, width: BASE_WIDTH });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [milestoneToast, setMilestoneToast] = useState(null);
  const [comboStreak, setComboStreak] = useState(0);
  const [scale, setScale] = useState(1);

  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const currentRef = useRef({ x: 0, width: BASE_WIDTH, dir: 1, speed: BASE_SPEED });
  const stackRef = useRef([]);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const reachedMilestonesRef = useRef(new Set());
  const toastTimerRef = useRef(null);
  const scaleWrapRef = useRef(null); // measures available width to scale the playfield

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BEST_KEY);
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {}
  }, []);

  const play = useCallback(
    (variant) => {
      if (soundEnabled && typeof onAction === 'function') onAction(variant);
    },
    [soundEnabled, onAction]
  );

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
    const base = { x: (PLAYFIELD_WIDTH - BASE_WIDTH) / 2, width: BASE_WIDTH, techIdx: null, perfect: false };
    setStack([base]);
    stackRef.current = [base];
    currentRef.current = { x: 0, width: BASE_WIDTH, dir: 1, speed: BASE_SPEED, techIdx: 0 };
    setCurrentBlock({ x: 0, width: BASE_WIDTH });
    setStatus('idle');
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

  // Keep the game's internal 400px-wide physics untouched, but shrink the
  // whole playfield visually (via CSS transform) to fit narrow phones —
  // iPhone SE/mini in portrait, split-screen iPad, small Android widths, etc.
  useEffect(() => {
    if (!isOpen) return;
    const el = scaleWrapRef.current;
    if (!el) return;

    const SAFETY_MARGIN = 8; // px breathing room so edges never clip

    const recompute = () => {
      const available = el.clientWidth - SAFETY_MARGIN;
      const next = available > 0 ? Math.min(1, available / PLAYFIELD_WIDTH) : 1;
      setScale(next);
    };

    recompute();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(recompute);
      ro.observe(el);
    } else {
      window.addEventListener('resize', recompute);
    }
    window.addEventListener('orientationchange', recompute);

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', recompute);
      window.removeEventListener('orientationchange', recompute);
    };
  }, [isOpen]);

  // rAF loop — runs continuously while playing; drops mutate currentRef
  // in place so the loop never needs to be torn down/restarted mid-game.
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
      setCurrentBlock({ x: cur.x, width: cur.width });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
    };
  }, [status]);

  const showMilestoneToast = useCallback((title) => {
    clearTimeout(toastTimerRef.current);
    setMilestoneToast(title);
    toastTimerRef.current = setTimeout(() => setMilestoneToast(null), 1800);
  }, []);

  const endGame = useCallback(
    (finalScore) => {
      setStatus('gameover');
      play('error');
      setBest((prevBest) => {
        const next = Math.max(prevBest, finalScore);
        try {
          localStorage.setItem(BEST_KEY, String(next));
        } catch {}
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
    setCurrentBlock({ x, width });
  }, []);

  const handleDrop = useCallback(() => {
    if (status === 'idle') {
      // First tap/space starts the game — spawn the first moving block.
      currentRef.current = { x: 0, width: BASE_WIDTH, dir: 1, speed: BASE_SPEED, techIdx: 0 };
      setCurrentBlock({ x: 0, width: BASE_WIDTH });
      setStatus('playing');
      return;
    }

    if (status !== 'playing') return;

    const prevBlock = stackRef.current[stackRef.current.length - 1];
    const cur = currentRef.current;

    const overlapLeft = Math.max(prevBlock.x, cur.x);
    const overlapRight = Math.min(prevBlock.x + prevBlock.width, cur.x + cur.width);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= MISS_TOLERANCE) {
      endGame(scoreRef.current);
      return;
    }

    const isPerfect = overlapWidth >= prevBlock.width * PERFECT_TOLERANCE;
    const newWidth = isPerfect ? prevBlock.width : overlapWidth;
    const newX = isPerfect ? prevBlock.x : overlapLeft;
    const newBlock = {
      x: newX,
      width: newWidth,
      perfect: isPerfect,
      techIdx: cur.techIdx,
    };

    const nextStack = [...stackRef.current, newBlock];
    stackRef.current = nextStack;
    setStack(nextStack);

    // Perfect stacks escalate: 1st perfect in a row = 2pts, 2nd = 3pts,
    // 3rd = 4pts, 4th+ = capped at 5pts. Any non-perfect resets the streak.
    let pointsGained;
    if (isPerfect) {
      comboRef.current += 1;
      pointsGained = Math.min(comboRef.current + 1, 5);
    } else {
      comboRef.current = 0;
      pointsGained = 1;
    }
    setComboStreak(comboRef.current);

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

    // Next block spawns from the opposite side, same width as the piece
    // we just laid down, a little faster than the last one.
    spawnNext(newBlock, cur.dir === 1 ? -1 : 1);
  }, [status, darkMode, endGame, play, showMilestoneToast, spawnNext]);

  // Keydown handler above needs the latest handleDrop without re-binding
  // the window listener on every render.
  const handleDropRef = useRef(handleDrop);
  useEffect(() => {
    handleDropRef.current = handleDrop;
  }, [handleDrop]);

  const closeGame = () => setIsOpen(false);

  const theme = darkMode
    ? {
        backdrop: 'bg-[#1B1B2A]/95',
        text: 'text-white',
        title: 'text-white/60',
        divider: 'border-white/10',
        accent: '#00FFB3',
        track: 'bg-white/5 border-white/10',
        iconIdle: 'text-white/40 hover:text-white/70 hover:bg-white/5',
      }
    : {
        backdrop: 'bg-white/95',
        text: 'text-[#1B1B2A]',
        title: 'text-[#1B1B2A]/60',
        divider: 'border-black/10',
        accent: '#FF007A',
        track: 'bg-black/5 border-black/10',
        iconIdle: 'text-[#1B1B2A]/40 hover:text-[#1B1B2A]/70 hover:bg-black/5',
      };

  const containerHeight = VISIBLE_ROWS * BLOCK_HEIGHT;
  // Standard dynamic smooth scrolling calculation as the tower climbs up
  const scrollOffset = Math.max(0, (stack.length - (VISIBLE_ROWS - 3)) * BLOCK_HEIGHT);
  const title = currentTitleForScore(score);
  const next = nextMilestone(score);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="claude-play-game-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed inset-0 z-[1000] flex flex-col backdrop-blur-2xl ${theme.backdrop} ${theme.text} font-sans`}
        >
          {/* Top bar */}
          <div
            className="relative flex items-center justify-center px-4 sm:px-6 shrink-0"
            style={{ height: 60, paddingTop: 'env(safe-area-inset-top)' }}
          >
            <span className={`text-[11px] sm:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] ${theme.title}`}>
              Stack Game
            </span>
            <button
              onClick={closeGame}
              aria-label="Close game"
              className={`cursor-target absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-colors ${theme.iconIdle}`}
              style={{ marginTop: 'env(safe-area-inset-top)' }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 custom-scrollbar">
            <div
              ref={scaleWrapRef}
              className="mx-auto w-full max-w-full min-h-full flex flex-col justify-start items-center gap-4 sm:gap-6 py-6 sm:py-10"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
            >
              {status !== 'gameover' ? (
                <>
                  <span className={`flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-center font-medium tracking-wide ${theme.title} opacity-90`}>
                    {isDesktop ? (
                      <>
                        press
                        <kbd className={`px-2.5 py-1 rounded-md border text-sm font-bold ${theme.divider} ${theme.title}`}>space</kbd>
                        or click / tap the tower to drop a block,
                        <kbd className={`px-2.5 py-1 rounded-md border text-sm font-bold ${theme.divider} ${theme.title}`}>esc</kbd>
                        to close
                      </>
                    ) : (
                      'Tap the tower to drop a block'
                    )}
                  </span>

                  {/* Live counters */}
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-10 md:gap-x-14">
                    <div className="text-center min-w-[76px] sm:min-w-[110px]">
                      <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${theme.title}`}>Score</p>
                      <p className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums" style={{ color: theme.accent }}>
                        {score}
                      </p>
                    </div>
                    <div className="text-center min-w-[76px] sm:min-w-[110px]">
                      <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${theme.title}`}>Best</p>
                      <p className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums">{best}</p>
                    </div>
                    <div className="text-center min-w-[100px] sm:min-w-[150px]">
                      <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${theme.title}`}>Level</p>
                      <p className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wide" style={{ color: theme.accent }}>
                        {title || '—'}
                      </p>
                    </div>
                  </div>

                  {next && (
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.title} opacity-70`}>
                      {next.score - score} to {next.title}
                    </p>
                  )}

                  <div
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest animate-pulse"
                    style={{
                      backgroundColor: `${theme.accent}22`,
                      color: theme.accent,
                      border: `1px solid ${theme.accent}55`,
                      visibility: comboStreak > 0 ? 'visible' : 'hidden',
                    }}
                  >
                    <Sparkles size={13} /> Perfect Streak ×{comboStreak || 1}
                  </div>

                  {/* Playfield — the inner block keeps the game's real 400px
                      logical size (physics/collision math is untouched); the
                      outer wrapper reserves the *scaled* footprint so layout
                      doesn't leave extra blank space on narrow screens. */}
                  <div style={{ width: PLAYFIELD_WIDTH * scale, height: containerHeight * scale }}>
                  <div
                    className="relative"
                    style={{ width: PLAYFIELD_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
                  >
                    {/* Milestone toast */}
                    <AnimatePresence>
                      {milestoneToast && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.85 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.85 }}
                          transition={{ duration: 0.25 }}
                          className="absolute left-1/2 -translate-x-1/2 -top-14 z-20 flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest whitespace-nowrap shadow-lg"
                          style={{ backgroundColor: theme.accent, color: darkMode ? '#1B1B2A' : '#fff' }}
                        >
                          <Trophy size={14} /> {milestoneToast} Unlocked!
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div
                      onPointerDown={handleDrop}
                      className={`relative overflow-hidden rounded-md border cursor-pointer select-none ${theme.track}`}
                      style={{ width: PLAYFIELD_WIDTH, height: containerHeight, touchAction: 'manipulation' }}
                    >
                      {status === 'idle' && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                          <span
                            className="text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full animate-pulse"
                            style={{ backgroundColor: theme.accent, color: darkMode ? '#1B1B2A' : '#fff' }}
                          >
                            Tap / Space to Start
                          </span>
                        </div>
                      )}

                      {/* Placed stack — the base platform is plain, every block
                          above it is stamped with the next tech-stack logo */}
                      {stack.map((b, i) => {
                        const tech = b.techIdx != null ? TECH_STACK[b.techIdx] : null;
                        return (
                          <div
                            key={i}
                            className="absolute rounded-[4px] flex items-center justify-center overflow-hidden"
                            style={{
                              left: b.x,
                              width: b.width,
                              height: BLOCK_HEIGHT - 3,
                              bottom: i * BLOCK_HEIGHT - scrollOffset,
                              backgroundColor: tech ? tech.bg : darkMode ? '#2a3a52' : '#e2e8f0',
                              boxShadow: b.perfect ? `0 0 14px ${tech?.bg || theme.accent}` : 'none',
                            }}
                          >
                            {tech && (
                              <span
                                className="px-1 text-[11px] font-black uppercase tracking-tight truncate"
                                style={{ color: tech.fg }}
                              >
                                {b.width > 60 ? tech.short : tech.short.slice(0, 2)}
                              </span>
                            )}
                            {b.perfect && (
                              <span className="absolute top-0.5 right-0.5">
                                <Sparkles size={12} color={tech?.fg || (darkMode ? '#1B1B2A' : '#fff')} />
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Moving current block — already shows the tech it will
                          stamp on landing */}
                      {status === 'playing' && (() => {
                        const movingTech = TECH_STACK[currentRef.current.techIdx];
                        return (
                          <div
                            className="absolute rounded-[4px] flex items-center justify-center overflow-hidden"
                            style={{
                              left: currentBlock.x,
                              width: currentBlock.width,
                              height: BLOCK_HEIGHT - 3,
                              bottom: stack.length * BLOCK_HEIGHT - scrollOffset,
                              backgroundColor: movingTech.bg,
                              opacity: 0.92,
                            }}
                          >
                            <span
                              className="px-1 text-[11px] font-black uppercase tracking-tight truncate"
                              style={{ color: movingTech.fg }}
                            >
                              {currentBlock.width > 60 ? movingTech.short : movingTech.short.slice(0, 2)}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-6 sm:gap-10 animate-fade-in px-2">
                  <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-16">
                    <div className="text-center min-w-[110px] sm:min-w-[160px]">
                      <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${theme.title}`}>Final Score</p>
                      <p className="text-5xl sm:text-6xl md:text-7xl font-black tabular-nums" style={{ color: theme.accent }}>
                        {score}
                      </p>
                    </div>
                    <div className="text-center min-w-[110px] sm:min-w-[160px]">
                      <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] ${theme.title}`}>Best</p>
                      <p className="text-5xl sm:text-6xl md:text-7xl font-black tabular-nums">{best}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${theme.title}`}>Level Reached</p>
                    <p className="text-xl font-black uppercase tracking-wide" style={{ color: theme.accent }}>
                      {title || 'Unranked'}
                    </p>
                  </div>

                  <button
                    onClick={resetGame}
                    className="cursor-target flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: theme.accent, color: darkMode ? '#1B1B2A' : '#fff' }}
                  >
                    <RotateCcw size={16} /> Play Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default PlayGame;