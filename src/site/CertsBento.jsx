import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

import { Tile, SectionHead, Count, Reveal } from './motion';
import { allCerts, featuredCerts, CERT_TOTAL } from '../Certifications';

const STEP = 8;

export default function CertsBento({ onPreview }) {
  const [filter, setFilter] = useState('featured');
  const [shown, setShown] = useState(STEP);

  const categories = useMemo(() => {
    const seen = new Map();
    allCerts.forEach((c) => {
      if (!seen.has(c.category.id)) seen.set(c.category.id, { id: c.category.id, label: c.category.short || c.category.label, n: 0 });
      seen.get(c.category.id).n += 1;
    });
    return [...seen.values()];
  }, []);

  const stats = [
    { label: 'Credentials', value: CERT_TOTAL, tone: 'poly' },
    { label: 'Domains', value: categories.length },
    { label: 'Platforms', value: new Set(allCerts.map((c) => c.provider)).size },
    { label: 'Verifiable online', value: allCerts.filter((c) => c.verified).length, tone: 'lav' },
  ];

  const list = useMemo(() => {
    if (filter === 'featured') {
      const rest = allCerts.filter((c) => !featuredCerts.includes(c)).sort((a, b) => b.time - a.time);
      return [...featuredCerts, ...rest];
    }
    if (filter === 'all') return [...allCerts].sort((a, b) => b.time - a.time);
    return allCerts.filter((c) => c.category.id === filter).sort((a, b) => b.time - a.time);
  }, [filter]);

  const pick = (f) => {
    setFilter(f);
    setShown(STEP);
  };

  const visible = list.slice(0, shown);

  return (
    <section id="certificates" className="sec wrap" aria-label="Certificates">
      <SectionHead num="04 — Certificates" title="Paper" serif="trail." aside="Courses from Coursera, Cisco, LinkedIn, DICT and Accenture. Click any one to see it up close." />

      <div className="bento" style={{ marginBottom: 'var(--gap)' }}>
        {stats.map((s, i) => (
          <Tile key={s.label} className="t-3 tb-3 x-1" tone={s.tone} delay={i * 0.06}>
            <div className="stack-v">
              <span className="mono mute">{s.label}</span>
              <div className="stat-num">
                <Count to={s.value} />
              </div>
            </div>
          </Tile>
        ))}
      </div>

      <Reveal className="cert-filters" role="group" aria-label="Filter certificates">
        <button type="button" className="chip" aria-pressed={filter === 'featured'} onClick={() => pick('featured')}>
          Featured first
        </button>
        <button type="button" className="chip" aria-pressed={filter === 'all'} onClick={() => pick('all')}>
          Newest · {CERT_TOTAL}
        </button>
        {categories.map((c) => (
          <button type="button" key={c.id} className="chip" aria-pressed={filter === c.id} onClick={() => pick(c.id)}>
            {c.label} · {c.n}
          </button>
        ))}
      </Reveal>

      <div className="bento" key={filter}>
        {visible.map((c, i) => (
          <Tile
            as="button"
            type="button"
            key={c.id}
            className="t-3 tb-2 x-1 cert"
            ticks={false}
            delay={(i % 4) * 0.06}
            onClick={() =>
              onPreview({
                src: c.img,
                title: c.title,
                sub: `${c.issuer} · ${c.date}`,
                desc: c.description,
                link: c.verified ? c.verifyUrl : null,
              })
            }
          >
            <div className="cert-img">
              <img src={c.img} alt="" loading="lazy" />
            </div>
            <div className="cert-body">
              <span className="mono mark">
                {c.category.short || c.category.label} · №{String(c.n).padStart(2, '0')}
              </span>
              <h5>{c.title}</h5>
              <span className="mono mute">
                {c.provider} · {c.date}
              </span>
            </div>
          </Tile>
        ))}
      </div>

      {list.length > STEP && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
          {shown < list.length ? (
            <button type="button" className="btn" onClick={() => setShown((n) => n + STEP * 2)}>
              Show more · {list.length - shown} left <ArrowDown />
            </button>
          ) : (
            <button type="button" className="btn" onClick={() => setShown(STEP)}>
              Show less <ArrowUp />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
