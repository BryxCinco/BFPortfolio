import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, MessageSquare } from 'lucide-react';

// ============================================================================
// HEROINFERENCE.JSX — the Home hero's "live inference" card. It types a
// visitor-style question, then streams the answer token by token the way an
// LLM does, each fresh token surfacing out of a blur. Clicking the question
// (or "Ask your own") opens the real chat assistant with it. Pauses while
// hovered or off-screen; reduced motion shows the finished answer.
// ============================================================================

const SCRIPT = [
  {
    chip: 'Shipped',
    q: 'What has Brian shipped?',
    a: 'Four live apps: TIDE, an AI productivity coach; Snapzy, an AI screenshot sorter; Poopipoo, a community toilet map; and Neo Chess XD, a retro chess game.',
  },
  {
    chip: 'Stack',
    q: "What's his tech stack?",
    a: 'React, Next.js and Node on the web, Expo on mobile, Supabase and PostgreSQL for data, with LLMs wired in where they actually help.',
  },
  {
    chip: 'Hiring',
    q: 'Is he open to work?',
    a: 'Yes. Open to full-time roles, internships and collabs. Based in Manila and usually replies within 24 hours.',
  },
];

// word-sized tokens with their leading space and trailing punctuation, like a tokenizer
const tokenize = (s) => s.match(/\s*[^\s,.;:]+[,.;:]?/g) ?? [s];

const TYPE_MS = 36;
const THINK_MS = 520;
const TOKEN_MS = 52;
const HOLD_MS = 3600;

const InferenceStyles = () => (
  <style>{`
    @property --hi-a { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
    @keyframes hi-spin { to { --hi-a: 360deg; } }
    .hi-ring {
      position: absolute; inset: 0; border-radius: inherit; padding: 1.5px; pointer-events: none;
      background: conic-gradient(from var(--hi-a), transparent 0deg, var(--acc) 70deg, var(--acc2) 140deg, transparent 210deg);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor; mask-composite: exclude;
      opacity: 0.3; transition: opacity 0.5s ease;
      animation: hi-spin 3.2s linear infinite;
    }
    .hi-ring[data-live='true'] { opacity: 1; }

    @keyframes hi-in {
      0% { opacity: 0; filter: blur(6px); background-color: var(--acc-soft); }
      45% { opacity: 1; filter: blur(0); }
      100% { background-color: transparent; }
    }
    .hi-card span.hi-tok { color: var(--ink) !important; border-radius: 4px; animation: hi-in 0.9s ease-out both; }
    .hi-card span.hi-tok.hi-still { animation: none; }

    @keyframes hi-blink { 0%, 45% { opacity: 1; } 55%, 100% { opacity: 0; } }
    .hi-caret { animation: hi-blink 1s step-end infinite; }

    @keyframes hi-bar { 0%, 100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
    .hi-bars i { display: block; width: 3px; height: 12px; border-radius: 2px; background: var(--acc); transform-origin: 50% 100%; transform: scaleY(0.35); }
    .hi-bars[data-live='true'] i { animation: hi-bar 0.9s ease-in-out infinite; }

    @keyframes hi-dot { 0%, 80%, 100% { opacity: 0.25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
    .hi-think i { display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: var(--acc); animation: hi-dot 1.1s ease-in-out infinite; }

    @media (prefers-reduced-motion: reduce) {
      .hi-ring, .hi-bars i, .hi-caret, .hi-think i { animation: none !important; }
      .hi-card span.hi-tok { animation: none !important; }
    }
  `}</style>
);

