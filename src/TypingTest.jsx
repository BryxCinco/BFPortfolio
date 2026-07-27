import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { X, Keyboard, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// CONFIG
// ============================================================================

const DURATIONS = [15, 30, 60, 120];
const WORDS_PER_BATCH = 220; // generous buffer so the passage never "runs out"

// A pool of varied passages — a fresh random mix is shuffled together every
// time a test starts/restarts, so it's never the same single block of text.
const TEXT_BANK = [
  'The quick brown fox jumps over the lazy dog while the sun sets slowly behind the hills.',
  'Great things are never done alone, they are done by a series of small steps taken together.',
  'Technology moves fast, but good habits and steady practice move even faster over time.',
  'A calm mind and a clear plan can solve problems that panic and haste never will.',
  'Every keystroke tells a story of patience, rhythm, and the quiet discipline of practice.',
  'Coffee brewed at dawn tastes better when the whole city is still asleep outside the window.',
  'Curiosity is the engine of progress, pushing people to ask better questions every single day.',
  'The old library smelled of paper and dust, a comforting scent that never seemed to fade.',
  'Rain tapped gently on the rooftop while the fire crackled softly in the corner of the room.',
  'Consistency beats intensity when the goal is to build a skill that lasts for years.',
  'The mountain trail wound upward through pine trees, offering quiet views at every turn.',
  'A well designed interface should feel invisible, guiding the user without ever getting in the way.',
  'Practice does not make perfect, but it does make progress, and progress is what truly counts.',
  'The ocean waves rolled in steadily, carrying the smell of salt and the sound of distant gulls.',
  'Focus is a muscle, and like any muscle, it grows stronger the more often it gets used.',
  'Simple tools, used consistently, often outperform complex systems that nobody fully understands.',
  'The city lights flickered on one by one as evening settled quietly over the busy streets.',
  'Small daily improvements compound over months into results that once seemed impossible.',
];

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateWords(minWordCount = WORDS_PER_BATCH) {
  let words = [];
  while (words.length < minWordCount) {
    words = words.concat(shuffleArray(TEXT_BANK).join(' ').split(' '));
  }
  return words;
}

function computeStats(typed, target, elapsedSeconds) {
  let correct = 0;
  let incorrect = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === target[i]) correct++;
    else incorrect++;
  }
  const minutes = Math.max(elapsedSeconds, 1) / 60;
  const wpm = Math.round(correct / 5 / minutes);
  const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
  return { correct, incorrect, wpm, accuracy, typedLength: typed.length };
}

// ============================================================================
// DESKTOP-ONLY DETECTION
// Width alone isn't reliable (tablets/iPads can report desktop-sized
// viewports), so this also requires a fine pointer + real hover support,
// which touch devices don't have. This keeps the feature off phones,
// tablets, and iPads while still working on real desktop/laptop browsers.
// ============================================================================

const DESKTOP_QUERY = '(min-width: 1024px) and (pointer: fine) and (hover: hover)';

export function useIsDesktopOnly() {
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
// NAV TRIGGER — bare icon, no pill/background/border. Renders nothing at
// all (not just hidden via CSS) on touch devices, tablets, and mobile.
// ============================================================================

export const TypingTestTrigger = ({ darkMode, onClick, className = '' }) => {
  const isDesktop = useIsDesktopOnly();
  if (!isDesktop) return null;

  const accent = darkMode ? '#00FFB3' : '#FF007A';

  return (
    <button
      onClick={onClick}
      aria-label="Open typing speed test"
      title="Typing Speed Test"
      className={`cursor-target inline-flex items-center gap-2 opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 transition-all duration-300 ${className}`}
      style={{ color: accent }}
    >
      <Keyboard size={18} />
      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Typing Test</span>
    </button>
  );
};

// ============================================================================
// MINI CHARTS (plain SVG — no extra chart dependency needed)
// ============================================================================

const WpmLineChart = ({ data, accent, darkMode }) => {
  const width = 640;
  const height = 180;
  const padding = 28;

  if (!data.length) return null;

  const maxWpm = Math.max(...data.map((d) => d.wpm), 10);
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;

  const toXY = (d, i) => {
    const x = padding + (data.length === 1 ? 0 : (i / (data.length - 1)) * plotW);
    const y = padding + plotH - (d.wpm / maxWpm) * plotH;
    return [x, y];
  };

  const linePoints = data.map((d, i) => toXY(d, i).join(',')).join(' ');
  const gridColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const labelColor = darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(27,27,42,0.4)';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 190 }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = padding + plotH - t * plotH;
        return (
          <g key={t}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke={gridColor} strokeWidth="1" />
            <text x={4} y={y + 4} fontSize="10" fill={labelColor}>
              {Math.round(maxWpm * t)}
            </text>
          </g>
        );
      })}
      <polyline points={linePoints} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const [x, y] = toXY(d, i);
        return <circle key={i} cx={x} cy={y} r="3" fill={accent} />;
      })}
      <text x={padding} y={height - 4} fontSize="10" fill={labelColor}>0s</text>
      <text x={width - padding - 24} y={height - 4} fontSize="10" fill={labelColor}>
        {data[data.length - 1]?.time ?? ''}s
      </text>
    </svg>
  );
};

