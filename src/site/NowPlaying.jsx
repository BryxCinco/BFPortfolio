import React, { useEffect, useState } from 'react';
import { Music2, Pause } from 'lucide-react';

import { TRACK, useMusic, pause } from './music';

// ============================================================================
// NOWPLAYING.JSX — when the soundtrack starts, a small notice says what is
// playing, with a Pause button, for four seconds; then it goes away. After
// that, the record player in Side quests has the controls.
// ============================================================================

const SHOW_MS = 4000;

export default function NowPlaying() {
  const { announce } = useMusic();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!announce) return undefined;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), SHOW_MS);
    return () => clearTimeout(t);
  }, [announce]);

  return (
    <div className={`now-playing ${visible ? 'is-on' : ''}`} role="status" aria-live="polite" aria-hidden={!visible}>
      <span className="np-icon" aria-hidden="true">
        <Music2 />
      </span>
      <span className="np-txt">
        <small className="mono">Now playing</small>
        <b>{TRACK.title}</b>
        <small>{TRACK.artist}</small>
      </span>
      <button
        type="button"
        className="np-pause"
        data-music-control
        tabIndex={visible ? 0 : -1}
        onClick={() => {
          pause();
          setVisible(false);
        }}
      >
        <Pause /> Pause
      </button>
      <i className="np-timer" key={announce} aria-hidden="true" />
    </div>
  );
}
