// ============================================================================
// THEME — one palette per mode, exposed to page markup as CSS variables.
// Palette: Yale #0E356C · Polynesian #0F499A · Air superiority #76A4C2
//          Pink lavender #DDBCEB · Pomp and power #8D6FA0
// Text stays black / white; the palette carries accents and surfaces.
// ============================================================================

export const PALETTE = {
  yale: '#0E356C',
  poly: '#0F499A',
  air: '#76A4C2',
  lav: '#DDBCEB',
  pomp: '#8D6FA0',
};

export const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const getPalette = (darkMode) =>
  darkMode
    ? {
        acc: '#A9C9E0',
        accHi: '#DDBCEB',
        acc2: '#DDBCEB',
        accInk: '#05070C',
        ink: '#F4F4F2',
        surface: 'rgba(255,255,255,0.035)',
        surfaceStrong: 'rgba(255,255,255,0.07)',
        line: 'rgba(255,255,255,0.10)',
        warpBg: '#05070C',
        stars: ['#DDBCEB', '#76A4C2', '#FFFFFF', '#8D6FA0', '#0F499A'],
      }
    : {
        acc: '#0F499A',
        accHi: '#76A4C2',
        acc2: '#8D6FA0',
        accInk: '#FFFFFF',
        ink: '#0B0B0C',
        surface: 'rgba(255,255,255,0.7)',
        surfaceStrong: 'rgba(255,255,255,0.9)',
        line: 'rgba(11,11,12,0.12)',
        warpBg: '#EEEFF3',
        stars: ['#0F499A', '#76A4C2', '#8D6FA0', '#0E356C', '#DDBCEB'],
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
