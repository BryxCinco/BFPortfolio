import React, { useEffect, useRef, useState } from 'react';

// ============================================================================
// INTROSPLASH.JSX — the "hello in many languages" opener, shot like a film
// title: letterbox bars, a soft drifting glow and grain, each greeting
// focusing in from a blur with its language underneath, then a gradient
// "Kamusta." and the screen splits open onto the site. It matches the
// device's light or dark display. The full cut runs about 3.3s on a first
// visit; returning visitors get a short cut (about 1.6s). A click, tap or any
// key skips straight to the reveal. It waits briefly for the web font so no
// fallback face flashes, and tells App when the split starts so the page
// mounts right then and its own entrance animations play in view.
// ============================================================================

const GREETINGS = [
  ['Hello', 'English'],
  ['¡Hola!', 'Español'],
  ['Bonjour', 'Français'],
  ['Ciao', 'Italiano'],
  ['Hallo', 'Deutsch'],
  ['こんにちは', '日本語'],
  ['안녕하세요', '한국어'],
  ['你好', '中文'],
  ['नमस्ते', 'हिन्दी'],
  ['مرحبا', 'العربية'],
  ['Olá', 'Português'],
  ['Привет', 'Русский'],
];

// returning visitors see a few of them, faster
const SHORT = ['Hello', '¡Hola!', 'Bonjour', 'こんにちは', 'Ciao'];

const START_MS = 180; // letterbox settles first
const HELLO_MS = 1500; // the first word, "Hello", holds this long before the other languages run
const EXIT_MS = 600; // the split-open reveal
const FONT_WAIT_MS = 300; // longest we wait for Montserrat before starting
const TIMING = {
  // Hello holds 1.5s, then the other greetings run fast; site is on screen ~2.8s after load (any click or key skips)
  full: { word: 65, hold: 420 },
  short: { word: 70, hold: 300 },
};

// the intro follows the device's display mode, like the rest of the site
const THEMES = {
  dark: {
    bg: '#05070C',
    bar: '#000000',
    ink: '255,255,255',
    glowA: 'rgba(15,73,154,0.22)',
    glowB: 'rgba(141,111,160,0.14)',
    vignette: 'rgba(0,0,0,0.6)',
    grain: { opacity: 0.05 },
    grad: 'is-grad',
    rule: 'rgba(255,255,255,0.6)',
    wordGlow: '0 0 40px rgba(255,255,255,0.18)',
  },
  light: {
    bg: '#EEEFF3',
    bar: '#E2E4EB',
    ink: '11,11,12',
    glowA: 'rgba(118,164,194,0.22)',
    glowB: 'rgba(141,111,160,0.13)',
    vignette: 'rgba(14,53,108,0.12)',
    grain: { opacity: 0.04 },
    grad: 'is-grad-light',
    rule: 'rgba(11,11,12,0.35)',
    wordGlow: '0 10px 40px rgba(141,111,160,0.12)',
  },
};

// static film grain (an SVG noise tile, drawn once — no per-frame cost)
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

