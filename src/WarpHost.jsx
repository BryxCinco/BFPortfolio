import React, { useEffect, useState } from 'react';

import { getPalette, cssVars } from './theme';
import { websites, ProjectStyles, WarpLaunch, useWarpLaunch } from './Project';

// ============================================================================
// WARPHOST.JSX — the Projects page's "warp into the live app" launch, shared
// with the rest of the site. Mounted once in App; anything that opens a live
// project (Home cards, the chat assistant) calls launchSite(name, event) and
// gets the same boot screen + hyperspace jump before the site opens.
// ============================================================================

const EVENT = 'bp:launch-site';

// `key` is a project name (or its URL); the click event gives the warp its origin
export function launchSite(key, e) {
  const r = e?.currentTarget?.getBoundingClientRect?.();
  const rect = r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { key, rect } }));
}

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
};

const WarpHost = ({ darkMode }) => {
  const reduced = useReducedMotion();
  const { launch, start, setStage, close } = useWarpLaunch(reduced);

  useEffect(() => {
    const onLaunch = (ev) => {
      const { key, rect } = ev.detail || {};
      const site = websites.find((w) => w.name === key || w.url === key);
      if (!site?.url || site.url === '#') return;
      start(site, rect ? { currentTarget: { getBoundingClientRect: () => rect } } : undefined);
    };
    window.addEventListener(EVENT, onLaunch);
    return () => window.removeEventListener(EVENT, onLaunch);
  }, [start]);

  if (!launch) return null;
  const palette = getPalette(darkMode);
  return (
    <div className="pj-scope" style={cssVars(palette)}>
      <ProjectStyles />
      <WarpLaunch key={launch.id} launch={launch} palette={palette} darkMode={darkMode} setStage={setStage} close={close} />
    </div>
  );
};

export default WarpHost;
