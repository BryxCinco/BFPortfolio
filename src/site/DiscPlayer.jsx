import React, { useEffect, useRef } from 'react';
import { Pause, Play, ArrowUpRight } from 'lucide-react';

import { Tile, Chars } from './motion';
import BrandMark from './BrandMark';
import { TRACK, useMusic, toggle, registerHost } from './music';

const fmt = (ms) => {
  const s = Math.max(0, Math.round((ms || 0) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// ============================================================================
// DISCPLAYER.JSX — the Side quests record player: a vinyl that spins while the
// soundtrack plays, a tonearm that drops onto it, play / pause, and the
// official Spotify player underneath (Spotify requires its player on screen).
// ============================================================================

export default function DiscPlayer() {
  const { status, position, duration } = useMusic();
  const slot = useRef(null);
  const playing = status === 'playing';

  // the Spotify API replaces the element it is given, so it gets a plain div
  // that React doesn't manage, inside a container that React does
  useEffect(() => {
    const el = document.createElement('div');
    slot.current.appendChild(el);
    registerHost(el);
    return () => {
      registerHost(null);
      el.remove();
    };
  }, []);

  return (
    <Tile className="t-12 disc-tile" tone="yale" data-playing={playing}>
      <div className="disc-wrap" aria-hidden="true">
        <div className="vinyl">
          <div className="vinyl-label">
            <BrandMark height={30} />
          </div>
        </div>
        <div className="tonearm">
          <i />
        </div>
      </div>

      <div className="disc-info">
        <div className="tile-label mono">
          <span>
            <span className="dot" />
            Game 03 · Soundtrack
          </span>
          <span>{status === 'idle' ? 'Tap to play' : status === 'loading' ? 'Loading…' : `${fmt(position)} / ${fmt(duration)}`}</span>
        </div>
        <h3 className="disc-title">
          <Chars text={TRACK.title} delay={0.1} />
        </h3>
        <p className="disc-artist serif">{TRACK.artist}</p>

        <div className="disc-controls">
          <button type="button" className="disc-play" onClick={toggle} data-music-control aria-label={playing ? 'Pause' : 'Play'} data-cursor={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause /> : <Play />}
          </button>
          <a className="btn sm" href={TRACK.url} target="_blank" rel="noopener noreferrer">
            Open in Spotify <ArrowUpRight className="nudge" />
          </a>
        </div>

        <div className="disc-bar" aria-hidden="true">
          <i style={{ transform: `scaleX(${duration ? position / duration : 0})` }} />
        </div>

        {/* the official player loads here on first play */}
        <div ref={slot} className="disc-spotify" />
        <p className="disc-note mono">Full track if you're signed in to Spotify · 30s preview otherwise</p>
      </div>
    </Tile>
  );
}
