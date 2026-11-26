import React, { useEffect, useRef, useState } from 'react';
import { Music2, X } from 'lucide-react';

// ============================================================================
// MUSICDOCK.JSX — a small "now playing" button in the corner that opens the
// official Spotify embed of the track. Nothing from Spotify loads until the
// button is pressed (the embed is heavy), and once loaded the player stays
// mounted when the panel is closed, so the song keeps playing.
// Visitors signed in to Spotify hear the full track; others get Spotify's
// 30-second preview.
// ============================================================================

const TRACK_ID = '0lYBSQXN6rCTvUZvg9S0lU'; // Let Me Love You — DJ Snake, Justin Bieber
const TRACK_LABEL = 'Let Me Love You';
const ARTIST_LABEL = 'DJ Snake, Justin Bieber';

export default function MusicDock({ darkMode }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const panel = useRef(null);
  // stays out of the way of the hero's buttons: slides in once the visitor scrolls
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const on = () => setShown(window.scrollY > 260);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const key = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open]);

  // the player's theme is fixed when it first loads: changing its URL later
  // would reload the iframe and cut the song off mid-play
  const [src, setSrc] = useState('');
  const toggle = () => {
    if (!loaded) {
      setSrc(`https://open.spotify.com/embed/track/${TRACK_ID}?utm_source=generator${darkMode ? '&theme=0' : ''}`);
      setLoaded(true);
    }
    setOpen((o) => !o);
  };

  return (
    <div className={`music-dock ${open ? 'is-open' : ''} ${shown || open || loaded ? 'is-shown' : ''}`}>
      <div ref={panel} className="music-panel" role="dialog" aria-label="Music player" aria-hidden={!open}>
        <div className="music-head">
          <span className="mono">
            <span className="dot" />
            Soundtrack
          </span>
          <button type="button" className="icon-btn" aria-label="Hide player (music keeps playing)" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            <X />
          </button>
        </div>
        {loaded && (
          <iframe
            title={`Spotify: ${TRACK_LABEL} by ${ARTIST_LABEL}`}
            src={src}
            width="100%"
            height="152"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            tabIndex={open ? 0 : -1}
          />
        )}
      </div>

      <button type="button" className="music-btn" onClick={toggle} aria-expanded={open} aria-label={open ? 'Hide music player' : `Play ${TRACK_LABEL} by ${ARTIST_LABEL}`} data-cursor={open ? 'Hide' : 'Music'}>
        <span className="music-icon" aria-hidden="true">
          <Music2 />
          {loaded && (
            <i className="eq">
              <b />
              <b />
              <b />
            </i>
          )}
        </span>
        <span className="music-txt">
          <b>{TRACK_LABEL}</b>
          <small>{ARTIST_LABEL}</small>
        </span>
      </button>
    </div>
  );
}
