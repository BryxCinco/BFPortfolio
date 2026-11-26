import { useSyncExternalStore } from 'react';

// ============================================================================
// MUSIC.JS — the site soundtrack, played through the official Spotify embed
// (Spotify's iFrame API), with one shared state for the disc player and the
// now-playing toast.
//
// Browsers only allow sound after the visitor interacts with the page, so the
// music starts on the first tap, click or key press anywhere (the intro's
// "Hello" screen included). Pausing is remembered, so a visitor who turned it
// off is not greeted by it on the next visit.
//
// Visitors signed in to Spotify hear the full track; everyone else hears
// Spotify's 30-second preview.
// ============================================================================

export const TRACK = {
  uri: 'spotify:track:2DOzJWZCslTQFQPQf6hhhj',
  url: 'https://open.spotify.com/track/2DOzJWZCslTQFQPQf6hhhj',
  title: 'Ice On My Baby',
  artist: 'Yung Bleu',
};
// where playback starts, in seconds (only applies to visitors signed in to Spotify)
const START_AT = 0;
const PREF = 'bp_music'; // 'off' after the visitor pauses

let state = { status: 'idle', position: 0, duration: 0, announce: 0 };
const subs = new Set();
const set = (patch) => {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
};
const subscribe = (f) => (subs.add(f), () => subs.delete(f));
export const useMusic = () => useSyncExternalStore(subscribe, () => state);

let host = null; // element in the disc player that the Spotify iframe replaces
let hostReady;
const hostPromise = new Promise((r) => (hostReady = r));
let controller = null;
let apiPromise = null;
let pendingPlay = false;

/** The disc player registers where the Spotify player should live. */
export function registerHost(el) {
  host = el;
  if (el) hostReady(el);
}

const loadApi = () => {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api);
    const s = document.createElement('script');
    s.src = 'https://open.spotify.com/embed/iframe-api/v1';
    s.async = true;
    document.body.appendChild(s);
  });
  return apiPromise;
};

/** Load the player (once) and start playing. */
export async function play() {
  try {
    localStorage.removeItem(PREF);
  } catch {
    /* storage may be unavailable */
  }
  if (controller) {
    pendingPlay = true;
    controller.resume ? controller.resume() : controller.play();
    return;
  }
  pendingPlay = true;
  if (state.status === 'loading') return;
  set({ status: 'loading' });
  // a tap during the intro arrives before the page (and the disc player) exists
  const [api] = await Promise.all([loadApi(), hostPromise]);
  const dark = document.documentElement.classList.contains('dark');
  const box = host.parentNode;
  // Spotify's API marks its iframe loading="lazy"; the player sits far down the
  // page, so it would never load (or play) until scrolled to. Load it now.
  const eager = new MutationObserver(() => {
    const f = box.querySelector('iframe');
    if (f) {
      f.loading = 'eager';
      eager.disconnect();
    }
  });
  eager.observe(box, { childList: true, subtree: true });
  api.createController(host, { uri: TRACK.uri, width: '100%', height: 80, theme: dark ? 'dark' : undefined }, (c) => {
    controller = c;
    c.addListener('ready', () => {
      if (!pendingPlay) return set({ status: 'paused' });
      if (START_AT) c.seek(START_AT);
      c.play();
    });
    let announced = false;
    let restarting = false;
    c.addListener('playback_update', (e) => {
      const { isPaused, isBuffering, position, duration } = e.data;
      // loop: when the track (or Spotify's 30s preview) reaches its end and the
      // visitor hasn't paused, start it again from the top. Spotify doesn't
      // always report a pause at the end, so the position decides.
      if (restarting && position < duration - 2000) restarting = false;
      if (!restarting && pendingPlay && duration > 0 && position >= duration - 400) {
        restarting = true;
        c.seek(START_AT);
        c.play();
        return set({ status: 'playing', position: START_AT * 1000, duration });
      }
      const status = isPaused ? 'paused' : isBuffering ? 'loading' : 'playing';
      // the toast announces the first start only, not every loop or resume
      if (status === 'playing' && !announced) {
        announced = true;
        set({ status, position, duration, announce: Date.now() });
      } else set({ status, position, duration });
    });
  });
}

export function pause() {
  pendingPlay = false;
  try {
    localStorage.setItem(PREF, 'off');
  } catch {
    /* storage may be unavailable */
  }
  controller?.pause();
}

export const toggle = () => (state.status === 'playing' ? pause() : play());

/** Start on the first interaction anywhere, unless the visitor paused it before. */
export function armAutostart() {
  let off = false;
  try {
    off = localStorage.getItem(PREF) === 'off';
  } catch {
    /* storage may be unavailable */
  }
  if (off) return () => {};
  const go = (e) => {
    if (e.type === 'keydown' && ['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(e.key)) return;
    // a press on the player's own controls already handles itself
    if (e.target?.closest?.('[data-music-control]')) return cleanup();
    cleanup();
    if (state.status === 'idle') play();
  };
  const cleanup = () => {
    window.removeEventListener('pointerdown', go, true);
    window.removeEventListener('keydown', go, true);
  };
  window.addEventListener('pointerdown', go, true);
  window.addEventListener('keydown', go, true);
  return cleanup;
}
