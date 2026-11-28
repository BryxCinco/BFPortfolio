import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { ArrowUpRight, Send, Check } from 'lucide-react';

import { Tile, Chars, Words, Scramble } from './motion';
import { CONTACT, SOCIALS } from './data';

const EMAILJS = { service: 'service_1111', template: 'template_yjvv0ch', key: 'lwxim5qaSvPtwlwxL' };
const SILENT = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape']);

export default function ContactBento({ soundEnabled, onTypeTick }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [err, setErr] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const tick = (e) => {
    if (soundEnabled && typeof onTypeTick === 'function' && !SILENT.has(e.key)) onTypeTick('key');
  };

  const submit = (e) => {
    e.preventDefault();
    setState('sending');
    setErr('');
    emailjs
      .send(EMAILJS.service, EMAILJS.template, { ...form, title: 'Portfolio Inquiry' }, EMAILJS.key)
      .then(() => {
        setState('sent');
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setState('idle'), 5000);
      })
      .catch((x) => {
        setState('error');
        setErr(x?.text || 'Something went wrong. You can email me directly instead.');
      });
  };

  return (
    <section id="contact" className="sec wrap" aria-label="Contact">
      <div className="bento">
        <Tile className="t-8" delay={0}>
          <div className="stack-v">
            <div className="tile-label mono">
              <span>
                <span className="dot" />
                <Scramble text="08 — Contact" />
              </span>
              <span>Usually replies within 24h</span>
            </div>
            <h2 className="cta-big display">
              <Chars text="Got an idea?" delay={0.1} />
              <br />
              <span className="serif">
                <Chars text="Let's build it." delay={0.4} />
              </span>
            </h2>
            <p className="body" style={{ maxWidth: '34rem' }}>
              <Words text="Open to full-time roles, internships and collabs. Tell me what you're working on, or just say hi. Pwede rin mag-Tagalog." delay={0.6} />
            </p>
          </div>
        </Tile>

        <Tile className="t-4" tone="lav" delay={0.08}>
          <div className="stack-v">
            <div className="tile-label mono" style={{ marginBottom: 0 }}>
              <span>
                <span className="dot" />
                Direct
              </span>
            </div>
            <div>
              <a className="contact-row" href={`mailto:${CONTACT.email}`}>
                <span>
                  <span className="mono mute" style={{ display: 'block' }}>
                    Email
                  </span>
                  <strong>{CONTACT.email}</strong>
                </span>
                <ArrowUpRight />
              </a>
              <a className="contact-row" href={`tel:${CONTACT.tel}`}>
                <span>
                  <span className="mono mute" style={{ display: 'block' }}>
                    Phone
                  </span>
                  <strong>{CONTACT.phone}</strong>
                </span>
                <ArrowUpRight />
              </a>
              <div className="contact-row">
                <span>
                  <span className="mono mute" style={{ display: 'block' }}>
                    Based in
                  </span>
                  <strong>Sta. Cruz, Manila</strong>
                </span>
              </div>
            </div>
          </div>
        </Tile>

        <Tile className="t-8" delay={0}>
          <div className="tile-label mono">
            <span>
              <span className="dot" />
              Send a message
            </span>
            <span>via EmailJS</span>
          </div>
          <form className="form" onSubmit={submit}>
            <div className="field">
              <label className="mono" htmlFor="c-name">
                Name
              </label>
              <input id="c-name" required value={form.name} onChange={set('name')} onKeyDown={tick} placeholder="Juan dela Cruz" autoComplete="name" />
            </div>
            <div className="field">
              <label className="mono" htmlFor="c-email">
                Email
              </label>
              <input id="c-email" type="email" required value={form.email} onChange={set('email')} onKeyDown={tick} placeholder="juan@email.com" autoComplete="email" />
            </div>
            <div className="field">
              <label className="mono" htmlFor="c-msg">
                Message
              </label>
              <textarea id="c-msg" required rows={4} value={form.message} onChange={set('message')} onKeyDown={tick} placeholder="Hi Brian, I'm building…" />
            </div>
            <div className="form-foot">
              <span className="form-msg mute" role="status" aria-live="polite">
                {state === 'sent' && 'Sent. Salamat! I will get back to you soon.'}
                {state === 'error' && err}
                {(state === 'idle' || state === 'sending') && 'All fields are required.'}
              </span>
              <button type="submit" className="btn solid" disabled={state === 'sending'}>
                {state === 'sent' ? <Check /> : <Send />}
                {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent' : 'Send message'}
              </button>
            </div>
          </form>
        </Tile>

        <Tile className="t-4" tone="yale" delay={0.08}>
          <div className="stack-v">
            <div className="tile-label mono" style={{ marginBottom: 0 }}>
              <span>
                <span className="dot" />
                Elsewhere
              </span>
            </div>
            <div>
              {SOCIALS.map((s) => (
                <a key={s.name} className="contact-row" href={s.url} target="_blank" rel="noopener noreferrer">
                  <strong>{s.name}</strong>
                  <ArrowUpRight />
                </a>
              ))}
            </div>
          </div>
        </Tile>
      </div>
    </section>
  );
}
