import React, { useCallback, useState } from 'react';
import { ArrowUpRight, Code2, Plus } from 'lucide-react';

import { Tile, SectionHead, Chars } from './motion';
import { WORK_LAYOUT } from './data';
import { websites, ProjectStyles, ProjectDetails } from '../Project';
import { launchSite } from '../WarpHost';
import { getPalette, cssVars } from '../theme';

const TONE = {
  yale: { bg: 'var(--yale)', ink: '#fff' },
  poly: { bg: 'var(--poly)', ink: '#fff' },
  pomp: { bg: 'var(--pomp)', ink: '#0B0B0C' },
  air: { bg: 'var(--air)', ink: '#0B0B0C' },
  lav: { bg: 'var(--lav)', ink: '#0B0B0C' },
};

const pad = (n) => String(n).padStart(2, '0');

const WorkTile = ({ w, site, i, onDetails }) => {
  const tone = TONE[w.tone];
  const big = w.cls.includes('big');
  const open = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    launchSite(site.name, e);
  };

  return (
    <Tile as="article" className={`${w.cls} work`} delay={(i % 3) * 0.08} ticks={false}>
      <div className="work-shot" style={{ '--shot-bg': tone.bg, '--shot-ink': tone.ink }}>
        <div className="work-num mono">
          <span>P/{pad(i + 1)}</span>
          <span>{site.tag}</span>
        </div>
        <img src={site.image} alt={`${site.name} screenshot`} loading="lazy" decoding="async" width="1600" height="900" draggable={false} />
      </div>

      <div className="work-body">
        <div className="work-head">
          {site.logo && <img src={site.logo} alt="" loading="lazy" />}
          <div>
            <h3 className="work-name">
              <Chars text={site.name} delay={0.25} />
            </h3>
            <div className="work-tag mono">{site.subtitle}</div>
          </div>
        </div>

        <p className="work-tl" lang="tl">
          {w.tl}
        </p>
        {big && <p className="work-desc">{site.desc}</p>}

        <div className="chips">
          {site.stack.slice(0, big ? 7 : 4).map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>

        <div className="work-act">
          <a className="btn sm solid" href={site.url} target="_blank" rel="noopener noreferrer" onClick={open}>
            Live <ArrowUpRight className="nudge" />
          </a>
          <button type="button" className="btn sm" onClick={() => onDetails(site)}>
            Case study <Plus />
          </button>
          {site.repo && (
            <a className="btn sm" href={site.repo} target="_blank" rel="noopener noreferrer" aria-label={`${site.name} source on GitHub`}>
              <Code2 /> Code
            </a>
          )}
        </div>
      </div>
    </Tile>
  );
};

export default function Work({ darkMode }) {
  const [details, setDetails] = useState(null);
  const close = useCallback(() => setDetails(null), []);
  const launch = (site, e) => {
    setDetails(null);
    launchSite(site.name, e);
  };

  const items = WORK_LAYOUT.map((w) => ({ w, site: websites.find((s) => s.name === w.name) })).filter((x) => x.site);

  return (
    <section id="projects" className="sec wrap" aria-labelledby="work-title">
      <SectionHead
        num="01 — Selected work"
        title="Things I"
        serif="shipped."
        aside="Seven live apps, five with LLMs doing real work inside. Click Live to open one, or read the case study."
      />
      <span id="work-title" className="sr-only">
        Selected work
      </span>

      <div className="bento">
        {items.map(({ w, site }, i) => (
          <WorkTile key={site.name} w={w} site={site} i={i} onDetails={setDetails} />
        ))}
      </div>

      {details && (
        <div className="pj-scope" style={cssVars(getPalette(darkMode))}>
          <ProjectStyles />
          <ProjectDetails site={details} darkMode={darkMode} onClose={close} onLaunch={launch} />
        </div>
      )}
    </section>
  );
}
