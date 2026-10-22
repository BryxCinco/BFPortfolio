import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// USETHEMEPREFERENCE.JS — light/dark follows the visitor's device by default
// (prefers-color-scheme), live: switching the phone or PC between light and
// dark display flips the site too. Using the theme switch pins a choice;
// followSystem() goes back to matching the device. Stored as 'bp_theme':
// 'system' | 'light' | 'dark'.
// ============================================================================

const KEY = 'bp_theme';
const QUERY = '(prefers-color-scheme: dark)';

const readPref = () => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
};

const systemIsDark = () => typeof window !== 'undefined' && !!window.matchMedia?.(QUERY).matches;

export function useThemePreference() {
  const [pref, setPref] = useState(readPref);
  const [systemDark, setSystemDark] = useState(systemIsDark);
  const systemDarkRef = useRef(systemDark);
  systemDarkRef.current = systemDark;

  // keep up with the device's display mode while the page is open
  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return undefined;
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, pref);
    } catch {
      /* storage may be unavailable */
    }
  }, [pref]);

  const darkMode = pref === 'system' ? systemDark : pref === 'dark';

  // same shape as a useState setter, so the theme-switch animation can use it;
  // any manual change pins the result as an explicit choice
  const setDarkMode = useCallback((next) => {
    setPref((p) => {
      const current = p === 'system' ? systemDarkRef.current : p === 'dark';
      const value = typeof next === 'function' ? next(current) : next;
      return value ? 'dark' : 'light';
    });
  }, []);

  const followSystem = useCallback(() => setPref('system'), []);

  return { darkMode, setDarkMode, followsSystem: pref === 'system', systemDark, followSystem };
}
