import React, {
  forwardRef,
  memo,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from 'react';
import { X, Keyboard, RotateCcw, MousePointerClick, ArrowBigUpDash, Crown, Quote, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getPalette, cssVars } from './theme';

// ============================================================================
// TYPINGTEST.JSX — a Monkeytype-style speed test. Three lines of text with a
// smooth sliding caret; the passage scrolls a line at a time as you type.
// Two word sets (quotes / dev words), four durations, per-mode personal bests,
// and a results screen with raw WPM, consistency and a WPM-over-time chart.
// ============================================================================

// ============================================================================
// CONFIG
// ============================================================================

const DURATIONS = [15, 30, 60, 120];
const WORDS_PER_BATCH = 220; // generous buffer so the passage never "runs out"
const PB_KEY = 'bp_typing_pb';

const MODES = [
  { id: 'quotes', label: 'Quotes', Icon: Quote },
  { id: 'dev', label: 'Dev words', Icon: Code2 },
];

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

const DEV_WORDS = (
  'const let function return async await promise array object string number boolean null undefined ' +
  'react component state props hook effect render memo context router query schema index table join ' +
  'select insert update delete commit branch merge rebase push pull deploy build bundle vite tailwind ' +
  'node express server client request response fetch cache token session cookie header middleware ' +
  'module import export default class interface type enum map filter reduce spread callback event ' +
  'listener handler debug console log error throw catch try finally test mock lint format refactor ' +
  'supabase postgres vercel expo mobile layout flex grid padding margin border shadow hover focus'
).split(' ');

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateWords(mode, minWordCount = WORDS_PER_BATCH) {
  let words = [];
  while (words.length < minWordCount) {
    words =
      mode === 'dev'
        ? words.concat(shuffleArray(DEV_WORDS))
        : words.concat(shuffleArray(TEXT_BANK).join(' ').split(' '));
  }
  return words;
}

function countCorrect(typed, target) {
  let correct = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) correct++;
  return correct;
}

function computeStats(typed, target, elapsedSeconds) {
  const correct = countCorrect(typed, target);
  const incorrect = typed.length - correct;
  const minutes = Math.max(elapsedSeconds, 1) / 60;
  return {
    correct,
    incorrect,
    wpm: Math.round(correct / 5 / minutes),
    raw: Math.round(typed.length / 5 / minutes),
    accuracy: typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100,
    typedLength: typed.length,
  };
}

// 100 = perfectly even pace; drops as per-second speed swings around
function consistencyOf(samples) {
  const vals = samples.filter((v) => v > 0);
  if (vals.length < 2) return 100;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
  return Math.max(0, Math.round(100 - (sd / mean) * 100));
}

function readPBs() {
  try {
    return JSON.parse(localStorage.getItem(PB_KEY) || '{}') || {};
  } catch {
    return {};
  }
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

  const accent = darkMode ? '#DDBCEB' : '#0F499A';

  return (
    <button
      onClick={onClick}
      aria-label="Open typing speed test"
      title="Typing Speed Test"
      className={`cursor-target inline-flex items-center gap-2 opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 transition-all duration-300 ${className}`}
      style={{ color: accent }}
    >
      <Keyboard size={18} />
      <span className="text-[0.625rem] font-black uppercase tracking-widest whitespace-nowrap">Typing Test</span>
    </button>
  );
};

// ============================================================================
// STYLES — scoped through the overlay id (very high specificity) plus
// !important, so the site's global `.light/.dark span { color }` rules
// can't recolor the letters.
// ============================================================================

