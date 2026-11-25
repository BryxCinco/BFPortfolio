import React, { useId } from 'react';

// ============================================================================
// BRANDMARK — the BF monogram. Heavy italic letters with chamfered corners and
// a speed cut through both, on a chamfered shield. Colours come from CSS:
// --bm-bg (shield) and --bm-ink (letters), so it follows light / dark mode.
// ============================================================================

export default function BrandMark({ size = 36, badge = true, className = '', title = 'BF' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`bmark ${className}`} width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={title}>
      <defs>
        <mask id={`bm-cut-${id}`}>
          <rect width="64" height="64" fill="#fff" />
          <path className="bmark-cut" d="M0 57.6 L64 21.2 L64 23.2 L0 59.6 Z" fill="#000" />
        </mask>
      </defs>
      {badge && <path className="bmark-bg" d="M9 2 H55 L62 9 V41 L32 62 L2 41 V9 Z" />}
      <g mask={`url(#bm-cut-${id})`}>
        <g className="bmark-ink" transform="translate(32 31) skewX(-11) translate(-32 -31)" fillRule="evenodd">
          <path d="M9 12 H26 L31 17 V27 L28.5 29.5 L31 32 V44 L26 49 H9 Z M15 17.6 H23.8 L25.2 19 V25.8 L23.8 27.2 H15 Z M15 32.4 H23.8 L25.2 33.8 V42 L23.8 43.4 H15 Z" />
          <path d="M34 12 H57 L53.4 17.8 H40 V27.2 H51 L47.6 32.6 H40 V49 H34 Z" />
        </g>
      </g>
    </svg>
  );
}
