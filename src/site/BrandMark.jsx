import React from 'react';

// ============================================================================
// BRANDMARK — the BP monogram. Heavy italic B and P with chamfered corners,
// led by four speed stripes. Colours come from CSS: --bm-ink (letters,
// stripes) and --bm-acc (top stripe), so it follows light / dark mode.
// `stripes={false}` gives the letters alone for square spaces (favicons).
// ============================================================================

const B = 'M39 10 H57 L62 15 V25 L59.5 28 L62 31 V45 L57 50 H39 Z M45.5 15.5 H55 L56.5 17 V23.5 L55 25 H45.5 Z M45.5 31 H55 L56.5 32.5 V43 L55 44.5 H45.5 Z';
const P = 'M65 10 H83 L88 15 V27 L83 32 H71.5 V50 H65 Z M71.5 15.5 H81 L82.5 17 V25 L81 26.5 H71.5 Z';
const STRIPES = ['M18 18 H36 V22 H18 Z', 'M8 26 H36 V30.5 H8 Z', 'M14 34.5 H36 V39 H14 Z', 'M24 43 H36 V47 H24 Z'];

export default function BrandMark({ height = 36, stripes = true, className = '', title = 'BP' }) {
  const vb = stripes ? '2 6 92 48' : '32 6 62 48';
  const [, , w, h] = vb.split(' ').map(Number);
  return (
    <svg className={`bmark ${className}`} height={height} width={(height * w) / h} viewBox={vb} role="img" aria-label={title}>
      <g transform="translate(50 30) skewX(-18) translate(-50 -30)" fillRule="evenodd">
        {stripes &&
          STRIPES.map((d, i) => <path key={d} d={d} className={i === 0 ? 'bmark-acc bmark-stripe' : 'bmark-ink bmark-stripe'} style={{ '--i': i }} />)}
        <path className="bmark-ink" d={B} />
        <path className="bmark-ink" d={P} />
      </g>
    </svg>
  );
}
