import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageSquare, Moon, Sun, Volume2, VolumeX } from 'lucide-react';

import { Tile, SectionHead, Chars, useSeen } from './motion';

const ROWS = ['qwertyuiop', 'asdfghjkl;', 'zxcvbnm,./'];
const PHRASE = 'ship it then make it pretty';

// the little keyboard "types" a phrase on its own while it's on screen
const Keys = () => {
  const ref = useRef(null);
  const seen = useSeen(ref);
  const [hit, setHit] = useState('');
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!seen || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let i = 0;
    const id = setInterval(() => {
      const ch = PHRASE[i % (PHRASE.length + 6)] ?? '';
      setHit(ch);
      setTyped(i % (PHRASE.length + 6) < PHRASE.length ? PHRASE.slice(0, (i % (PHRASE.length + 6)) + 1) : PHRASE);
      i += 1;
    }, 140);
    return () => clearInterval(id);
  }, [seen]);

  return (
    <div ref={ref} aria-hidden="true">
      <div className="mono" style={{ minHeight: '1.2em', fontSize: '0.8125rem', textTransform: 'none' }}>
        &gt; {typed}
        <span style={{ opacity: 0.6 }}>▍</span>
      </div>
      <div className="keys">
        {ROWS.join('').split('').map((k) => (
          <i key={k} className={hit === k ? 'hit' : ''}>
            <b style={{ fontWeight: 400 }}>{k}</b>
          </i>
        ))}
      </div>
    </div>
  );
};

const Blocks = () => (
  <div className="stackviz" aria-hidden="true">
    {[78, 70, 62, 56, 48, 40].map((w, i) => (
      <i key={i} style={{ width: `${w}%`, '--i': i, '--x': `${i % 2 ? -40 : 40}%`, opacity: 1 - i * 0.08 }} />
    ))}
  </div>
);

export default function PlayBento({ darkMode, onTyping, onStack, onChat, soundEnabled, onToggleSound, onToggleTheme }) {
  return (
    <section id="play" className="sec wrap" aria-label="Play">
      <SectionHead num="05 — Play" title="Side" serif="quests." aside="Small games I built into the site. Your score stays on your device." />

      <div className="bento">
        <Tile as="button" type="button" className="t-7 play" tone="ink" onClick={onTyping} aria-label="Open the typing speed test">
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              Game 01 · Typing speed
            </span>
            <span>15 / 30 / 60 / 120s</span>
          </div>
          <Keys />
          <div className="flex-between">
            <h3>
              <Chars text="How fast" delay={0.1} /> <br />
              <Chars text="do you type?" delay={0.25} />
            </h3>
            <span className="go mono">
              Start test <ArrowRight />
            </span>
          </div>
        </Tile>

        <Tile as="button" type="button" className="t-5 play" tone="poly" delay={0.08} onClick={onStack} aria-label="Open the stack game">
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              Game 02 · Stack
            </span>
            <span>Tap to drop</span>
          </div>
          <Blocks />
          <div className="flex-between">
            <h3>
              <Chars text="Stack the" delay={0.1} /> <br />
              <Chars text="tech." delay={0.25} />
            </h3>
            <span className="go mono">
              Play <ArrowRight />
            </span>
          </div>
        </Tile>

        <Tile as="button" type="button" className="t-4 tb-2 play" tone="lav" onClick={onChat} aria-label="Open the chat assistant" style={{ minHeight: '13rem' }}>
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              Assistant
            </span>
            <MessageSquare size={16} />
          </div>
          <h3 style={{ fontSize: 'clamp(1.7rem, 2.4vw, 2.4rem)' }}>
            <Chars text="Ask about me." delay={0.1} />
          </h3>
          <span className="go mono">
            Projects, stack, a joke <ArrowRight />
          </span>
        </Tile>

        <Tile as="button" type="button" className="t-4 tb-2 play" delay={0.06} onClick={onToggleSound} aria-pressed={soundEnabled} style={{ minHeight: '13rem' }} data-no-sound="true">
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              Typing sounds
            </span>
            <span className={`pill ${soundEnabled ? 'on' : ''}`}>{soundEnabled ? 'On' : 'Off'}</span>
          </div>
          <h3 style={{ fontSize: 'clamp(1.7rem, 2.4vw, 2.4rem)' }}>{soundEnabled ? 'Clicky.' : 'Silent.'}</h3>
          <span className="go mono">
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} Toggle key clicks
          </span>
        </Tile>

        <Tile as="button" type="button" className="t-4 tb-2 play" tone="air" delay={0.12} onClick={onToggleTheme} style={{ minHeight: '13rem' }}>
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              Lights
            </span>
            {darkMode ? <Moon size={16} /> : <Sun size={16} />}
          </div>
          <h3 style={{ fontSize: 'clamp(1.7rem, 2.4vw, 2.4rem)' }}>{darkMode ? 'Lights on?' : 'Lights off?'}</h3>
          <span className="go mono">
            Click anywhere here <ArrowRight />
          </span>
        </Tile>
      </div>
    </section>
  );
}
