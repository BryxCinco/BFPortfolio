// ============================================================================
// THEME — one palette per mode, exposed to page markup as CSS variables.
// Shared by Project.jsx and Certifications.jsx so both pages stay in sync.
// ============================================================================

export const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const getPalette = (darkMode) =>
  darkMode
    ? {
        // mint for text and buttons; the full neon is saved for glows
        acc: '#2EE6A8',
        accHi: '#00FFB3',
        acc2: '#FF4D9A',
        accInk: '#1B1B2A',
        ink: '#FFFFFF',
        surface: 'rgba(255,255,255,0.04)',
        surfaceStrong: 'rgba(255,255,255,0.08)',
        line: 'rgba(46,230,168,0.14)',
        warpBg: '#0B0B16',
        stars: ['#00FFB3', '#7DFFE0', '#FFFFFF', '#FF4D9A', '#A700FF'],
      }
    : {
        // the same mint, deepened so it passes contrast on cream (~5:1)
        acc: '#007A59',
        accHi: '#2EE6A8',
        acc2: '#D6006A',
        accInk: '#FFFFFF',
        ink: '#1B1B2A',
        surface: 'rgba(255,255,255,0.62)',
        surfaceStrong: 'rgba(255,255,255,0.85)',
        line: 'rgba(27,27,42,0.12)',
        warpBg: '#F3FBF7',
        stars: ['#007A59', '#2EE6A8', '#D6006A', '#1B1B2A', '#A700FF'],
      };

export const cssVars = (p) => ({
  '--acc': p.acc,
  '--acc-soft': rgba(p.acc, 0.12),
  '--acc-line': rgba(p.acc, 0.32),
  '--acc-glow': rgba(p.acc, 0.45),
  '--acc-hi': p.accHi,
  '--acc2': p.acc2,
  '--acc-ink': p.accInk,
  '--ink': p.ink,
  '--surface': p.surface,
  '--surface-strong': p.surfaceStrong,
  '--line': p.line,
});
