import { useEffect, useState } from 'react';

// ============================================================================
// USEFITSCALE.JS — on desktop (mouse + a window at least 1024px wide) the
// root font-size follows the window width (see the `html` rule in index.css),
// so every rem-based size in the page scales together. A 1366 laptop, a 1920
// monitor, a 2560 display or any browser zoom level all show the same
// composition as an 1800px-wide design, just bigger or smaller. Phones and
// tablets keep the normal 16px responsive layout.
//
// Sizes written in rem scale; raw px (inline styles, shadows) do not, so use
// rem for anything that should keep its proportions.
// ============================================================================

export const DESIGN_WIDTH = 1800;

const read = () => {
  if (typeof window === 'undefined') return { scale: 1, width: DESIGN_WIDTH };
  const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const scale = rootPx / 16;
  // the layout width the page is designed against: window width in "design px"
  return { scale, width: window.innerWidth / scale };
};

export function useFitScale() {
  const [state, setState] = useState(read);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = read();
        setState((prev) => (prev.scale === next.scale && prev.width === next.width ? prev : next));
      });
    };
    window.addEventListener('resize', update);
    const mq = window.matchMedia('(pointer: fine)');
    mq.addEventListener?.('change', update);
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      mq.removeEventListener?.('change', update);
    };
  }, []);

  return state;
}
