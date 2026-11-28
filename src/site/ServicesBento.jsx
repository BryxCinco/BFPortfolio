import React from 'react';
import { ArrowRight } from 'lucide-react';

import { Tile, Reveal, SectionHead, Chars } from './motion';
import { SERVICES, PROCESS } from './data';

// ============================================================================
// SERVICESBENTO.JSX — the freelance side of the portfolio: what Brian builds
// for clients (each tied to his real projects), how a project runs, and a
// "get a quote" path into the contact form with the service preselected.
// ============================================================================

const SHAPE = {
  ai: { cls: 't-6 tb-6', tone: 'yale' },
  web: { cls: 't-6 tb-6', tone: null },
  app: { cls: 't-4 tb-2', tone: null },
  mobile: { cls: 't-4 tb-2', tone: 'lav' },
  design: { cls: 't-4 tb-2', tone: null },
};

// jump to the contact form with this service chosen (ContactBento listens)
export const requestQuote = (service) => (e) => {
  e?.preventDefault?.();
  window.dispatchEvent(new CustomEvent('bp:quote', { detail: { service } }));
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function ServicesBento() {
  return (
    <section id="services" className="sec wrap" aria-label="Services">
      <SectionHead
        num="02 — Services"
        title="What I"
        serif="can build."
        aside="Open for freelance work. Every project gets a quote after a short chat, so tell me your idea and budget."
      />

      <div className="bento">
        {SERVICES.map((s, i) => (
          <Tile key={s.id} className={`${SHAPE[s.id].cls} service`} tone={SHAPE[s.id].tone} delay={(i % 3) * 0.06}>
            <div className="tile-label mono">
              <span>
                <span className="dot" />
                S/{String(i + 1).padStart(2, '0')}
              </span>
              <span>{s.price === 'Quote' ? 'Quote on request' : s.price}</span>
            </div>
            <h3 className="service-title">
              <Chars text={s.title} delay={0.1} />
            </h3>
            <p className="service-line">{s.line}</p>
            <ul className="service-list">
              {s.includes.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <div className="service-foot">
              <span className="mono mute">e.g. {s.example}</span>
              <a className="btn sm" href="#contact" onClick={requestQuote(s.title)}>
                Get a quote <ArrowRight />
              </a>
            </div>
          </Tile>
        ))}
      </div>

      <Reveal as="div" rv="fade" className="process">
        <div className="process-head">
          <span className="mono mark">How it works</span>
          <h3 className="process-title">
            Five steps, <span className="serif">no surprises.</span>
          </h3>
        </div>
        <ol className="process-steps">
          {PROCESS.map(([title, desc], i) => (
            <li key={title}>
              <span className="mono mark">{String(i + 1).padStart(2, '0')}</span>
              <strong>{title}</strong>
              <p>{desc}</p>
            </li>
          ))}
        </ol>
        <a className="btn solid process-cta" href="#contact" onClick={requestQuote('')}>
          Start a project <ArrowRight />
        </a>
      </Reveal>
    </section>
  );
}
