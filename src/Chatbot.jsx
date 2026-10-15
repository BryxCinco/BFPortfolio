import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import {
  X,
  ArrowUp,
  Mic,
  Square,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowUpRight,
  ArrowRight,
  Mail,
  Phone,
  Rocket,
  Layers,
  Award,
  User,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getPalette, cssVars } from './theme';
import { getReply, CONTACT } from './ChatBrain';
import { websites } from './Project';
import { stackCategories } from './Stacks';
import { featuredCerts, CERT_TOTAL } from './Certifications';
import brian1 from './assets/Brian1.png';
import brian2 from './assets/Brian2.png';
import brian3 from './assets/Brian3.png';
import brian4 from './assets/Brian4.png';
import brian5 from './assets/Brian5.png';

// ============================================================================
// CHATBOT.JSX — the "Ask Me" assistant. Answers stream in and are read out
// loud (browser speech, toggle in the header), the mic sends what you say,
// and answers can carry rich cards: project screenshots with live links, the
// stack as logos, certificate images, a profile card, contact buttons, a
// photo strip, or a Wikipedia summary for general questions. All the
// question-matching lives in ChatBrain.js.
// ============================================================================

const QUESTION_BANK = [
  'Who is Brian?',
  'What projects have you built?',
  'What is your tech stack?',
  'What certificates do you have?',
  'Why should we hire you?',
  'How can I contact Brian?',
  'Tell me about TIDE',
  'Tell me about Poopipoo',
  'Tell me about Neo Chess XD',
  'Which AI tools do you use?',
  'What design tools do you use?',
  'What backend tools do you use?',
  'Do you build mobile apps?',
  'What are your hobbies?',
  'What is your expected salary?',
  'What work modality do you prefer?',
  'What work locations do you prefer?',
  'What days do you work?',
  'How do you handle complex technical problems?',
  'Where do you see yourself in 2-3 years?',
  'What is your dream job?',
  'Who is José Rizal?',
  'What is machine learning?',
  "What's 25 * 48?",
  "What's the weather?",
  'Tell me a joke',
];

const STARTERS = [
  { label: 'Projects', q: 'What projects have you built?', Icon: Rocket },
  { label: 'Tech stack', q: 'What is your tech stack?', Icon: Layers },
  { label: 'Certificates', q: 'What certificates do you have?', Icon: Award },
  { label: 'About Brian', q: 'Who is Brian?', Icon: User },
  { label: 'Contact', q: 'How can I contact Brian?', Icon: Mail },
  { label: 'Ask anything', q: 'What is machine learning?', Icon: BookOpen },
];

const VOICE_KEY = 'bp_chat_voice';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// ============================================================================
// VOICE — browser text-to-speech with a smooth female voice. Picks the most
// natural female English voice the browser has, reads the answer in a few
// long chunks (not sentence by sentence, which made it sound choppy), and
// keeps Chrome's online voices from going silent on longer answers.
// ============================================================================

// best first: neural "Natural" voices (Edge), then good built-in ones
const FEMALE_VOICES = [
  /aria.*natural/i, /jenny.*natural/i, /ava.*natural/i, /emma.*natural/i, /michelle.*natural/i,
  /libby.*natural/i, /sonia.*natural/i, /natasha.*natural/i, /clara.*natural/i,
  /google us english/i, /samantha/i, /ava/i, /allison/i, /susan/i, /karen/i, /moira/i, /tessa/i,
  /victoria/i, /zira/i, /hazel/i, /google uk english female/i, /female/i,
];
const MALE_HINTS = /(guy|davis|tony|jason|brian|andrew|christopher|eric|roger|steffan|ryan|thomas|william|david|mark|george|james|daniel|alex|fred|male)/i;

const pickVoice = () => {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  const english = voices.filter((v) => /^en/i.test(v.lang));
  for (const re of FEMALE_VOICES) {
    const v = english.find((x) => re.test(x.name) && !MALE_HINTS.test(x.name.replace(re, '')));
    if (v) return v;
  }
  return english.find((v) => !MALE_HINTS.test(v.name)) ?? english[0] ?? null;
};

const speakable = (text) =>
  text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/₱\s?([\d,]+)/g, '$1 pesos')
    .replace(/\s+/g, ' ')
    .trim();