const TypingStyles = ({ darkMode }) => (
  <style>{`
    #claude-typing-test-overlay :is(h2,h3,p,span,div).tt-ink { color: var(--ink) !important; }
    #claude-typing-test-overlay :is(h2,h3,p,span,div).tt-acc { color: var(--acc) !important; }
    #claude-typing-test-overlay :is(h2,h3,p,span,div).tt-on { color: var(--acc-ink) !important; }
    #claude-typing-test-overlay :is(p,span).tt-red { color: #F43F5E !important; }
    #claude-typing-test-overlay .tt-pending { color: ${darkMode ? 'rgba(255,255,255,0.28)' : 'rgba(27,27,42,0.32)'} !important; }
    #claude-typing-test-overlay .tt-correct { color: ${darkMode ? '#F5F5FA' : '#0B0B0C'} !important; }
    #claude-typing-test-overlay .tt-incorrect { color: #F43F5E !important; }
    #claude-typing-test-overlay .tt-incorrect.tt-space { background: rgba(244,63,94,0.28); border-radius: 3px; }
    #claude-typing-test-overlay .tt-word-err { text-decoration: underline wavy rgba(244,63,94,0.75); text-underline-offset: 6px; text-decoration-thickness: 1.5px; }
    .tt-caret { transition: transform 0.09s cubic-bezier(.3,.7,.4,1); }
    @keyframes tt-blink { 0%, 45% { opacity: 1; } 55%, 100% { opacity: 0; } }
    .tt-blink { animation: tt-blink 1s step-end infinite; }
    .tt-lines { transition: transform 0.22s cubic-bezier(.22,1,.36,1); }
    .tt-mono { font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, 'Cascadia Code', Consolas, monospace; }
    @media (prefers-reduced-motion: reduce) { .tt-caret, .tt-lines { transition: none; } }
  `}</style>
);

// ============================================================================
// PASSAGE — one memoized component per word, so a keystroke only re-renders
// the word being typed (and the one just left), not the whole passage.
// ============================================================================

const Word = memo(({ word, start, typedSlice, passed }) => {
  const hasError = passed && typedSlice.slice(0, word.length) !== word;
  return (
    <span className="inline-block">
      <span className={hasError ? 'tt-word-err' : ''}>
      {[...word].map((ch, ci) => {
        const t = typedSlice[ci];
        const cls = t === undefined ? 'tt-pending' : t === ch ? 'tt-correct' : 'tt-incorrect';
        return (
          <span key={ci} data-i={start + ci} className={cls}>
            {ch}
          </span>
        );
      })}
      </span>
      {/* the space after the word is a real target character too */}
      <span
        data-i={start + word.length}
        className={`tt-space ${typedSlice.length > word.length && typedSlice[word.length] !== ' ' ? 'tt-incorrect' : ''}`}
        style={{ display: 'inline-block', width: '0.6em' }}
      >
        {' '}
      </span>
    </span>
  );
});
Word.displayName = 'Word';

