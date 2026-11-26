import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Download, MessageSquare } from 'lucide-react';

import { Tile, Chars, Words, Scramble, Count, useOnScreen } from './motion';
import { ROLES, TOOLS } from './data';
import { getPalette, cssVars } from '../theme';
import HeroInference from '../HeroInference';
import h1 from '../assets/hero/brian-1.webp';
import h2 from '../assets/hero/brian-2.webp';
import h3 from '../assets/hero/brian-3.webp';
import h4 from '../assets/hero/brian-4.webp';
import h5 from '../assets/hero/brian-5.webp';
import h6 from '../assets/hero/brian-6.webp';
import brianCV from '../assets/Brian_Paul_Francisco_CV.pdf';

const PHOTOS = [h1, h2, h3, h4, h5, h6];
const SLIDE_MS = 3000;

// the hero photo changes every 3 seconds: the next picture wipes in over the last one
const Portrait = () => {
  const box = useRef(null);
  const visible = useOnScreen(box);
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [tick, setTick] = useState(0);

  // warm the other photos only after the page has settled, so they never compete with first paint
  useEffect(() => {
    const t = setTimeout(() => {
      PHOTOS.slice(1).forEach((src) => {
        const im = new Image();
        im.src = src;
      });
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  // rotates only while the photo is on screen
  useEffect(() => {
    if (!visible) return undefined;
    const id = setTimeout(() => {
      setPrev(i);
      setI((n) => (n + 1) % PHOTOS.length);
    }, SLIDE_MS);
    return () => clearTimeout(id);
  }, [i, tick, visible]);

  const pick = (k) => {
    if (k === i) return;
    setPrev(i);
    setI(k);
    setTick((t) => t + 1);
  };

  return (
    <>
      <span ref={box} className="portrait-probe" aria-hidden="true" />
      {PHOTOS.map((src, k) => (
        <img
          key={src}
          src={src}
          alt={k === i ? 'Photo of Brian Paul Francisco' : ''}
          aria-hidden={k !== i}
          className={`slide ${k === i ? 'on' : k === prev ? 'was' : ''}`}
          draggable={false}
          width={k === 5 ? 1000 : 750}
          height={k === 5 ? 750 : 1000}
          decoding={k === 0 ? 'sync' : 'async'}
          fetchpriority={k === 0 ? 'high' : 'low'}
          loading={k === 0 ? 'eager' : 'lazy'}
        />
      ))}
      <div className="bars" style={{ '--dur': `${SLIDE_MS}ms` }}>
        {PHOTOS.map((src, k) => (
          <button type="button" key={`${src}-${k === i ? tick : 'x'}`} className={k === i ? 'now' : k < i ? 'done' : ''} onClick={() => pick(k)} aria-label={`Show photo ${k + 1}`}>
            <i />
          </button>
        ))}
      </div>
      <div className="cap mono">
        <span>B. P. Francisco</span>
        <span>{String(i + 1).padStart(2, '0')} / {String(PHOTOS.length).padStart(2, '0')}</span>
      </div>
    </>
  );
};

const useManilaClock = () => {
  const read = () => {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value ?? '00';
    return { h: get('hour'), m: get('minute'), s: get('second') };
  };
  const [t, setT] = useState(read);
  useEffect(() => {
    const id = setInterval(() => setT(read()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
};

// The ticking clock and the rotating role live in their own small components,
// so a tick re-renders a few characters instead of the whole hero.
const Clock = () => {
  const clock = useManilaClock();
  const hour = Number(clock.h);
  const awake = hour >= 8 && hour < 24;
  return (
    <div>
      <div className="clock" aria-label={`Manila time ${clock.h}:${clock.m}`}>
        {clock.h}:{clock.m}
        <span className="s">:{clock.s}</span>
      </div>
      <p className="mono mute" style={{ margin: '0.6rem 0 0' }}>
        Manila time · {awake ? 'probably coding' : 'probably asleep'}
      </p>
    </div>
  );
};

const RoleLine = () => {
  const [role, setRole] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setRole((r) => (r + 1) % ROLES.length), 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="role-line">
      <span className="bar-mark" aria-hidden="true" />
      <Scramble text={ROLES[role]} trigger="mount" />
    </div>
  );
};

export default function Hero({ darkMode, go, onAsk }) {
  const vars = useMemo(() => cssVars(getPalette(darkMode)), [darkMode]);

  return (
    <section id="home" className="hero wrap" aria-label="Introduction">
      <div className="bento">
        {/* ---- name + pitch ---- */}
        <Tile className="t-8 tb-4 hero-main" delay={0.05}>
          <div className="hero-top">
            <span className="status-pill">
              <span className="live-dot" aria-hidden="true" />
              Available for work · Manila
            </span>
            <Scramble className="mono mute hide-s" text="Portfolio / Ed. 2026" delay={0.3} trigger="mount" />
          </div>

          <h1 className="hero-name display">
            <span className="row">
              <Chars text="Brian Paul" delay={0.35} />
            </span>
            <span className="row">
              <Chars text="Francisco" delay={0.55} />
              <span className="serif">
                <Chars text="(dev)" delay={0.95} />
              </span>
            </span>
          </h1>

          <div className="hero-foot">
            <div style={{ display: 'grid', gap: '1.25rem', maxWidth: '40rem' }}>
              <RoleLine />
              <p className="hero-lede">
                <Words
                  delay={0.35}
                  text="A fresh BSIT grad from Manila who builds full-stack apps with LLMs inside, and cares as much about how they feel as how they work."
                />
              </p>
              <div className="hero-actions">
                <a className="btn solid" href={brianCV} download="Brian_Paul_Francisco_CV.pdf">
                  <Download /> Download CV
                </a>
                <a className="btn" href="#projects" onClick={go('projects')}>
                  See my work <ArrowDown />
                </a>
                <button type="button" className="text-link mono" onClick={() => onAsk()}>
                  <MessageSquare /> Ask me anything
                </button>
              </div>
            </div>
          </div>
        </Tile>

        {/* ---- portrait ---- */}
        <Tile className="t-4 tb-2 portrait" ticks={false} delay={0.2}>
          <Portrait />
          <span className="tag-v mono">Fig. 01 — the developer</span>
        </Tile>

        {/* ---- status + clock ---- */}
        <Tile className="t-3 tb-3" delay={0.28}>
          <div className="stack-v">
            <div className="tile-label mono" style={{ marginBottom: 0 }}>
              <span>
                <span className="live-dot" />
                Available for work
              </span>
            </div>
            <Clock />
          </div>
        </Tile>

        {/* ---- numbers ---- */}
        <Tile className="t-2 tb-3 x-1" tone="lav" delay={0.34}>
          <div className="stack-v">
            <span className="mono mute">GWA</span>
            <div className="stat-num">
              <Count to={1.25} decimals={2} />
            </div>
            <span className="mono mute">Graduated BSIT</span>
          </div>
        </Tile>
        <Tile className="t-2 tb-3 x-1" tone="yale" delay={0.4}>
          <div className="stack-v">
            <span className="mono mute">Apps live</span>
            <div className="stat-num">
              0<Count to={7} />
            </div>
            <span className="mono mute">5 with LLMs</span>
          </div>
        </Tile>

        {/* ---- live inference ---- */}
        <Tile className="t-5 m-6" delay={0.46} style={vars}>
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              Ask the assistant
            </span>
            <button type="button" className="link-u mono" onClick={() => onAsk()} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'inherit', padding: 0 }}>
              Open chat <ArrowUpRight size={12} style={{ display: 'inline', verticalAlign: '-2px' }} />
            </button>
          </div>
          <HeroInference darkMode={darkMode} onAsk={onAsk} />
        </Tile>
      </div>

      <div className="marquee" aria-label="Tools I use">
        <div className="marquee-track">
          {[...TOOLS, ...TOOLS].map((t, i) => (
            <span key={i} aria-hidden={i >= TOOLS.length}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