// sentences merged into chunks of up to ~230 characters, so most answers are
// read in one or two continuous breaths
const chunksOf = (text, max = 230) => {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
  const out = [];
  let cur = '';
  for (const s of sentences) {
    if (cur && (cur + s).length > max) {
      out.push(cur.trim());
      cur = s;
    } else {
      cur += s;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};

function useVoice() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [enabled, setEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(VOICE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [speakingId, setSpeakingId] = useState(null);
  const voiceRef = useRef(null);
  const runRef = useRef(0);
  const keepAliveRef = useRef(0);

  useEffect(() => {
    if (!supported) return undefined;
    const load = () => {
      voiceRef.current = pickVoice();
    };
    load();
    window.speechSynthesis.addEventListener?.('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', load);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    runRef.current += 1;
    clearInterval(keepAliveRef.current);
    window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, [supported]);

  const speak = useCallback(
    (id, text) => {
      if (!supported) return;
      stop();
      const run = runRef.current;
      const parts = chunksOf(speakable(text));
      if (!parts.length) return;
      // voices can load late; pick again so the first answer isn't a fallback voice
      if (!voiceRef.current) voiceRef.current = pickVoice();
      const voice = voiceRef.current;
      setSpeakingId(id);

      // Chrome's online voices stop after ~15s unless nudged
      clearInterval(keepAliveRef.current);
      if (voice && !voice.localService && /google/i.test(voice.name)) {
        keepAliveRef.current = setInterval(() => {
          if (!window.speechSynthesis.speaking) return clearInterval(keepAliveRef.current);
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }, 9000);
      }

      const done = () => {
        if (runRef.current !== run) return;
        clearInterval(keepAliveRef.current);
        setSpeakingId(null);
      };
      parts.forEach((part, i) => {
        const u = new SpeechSynthesisUtterance(part);
        if (voice) u.voice = voice;
        u.lang = voice?.lang ?? 'en-US';
        u.rate = 1;
        u.pitch = 1.08;
        u.volume = 1;
        if (i === parts.length - 1) u.onend = done;
        u.onerror = done;
        window.speechSynthesis.speak(u);
      });
    },
    [supported, stop]
  );

  const toggle = useCallback(() => {
    setEnabled((on) => {
      const next = !on;
      try {
        localStorage.setItem(VOICE_KEY, String(next));
      } catch {
        /* storage may be unavailable */
      }
      if (!next) stop();
      return next;
    });
  }, [stop]);

  useEffect(() => () => supported && window.speechSynthesis.cancel(), [supported]);

  return { supported, enabled, toggle, speak, stop, speakingId };
}

// ============================================================================
// STYLES — the overlay sits inside the site's `.dark/.light` wrapper, whose
// `p, span { color; font-weight: !important }` rules would flatten
// everything, so text resets to inherit and color comes from cb- classes.
// ============================================================================

const ChatStyles = () => (
  <style>{`
    #claude-chat-overlay :is(h1,h2,h3,h4,p,span) { color: inherit !important; font-weight: inherit !important; }
    #claude-chat-overlay .cb-acc { color: var(--acc) !important; }
    #claude-chat-overlay .cb-on { color: var(--acc-ink) !important; }
    #claude-chat-overlay .cb-dark { color: #1B1B2A !important; }
    #claude-chat-overlay .cb-white { color: #fff !important; }
    #claude-chat-overlay .font-medium { font-weight: 500 !important; }
    #claude-chat-overlay .font-semibold { font-weight: 600 !important; }
    #claude-chat-overlay .font-bold { font-weight: 700 !important; }
    #claude-chat-overlay .font-black { font-weight: 900 !important; }

    @keyframes cb-spin { to { transform: rotate(360deg); } }
    @keyframes cb-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    @keyframes cb-bar { 0%,100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
    @keyframes cb-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.9); opacity: 0; } }
    .cb-orb-spin { animation: cb-spin 6s linear infinite; }
    .cb-orb-fast { animation: cb-spin 1.4s linear infinite; }
    .cb-breathe { animation: cb-breathe 1.1s ease-in-out infinite; }
    .cb-bar { animation: cb-bar 0.8s ease-in-out infinite; transform-origin: 50% 50%; }
    .cb-ring { animation: cb-ring 1.4s ease-out infinite; }
    .cb-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
    .cb-scroll::-webkit-scrollbar-thumb { background: var(--acc-line); border-radius: 99px; }
    @media (prefers-reduced-motion: reduce) {
      .cb-orb-spin, .cb-orb-fast, .cb-breathe, .cb-bar, .cb-ring { animation: none !important; }
    }
  `}</style>
);

// the assistant's face: a spinning gradient orb that reacts to its state
const Orb = ({ state = 'idle', size = 40 }) => (
  <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
    {(state === 'speaking' || state === 'listening') && (
      <span className="cb-ring absolute inset-0 rounded-full" style={{ background: state === 'listening' ? '#F43F5E' : 'var(--acc)' }} />
    )}
    <span
      className={`absolute inset-0 rounded-full ${state === 'thinking' ? 'cb-orb-fast' : 'cb-orb-spin'}`}
      style={{ background: 'conic-gradient(from 0deg, var(--acc), var(--acc2), #FF007A, var(--acc))' }}
    />
    <span
      className={`absolute inset-[3px] rounded-full flex items-center justify-center ${state === 'thinking' ? 'cb-breathe' : ''}`}
      style={{ background: 'var(--orb-core)' }}
    >
      {state === 'speaking' ? (
        <span className="flex items-center gap-[2px] h-1/2">
          {[0, 0.15, 0.3, 0.1].map((d, i) => (
            <span key={i} className="cb-bar w-[3px] h-full rounded-full" style={{ background: 'var(--acc)', animationDelay: `${d}s` }} />
          ))}
        </span>
      ) : (
        <Sparkles size={size * 0.42} className="text-[color:var(--acc)]" />
      )}
    </span>
  </span>
);

// ============================================================================
// RICH CARDS
// ============================================================================

const cardBase = 'rounded-2xl border border-[color:var(--line)] overflow-hidden';
const cardStyle = { background: 'var(--card)' };

const LinkPill = ({ href, children, solid = false }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={(e) => e.stopPropagation()}
    className="cursor-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.6875rem] font-black uppercase tracking-widest transition-transform hover:-translate-y-0.5"
    style={solid ? { background: 'var(--acc)', color: 'var(--acc-ink)' } : { border: '1px solid var(--line)', color: 'var(--ink)' }}
  >
    {children}
  </a>
);

const ProjectCard = ({ p, onAsk }) => {
  const live = p.url && p.url !== '#';
  return (
    <div className={`${cardBase} flex flex-col`} style={cardStyle}>
      <a
        href={live ? p.url : undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative block aspect-[16/10] overflow-hidden bg-black/10 ${live ? 'cursor-target group' : 'pointer-events-none'}`}
      >
        <img src={p.image} alt={`${p.name} screenshot`} loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
        {live && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-[0.5625rem] font-black uppercase tracking-widest">
            <span className="cb-white">● Live</span>
          </span>
        )}
      </a>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="cb-acc text-[0.625rem] font-black uppercase tracking-[0.2em]">{p.tag}</p>
        <p className="text-lg font-black leading-tight">{p.name}</p>
        <p className="text-sm font-medium opacity-70 line-clamp-2">{p.desc}</p>
        <div className="mt-auto pt-2 flex flex-wrap gap-2">
          {live && <LinkPill href={p.url} solid>Open <ArrowUpRight size={12} /></LinkPill>}
          <button
            onClick={() => onAsk(`Tell me about ${p.name}`)}
            className="cursor-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.6875rem] font-black uppercase tracking-widest border border-[color:var(--line)] transition-transform hover:-translate-y-0.5"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectsAttach = ({ onAsk }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {websites.map((p) => (
      <ProjectCard key={p.name} p={p} onAsk={onAsk} />
    ))}
  </div>
);

const ProjectAttach = ({ name, onNavigate }) => {
  const p = websites.find((w) => w.name === name);
  if (!p) return null;
  const live = p.url && p.url !== '#';
  return (
    <div className={cardBase} style={cardStyle}>
      <a href={live ? p.url : undefined} target="_blank" rel="noopener noreferrer" className={`block aspect-[16/9] overflow-hidden bg-black/10 ${live ? 'cursor-target' : 'pointer-events-none'}`}>
        <img src={p.image} alt={`${p.name} screenshot`} className="w-full h-full object-cover object-top" />
      </a>
      <div className="p-5">
        <p className="cb-acc text-[0.625rem] font-black uppercase tracking-[0.2em]">{p.subtitle}</p>
        <p className="text-2xl font-black mt-1">{p.name}</p>
        <ul className="mt-3 space-y-1.5">
          {p.highlights.map((h) => (
            <li key={h} className="flex gap-2 text-sm font-medium opacity-80">
              <span className="cb-acc">✦</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.stack.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-full text-[0.625rem] font-black uppercase tracking-widest" style={{ background: 'var(--acc-soft)' }}>
              <span className="cb-acc">{s}</span>
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {live && <LinkPill href={p.url} solid>Open live site <ArrowUpRight size={12} /></LinkPill>}
          <button
            onClick={() => onNavigate('projects')}
            className="cursor-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.6875rem] font-black uppercase tracking-widest border border-[color:var(--line)]"
          >
            See in Projects <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ToolChip = ({ item }) => {
  const [failed, setFailed] = useState(false);
  return (
    <span className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-[color:var(--line)]" style={{ background: 'var(--card)' }}>
      <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
        {item.logo && !failed ? (
          <img src={item.logo} alt="" loading="lazy" onError={() => setFailed(true)} className="w-4 h-4 object-contain" />
        ) : (
          <span className="cb-dark text-[0.5rem] font-black">{item.glyph ?? item.name.slice(0, 2)}</span>
        )}
      </span>
      <span className="text-xs font-bold">{item.name}</span>
    </span>
  );
};

const StackAttach = ({ category }) => {
  const groups = category ? stackCategories.filter((c) => c.id === category) : stackCategories;
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.id}>
          <p className="flex items-center gap-2 text-[0.625rem] font-black uppercase tracking-[0.25em] opacity-70 mb-2">
            <span className="w-2 h-2 rounded-full" style={{ background: g.color }} />
            <span>{g.title}</span>
            <span className="opacity-50">· {g.items.length}</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {g.items.map((it) => (
              <ToolChip key={it.name} item={it} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const CertsAttach = ({ onPreview, onNavigate }) => (
  <div>
    <div className="cb-scroll flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
      {featuredCerts.map((c) => (
        <button
          key={c.id}
          onClick={() => onPreview(c.img)}
          className={`cursor-target ${cardBase} snap-start shrink-0 w-56 text-left transition-transform hover:-translate-y-1`}
          style={cardStyle}
        >
          <div className="aspect-[4/3] bg-white p-2">
            <img src={c.img} alt={c.title} loading="lazy" className="w-full h-full object-contain" />
          </div>
          <div className="p-3">
            <p className="text-sm font-black leading-snug line-clamp-2">{c.title}</p>
            <p className="text-[0.6875rem] font-medium opacity-60 mt-1 line-clamp-1">{c.issuer}</p>
          </div>
        </button>
      ))}
    </div>
    <button onClick={() => onNavigate('certificates')} className="cursor-target mt-2 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest">
      <span className="cb-acc">See all {CERT_TOTAL} certificates</span> <ArrowRight size={13} className="text-[color:var(--acc)]" />
    </button>
  </div>
);

const ProfileAttach = () => (
  <div className={`${cardBase} flex flex-col sm:flex-row`} style={cardStyle}>
    <div className="sm:w-44 shrink-0 bg-neutral-200">
      <img src={brian1} alt="Brian Paul Francisco" className="w-full h-56 sm:h-full object-cover object-top" />
    </div>
    <div className="p-5 flex-1">
      <p className="text-xl font-black">Brian Paul Francisco</p>
      <p className="cb-acc text-xs font-black uppercase tracking-[0.2em] mt-1">Full-stack developer · UI/UX</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          ['1.25', 'GWA'],
          ['BSIT', 'National Teachers College'],
          ['Intern', 'Grandline Maritime'],
          ['Manila', 'Philippines'],
        ].map(([v, l]) => (
          <div key={l} className="rounded-xl border border-[color:var(--line)] px-3 py-2">
            <p className="cb-acc text-base font-black leading-none">{v}</p>
            <p className="text-[0.625rem] font-bold opacity-60 mt-1 leading-tight">{l}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContactAttach = ({ onNavigate }) => (
  <div className={`${cardBase} p-4`} style={cardStyle}>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <a href={`mailto:${CONTACT.email}`} className="cursor-target flex items-center gap-3 p-3 rounded-xl border border-[color:var(--line)] transition-colors hover:border-[color:var(--acc)]">
        <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--acc-soft)' }}>
          <Mail size={16} className="text-[color:var(--acc)]" />
        </span>
        <span className="min-w-0">
          <span className="block text-[0.625rem] font-black uppercase tracking-widest opacity-60">Email</span>
          <span className="block text-sm font-bold truncate">{CONTACT.email}</span>
        </span>
      </a>
      <a href={`tel:${CONTACT.phone}`} className="cursor-target flex items-center gap-3 p-3 rounded-xl border border-[color:var(--line)] transition-colors hover:border-[color:var(--acc)]">
        <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--acc-soft)' }}>
          <Phone size={16} className="text-[color:var(--acc)]" />
        </span>
        <span>
          <span className="block text-[0.625rem] font-black uppercase tracking-widest opacity-60">Phone</span>
          <span className="block text-sm font-bold">{CONTACT.phone}</span>
        </span>
      </a>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      <LinkPill href="https://github.com/BryxCinco">GitHub <ArrowUpRight size={12} /></LinkPill>
      <LinkPill href="https://www.linkedin.com/in/brianfrancisco10/">LinkedIn <ArrowUpRight size={12} /></LinkPill>
      <LinkPill href="https://www.facebook.com/Bryx.Francisco111/">Facebook <ArrowUpRight size={12} /></LinkPill>
      <button
        onClick={() => onNavigate('contact')}
        className="cursor-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.6875rem] font-black uppercase tracking-widest"
        style={{ background: 'var(--acc)', color: 'var(--acc-ink)' }}
      >
        <span className="cb-on">Send a message</span> <ArrowRight size={12} />
      </button>
    </div>
  </div>
);

const GalleryAttach = ({ onPreview }) => (
  <div className="cb-scroll flex gap-2 overflow-x-auto pb-2">
    {[brian2, brian3, brian4, brian5].map((src, i) => (
      <button
        key={src}
        onClick={() => onPreview(src)}
        className="cursor-target shrink-0 w-32 sm:w-36 aspect-[3/4] rounded-xl overflow-hidden bg-white p-1.5 pb-5 shadow-md transition-transform hover:-translate-y-1"
        style={{ transform: `rotate(${[-2, 1.5, -1, 2][i]}deg)` }}
      >
        <img src={src} alt="Brian outside of code" loading="lazy" className="w-full h-full object-cover rounded-md" />
      </button>
    ))}
  </div>
);

const WikiAttach = ({ title, description, thumb, url }) => (
  <a href={url} target="_blank" rel="noopener noreferrer" className={`cursor-target ${cardBase} flex items-stretch transition-transform hover:-translate-y-0.5`} style={cardStyle}>
    {thumb && (
      <span className="w-24 sm:w-28 shrink-0 bg-white">
        <img src={thumb} alt={title} className="w-full h-full object-cover" />
      </span>
    )}
    <span className="p-4 flex flex-col justify-center min-w-0">
      <span className="block text-base font-black truncate">{title}</span>
      {description && <span className="block text-xs font-medium opacity-60 mt-0.5 line-clamp-2">{description}</span>}
      <span className="cb-acc mt-2 inline-flex items-center gap-1 text-[0.625rem] font-black uppercase tracking-widest">
        <BookOpen size={12} /> Read on Wikipedia <ArrowUpRight size={11} />
      </span>
    </span>
  </a>
);

const Attachment = ({ attach, onAsk, onNavigate, onPreview }) => {
  switch (attach.type) {
    case 'projects':
      return <ProjectsAttach onAsk={onAsk} />;
    case 'project':
      return <ProjectAttach name={attach.name} onNavigate={onNavigate} />;
    case 'stack':
      return <StackAttach category={attach.category} />;
    case 'certs':
      return <CertsAttach onPreview={onPreview} onNavigate={onNavigate} />;
    case 'profile':
      return <ProfileAttach />;
    case 'contact':
      return <ContactAttach onNavigate={onNavigate} />;
    case 'gallery':
      return <GalleryAttach onPreview={onPreview} />;
    case 'wiki':
      return <WikiAttach {...attach} />;
    default:
      return null;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Chatbot = forwardRef(({ darkMode, soundEnabled = true, onTypeTick, onNavigate }, ref) => {
  const p = getPalette(darkMode);
  const voice = useVoice();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [preview, setPreview] = useState(null);

  // speech-to-text
  const [isDictating, setIsDictating] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [micError, setMicError] = useState('');

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const sendRef = useRef(null);
  const previewRef = useRef(null);
  previewRef.current = preview;

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  // lock page scroll; Esc closes (or closes the image preview first)
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (previewRef.current) setPreview(null);
      else setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    setSuggested(shuffle(QUESTION_BANK).slice(0, 4));
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [isOpen]);

  // closing stops typing and talking
  useEffect(() => {
    if (!isOpen) {
      clearInterval(streamRef.current);
      voice.stop();
      recognitionRef.current?.abort?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // mic: what you say is sent straight away, like talking to it
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || (typeof window.isSecureContext === 'boolean' && !window.isSecureContext)) {
      setMicSupported(false);
      return undefined;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (event) => {
      const res = event.results[event.results.length - 1];
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join(' ');
      setInput(transcript);
      if (res.isFinal) {
        setIsDictating(false);
        sendRef.current?.(transcript);
      }
    };
    rec.onend = () => setIsDictating(false);
    rec.onerror = (event) => {
      setIsDictating(false);
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        setMicError('Mic is blocked — allow microphone access for this site, then try again.');
      } else if (event?.error === 'network') {
        setMicError('Voice input needs an internet connection.');
      } else if (event?.error && event.error !== 'no-speech' && event.error !== 'aborted') {
        setMicError(`Voice input hit a snag (${event.error}). Try again.`);
      }
    };
    recognitionRef.current = rec;
    return () => rec.abort?.();
  }, []);

  const toggleDictation = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isDictating) {
      rec.stop();
      setIsDictating(false);
      return;
    }
    setMicError('');
    voice.stop();
    try {
      setInput('');
      rec.start();
      setIsDictating(true);
    } catch (err) {
      if (err?.name !== 'InvalidStateError') {
        setIsDictating(false);
        setMicError('Could not start the mic. Try again.');
      }
    }
  };

  const SILENT_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape']);
  const handleTypingKeydown = (e) => {
    if (!soundEnabled || typeof onTypeTick !== 'function' || SILENT_KEYS.has(e.key)) return;
    onTypeTick('key');
  };

  // keep the newest message in view
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isWaiting]);

  // reveal the answer progressively; cards show once the text is done
  const streamReply = (id, fullText) => {
    clearInterval(streamRef.current);
    let i = 0;
    let tick = 0;
    streamRef.current = setInterval(() => {
      i += 3;
      tick += 1;
      if (soundEnabled && typeof onTypeTick === 'function' && tick % 3 === 0) onTypeTick('type');
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: fullText.slice(0, i), streaming: i < fullText.length } : m)));
      if (i >= fullText.length) clearInterval(streamRef.current);
    }, 16);
  };

  const send = async (text) => {
    const clean = text?.trim();
    if (!clean) return;
    voice.stop();
    clearInterval(streamRef.current);
    setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, text: m.reply.text, streaming: false } : m)).concat({ id: Date.now(), text: clean, sender: 'user' }));
    setInput('');
    setIsWaiting(true);

    const started = performance.now();
    const reply = await getReply(clean);
    // a short beat so it feels like it's thinking, without making you wait
    const wait = Math.max(0, 550 - (performance.now() - started));
    setTimeout(() => {
      setIsWaiting(false);
      const id = Date.now() + 1;
      setMessages((prev) => [...prev, { id, sender: 'bot', text: '', reply, streaming: true }]);
      streamReply(id, reply.text);
      if (voice.enabled) voice.speak(id, reply.text);
    }, wait);
  };
  sendRef.current = send;

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    send(input);
  };

  const go = (section) => {
    setIsOpen(false);
    onNavigate?.(section);
  };

  const resetChat = () => {
    voice.stop();
    clearInterval(streamRef.current);
    setMessages([]);
    setIsWaiting(false);
    setSuggested(shuffle(QUESTION_BANK).slice(0, 4));
    inputRef.current?.focus();
  };

  const typed = input.trim().toLowerCase();
  const typeahead = typed && !isDictating ? QUESTION_BANK.filter((q) => q.toLowerCase().includes(typed)).slice(0, 4) : [];

  const lastBot = [...messages].reverse().find((m) => m.sender === 'bot');
  const orbState = isDictating ? 'listening' : isWaiting ? 'thinking' : voice.speakingId ? 'speaking' : 'idle';
  const status = { listening: 'listening…', thinking: 'thinking…', speaking: 'speaking…', idle: 'online' }[orbState];

  const vars = {
    ...cssVars(p),
    '--card': darkMode ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
    '--orb-core': darkMode ? '#141424' : '#FFFFFF',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="claude-chat-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-[1000] flex flex-col font-sans"
          style={{ ...vars, background: darkMode ? '#0E0E1A' : '#FFFDF6', color: p.ink }}
        >
          <ChatStyles />
          {/* soft backdrop glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(60% 50% at 50% 0%, ${darkMode ? 'rgba(0,255,179,0.08)' : 'rgba(255,0,122,0.07)'}, transparent 70%)` }}
          />

          {/* header */}
          <div className="relative shrink-0 border-b border-[color:var(--line)]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="max-w-3xl mx-auto w-full flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4">
              <Orb state={orbState} size={42} />
              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-lg font-black leading-tight truncate">Brian&apos;s AI</p>
                <p className="flex items-center gap-1.5 text-xs font-bold opacity-60">
                  <span className={`w-1.5 h-1.5 rounded-full ${orbState === 'listening' ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                  <span>{status}</span>
                </p>
              </div>
              {voice.supported && (
                <button
                  onClick={voice.toggle}
                  aria-pressed={voice.enabled}
                  title={voice.enabled ? 'Voice on — click to mute' : 'Voice off — click to let me talk'}
                  className="cursor-target inline-flex items-center gap-2 h-10 px-3 sm:px-4 rounded-full border text-[0.6875rem] font-black uppercase tracking-widest transition-colors"
                  style={
                    voice.enabled
                      ? { background: 'var(--acc-soft)', borderColor: 'var(--acc-line)', color: 'var(--acc)' }
                      : { borderColor: 'var(--line)', color: 'var(--ink)' }
                  }
                >
                  {voice.enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <span className={`hidden sm:inline ${voice.enabled ? 'cb-acc' : ''}`}>{voice.enabled ? 'Voice on' : 'Voice off'}</span>
                </button>
              )}
              {messages.length > 0 && (
                <button
                  onClick={resetChat}
                  aria-label="New chat"
                  title="New chat"
                  className="cursor-target w-10 h-10 rounded-full border border-[color:var(--line)] flex items-center justify-center transition-transform hover:-rotate-90"
                >
                  <RotateCcw size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="cursor-target w-10 h-10 rounded-full border border-[color:var(--line)] flex items-center justify-center transition-transform hover:rotate-90"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* conversation */}
          <div ref={scrollRef} className="cb-scroll relative flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6">
            <div className="max-w-3xl mx-auto w-full min-h-full flex flex-col justify-end gap-6 py-6 sm:py-8">
              {messages.length === 0 && !isWaiting && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 my-auto">
                  <div className="flex flex-col items-center text-center gap-4">
                    <Orb state="idle" size={72} />
                    <p className="text-3xl sm:text-4xl font-black tracking-tight">Hey! I&apos;m Brian&apos;s AI.</p>
                    <p className="text-sm sm:text-base font-medium opacity-60 max-w-md">
                      Ask me about his projects, stack and certificates — I&apos;ll show you, not just tell you. I can also answer general questions, and I talk back{voice.supported ? '' : ' (in browsers that support it)'}.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STARTERS.map(({ label, q, Icon }, i) => (
                      <motion.button
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        onClick={() => send(q)}
                        className="cursor-target group text-left p-4 rounded-2xl border border-[color:var(--line)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--acc-line)]"
                        style={{ background: 'var(--card)' }}
                      >
                        <Icon size={18} className="text-[color:var(--acc)] transition-transform group-hover:-rotate-12" />
                        <p className="mt-3 text-sm font-black">{label}</p>
                        <p className="text-xs font-medium opacity-55 mt-0.5 line-clamp-1">{q}</p>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggested.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="cursor-target px-3.5 py-1.5 rounded-full border border-[color:var(--line)] text-xs sm:text-sm font-semibold transition-colors hover:border-[color:var(--acc-line)]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((m) =>
                m.sender === 'user' ? (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                    <span
                      className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md text-sm sm:text-base font-semibold"
                      style={{ background: 'var(--acc)', color: 'var(--acc-ink)' }}
                    >
                      <span className="cb-on">{m.text}</span>
                    </span>
                  </motion.div>
                ) : (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="pt-1">
                      <Orb state={voice.speakingId === m.id ? 'speaking' : 'idle'} size={30} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      <p className="text-base sm:text-lg font-medium leading-relaxed">
                        {m.text}
                        {m.streaming && <span className="inline-block w-[2px] h-[1em] ml-1 align-middle animate-pulse" style={{ background: 'var(--acc)' }} />}
                      </p>

                      {!m.streaming && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
                          {m.reply?.attach && <Attachment attach={m.reply.attach} onAsk={send} onNavigate={go} onPreview={setPreview} />}

                          <div className="flex flex-wrap items-center gap-2">
                            {voice.supported && (
                              <button
                                onClick={() => (voice.speakingId === m.id ? voice.stop() : voice.speak(m.id, m.reply.text))}
                                aria-label={voice.speakingId === m.id ? 'Stop reading' : 'Read aloud'}
                                title={voice.speakingId === m.id ? 'Stop' : 'Read aloud'}
                                className="cursor-target w-8 h-8 rounded-full border border-[color:var(--line)] flex items-center justify-center opacity-70 hover:opacity-100"
                              >
                                {voice.speakingId === m.id ? <Square size={12} /> : <Volume2 size={14} />}
                              </button>
                            )}
                            {m.reply?.actions?.map((a) => (
                              <button
                                key={a.label}
                                onClick={() => (a.nav ? go(a.nav) : window.open(a.href, '_blank', 'noopener,noreferrer'))}
                                className="cursor-target inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.6875rem] font-black uppercase tracking-widest"
                                style={{ background: 'var(--acc)', color: 'var(--acc-ink)' }}
                              >
                                <span className="cb-on">{a.label}</span> <ArrowRight size={12} />
                              </button>
                            ))}
                          </div>

                          {m === lastBot && m.reply?.chips?.length > 0 && !isWaiting && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {m.reply.chips.map((c) => (
                                <button
                                  key={c}
                                  onClick={() => send(c === 'Another joke' ? 'Tell me a joke' : c)}
                                  className="cursor-target px-3.5 py-1.5 rounded-full border border-[color:var(--line)] text-xs sm:text-sm font-semibold transition-colors hover:border-[color:var(--acc-line)]"
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )
              )}

              {isWaiting && (
                <div className="flex items-center gap-3">
                  <Orb state="thinking" size={30} />
                  <span className="flex gap-1">
                    {[-0.3, -0.15, 0].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--acc)', animationDelay: `${d}s` }} />
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* input */}
          <form onSubmit={handleSubmit} className="relative shrink-0 px-4 sm:px-6 pt-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
            <div className="max-w-3xl mx-auto w-full relative">
              <AnimatePresence>
                {inputFocused && typeahead.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 right-0 mb-2 flex flex-col gap-0.5 rounded-2xl border border-[color:var(--line)] p-1.5 shadow-xl"
                    style={{ background: darkMode ? '#17172A' : '#FFFFFF' }}
                  >
                    {typeahead.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => send(q)}
                        className="cursor-target text-left px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-[color:var(--acc-soft)]"
                      >
                        {q}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className="flex items-center gap-2 pl-5 pr-2 py-2 rounded-full border transition-colors"
                style={{
                  background: 'var(--card)',
                  borderColor: isDictating ? '#F43F5E' : inputFocused ? 'var(--acc-line)' : 'var(--line)',
                  boxShadow: inputFocused ? '0 10px 30px -12px var(--acc-glow)' : 'none',
                }}
              >
                {isDictating && (
                  <span className="flex items-center gap-[3px] h-5 shrink-0" aria-hidden="true">
                    {[0, 0.2, 0.1, 0.3, 0.15].map((d, i) => (
                      <span key={i} className="cb-bar w-[3px] h-full rounded-full bg-rose-500" style={{ animationDelay: `${d}s` }} />
                    ))}
                  </span>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleTypingKeydown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={micError || (isDictating ? 'Listening… just talk' : 'Ask about projects, stack, anything…')}
                  aria-label="Message"
                  className="flex-1 min-w-0 bg-transparent outline-none text-base sm:text-lg font-medium placeholder:opacity-40"
                  style={{ color: 'var(--ink)' }}
                />
                {micSupported && (
                  <button
                    type="button"
                    onClick={toggleDictation}
                    aria-label={isDictating ? 'Stop listening' : 'Speak your question'}
                    title={isDictating ? 'Stop listening' : 'Speak your question'}
                    className={`cursor-target shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isDictating ? 'bg-rose-500 text-white' : 'hover:bg-[color:var(--acc-soft)]'}`}
                  >
                    {isDictating ? <Square size={16} /> : <Mic size={19} />}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="cursor-target shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                  style={{ background: 'var(--acc)', color: 'var(--acc-ink)' }}
                >
                  <ArrowUp size={20} strokeWidth={2.6} />
                </button>
              </div>
              <p className="hidden sm:block mt-2 text-center text-[0.625rem] font-bold uppercase tracking-[0.2em] opacity-40">
                Esc to close · answers about Brian are from his portfolio, general ones from Wikipedia
              </p>
            </div>
          </form>

          {/* image preview */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-black/80"
                onClick={() => setPreview(null)}
              >
                <motion.img
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-[85vh] rounded-xl shadow-2xl bg-white"
                />
                <button aria-label="Close preview" className="cursor-target absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <X size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

Chatbot.displayName = 'Chatbot';

export default Chatbot;
