import { useState, useRef, useCallback, useEffect } from 'react';

// ============================================================================
// SOUND EFFECTS MODULE
// ============================================================================
// Every tone here is generated on the fly with the Web Audio API — there is
// no .mp3/.wav file anywhere. That means it works instantly with zero asset
// loading, has no network/file-path issues, and is trivial to retune (just
// change the numbers below).
//
// Exposes:
//   useSoundEffects()        -> { soundEnabled, toggleSound, playClick }
//   useGlobalClickSounds()   -> wires playClick('click') to every button /
//                                [role="button"] / .cursor-target press
//                                on the page automatically.
// ============================================================================

const SOUND_PREF_KEY = 'bp_sound_enabled';

// Tonal presets — used for the non-click sounds (error buzz, toggle ping).
const TONE_PRESETS = {
  error:  { freq: 180, waveType: 'sawtooth', peakGain: 0.14, duration: 0.11 },
  toggle: { freq: 440, waveType: 'square',   peakGain: 0.16, duration: 0.09 },
};

// Click presets — used for the noise-burst "mechanical key" sounds.
// filterFreq/Q shape the noise into a percussive "clack"; thump adds a soft
// low-end body underneath it (like a real keyswitch bottoming out).
const CLICK_PRESETS = {
  key:   { duration: 0.03,  peakGain: 0.22, filterFreq: 2800, filterQ: 1.6, thump: true },   // typing test keystrokes
  click: { duration: 0.035, peakGain: 0.17, filterFreq: 3400, filterQ: 1.4, thump: true },   // site-wide button clicks
  type:  { duration: 0.028, peakGain: 0.11, filterFreq: 4200, filterQ: 2, thump: false },   // chatbot answer streaming
};

export function useSoundEffects() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(SOUND_PREF_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const audioCtxRef = useRef(null);
  const noiseBufferRef = useRef(null);

  const getCtx = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // A short buffer of white noise, generated once in-memory and reused for
  // every click — this is what makes the click sound like an actual key
  // "clack" instead of a synth beep, with no audio file involved.
  const getNoiseBuffer = useCallback((ctx) => {
    if (!noiseBufferRef.current) {
      const length = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      noiseBufferRef.current = buffer;
    }
    return noiseBufferRef.current;
  }, []);

  const playNoiseClick = useCallback(
    (ctx, { duration, peakGain, filterFreq, filterQ = 1.4, thump = false }) => {
      const now = ctx.currentTime;
      const buffer = getNoiseBuffer(ctx);

      const src = ctx.createBufferSource();
      src.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(filterFreq, now);
      filter.Q.value = filterQ;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(now);
      src.stop(now + duration + 0.01);

      if (thump) {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + duration);
        oscGain.gain.setValueAtTime(0.0001, now);
        oscGain.gain.exponentialRampToValueAtTime(peakGain * 0.45, now + 0.003);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.01);
      }
    },
    [getNoiseBuffer]
  );

  const playTone = useCallback((ctx, { freq, waveType, peakGain, duration }) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.6, 80), now + 0.045);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.85);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }, []);

  const playClick = useCallback(
    (variant = 'key') => {
      if (!soundEnabled) return;
      const ctx = getCtx();
      if (!ctx) return;

      if (TONE_PRESETS[variant]) {
        playTone(ctx, TONE_PRESETS[variant]);
      } else {
        playNoiseClick(ctx, CLICK_PRESETS[variant] || CLICK_PRESETS.key);
      }
    },
    [soundEnabled, getCtx, playTone, playNoiseClick]
  );

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_PREF_KEY, String(next));
      } catch {}
      if (next) {
        // audible confirmation that sound just turned on
        setTimeout(() => playClick('toggle'), 0);
      }
      return next;
    });
  }, [playClick]);

  return { soundEnabled, toggleSound, playClick };
}

// ============================================================================
// GLOBAL BUTTON CLICK SOUND
// ============================================================================
// Attaches a single delegated listener on the document so that clicking ANY
// button, [role="button"], or element carrying the site's .cursor-target
// class plays a short click sound — without having to add an onClick handler
// to every single button individually.
//
// Elements can opt out with data-no-sound="true" (e.g. if a button already
// plays its own distinct sound, like the typing test's per-key sounds).
// ============================================================================

export function useGlobalClickSounds(soundEnabled, playClick) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handlePointerDown = (e) => {
      if (!soundEnabled) return;
      const target = e.target.closest('button, [role="button"], .cursor-target, .cursor-pointer, a[href]');
      if (!target) return;
      if (target.dataset.noSound === 'true') return;
      if (target.disabled) return;
      playClick('click');
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [soundEnabled, playClick]);
}