// WPM over time: area for net WPM, dashed line for raw, red marks for errors
const WpmChart = ({ data, darkMode }) => {
  const width = 720;
  const height = 200;
  const padL = 34;
  const padR = 12;
  const padT = 14;
  const padB = 26;
  if (!data.length) return null;

  const maxV = Math.max(...data.map((d) => Math.max(d.wpm, d.raw)), 20);
  const top = Math.ceil(maxV / 20) * 20;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const X = (i) => padL + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
  const Y = (v) => padT + plotH - (v / top) * plotH;

  const line = (key) => data.map((d, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(d[key]).toFixed(1)}`).join(' ');
  const area = `${line('wpm')} L${X(data.length - 1)},${padT + plotH} L${X(0)},${padT + plotH} Z`;
  const grid = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(27,27,42,0.08)';
  const label = darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(27,27,42,0.45)';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Words per minute over time">
      <defs>
        <linearGradient id="tt-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--acc)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--acc)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={padL} x2={width - padR} y1={Y(top * t)} y2={Y(top * t)} stroke={grid} />
          <text x={padL - 8} y={Y(top * t) + 4} fontSize="10" textAnchor="end" fill={label}>
            {Math.round(top * t)}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#tt-area)" />
      <path d={line('raw')} fill="none" stroke={label} strokeWidth="1.5" strokeDasharray="4 4" />
      <path d={line('wpm')} fill="none" stroke="var(--acc)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) =>
        d.errors > 0 ? (
          <g key={i} stroke="#F43F5E" strokeWidth="2" strokeLinecap="round">
            <line x1={X(i) - 3.5} y1={padT + 2} x2={X(i) + 3.5} y2={padT + 9} />
            <line x1={X(i) + 3.5} y1={padT + 2} x2={X(i) - 3.5} y2={padT + 9} />
          </g>
        ) : null
      )}
      {data.map((d, i) => (
        <circle key={`p${i}`} cx={X(i)} cy={Y(d.wpm)} r="2.5" fill="var(--acc)" />
      ))}
      {data.map((d, i) =>
        data.length <= 15 || i % Math.ceil(data.length / 12) === 0 || i === data.length - 1 ? (
          <text key={`t${i}`} x={X(i)} y={height - 8} fontSize="10" textAnchor="middle" fill={label}>
            {d.time}s
          </text>
        ) : null
      )}
    </svg>
  );
};

const AccuracyRing = ({ accuracy, darkMode, size = 128 }) => {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--acc)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (accuracy / 100) * c }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="47%" dominantBaseline="middle" textAnchor="middle" fontSize="26" fontWeight="900" fill="var(--acc)">
        {accuracy}%
      </text>
      <text x="50%" y="66%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fontWeight="800" letterSpacing="2" fill={darkMode ? 'rgba(255,255,255,0.45)' : 'rgba(27,27,42,0.5)'}>
        ACCURACY
      </text>
    </svg>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TypingTest = forwardRef(({ darkMode, soundEnabled = true, onKeyPress }, ref) => {
  const p = getPalette(darkMode);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('quotes');
  const [duration, setDuration] = useState(30);
  const [status, setStatus] = useState('idle'); // idle | running | finished
  const [timeLeft, setTimeLeft] = useState(30);
  const [words, setWords] = useState(() => generateWords('quotes'));
  const [typed, setTyped] = useState('');
  const [history, setHistory] = useState([]);
  const [live, setLive] = useState({ wpm: 0, accuracy: 100 });
  const [finalStats, setFinalStats] = useState(null);
  const [focused, setFocused] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [typing, setTyping] = useState(false); // caret stops blinking while keys are flowing
  const [caret, setCaret] = useState({ x: 0, y: 0, h: 0 });
  const [lineShift, setLineShift] = useState(0);
  const [pbs, setPbs] = useState(readPBs);
  const [newPb, setNewPb] = useState(false);

  const inputRef = useRef(null);
  const linesRef = useRef(null);
  const typedRef = useRef('');
  const targetRef = useRef('');
  const intervalRef = useRef(null);
  const startRef = useRef(0);
  const secondRef = useRef(0);
  const lastSecondRef = useRef({ typed: 0, errors: 0 });
  const errorsRef = useRef(0);
  const typingTimerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  useEffect(() => {
    targetRef.current = words.join(' ');
  }, [words]);

  const focusInput = () => inputRef.current?.focus();

  const resetTest = useCallback(
    (opts = {}) => {
      clearInterval(intervalRef.current);
      const d = opts.duration ?? duration;
      const m = opts.mode ?? mode;
      const fresh = generateWords(m);
      setWords(fresh);
      targetRef.current = fresh.join(' ');
      setMode(m);
      setDuration(d);
      setTimeLeft(d);
      setTyped('');
      typedRef.current = '';
      setHistory([]);
      setLive({ wpm: 0, accuracy: 100 });
      setFinalStats(null);
      setNewPb(false);
      setLineShift(0);
      setStatus('idle');
      errorsRef.current = 0;
      secondRef.current = 0;
      lastSecondRef.current = { typed: 0, errors: 0 };
      setTimeout(focusInput, 30);
    },
    [duration, mode]
  );

  const resetRef = useRef(resetTest);
  useEffect(() => {
    resetRef.current = resetTest;
  }, [resetTest]);

  // Lock scroll; Esc closes, Tab restarts, any key refocuses the passage
  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setPbs(readPBs());
    const t = setTimeout(focusInput, 250);
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
      else if (e.key === 'Tab') {
        e.preventDefault();
        resetRef.current();
      } else if (document.activeElement !== inputRef.current && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        focusInput();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  useEffect(
    () => () => {
      clearInterval(intervalRef.current);
      clearTimeout(typingTimerRef.current);
    },
    []
  );

  const finishTest = useCallback(
    (samples) => {
      clearInterval(intervalRef.current);
      const stats = computeStats(typedRef.current, targetRef.current, duration);
      stats.consistency = consistencyOf(samples.map((s) => s.raw));
      setFinalStats(stats);
      setStatus('finished');
      const key = `${mode}-${duration}`;
      const prev = readPBs();
      if (stats.wpm > 0 && stats.wpm > (prev[key] || 0)) {
        const next = { ...prev, [key]: stats.wpm };
        try {
          localStorage.setItem(PB_KEY, JSON.stringify(next));
        } catch {
          /* storage may be unavailable */
        }
        setPbs(next);
        setNewPb(true);
      }
    },
    [duration, mode]
  );

  const startTest = useCallback(() => {
    setStatus('running');
    startRef.current = performance.now();
    secondRef.current = 0;
    const samples = [];
    intervalRef.current = setInterval(() => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      setTimeLeft(Math.max(0, Math.ceil(duration - elapsed)));
      const whole = Math.floor(elapsed);
      if (whole > secondRef.current) {
        secondRef.current = whole;
        const stats = computeStats(typedRef.current, targetRef.current, whole);
        // raw speed of just this second, for the consistency score
        const typedThisSecond = typedRef.current.length - lastSecondRef.current.typed;
        const sample = {
          time: whole,
          wpm: stats.wpm,
          raw: Math.round((Math.max(typedThisSecond, 0) / 5) * 60),
          errors: errorsRef.current - lastSecondRef.current.errors,
        };
        lastSecondRef.current = { typed: typedRef.current.length, errors: errorsRef.current };
        samples.push(sample);
        setHistory([...samples]);
        setLive({ wpm: stats.wpm, accuracy: stats.accuracy });
      }
      if (elapsed >= duration) finishTest(samples);
    }, 100);
  }, [duration, finishTest]);

  const handleChange = (e) => {
    if (status === 'finished') return;
    const val = e.target.value;

    if (status === 'idle' && val.length > 0) startTest();

    if (val.length > typedRef.current.length) {
      const i = val.length - 1;
      const ok = val[i] === targetRef.current[i];
      if (!ok) errorsRef.current += 1;
      if (soundEnabled && typeof onKeyPress === 'function') onKeyPress(ok ? 'key' : 'error');
    }

    typedRef.current = val;
    setTyped(val);
    setTyping(true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => setTyping(false), 550);

    // keep the passage effectively endless while the clock runs
    if (targetRef.current.length - val.length < 80) {
      setWords((prev) => {
        const extended = [...prev, ...generateWords(mode, 80)];
        targetRef.current = extended.join(' ');
        return extended;
      });
    }
  };

  // place the caret on the next character and scroll a line at a time
  useLayoutEffect(() => {
    if (!isOpen || status === 'finished') return;
    const box = linesRef.current;
    if (!box) return;
    const el = box.querySelector(`[data-i="${typed.length}"]`);
    if (!el) return;
    const lineH = parseFloat(getComputedStyle(box).lineHeight) || 44;
    const line = Math.floor((el.offsetTop + el.offsetHeight / 2) / lineH);
    // keep the active line in the middle row once we're past the first line
    setLineShift(Math.max(0, line - 1) * lineH);
    setCaret({ x: el.offsetLeft, y: line * lineH, h: lineH });
  }, [typed, words, isOpen, status]);

  const closeTest = () => setIsOpen(false);

  const pbKey = `${mode}-${duration}`;
  const pb = pbs[pbKey] || 0;

  // build the per-word render list with each word's start index in the text
  let cursor = 0;
  const currentWord = typed.split(' ').length - 1;

  const pill = (on) =>
    `cursor-target inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.6875rem] font-black uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
      on ? '' : 'hover:bg-[color:var(--acc-soft)]'
    }`;
  const pillStyle = (on) => ({
    background: on ? 'var(--acc)' : 'transparent',
    color: on ? 'var(--acc-ink)' : 'var(--ink)',
    opacity: on ? 1 : 0.6,
  });
  const statLabel = 'tt-ink text-[0.625rem] font-black uppercase tracking-[0.3em] opacity-50';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="claude-typing-test-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[1000] flex flex-col font-sans"
          style={{ ...cssVars(p), background: darkMode ? '#11111E' : '#FFFDF6', color: p.ink }}
        >
          <TypingStyles darkMode={darkMode} />

          {/* Top bar */}
          <div className="relative flex items-center justify-center px-6 shrink-0" style={{ height: 64 }}>
            <span className="tt-ink inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.5em] opacity-60">
              <Keyboard size={16} /> Typing Test
            </span>
            <button
              onClick={closeTest}
              aria-label="Close typing test"
              className="cursor-target absolute right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[color:var(--line)] flex items-center justify-center transition-transform hover:rotate-90"
              style={{ color: 'var(--ink)' }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative flex-1 overflow-y-auto px-6 custom-scrollbar">
            <div className="mx-auto w-full max-w-[56rem] min-h-full flex flex-col justify-center items-center gap-8 py-8">
              {status !== 'finished' ? (
                <>
                  {/* settings bar: word set + duration */}
                  <div
                    className="flex flex-wrap items-center justify-center gap-1 p-1.5 rounded-full border border-[color:var(--line)] transition-opacity"
                    style={{ background: 'var(--surface-strong)', opacity: status === 'running' ? 0.35 : 1 }}
                  >
                    {MODES.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        disabled={status === 'running'}
                        onClick={() => resetTest({ mode: id })}
                        className={pill(mode === id)}
                        style={pillStyle(mode === id)}
                      >
                        <Icon size={13} /> {label}
                      </button>
                    ))}
                    <span className="w-px h-5 mx-1.5 bg-[color:var(--line)]" />
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        disabled={status === 'running'}
                        onClick={() => resetTest({ duration: d })}
                        className={pill(duration === d)}
                        style={pillStyle(duration === d)}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>

                  {/* live counters */}
                  <div className="w-full flex items-end justify-between gap-6">
                    <div>
                      <p className={statLabel}>Time</p>
                      <p className="tt-acc text-6xl font-black tabular-nums leading-none mt-1">{timeLeft}</p>
                    </div>
                    <div className="flex items-end gap-10">
                      <div className="text-right">
                        <p className={statLabel}>WPM</p>
                        <p className="tt-ink text-4xl font-black tabular-nums leading-none mt-1">{live.wpm}</p>
                      </div>
                      <div className="text-right">
                        <p className={statLabel}>Accuracy</p>
                        <p className="tt-ink text-4xl font-black tabular-nums leading-none mt-1">{live.accuracy}%</p>
                      </div>
                      <div className="text-right">
                        <p className={statLabel}>Best</p>
                        <p className="tt-ink text-4xl font-black tabular-nums leading-none mt-1 opacity-60">{pb || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* passage */}
                  <div className="relative w-full">
                    {/* time progress */}
                    <div className="h-1 w-full rounded-full overflow-hidden mb-6" style={{ background: 'var(--acc-soft)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(timeLeft / duration) * 100}%`,
                          background: 'var(--acc)',
                          transition: status === 'running' ? 'width 1s linear' : 'width 0.3s ease',
                        }}
                      />
                    </div>

                    <div
                      className="relative overflow-hidden cursor-text"
                      style={{ height: '8.4rem' }}
                      onClick={focusInput}
                    >
                      <div
                        ref={linesRef}
                        className="tt-lines tt-mono relative select-none text-[1.75rem] leading-[2.8rem] tracking-wide"
                        style={{ transform: `translate3d(0, ${-lineShift}px, 0)`, filter: focused ? 'none' : 'blur(5px)' }}
                      >
                        {words.map((word, wi) => {
                          const start = cursor;
                          cursor += word.length + 1;
                          return (
                            <Word
                              key={wi}
                              word={word}
                              start={start}
                              typedSlice={typed.length > start ? typed.slice(start, start + word.length + 1) : ''}
                              passed={wi < currentWord}
                            />
                          );
                        })}

                        {/* the caret */}
                        <span
                          aria-hidden="true"
                          className={`tt-caret absolute left-0 top-0 w-[3px] rounded-full ${typing ? '' : 'tt-blink'}`}
                          style={{
                            height: caret.h * 0.72,
                            transform: `translate3d(${caret.x - 1}px, ${caret.y + caret.h * 0.14}px, 0)`,
                            background: 'var(--acc)',
                            boxShadow: '0 0 10px var(--acc-glow)',
                          }}
                        />
                      </div>

                      {!focused && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="tt-ink inline-flex items-center gap-2 text-sm font-bold opacity-80">
                            <MousePointerClick size={16} /> Click here or press any key to focus
                          </span>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {capsLock && focused && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="absolute left-1/2 -translate-x-1/2 -top-12 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg bg-amber-400"
                        >
                          <ArrowBigUpDash size={15} className="text-[#0B0B0C]" />
                          <span className="tt-on" style={{ color: '#0B0B0C' }}>Caps Lock is on</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <input
                    ref={inputRef}
                    type="text"
                    value={typed}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={(e) => setCapsLock(e.getModifierState?.('CapsLock') ?? false)}
                    onKeyUp={(e) => setCapsLock(e.getModifierState?.('CapsLock') ?? false)}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className="absolute opacity-0 w-0 h-0"
                    aria-label="Type the passage"
                  />

                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => resetTest()}
                      aria-label="Restart test"
                      className="cursor-target w-11 h-11 rounded-full border border-[color:var(--line)] flex items-center justify-center transition-transform hover:-rotate-180 duration-500"
                      style={{ color: 'var(--ink)' }}
                    >
                      <RotateCcw size={17} />
                    </button>
                    <span className="tt-ink inline-flex items-center gap-2 text-xs font-medium opacity-55">
                      <kbd className="px-2 py-0.5 rounded-md border border-[color:var(--line)] font-bold">tab</kbd> restart
                      <kbd className="ml-3 px-2 py-0.5 rounded-md border border-[color:var(--line)] font-bold">esc</kbd> close
                    </span>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex flex-col items-center gap-8"
                >
                  {newPb && (
                    <motion.span
                      initial={{ scale: 0.5, rotate: -8 }}
                      animate={{ scale: 1, rotate: -3 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.3 }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 shadow-lg"
                    >
                      <Crown size={14} className="text-[#0B0B0C]" />
                      <span className="tt-on text-xs font-black uppercase tracking-widest" style={{ color: '#0B0B0C' }}>
                        New personal best!
                      </span>
                    </motion.span>
                  )}

                  <div className="w-full flex items-center justify-center gap-14">
                    <div className="text-right">
                      <p className={statLabel}>WPM</p>
                      <p className="tt-acc text-8xl font-black tabular-nums leading-none mt-1">{finalStats.wpm}</p>
                    </div>
                    <AccuracyRing accuracy={finalStats.accuracy} darkMode={darkMode} />
                    <div>
                      <p className={statLabel}>Test</p>
                      <p className="tt-ink text-2xl font-black mt-1">{duration}s</p>
                      <p className="tt-ink text-sm font-bold opacity-60">{MODES.find((m) => m.id === mode).label}</p>
                    </div>
                  </div>

                  <div className="w-full grid grid-cols-4 gap-3">
                    {[
                      { label: 'Raw', value: finalStats.raw },
                      { label: 'Consistency', value: `${finalStats.consistency}%` },
                      { label: 'Characters', value: (
                        <>
                          <span className="tt-acc">{finalStats.correct}</span>
                          <span className="tt-ink opacity-40"> / </span>
                          <span className="tt-red">{finalStats.incorrect}</span>
                        </>
                      ) },
                      { label: 'Personal best', value: pb || finalStats.wpm },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl border border-[color:var(--line)] p-4 text-center" style={{ background: 'var(--surface-strong)' }}>
                        <p className={statLabel}>{s.label}</p>
                        <p className="tt-ink text-2xl font-black tabular-nums mt-1">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="w-full rounded-2xl border border-[color:var(--line)] p-4" style={{ background: 'var(--surface-strong)' }}>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className={statLabel}>WPM over time</p>
                      <p className="tt-ink text-[0.625rem] font-bold opacity-50">
                        <span className="tt-acc">━</span> wpm · <span className="tt-ink">┅</span> raw · <span className="tt-red">✕</span> errors
                      </p>
                    </div>
                    <WpmChart data={history} darkMode={darkMode} />
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => resetTest()}
                      className="cursor-target inline-flex items-center gap-3 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
                      style={{ backgroundColor: 'var(--acc)', color: 'var(--acc-ink)' }}
                    >
                      <RotateCcw size={16} /> Try again
                    </button>
                    <span className="tt-ink text-xs font-medium opacity-50">
                      or press <kbd className="px-2 py-0.5 rounded-md border border-[color:var(--line)] font-bold">tab</kbd>
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

TypingTest.displayName = 'TypingTest';

export default TypingTest;
