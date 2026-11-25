import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { Tile, SectionHead } from './motion';
import { SOCIALS } from './data';
import fbShot from '../assets/FacebookProfile.png';
import igShot from '../assets/InstagramProfile.png';
import liShot from '../assets/LinkedinProfile.png';
import fbLogo from '../assets/FacebookLogo.png';
import igLogo from '../assets/InstagramLogo.png';
import liLogo from '../assets/LinkedInLogo.png';
import ghAvatar from '../assets/hero/brian-1.webp';

const ART = {
  Facebook: { shot: fbShot, logo: fbLogo, tone: 'poly' },
  Instagram: { shot: igShot, logo: igLogo, tone: 'lav' },
  LinkedIn: { shot: liShot, logo: liLogo, tone: 'yale' },
  GitHub: { shot: null, logo: 'https://cdn.simpleicons.org/github/181717', tone: 'air' },
};

// GitHub has no profile screenshot, so it gets a small hand-built profile card instead
const GitHubCard = () => (
  <div className="gh-card">
    <img src={ghAvatar} alt="" className="gh-ava" loading="lazy" />
    <strong>Brian Francisco</strong>
    <span className="mono">BryxCinco</span>
    <div className="gh-grid" aria-hidden="true">
      {Array.from({ length: 84 }, (_, i) => (
        <i key={i} style={{ opacity: [0.12, 0.3, 0.55, 0.85, 1][(i * 7 + (i % 5) * 3) % 5] }} />
      ))}
    </div>
    <span className="mono">TIDE · Krea · Matchie · Snapzy · Poopipoo · NeoChess</span>
  </div>
);

export default function Socials() {
  return (
    <section id="socials" className="sec wrap" aria-label="Socials">
      <SectionHead num="06 — Socials" title="Find me" serif="online." aside="Same person on every app. Tap a card to open the profile." />
      <div className="bento">
        {SOCIALS.map((s, i) => {
          const art = ART[s.name];
          return (
            <Tile
              as="a"
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="t-3 tb-3 social"
              tone={art.tone}
              delay={i * 0.07}
              aria-label={`${s.name}: ${s.handle}`}
            >
              <div className="tile-label mono">
                <span>
                  <span className="dot" />
                  {String(i + 1).padStart(2, '0')} / {s.name}
                </span>
                <ArrowUpRight size={16} className="social-arrow" />
              </div>
              <div className="phone">
                {art.shot ? <img src={art.shot} alt={`${s.name} profile of Brian Francisco`} loading="lazy" draggable={false} /> : <GitHubCard />}
              </div>
              <div className="social-foot">
                <span className="social-logo">
                  <img src={art.logo} alt="" loading="lazy" />
                </span>
                <span>
                  <strong>{s.handle}</strong>
                  <small>{s.note}</small>
                </span>
              </div>
            </Tile>
          );
        })}
      </div>
    </section>
  );
}