const HeroInference = ({ darkMode, reduced, onAsk, className = '' }) => {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(reduced ? 'done' : 'typing');
  const [chars, setChars] = useState(reduced ? Infinity : 0);
  const [shown, setShown] = useState(reduced ? Infinity : 0);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef(null);

  const item = SCRIPT[idx];
  const tokens = useMemo(() => tokenize(item.a), [item]);
  const running = !reduced && !hovered && visible;

  // only run while the card is on screen
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show = (i) => {
    setIdx(i);
    setChars(reduced ? Infinity : 0);
    setShown(reduced ? Infinity : 0);
    setPhase(reduced ? 'done' : 'typing');
  };

  useEffect(() => {
    if (!running) return undefined;
    let t;
    if (phase === 'typing') {
      t = chars < item.q.length ? setTimeout(() => setChars((c) => c + 1), TYPE_MS) : setTimeout(() => setPhase('thinking'), 200);
    } else if (phase === 'thinking') {
      t = setTimeout(() => setPhase('streaming'), THINK_MS);
    } else if (phase === 'streaming') {
      // a small hitch now and then, so it reads like real generation
      t = shown < tokens.length
        ? setTimeout(() => setShown((s) => s + 1), TOKEN_MS + (shown % 6 === 5 ? 70 : 0))
        : setTimeout(() => setPhase('done'), 0);
    } else {
      t = setTimeout(() => show((idx + 1) % SCRIPT.length), HOLD_MS);
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, chars, shown, idx, tokens.length]);

  const live = phase === 'thinking' || phase === 'streaming';
  const status = phase === 'typing' ? 'listening' : phase === 'thinking' ? 'thinking' : phase === 'streaming' ? 'streaming' : 'done';
  const ink = (a) => (darkMode ? `rgba(255,255,255,${a})` : `rgba(27,27,42,${a})`);

  return (
    <div
      ref={rootRef}
      className={`hi-card relative rounded-[1.5rem] ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ boxShadow: `0 30px 70px -30px ${darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(27,27,42,0.35)'}, 0 0 0 1px ${ink(0.08)}` }}
    >
      <InferenceStyles />
      <div className="hi-ring" data-live={live} aria-hidden="true" />
      <div
        className="relative rounded-[1.5rem] p-5 sm:p-6 backdrop-blur-xl text-left"
        style={{ background: darkMode ? 'rgba(18,18,30,0.92)' : 'rgba(255,255,255,0.94)' }}
      >
        {/* header */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full shrink-0"
            style={{ background: 'radial-gradient(circle at 30% 30%, #fff 0%, var(--acc-hi) 30%, var(--acc) 60%, var(--acc2) 100%)' }}
            aria-hidden="true"
          />
          <div className="min-w-0 leading-tight">
            <div className="text-sm font-extrabold" style={{ color: 'var(--ink)' }}>brian.ai</div>
            <div className="text-[0.6875rem] font-semibold" style={{ color: ink(0.5) }}>Ask about my work</div>
          </div>
          <div className="ml-auto flex items-center gap-2" aria-live="off">
            <div className="hi-bars flex items-end gap-[3px] h-3" data-live={live} aria-hidden="true">
              {[0, 1, 2, 3].map((i) => <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}
            </div>
            <div className="text-[0.6875rem] font-bold tabular-nums" style={{ color: live ? 'var(--acc)' : ink(0.45) }}>{status}</div>
          </div>
        </div>

        {/* the question — click to ask the real assistant */}
        <button
          type="button"
          onClick={() => onAsk?.(item.q)}
          className="cursor-target group mt-4 w-full flex items-center gap-2.5 rounded-xl px-3.5 py-3 border transition-colors"
          style={{ borderColor: ink(0.1), background: ink(0.035) }}
          aria-label={`Ask: ${item.q}`}
        >
          <div className="font-black" style={{ color: 'var(--acc)' }} aria-hidden="true">›</div>
          <div className="flex-1 min-w-0 text-left text-sm sm:text-[0.9375rem] font-semibold truncate" style={{ color: 'var(--ink)' }}>
            {item.q.slice(0, chars)}
            {phase === 'typing' && <i className="hi-caret inline-block w-[2px] h-[1em] -mb-[0.15em] ml-0.5" style={{ background: 'var(--acc)' }} />}
          </div>
          <CornerDownLeft size={15} className="shrink-0 opacity-40 transition-opacity group-hover:opacity-100" style={{ color: 'var(--ink)' }} />
        </button>

        {/* the answer; every script is laid out invisibly underneath so the card never jumps */}
        <div className="mt-4 grid text-sm sm:text-[0.9375rem] leading-relaxed font-medium" aria-live="polite">
          {SCRIPT.map((s) => (
            <div key={s.chip} className="invisible [grid-area:1/1]" aria-hidden="true">{s.a}</div>
          ))}
          <div className="[grid-area:1/1]">
            {phase === 'thinking' && (
              <div className="hi-think flex items-center gap-1.5 h-6" aria-label="Thinking">
                <i /><i style={{ animationDelay: '0.15s' }} /><i style={{ animationDelay: '0.3s' }} />
              </div>
            )}
            {(phase === 'streaming' || phase === 'done') &&
              tokens.slice(0, shown).map((tok, i) => (
                <span key={`${idx}-${i}`} className={`hi-tok${reduced ? ' hi-still' : ''}`}>{tok}</span>
              ))}
            {phase === 'streaming' && <i className="hi-caret inline-block w-[0.5em] h-[1em] -mb-[0.15em] ml-1 rounded-[2px]" style={{ background: 'var(--acc)' }} />}
          </div>
        </div>

        {/* footer: pick a question, or open the full assistant */}
        <div className="mt-5 pt-4 border-t flex items-center gap-2 flex-wrap" style={{ borderColor: ink(0.08) }}>
          {SCRIPT.map((s, i) => (
            <button
              key={s.chip}
              type="button"
              onClick={() => show(i)}
              aria-pressed={i === idx}
              className="cursor-target px-3 py-1.5 rounded-full text-[0.6875rem] font-bold border transition-colors"
              style={
                i === idx
                  ? { background: 'var(--acc-soft)', borderColor: 'var(--acc-line)', color: 'var(--acc)' }
                  : { borderColor: ink(0.12), color: ink(0.6) }
              }
            >
              {s.chip}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onAsk?.()}
            className="cursor-target ml-auto inline-flex items-center gap-1.5 text-[0.75rem] font-extrabold hover:underline underline-offset-4"
            style={{ color: 'var(--acc)' }}
          >
            <MessageSquare size={14} /> Ask your own
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroInference;