const AccuracyRing = ({ accuracy, accent, darkMode, size = 120 }) => {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (accuracy / 100) * c;
  const trackColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={accent}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="22"
        fontWeight="900"
        fill={accent}
      >
        {accuracy}%
      </text>
    </svg>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TypingTest = forwardRef(({ darkMode, soundEnabled = true, onKeyPress }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState(30);
  const [status, setStatus] = useState('idle'); // idle | running | finished
  const [timeLeft, setTimeLeft] = useState(30);
  const [words, setWords] = useState(() => generateWords());
  const [typed, setTyped] = useState('');
  const [wpmHistory, setWpmHistory] = useState([]);
  const [liveStats, setLiveStats] = useState({ wpm: 0, accuracy: 100 });
  const [finalStats, setFinalStats] = useState(null);

  const inputRef = useRef(null);
  const wordRefs = useRef([]);
  const lastScrolledWordRef = useRef(-1);
  const typedRef = useRef('');
  const targetRef = useRef('');
  const intervalRef = useRef(null);
  const elapsedRef = useRef(0);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  useEffect(() => {
    targetRef.current = words.join(' ');
  }, [words]);

  // Lock scroll + esc to close, matching the rest of the site's overlays
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      const onKey = (e) => {
        if (e.key === 'Escape') setIsOpen(false);
        if (e.key === 'Tab') {
          e.preventDefault();
          resetTest();
        }
      };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = prevOverflow;
        clearTimeout(t);
        window.removeEventListener('keydown', onKey);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const resetTest = useCallback((newDuration) => {
    clearInterval(intervalRef.current);
    const d = newDuration ?? duration;
    const freshWords = generateWords();
    setWords(freshWords);
    targetRef.current = freshWords.join(' ');
    setDuration(d);
    setTimeLeft(d);
    setTyped('');
    typedRef.current = '';
    setWpmHistory([]);
    setLiveStats({ wpm: 0, accuracy: 100 });
    setFinalStats(null);
    setStatus('idle');
    lastScrolledWordRef.current = -1;
    elapsedRef.current = 0;
    setTimeout(() => inputRef.current?.focus(), 30);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const finishTest = useCallback(() => {
    clearInterval(intervalRef.current);
    const stats = computeStats(typedRef.current, targetRef.current, duration);
    setFinalStats(stats);
    setStatus('finished');
  }, [duration]);

  const startTest = useCallback(() => {
    setStatus('running');
    elapsedRef.current = 0;
    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      const remaining = duration - elapsedRef.current;
      const stats = computeStats(typedRef.current, targetRef.current, elapsedRef.current);
      setLiveStats({ wpm: stats.wpm, accuracy: stats.accuracy });
      setWpmHistory((prev) => [...prev, { time: elapsedRef.current, wpm: stats.wpm, accuracy: stats.accuracy }]);
      setTimeLeft(Math.max(remaining, 0));
      if (remaining <= 0) {
        finishTest();
      }
    }, 1000);
  }, [duration, finishTest]);

  const handleChange = (e) => {
    if (status === 'finished') return;
    let val = e.target.value;

    if (status === 'idle' && val.length > 0) {
      startTest();
    }

    // Sound effect: only on new characters being typed (not backspace/deletes).
    // Plays a normal click for a correct key, a lower "error" tone for a mistyped one.
    if (soundEnabled && typeof onKeyPress === 'function' && val.length > typedRef.current.length) {
      const newIndex = val.length - 1;
      const typedChar = val[newIndex];
      const targetChar = targetRef.current[newIndex];
      onKeyPress(typedChar === targetChar ? 'key' : 'error');
    }

    typedRef.current = val;
    setTyped(val);

    // Keep the passage effectively endless while the clock is running so a
    // fast typer never "runs out" of text before time is up.
    if (targetRef.current.length - val.length < 60) {
      setWords((prevWords) => {
        const extended = [...prevWords, ...generateWords(80)];
        targetRef.current = extended.join(' ');
        return extended;
      });
    }
  };

  // Keep the current word scrolled into view
  useEffect(() => {
    const currentWordIndex = typed.split(' ').length - 1;
    if (currentWordIndex !== lastScrolledWordRef.current) {
      lastScrolledWordRef.current = currentWordIndex;
      wordRefs.current[currentWordIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [typed]);

  const closeTest = () => setIsOpen(false);

  const theme = darkMode
    ? {
        backdrop: 'bg-[#1B1B2A]/95',
        text: 'text-white',
        title: 'text-white/60',
        divider: 'border-white/10',
        accent: '#00FFB3',
        pillIdle: 'border-white/10 text-white/50 hover:text-white hover:border-[#00FFB3]/50',
        pillActive: 'border-[#00FFB3] text-[#00FFB3] bg-[#00FFB3]/10',
        iconIdle: 'text-white/40 hover:text-white/70 hover:bg-white/5',
      }
    : {
        backdrop: 'bg-white/95',
        text: 'text-[#1B1B2A]',
        title: 'text-[#1B1B2A]/60',
        divider: 'border-black/10',
        accent: '#FF007A',
        pillIdle: 'border-black/10 text-[#1B1B2A]/50 hover:text-[#1B1B2A] hover:border-[#FF007A]/50',
        pillActive: 'border-[#FF007A] text-[#FF007A] bg-[#FF007A]/10',
        iconIdle: 'text-[#1B1B2A]/40 hover:text-[#1B1B2A]/70 hover:bg-black/5',
      };

  let globalIdx = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="claude-typing-test-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed inset-0 z-[1000] flex flex-col backdrop-blur-2xl ${theme.backdrop} ${theme.text} font-sans`}
        >
          {/* Forced letter-coloring — scoped through the #claude-typing-test-overlay
              id (very high specificity) plus !important, so nothing else on the
              site — global resets, typography plugins, dark-mode text rules,
              even other !important declarations of lower specificity — can
              silently override the typed-letter colors. */}
          <style>{`
            #claude-typing-test-overlay .tt-pending { color: ${darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(27,27,42,0.3)'} !important; }
            #claude-typing-test-overlay .tt-correct { color: ${darkMode ? '#ffffff' : '#000000'} !important; }
            #claude-typing-test-overlay .tt-incorrect { color: #ef4444 !important; text-decoration: underline !important; }
            #claude-typing-test-overlay .tt-caret { color: ${darkMode ? '#1B1B2A' : '#ffffff'} !important; }
          `}</style>

          {/* Top bar */}
          <div className="relative flex items-center justify-center px-6 shrink-0" style={{ height: 68 }}>
            <span className={`text-sm font-black uppercase tracking-[0.5em] ${theme.title}`}>
              Typing Test
            </span>
            <button
              onClick={closeTest}
              aria-label="Close typing test"
              className={`cursor-target absolute right-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-colors ${theme.iconIdle}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative flex-1 overflow-y-auto px-6 custom-scrollbar">
            <div className="mx-auto w-full min-h-full flex flex-col justify-center items-center gap-8 py-10" style={{ width: 880 }}>
              {status !== 'finished' ? (
                <>
                  {/* Tab/Esc hint — centered, right above the timer selection */}
                  <span className={`inline-flex items-center gap-2 text-sm font-medium tracking-wide ${theme.title} opacity-90`}>
                    press
                    <kbd className={`px-2.5 py-1 rounded-md border text-sm font-bold ${theme.divider} ${theme.title}`}>tab</kbd>
                    to restart,
                    <kbd className={`px-2.5 py-1 rounded-md border text-sm font-bold ${theme.divider} ${theme.title}`}>esc</kbd>
                    to close
                  </span>

                  {/* Duration selector */}
                  <div className="flex items-center justify-center gap-3">
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        disabled={status === 'running'}
                        onClick={() => resetTest(d)}
                        className={`cursor-target px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                          duration === d ? theme.pillActive : theme.pillIdle
                        }`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>

                  {/* Live counters */}
                  <div className="flex items-center justify-center gap-16">
                    <div className="text-center" style={{ width: 120 }}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.title}`}>Time</p>
                      <p className="text-5xl font-black tabular-nums" style={{ color: theme.accent }}>
                        {timeLeft}
                      </p>
                    </div>
                    <div className="text-center" style={{ width: 120 }}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.title}`}>WPM</p>
                      <p className="text-5xl font-black tabular-nums">{liveStats.wpm}</p>
                    </div>
                    <div className="text-center" style={{ width: 120 }}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.title}`}>Accuracy</p>
                      <p className="text-5xl font-black tabular-nums">{liveStats.accuracy}%</p>
                    </div>
                  </div>

                  {/* Typing passage */}
                  <div
                    className="relative overflow-hidden cursor-text"
                    style={{ height: 168, width: '100%' }}
                    onClick={() => inputRef.current?.focus()}
                  >
                    <div className={`absolute inset-x-0 top-0 h-6 bg-gradient-to-b ${darkMode ? 'from-[#1B1B2A]' : 'from-white'} to-transparent pointer-events-none z-10`} />
                    <div className={`absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t ${darkMode ? 'from-[#1B1B2A]' : 'from-white'} to-transparent pointer-events-none z-10`} />
                    <p className="text-2xl font-light leading-relaxed tracking-wide select-none" style={{ fontSize: 26 }}>
                      {words.map((word, wi) => {
                        const chars = [...word].map((ch, ci) => {
                          const idx = globalIdx++;
                          const typedCh = typed[idx];
                          // The "you are here" marker: the very next character to
                          // type gets a solid highlighted block (cyan in dark mode,
                          // pink in light mode) so position is easy to track.
                          const isCaret = idx === typed.length && status !== 'finished';

                          let colorCls = 'tt-pending';
                          if (typedCh !== undefined) {
                            colorCls = typedCh === ch ? 'tt-correct' : 'tt-incorrect';
                          }
                          if (isCaret) colorCls = 'tt-caret';

                          return (
                            <span
                              key={ci}
                              className={`${colorCls} rounded-[3px] ${isCaret ? 'animate-pulse' : ''}`}
                              style={{ backgroundColor: isCaret ? theme.accent : undefined }}
                            >
                              {ch}
                            </span>
                          );
                        });
                        const spaceIdx = globalIdx++;
                        const isCaretSpace = spaceIdx === typed.length && status !== 'finished';
                        return (
                          <span
                            key={wi}
                            ref={(el) => (wordRefs.current[wi] = el)}
                            className="inline-block mr-[0.4em]"
                          >
                            {chars}
                            <span
                              className={`rounded-[3px] ${isCaretSpace ? 'animate-pulse' : ''}`}
                              style={{ backgroundColor: isCaretSpace ? theme.accent : undefined }}
                            >
                              {'\u00A0'}
                            </span>
                          </span>
                        );
                      })}
                    </p>
                  </div>

                  <input
                    ref={inputRef}
                    type="text"
                    value={typed}
                    onChange={handleChange}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className="absolute opacity-0 w-0 h-0"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center gap-10 animate-fade-in">
                  <div className="flex items-center justify-center gap-16">
                    <div className="text-center" style={{ width: 160 }}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.title}`}>WPM</p>
                      <p className="text-7xl font-black tabular-nums" style={{ color: theme.accent }}>
                        {finalStats.wpm}
                      </p>
                    </div>
                    <AccuracyRing accuracy={finalStats.accuracy} accent={theme.accent} darkMode={darkMode} />
                    <div className="text-center" style={{ width: 160 }}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.title}`}>Duration</p>
                      <p className="text-7xl font-black tabular-nums">{duration}s</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-10 text-center">
                    <div style={{ width: 130 }}>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${theme.title}`}>Correct</p>
                      <p className="text-xl font-black" style={{ color: theme.accent }}>{finalStats.correct}</p>
                    </div>
                    <div style={{ width: 130 }}>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${theme.title}`}>Incorrect</p>
                      <p className="text-xl font-black text-red-500">{finalStats.incorrect}</p>
                    </div>
                    <div style={{ width: 130 }}>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${theme.title}`}>Characters Typed</p>
                      <p className="text-xl font-black">{finalStats.typedLength}</p>
                    </div>
                  </div>

                  <div style={{ width: 640 }}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-center ${theme.title}`}>
                      WPM Over Time
                    </p>
                    <WpmLineChart data={wpmHistory} accent={theme.accent} darkMode={darkMode} />
                  </div>

                  <button
                    onClick={() => resetTest()}
                    className="cursor-target flex items-center gap-3 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: theme.accent, color: darkMode ? '#1B1B2A' : '#fff' }}
                  >
                    <RotateCcw size={16} /> Try Again
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

export default TypingTest;