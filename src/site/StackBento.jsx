import React from 'react';

import { Reveal, SectionHead, Chars } from './motion';
import { METHODS } from './data';
import { stackCategories } from '../Stacks';

// Stack reads as an open index, not as more bento tiles: one row per area,
// title on the left, tools flowing on the right. AI is the highlighted row.
const ORDER = ['frontend', 'backend', 'ai', 'ship', 'design', 'mobile'];

const ToolChip = ({ item }) => (
  <li className="lchip" title={item.usedIn?.length ? `Used in ${item.usedIn.join(', ')}` : item.name}>
    <span className="lg">
      {item.logo ? <img src={item.logo} alt="" loading="lazy" decoding="async" width="24" height="24" /> : <b>{item.glyph ?? item.name.slice(0, 2)}</b>}
    </span>
    <span>{item.name}</span>
    {item.usedIn?.length > 0 && <span className="used">×{item.usedIn.length}</span>}
  </li>
);

export default function StackBento() {
  const cats = ORDER.map((id) => stackCategories.find((c) => c.id === id)).filter(Boolean);
  const total = stackCategories.reduce((n, c) => n + c.items.length, 0);

  return (
    <section id="stacks" className="sec wrap" aria-label="Tech stack">
      <SectionHead
        num="04 — Stack"
        title="The"
        serif="toolbox."
        aside={`${total} tools across six areas. The small ×n is how many of my shipped apps use it.`}
      />

      <div className="stack-rows">
        {cats.map((c, i) => (
          <Reveal as="article" key={c.id} rv="fade" className={`stack-row ${c.id === 'ai' ? 'is-hi' : ''}`} delay={0.04}>
            <div className="sr-head">
              <span className="mono mark">
                {String(i + 1).padStart(2, '0')} / {c.items.length} tools
              </span>
              <h4>
                <Chars text={c.title} delay={0.1} />
              </h4>
              <p className="sub">{c.subtitle}</p>
            </div>
            <ul className="sr-tools">
              {c.items.map((it) => (
                <ToolChip key={it.name} item={it} />
              ))}
            </ul>
          </Reveal>
        ))}

        <Reveal as="article" rv="fade" className="stack-row is-methods">
          <div className="sr-head">
            <span className="mono mark">How I work</span>
            <h4>
              <Chars text="Methods" delay={0.1} />
            </h4>
            <p className="sub">Process I&apos;ve practiced on team and solo projects.</p>
          </div>
          <ol className="sr-methods">
            {METHODS.map((m, i) => (
              <li key={m}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                {m}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