const Styles = () => (
  <style>{`
    .is-root { font-family: var(--font-montserrat, 'Montserrat', sans-serif); }
    @keyframes is-bar-top { from { transform: translateY(-100%); } to { transform: none; } }
    @keyframes is-bar-bot { from { transform: translateY(100%); } to { transform: none; } }
    @keyframes is-focus {
      0%   { opacity: 0; filter: blur(4px); transform: translateY(10px) scale(1.03); letter-spacing: 0.06em; }
      100% { opacity: 1; filter: blur(0); transform: none; letter-spacing: -0.02em; }
    }
    @keyframes is-sub { from { opacity: 0; transform: translateY(6px); } to { opacity: 0.55; transform: none; } }
    @keyframes is-final {
      0%   { opacity: 0; filter: blur(14px); transform: scale(0.92); letter-spacing: 0.2em; }
      60%  { opacity: 1; filter: blur(0); }
      100% { opacity: 1; filter: blur(0); transform: scale(1); letter-spacing: -0.03em; }
    }
    @keyframes is-sweep { from { background-position: 120% 0; } to { background-position: -40% 0; } }
    @keyframes is-drift-a { 0%,100% { transform: translate(-12%, -8%) scale(1); } 50% { transform: translate(6%, 4%) scale(1.15); } }
    @keyframes is-drift-b { 0%,100% { transform: translate(10%, 10%) scale(1.1); } 50% { transform: translate(-6%, -2%) scale(0.95); } }
    @keyframes is-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes is-rule { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }

    .is-bar-top { animation: is-bar-top 0.45s cubic-bezier(.22,1,.36,1) both; }
    .is-bar-bot { animation: is-bar-bot 0.45s cubic-bezier(.22,1,.36,1) both; }
    .is-word { animation: is-focus 0.12s cubic-bezier(.22,1,.36,1) both; will-change: transform, opacity; }
    .is-sub { animation: is-sub 0.14s ease-out both; }
    .is-final { animation: is-final 0.6s cubic-bezier(.22,1,.36,1) both; }
    .is-grad {
      background-image: linear-gradient(100deg, #DDBCEB 0%, #DDBCEB 22%, #FFFFFF 40%, #76A4C2 60%, #8D6FA0 78%, #8D6FA0 100%);
      background-size: 100% 100%;
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .is-grad-light {
      background-image: linear-gradient(100deg, #0E356C 0%, #0F499A 22%, #0B0B0C 42%, #8D6FA0 62%, #0F499A 78%, #0E356C 100%);
      background-size: 100% 100%;
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .is-sheen {
      background-image: linear-gradient(100deg, transparent 35%, rgba(255,255,255,0.85) 50%, transparent 65%);
      background-size: 250% 100%;
      -webkit-background-clip: text; background-clip: text; color: transparent;
      animation: is-sweep 0.9s 0.25s ease-in-out both;
    }
    .is-glow-a { animation: is-drift-a 6s ease-in-out infinite; }
    .is-glow-b { animation: is-drift-b 7s ease-in-out infinite; }
    .is-progress { transform-origin: left; }
    .is-rule { animation: is-rule 0.5s 0.2s cubic-bezier(.22,1,.36,1) both; transform-origin: center; }
    .is-half { transition: transform ${EXIT_MS}ms cubic-bezier(0.83,0,0.17,1); }
    .is-stage { transition: opacity 0.32s ease, transform 0.5s cubic-bezier(.22,1,.36,1); }

    @media (prefers-reduced-motion: reduce) {
      .is-word, .is-sub, .is-final, .is-sheen, .is-glow-a, .is-glow-b, .is-bar-top, .is-bar-bot, .is-rule { animation: none !important; }
      .is-half, .is-stage { transition: opacity 0.3s ease !important; }
    }
  `}</style>
);

