import React from 'react';

import { Tile, SectionHead, Words, Chars } from './motion';
import { FACTS, EXPERIENCE, TIMELINE, ACHIEVEMENTS, NOW, SOFT_SKILLS } from './data';
import brian2 from '../assets/Brian2.png';
import brian3 from '../assets/Brian3.png';
import brian4 from '../assets/Brian4.png';
import brian5 from '../assets/Brian5.png';
import brian6 from '../assets/Brian6.png';

import t2 from '../assets/hero/brian-2.webp';
import t3 from '../assets/hero/brian-3.webp';
import t4 from '../assets/hero/brian-4.webp';
import t5 from '../assets/hero/brian-5.webp';
import t6 from '../assets/hero/brian-6.webp';

const PHOTOS = [brian2, brian3, brian4, brian5, brian6];
// small webp copies for the strip; the lightbox still opens the full photo
const THUMBS = [t2, t3, t4, t5, t6];

export default function AboutBento({ onPreview }) {
  return (
    <section id="about" className="sec wrap" aria-label="About">
      <SectionHead num="03 — About" title="The short" serif="version." aside="Four years of BSIT, one internship, a lot of late nights. Here is the gist." />

      <div className="bento">
        <Tile className="t-7" delay={0}>
          <div className="stack-v">
            <div className="tile-label mono">
              <span>
                <span className="dot" />
                Hello
              </span>
              <span>(I promise it&apos;s short)</span>
            </div>
            <p className="big-copy">
              <Words text="I'm Brian Paul Francisco. I fell for code the moment a page I wrote actually" />{' '}
              <span className="serif">
                <Words text="did something." delay={0.4} />
              </span>{' '}
              <Words text="Now I build full-stack web and mobile apps, and I care just as much about how they" delay={0.5} />{' '}
              <span className="serif">
                <Words text="feel" delay={0.9} />
              </span>{' '}
              <Words text="as how they work." delay={0.95} />
            </p>
            <span className="serif" style={{ fontSize: '2rem' }}>
              — Brian
            </span>
          </div>
        </Tile>

        <Tile className="t-5" delay={0.08}>
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              Quick facts
            </span>
            <span>06</span>
          </div>
          <div className="facts">
            {FACTS.map(([k, v]) => (
              <div key={k}>
                <span className="mono mute">{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
        </Tile>

        <Tile className="t-6" delay={0}>
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              Experience
            </span>
          </div>
          <div className="xp">
            {EXPERIENCE.map((x) => (
              <article key={x.role}>
                <span className="mono mute">{x.period}</span>
                <div>
                  <h4>{x.role}</h4>
                  <span className="mono mark">{x.company}</span>
                  <p>{x.desc}</p>
                  <div className="chips">
                    {x.skills.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Tile>

        <Tile className="t-6" delay={0.08}>
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              College, year by year
            </span>
            <span>2022 — 2026</span>
          </div>
          <ol className="timeline">
            {TIMELINE.map((t) => (
              <li key={t.yr}>
                <span className="yr">{t.yr}</span>
                <div>
                  <h5>
                    {t.title} <span className="mono faint">· {t.period}</span>
                  </h5>
                  <p>{t.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </Tile>

        <Tile className="t-4 tb-3" tone="yale" delay={0}>
          <div className="stack-v">
            <span className="mono mute">How I think about it</span>
            <p className="quote">
              <Chars text="Turning complex logic into seamless experiences." delay={0.2} />
            </p>
            <span className="mono mute">Persistence over perfection</span>
          </div>
        </Tile>

        <Tile className="t-4 tb-3" delay={0.06}>
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              Milestones
            </span>
          </div>
          <ul className="list-plain">
            {ACHIEVEMENTS.map((a, i) => (
              <li key={a}>
                <span className="mono mark">{String(i + 1).padStart(2, '0')}</span>
                {a}
              </li>
            ))}
          </ul>
        </Tile>

        <Tile className="t-4" tone="lav" delay={0.12}>
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              Right now
            </span>
            <span>Nov 2026</span>
          </div>
          <ul className="list-plain">
            {NOW.map((n) => (
              <li key={n}>
                <span className="mono">→</span>
                {n}
              </li>
            ))}
          </ul>
        </Tile>

        <Tile className="t-12 soft" tone="yale" ticks={false} delay={0}>
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              Soft skills
            </span>
            <span>{String(SOFT_SKILLS.length).padStart(2, '0')} traits</span>
          </div>
          <ul className="soft-grid">
            {SOFT_SKILLS.map(([name, line], i) => (
              <li key={name} style={{ '--i': i }}>
                <span className="mono faint">{String(i + 1).padStart(2, '0')}</span>
                <strong>{name}</strong>
                <small>{line}</small>
              </li>
            ))}
          </ul>
        </Tile>

        <Tile className="t-12" ticks={false} style={{ padding: 0 }} delay={0}>
          <div className="tile-label mono" style={{ padding: '1rem 1rem 0', marginBottom: 0 }}>
            <span>
              <span className="dot" />
              My gallery
            </span>
            <span>(yes, I go outside)</span>
          </div>
          <div className="film">
            {PHOTOS.map((p, i) => (
              <button type="button" key={p} onClick={() => onPreview({ src: p, title: `Snapshot ${String(i + 1).padStart(2, '0')}` })} aria-label={`Open snapshot ${i + 1}`}>
                <img src={THUMBS[i]} alt="" loading="lazy" decoding="async" width="750" height="1000" />
                <span className="mono">IMG_{String(i + 1).padStart(3, '0')}</span>
              </button>
            ))}
          </div>
        </Tile>
      </div>
    </section>
  );
}
