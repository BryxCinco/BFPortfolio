import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Minus } from 'lucide-react';

import { Tile, SectionHead, Count, Reveal } from './motion';
import { allCerts, featuredCerts, CERT_TOTAL } from '../Certifications';
import { thumb } from './thumbs';

const STEP = 8;

const CertCard = ({ c, cls, delay, onOpen }) => (
  <Tile as="button" type="button" className={`${cls} cert`} ticks={false} delay={delay} onClick={() => onOpen(c)}>
    <div className="cert-img">
      <img src={thumb(c.img)} alt="" loading="lazy" decoding="async" width="1414" height="1000" />
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
);


export default function CertsBento({ onPreview }) {
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
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
    if (filter === 'all') return [...allCerts].sort((a, b) => b.time - a.time);
    return allCerts.filter((c) => c.category.id === filter).sort((a, b) => b.time - a.time);
  }, [filter]);

  const pick = (f) => {
    setFilter(f);
    setShown(STEP);
  };

  const visible = list.slice(0, shown);

  const preview = (c) =>
    onPreview({
      src: c.img,
      title: c.title,
      sub: `${c.issuer} · ${c.date}`,
      desc: c.description,
      link: c.verified ? c.verifyUrl : null,
    });


  return (
    <section id="certificates" className="sec wrap" aria-label="Certificates">
      <SectionHead num="04 — Certificates" title="Paper" serif="trail." aside="Courses from Coursera, Cisco, LinkedIn, DICT and Accenture. Click any one to see it up close." />

      <Reveal className="cert-stats" rv="fade">
        {stats.map((s) => (
          <div key={s.label} className={s.tone ? `is-${s.tone}` : ''}>
            <span className="stat-num">
              <Count to={s.value} />
            </span>
            <span className="mono">{s.label}</span>
          </div>
        ))}
      </Reveal>

      <div className="bento cert-featured">
        {featuredCerts.map((c, i) => (
          <CertCard key={c.id} c={c} onOpen={preview} cls={i === 0 ? 't-6 r-2 tb-6 cert-lead' : 't-3 tb-3 x-1'} delay={(i % 3) * 0.06} />
        ))}
      </div>

      <div className="cert-toggle">
        <button type="button" className="btn" aria-expanded={open} aria-controls="cert-all" onClick={() => setOpen((o) => !o)}>
          {open ? <Minus /> : <Plus />}
          {open ? 'Hide the full list' : `Browse all ${CERT_TOTAL} certificates`}
        </button>
      </div>

      {open && (
        <div id="cert-all" className="cert-all">
          <div className="cert-filters" role="group" aria-label="Filter certificates">
            <button type="button" className="chip" aria-pressed={filter === 'all'} onClick={() => pick('all')}>
              Newest · {CERT_TOTAL}
            </button>
            {categories.map((c) => (
              <button type="button" key={c.id} className="chip" aria-pressed={filter === c.id} onClick={() => pick(c.id)}>
                {c.label} · {c.n}
              </button>
            ))}
          </div>

          <div className="bento" key={filter}>
            {visible.map((c, i) => (
              <CertCard key={c.id} c={c} onOpen={preview} cls="t-3 tb-2 x-1" delay={(i % 4) * 0.05} />
            ))}
          </div>

          {list.length > STEP && (
            <div className="cert-toggle">
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
        </div>
      )}
    </section>
  );
}
