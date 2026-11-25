import React from 'react';

import { Tile, SectionHead, Chars } from './motion';
import { METHODS } from './data';
import { stackCategories } from '../Stacks';

const SHAPE = {
  frontend: { cls: 't-7', tone: null },
  backend: { cls: 't-5', tone: null },
  ai: { cls: 't-6', tone: 'yale' },
  ship: { cls: 't-6', tone: null },
  design: { cls: 't-5 tb-3', tone: null },
  mobile: { cls: 't-3 tb-3', tone: 'lav' },
};
const ORDER = ['frontend', 'backend', 'ai', 'ship', 'design', 'mobile'];

const LogoCell = ({ item }) => (
  <div className="logo-cell" title={item.usedIn?.length ? `Used in ${item.usedIn.join(', ')}` : item.name}>
    {item.usedIn?.length > 0 && <span className="used">×{item.usedIn.length}</span>}
    <span className="lg">{item.logo ? <img src={item.logo} alt="" loading="lazy" /> : <b>{item.glyph ?? item.name.slice(0, 2)}</b>}</span>
    <span>{item.name}</span>
  </div>
);

export default function StackBento() {
  const cats = ORDER.map((id) => stackCategories.find((c) => c.id === id)).filter(Boolean);
  const total = stackCategories.reduce((n, c) => n + c.items.length, 0);

  return (
    <section id="stacks" className="sec wrap" aria-label="Tech stack">
      <SectionHead
        num="03 — Stack"
        title="The"
        serif="toolbox."
        aside={`${total} tools across six areas. The small ×n is how many of my shipped apps use it.`}
      />

      <div className="bento">
        {cats.map((c, i) => {
          const s = SHAPE[c.id];
          return (
            <Tile key={c.id} className={`${s.cls} stack-cat`} tone={s.tone} delay={(i % 2) * 0.08}>
              <div className="tile-label mono">
                <span>
                  <span className="dot" />
                  {String(i + 1).padStart(2, '0')} / {c.items.length} tools
                </span>
              </div>
              <h4>
                <Chars text={c.title} delay={0.15} />
              </h4>
              <p className="sub">{c.subtitle}</p>
              <div className="logos">
                {c.items.map((it) => (
                  <LogoCell key={it.name} item={it} />
                ))}
              </div>
            </Tile>
          );
        })}

        <Tile className="t-4 stack-cat" tone="air" delay={0.1}>
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              How I work
            </span>
          </div>
          <h4>
            <Chars text="Methods" delay={0.15} />
          </h4>
          <p className="sub">Process I&apos;ve practiced on team and solo projects.</p>
          <ul className="list-plain">
            {METHODS.map((m, i) => (
              <li key={m}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                {m}
              </li>
            ))}
          </ul>
        </Tile>
      </div>
    </section>
  );
}
