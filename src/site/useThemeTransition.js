import { useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';

// ============================================================================
// The theme switch from the first version of the site, kept as-is in spirit:
// the new theme grows out of the exact point you clicked, as a circle, using
// the View Transitions API. flushSync makes React paint the new theme inside
// the transition callback so the "after" snapshot is never stale.
// ============================================================================

const DURATION = 650;
const EASING = 'cubic-bezier(0.83, 0, 0.17, 1)';

export function useThemeTransition(setDarkMode) {
  const busy = useRef(false);

  const toggleTheme = useCallback(
    (event) => {
      if (busy.current) return;
      const x = event?.clientX ?? window.innerWidth / 2;
      const y = event?.clientY ?? window.innerHeight / 2;
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const apply = () => flushSync(() => setDarkMode((d) => !d));

      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (typeof document.startViewTransition !== 'function' || reduced) {
        apply();
        return;
      }

      busy.current = true;
      const t = document.startViewTransition(apply);
      t.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
            { duration: DURATION, easing: EASING, pseudoElement: '::view-transition-new(root)' }
          );
        })
        .catch(() => {});
      t.finished.finally(() => {
        busy.current = false;
      });
    },
    [setDarkMode]
  );

  return toggleTheme;
}