const IntroSplash = ({ onDone, onLeave, dark = true, short = false }) => {
  const T = THEMES[dark ? 'dark' : 'light'];
  const ink = (a) => `rgba(${T.ink},${a})`;
  const reduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const list = short ? GREETINGS.filter(([w]) => SHORT.includes(w)) : GREETINGS;
  const { word: WORD_MS, hold: HOLD_MS } = TIMING[short ? 'short' : 'full'];
  const [index, setIndex] = useState(reduced ? list.length : -1); // -1 = bars only, length = Kamusta
  const [started, setStarted] = useState(reduced);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef([]);
  const doneRef = useRef(false);

  // when word i appears: Hello first and on its own, then the rest in quick succession
  const at = (i) => START_MS + (i === 0 ? 0 : HELLO_MS + (i - 1) * WORD_MS);
  const total = at(list.length) + HOLD_MS;

  const leave = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    timers.current.forEach(clearTimeout);
    setLeaving(true);
    onLeave?.();
    timers.current = [setTimeout(() => onDone?.(), reduced ? 320 : EXIT_MS)];
  };

  useEffect(() => {
    // the page behind stays still while the intro plays
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    let cancelled = false;
    const run = () => {
      if (cancelled || doneRef.current) return;
      const t = [];
      if (reduced) {
        t.push(setTimeout(leave, 900));
      } else {
        setStarted(true);
        list.forEach((_, i) => t.push(setTimeout(() => setIndex(i), at(i))));
        t.push(setTimeout(() => setIndex(list.length), at(list.length)));
        t.push(setTimeout(leave, total));
      }
      timers.current = t;
    };

    // start once Montserrat is in (or after a short cap), so no fallback face flashes
    const fontsReady = document.fonts?.load
      ? Promise.all([document.fonts.load('900 1em Montserrat'), document.fonts.load('700 1em Montserrat')])
      : Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, FONT_WAIT_MS))]).then(run, run);

    const skip = () => leave();
    window.addEventListener('keydown', skip);
    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      window.removeEventListener('keydown', skip);
      root.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFinal = index >= list.length;
  const [word, lang] = isFinal || index < 0 ? [null, null] : list[index];
  const count = Math.min(index + 1, list.length);

  return (
    <div
      className={`is-root fixed inset-0 z-[9999] select-none ${leaving ? 'pointer-events-none' : 'cursor-pointer'}`}
      onClick={leave}
      role="presentation"
      aria-hidden="true"
    >
      <Styles />

      {/* the two halves that split open on the way out */}
      <div className="is-half absolute inset-x-0 top-0 h-1/2" style={{ background: T.bg, transform: leaving ? 'translateY(-100%)' : 'none' }} />
      <div className="is-half absolute inset-x-0 bottom-0 h-1/2" style={{ background: T.bg, transform: leaving ? 'translateY(100%)' : 'none' }} />

      {/* the stage */}
      <div
        className="is-stage absolute inset-0 overflow-hidden"
        style={{ opacity: leaving ? 0 : 1, transform: leaving ? 'scale(1.06)' : 'none' }}
      >
        {/* soft drifting light */}
        <div
          className="is-glow-a absolute left-1/2 top-1/2 -ml-[35vmax] -mt-[35vmax] w-[70vmax] h-[70vmax] rounded-full"
          style={{ background: `radial-gradient(closest-side, ${T.glowA}, transparent 70%)` }}
        />
        <div
          className="is-glow-b absolute left-1/2 top-1/2 -ml-[30vmax] -mt-[30vmax] w-[60vmax] h-[60vmax] rounded-full"
          style={{ background: `radial-gradient(closest-side, ${T.glowB}, transparent 70%)` }}
        />
        {/* grain + vignette */}
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, opacity: T.grain.opacity }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 45%, ${T.vignette} 100%)` }} />

        {/* letterbox */}
        <div style={{ background: T.bar }} className="is-bar-top absolute inset-x-0 top-0 h-[9vh] flex items-end justify-between px-5 sm:px-10 pb-3">
          <span className="text-[0.625rem] sm:text-xs font-black uppercase tracking-[0.4em]" style={{ color: ink(0.45) }}>Brian Francisco</span>
          <span className="text-[0.625rem] sm:text-xs font-black uppercase tracking-[0.4em]" style={{ color: ink(0.45) }}>Portfolio · {new Date().getFullYear()}</span>
        </div>
        <div style={{ background: T.bar }} className="is-bar-bot absolute inset-x-0 bottom-0 h-[9vh] flex flex-col justify-start px-5 sm:px-10 pt-3 gap-2">
          <div className="h-px w-full overflow-hidden" style={{ background: ink(0.1) }}>
            <div
              className="is-progress h-full"
              style={{
                background: 'linear-gradient(90deg, #DDBCEB, #8D6FA0)',
                animation: reduced || !started ? 'none' : `is-line ${total - START_MS}ms ${START_MS}ms linear both`,
                transform: started ? undefined : 'scaleX(0)',
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.625rem] sm:text-xs font-black tabular-nums tracking-[0.3em]" style={{ color: ink(0.5) }}>
              {String(isFinal ? list.length + 1 : Math.max(count, 0)).padStart(2, '0')} / {list.length + 1}
            </span>
            <span className="text-[0.625rem] sm:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ink(0.35) }}>click to skip</span>
          </div>
        </div>

        {/* the words */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {word && (
            <div key={index} className="flex flex-col items-center">
              <h1
                className="is-word font-black leading-none text-[clamp(3rem,10vw,8rem)]"
                style={{ color: ink(1), textShadow: T.wordGlow }}
              >
                {word}
              </h1>
              <span className="is-sub mt-4 text-[0.6875rem] sm:text-sm font-bold uppercase tracking-[0.5em]" style={{ color: ink(1) }}>
                {lang}
              </span>
            </div>
          )}

          {isFinal && (
            <div className="flex flex-col items-center">
              <h1 className="is-final relative font-black leading-none text-[clamp(3.5rem,12vw,10rem)]">
                <span className={T.grad}>Kamusta.</span>
                <span className="is-sheen absolute inset-0" aria-hidden="true">Kamusta.</span>
              </h1>
              <span className="is-rule mt-6 block h-px w-40 sm:w-64" style={{ background: `linear-gradient(90deg, transparent, ${T.rule}, transparent)` }} />
              <span className="is-sub mt-4 text-[0.6875rem] sm:text-sm font-bold uppercase tracking-[0.5em]" style={{ color: ink(1), animationDelay: '0.25s' }}>
                Filipino · welcome in
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroSplash;
