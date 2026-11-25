import React, { forwardRef, useEffect, useRef, useState } from 'react';

// ============================================================================
// MOTION.JSX — the reveal system. One shared IntersectionObserver flips `.in`
// on anything marked [data-rv]; the CSS in site.css does the rest, so the
// animations stay on transform / opacity / clip-path and cost almost nothing.
// ============================================================================

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Content is visible by default. Only when the browser can actually reveal
// things (IntersectionObserver, motion allowed) does <html> get .rv-on, which
// switches on the hidden "before" states in site.css.
const canReveal = typeof window !== 'undefined' && 'IntersectionObserver' in window && !reducedMotion();
if (canReveal) {
  document.documentElement.classList.add('rv-on');
  // failsafe: anything on screen that still has not revealed itself shortly
  // after load (throttled tab, odd observer timing) is shown anyway
  const sweep = () =>
    document.querySelectorAll('[data-rv]:not(.in)').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
    });
  window.addEventListener('load', () => setTimeout(sweep, 2500));
  window.addEventListener('scroll', () => {
    clearTimeout(sweep.t);
    sweep.t = setTimeout(sweep, 900);
  }, { passive: true });
}

let sharedIO = null;
const watchers = new WeakMap();
const getIO = () => {
  if (sharedIO || typeof IntersectionObserver === 'undefined') return sharedIO;
  sharedIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        watchers.get(e.target)?.();
        sharedIO.unobserve(e.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  return sharedIO;
};

// Tiles already on screen at mount (the hero) start revealing right away
// instead of waiting for the observer's first callback. All mounting tiles are
// batched: one pass reads every position, then one pass writes the classes,
// so the page lays out once rather than once per tile.
const pending = [];
let flushing = false;
const flush = () => {
  flushing = false;
  const batch = pending.splice(0);
  const vh = window.innerHeight;
  const tops = batch.map(([el]) => el.getBoundingClientRect().top);
  batch.forEach(([el, io], i) => {
    if (!el.isConnected) return;
    if (tops[i] < vh) {
      el.classList.add('in');
      watchers.get(el)?.();
    } else io.observe(el);
  });
};
const queueReveal = (el, io) => {
  pending.push([el, io]);
  if (!flushing) {
    flushing = true;
    queueMicrotask(flush);
  }
};

/** Mark a node to reveal on scroll; `onIn` fires once when it does. */
export function useReveal(ref, onIn) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = getIO();
    if (!io) {
      el.classList.add('in');
      onIn?.();
      return undefined;
    }
    if (onIn) watchers.set(el, onIn);
    queueReveal(el, io);
    return () => io.unobserve(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** true once the node has scrolled into view */
export function useSeen(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return seen;
}

const mergeRefs = (...refs) => (node) =>
  refs.forEach((r) => {
    if (typeof r === 'function') r(node);
    else if (r) r.current = node;
  });

/** A bento tile: reveals itself, tracks the pointer for the spotlight, wears corner ticks. */
export const Tile = forwardRef(function Tile(
  { as: Tag = 'div', className = '', tone, ticks = true, delay = 0, rv = 'clip', style, children, ...rest },
  outerRef
) {
  const ref = useRef(null);
  useReveal(ref);
  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <Tag
      ref={mergeRefs(ref, outerRef)}
      data-rv={rv === 'clip' ? '' : rv}
      className={`tile ${tone ? `on-${tone}` : ''} ${ticks ? 'ticks' : ''} ${className}`}
      style={{ '--d': `${delay}s`, ...style }}
      onPointerMove={onPointerMove}
      {...rest}
    >
      {ticks && (
        <>
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <i aria-hidden="true" />
        </>
      )}
      {children}
    </Tag>
  );
});

/** Small wrapper that reveals on its own (for things outside a Tile). */
export const Reveal = ({ as: Tag = 'div', className = '', delay = 0, rv = 'fade', style, children, ...rest }) => {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <Tag ref={ref} data-rv={rv === 'clip' ? '' : rv} className={className} style={{ '--d': `${delay}s`, ...style }} {...rest}>
      {children}
    </Tag>
  );
};

/**
 * Headline typesetting: every character rises out of its own mask.
 * Animates when an ancestor gets `.in`, or on its own with `self`.
 */
export const Chars = ({ text, delay = 0, self = false, className = '' }) => {
  const ref = useRef(null);
  const [selfIn, setSelfIn] = useState(false);
  useEffect(() => {
    if (!self) return undefined;
    const t = setTimeout(() => setSelfIn(true), 30);
    return () => clearTimeout(t);
  }, [self]);
  let i = 0;
  const words = text.split(' ');
  return (
    <span ref={ref} className={`chars ${self && selfIn ? 'in' : ''} ${className}`} style={{ '--d': `${delay}s` }} aria-label={text}>
      {words.map((w, wi) => (
        <React.Fragment key={wi}>
          <span className="w" aria-hidden="true">
            {[...w].map((ch, ci) => (
              <span className="cm" key={ci}>
                <span className="c" style={{ '--i': i++ }}>
                  {ch}
                </span>
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </span>
  );
};

/** Body copy: words come out of a blur, one after another. */
export const Words = ({ text, delay = 0, className = '' }) => (
  <span className={`words ${className}`} style={{ '--d': `${delay}s` }}>
    {text.split(' ').map((w, i, arr) => (
      <React.Fragment key={i}>
        <span className="w" style={{ '--i': i }}>
          {w}
        </span>
        {i < arr.length - 1 ? ' ' : null}
      </React.Fragment>
    ))}
  </span>
);

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>#*+';

/** Monospace labels decode from noise into the real text. */
export const Scramble = ({ text, className = '', delay = 0, as: Tag = 'span', trigger = 'view' }) => {
  const ref = useRef(null);
  const [out, setOut] = useState(text);
  const raf = useRef(0);

  const run = () => {
    if (reducedMotion()) {
      setOut(text);
      return;
    }
    cancelAnimationFrame(raf.current);
    const start = performance.now() + delay * 1000;
    const dur = Math.min(900, 260 + text.length * 28);
    const tick = (now) => {
      const p = Math.max(0, Math.min(1, (now - start) / dur));
      const fixed = Math.floor(p * text.length);
      let s = '';
      for (let k = 0; k < text.length; k++) {
        const ch = text[k];
        s += k < fixed || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(s);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  // re-run whenever the text changes (rotating roles), or once it scrolls into view
  const seen = useSeen(ref);
  useEffect(() => {
    if (trigger === 'view' && !seen) return undefined;
    run();
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, seen, trigger]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </Tag>
  );
};

/** Number that counts up once in view. */
export const Count = ({ to, decimals = 0, duration = 1400, className = '' }) => {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const [v, setV] = useState(canReveal ? 0 : to);
  useEffect(() => {
    if (!seen || reducedMotion()) {
      if (seen) setV(to);
      return undefined;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setV(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);
  return (
    <span ref={ref} className={className}>
      {v.toFixed(decimals)}
    </span>
  );
};

/** Section header: number, big title, short aside. */
export const SectionHead = ({ num, title, serif, aside }) => (
  <Reveal className="sec-head" rv="fade">
    <Scramble className="mono sec-num" text={num} />
    <h2 className="sec-title">
      <Chars text={title} />
      {serif && (
        <>
          {' '}
          <span className="serif">
            <Chars text={serif} delay={0.25} />
          </span>
        </>
      )}
    </h2>
    {aside && (
      <p className="sec-aside body">
        <Words text={aside} delay={0.3} />
      </p>
    )}
  </Reveal>
);
