import { useSyncExternalStore } from 'react';

// ============================================================================
// MUSIC.JS — the site soundtrack, played through the official YouTube upload
// (YouTube IFrame API), with one shared state for the record player and the
// now-playing notice.
//
// YouTube plays the full song for everyone (no sign-in), so playback can start
// at a chosen moment and loop back to it. Spotify can't: signed-out visitors
// only get a 30-second preview of Spotify's choosing.
//
// Browsers only allow sound after the visitor interacts with the page, so the
// music starts on the first tap, click or key press anywhere (the intro's
// "Hello" screen included). Pausing is remembered, so a visitor who turned it
// off is not greeted by it on the next visit.
// ============================================================================

export const TRACK = {
  videoId: 'Lh7jYzwxdOI', // "Ice On My Baby" — Yung Bleu (Topic channel: the album audio)
  url: 'https://www.youtube.com/watch?v=Lh7jYzwxdOI&t=51s',
  title: 'Ice On My Baby',
  artist: 'Yung Bleu',
};
// where playback starts, and where every loop returns to: 0:51, the verse that
// runs into the "ice on my baby" hook (timed against the album audio)
const START_AT = 50.8;
const PREF = 'bp_music'; // 'off' after the visitor pauses

let state = { status: 'idle', position: 0, duration: 0, announce: 0 };
const subs = new Set();
const set = (patch) => {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
};
const subscribe = (f) => (subs.add(f), () => subs.delete(f));
export const useMusic = () => useSyncExternalStore(subscribe, () => state);

let host = null; // element in the record player that the YouTube iframe replaces
let hostReady;
const hostPromise = new Promise((r) => (hostReady = r));
let player = null;
let apiPromise = null;
let pendingPlay = false;
let poll = 0;

/** The record player registers where the YouTube player should live. */
export function registerHost(el) {
  host = el;
  if (el) hostReady(el);
}

const loadApi = () => {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    document.body.appendChild(s);
  });
  return apiPromise;
};

// YouTube has no progress events, so the position is read twice a second while playing
const startPolling = () => {
  clearInterval(poll);
  poll = setInterval(() => {
    if (!player?.getCurrentTime) return;
    set({ position: player.getCurrentTime() * 1000, duration: (player.getDuration() || 0) * 1000 });
  }, 500);
};

/** Load the player (once) and start playing. */
export async function play() {
  try {
    localStorage.removeItem(PREF);
  } catch {
    /* storage may be unavailable */
  }
  pendingPlay = true;
  if (player?.playVideo) {
    player.playVideo();
    return;
  }
  if (state.status === 'loading') return;
  set({ status: 'loading' });
  // a tap during the intro arrives before the page (and the record player) exists
  const [YT] = await Promise.all([loadApi(), hostPromise]);
  let announced = false;
  player = new YT.Player(host, {
    videoId: TRACK.videoId,
    width: '100%',
    height: '100%',
    playerVars: { start: Math.floor(START_AT), playsinline: 1, rel: 0, modestbranding: 1 },
    events: {
      onReady: (e) => {
        if (!pendingPlay) return set({ status: 'paused' });
        e.target.seekTo(START_AT, true);
        e.target.playVideo();
      },
      onStateChange: (e) => {
        const S = YT.PlayerState;
        if (e.data === S.ENDED) {
          // loop: back to the highlight unless the visitor paused
          if (pendingPlay) {
            e.target.seekTo(START_AT, true);
            e.target.playVideo();
          }
          return;
        }
        if (e.data === S.PLAYING) {
          startPolling();
          // the notice announces the first start only, not every loop or resume
          if (!announced) {
            announced = true;
            set({ status: 'playing', announce: Date.now() });
          } else set({ status: 'playing' });
        } else if (e.data === S.PAUSED) {
          clearInterval(poll);
          // pausing in YouTube's own controls counts as the visitor pausing
          pendingPlay = false;
          set({ status: 'paused' });
        } else if (e.data === S.BUFFERING) set({ status: 'loading' });
      },
    },
  });
}

export function pause() {
  pendingPlay = false;
  try {
    localStorage.setItem(PREF, 'off');
  } catch {
    /* storage may be unavailable */
  }
  player?.pauseVideo?.();
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
