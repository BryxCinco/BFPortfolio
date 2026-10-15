import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// ============================================================================
// HANDTOUCH.JSX — the shared "made by a human" kit used across pages:
// handwritten notes, doodles that draw themselves in, tape strips, sticky
// notes and stickers. Colors come from the page's --acc / --ink variables
// (see theme.js), so every piece follows light and dark mode.
//
// The `:is(.light,.dark)` prefix out-specifies the global
// `.light/.dark h1..span { color: !important }` overrides in index.css.
// ============================================================================

export const HandStyles = () => (
  <style>{`
    .ht-hand { font-family: 'Caveat', 'Segoe Print', 'Bradley Hand', cursive; font-weight: 700; letter-spacing: 0; line-height: 1.05; }
    :is(.light,.dark) :is(h1,h2,h3,h4,p,span,li,div).ht-acc { color: var(--acc) !important; }
    :is(.light,.dark) :is(h1,h2,h3,h4,p,span,li,div).ht-ink { color: var(--ink) !important; }
    :is(.light,.dark) :is(h1,h2,h3,h4,p,span,li,div).ht-dark,
    :is(.light,.dark) .ht-dark :is(span,p,li,strong,b,em) { color: #1B1B2A !important; }
    @keyframes ht-bob { 0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); } 50% { transform: translateY(-5px) rotate(var(--r, 0deg)); } }
    @media (prefers-reduced-motion: reduce) { .ht-anim { animation: none !important; } }
  `}</style>
);

// a handwritten aside in the page accent
export const HandNote = ({ children, rot = -3, className = '', tone = 'acc', delay = 0.2, as: Tag = 'span' }) => {
  const reduced = useReducedMotion();
  const MotionTag = motion[Tag] ?? motion.span;
  return (
    <MotionTag
      className={`ht-hand ${tone === 'ink' ? 'ht-ink' : tone === 'dark' ? 'ht-dark' : 'ht-acc'} inline-block ${className}`}
      initial={reduced ? false : { opacity: 0, y: 8, rotate: rot }}
      whileInView={{ opacity: 1, y: 0, rotate: rot }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </MotionTag>
  );
};

// a single hand-drawn stroke that draws itself in when scrolled into view
export const Scribble = ({ d, viewBox, className = '', delay = 0, strokeWidth = 4, color = 'var(--acc)' }) => {
  const reduced = useReducedMotion();
  return (
    <svg viewBox={viewBox} className={`pointer-events-none ${className}`} fill="none" aria-hidden="true" preserveAspectRatio="none">
      <motion.path
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay, ease: 'easeInOut' }}
      />
    </svg>
  );
};

const DOODLES = {
  underline: { viewBox: '0 0 300 20', d: 'M4 14 C 60 4, 120 18, 180 9 S 260 6, 296 12' },
  circle: { viewBox: '0 0 200 80', d: 'M30 14 C 80 -2, 180 4, 192 36 C 202 66, 120 80, 60 74 C 10 68, -4 40, 22 22 C 40 10, 70 8, 96 9' },
  arrowDown: { viewBox: '0 0 60 80', d: 'M12 6 C 40 16, 46 40, 30 70 M30 70 L 18 58 M30 70 L 42 60' },
  arrowLeft: { viewBox: '0 0 80 60', d: 'M74 8 C 52 4, 28 14, 12 44 M12 44 L 8 30 M12 44 L 26 38' },
  arrowRight: { viewBox: '0 0 80 60', d: 'M6 8 C 28 4, 52 14, 68 44 M68 44 L 72 30 M68 44 L 54 38' },
  star: { viewBox: '0 0 60 60', d: 'M30 6 L 36 24 L 54 24 L 40 35 L 46 53 L 30 42 L 14 53 L 20 35 L 6 24 L 24 24 Z' },
  sparkle: { viewBox: '0 0 60 60', d: 'M30 4 C 32 22, 38 28, 56 30 C 38 32, 32 38, 30 56 C 28 38, 22 32, 4 30 C 22 28, 28 22, 30 4 Z' },
  squiggle: { viewBox: '0 0 120 24', d: 'M4 12 C 14 2, 24 22, 34 12 S 54 2, 64 12 S 84 22, 94 12 S 110 4, 116 12' },
};

// named doodle shapes built on Scribble
export const Doodle = ({ type, className = '', delay = 0, strokeWidth = 3, color }) => {
  const { viewBox, d } = DOODLES[type];
  return <Scribble viewBox={viewBox} d={d} className={className} delay={delay} strokeWidth={strokeWidth} color={color} />;
};

// translucent masking-tape strip
export const Tape = ({ className = '', rot = 0, width = 96 }) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none absolute h-7 z-10 ${className}`}
    style={{
      width,
      transform: `rotate(${rot}deg)`,
      background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.6) 0 6px, rgba(255,255,255,0.42) 6px 12px)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.14)',
    }}
  />
);

// a small paper sticker label; `drag` turns it into a toy
export const Sticker = ({ children, bg = '#FFE873', rot = -6, className = '', style, drag = false, dragConstraints, delay = 0.4 }) => {
  const reduced = useReducedMotion();
  return (
    <motion.span
      drag={drag && !reduced}
      dragConstraints={dragConstraints}
      dragElastic={0.2}
      dragMomentum={false}
      whileDrag={{ scale: 1.12, rotate: 0, zIndex: 40 }}
      initial={reduced ? false : { opacity: 0, scale: 0.4, rotate: rot * 3 }}
      whileInView={{ opacity: 1, scale: 1, rotate: rot }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 260, damping: 16, delay }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-lg select-none whitespace-nowrap ${
        drag ? 'cursor-grab active:cursor-grabbing touch-none' : ''
      } ${className}`}
      style={{ background: bg, ...style }}
    >
      <span className="ht-dark text-[0.6875rem] sm:text-xs font-black">{children}</span>
    </motion.span>
  );
};

// a taped sticky note with a handwritten body
export const StickyNote = ({ title, children, bg = '#FFE873', rot = -2, className = '' }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20, rotate: rot * 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: rot }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 160, damping: 16 }}
      whileHover={reduced ? undefined : { rotate: 0, y: -4 }}
      className={`relative px-6 pt-7 pb-6 shadow-[0_18px_30px_-12px_rgba(0,0,0,0.4)] ${className}`}
      style={{ background: bg }}
    >
      <Tape className="-top-3 left-1/2 -ml-12" rot={rot > 0 ? -5 : 5} />
      {title && <p className="ht-hand ht-dark text-2xl sm:text-3xl mb-2">{title}</p>}
      <div className="ht-hand ht-dark text-xl sm:text-2xl leading-snug">{children}</div>
    </motion.div>
  );
};
