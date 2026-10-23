import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Code2,
  Cpu,
  Globe,
  ShieldCheck,
  Briefcase,
  MapPin,
  Star,
  Layers,
  History,
  Smartphone,
  GraduationCap,
  Award,
  Sparkles,
  ArrowUpRight,
  Camera,
} from 'lucide-react';

import { rgba, getPalette, cssVars } from './theme';
import { HandStyles, HandNote, Doodle, Tape, Sticker } from './HandTouch';

// Assets - Profiles
import brian1 from './assets/Brian1.png';
import InstagramProfile from './assets/InstagramProfile.png';
import FacebookProfile from './assets/FacebookProfile.png';
import LinkedinProfile from './assets/LinkedinProfile.png';

// Assets - Logos
import InstagramLogo from './assets/InstagramLogo.png';
import FacebookLogo from './assets/FacebookLogo.png';
import LinkedInLogo from './assets/LinkedInLogo.png';

// ============================================================================
// DATA
// ============================================================================

const experiences = [
  {
    role: 'IT Intern',
    company: 'Grandline Maritime Inc.',
    period: '2026 - Present',
    desc: 'Developing secure maritime Training Management Systems and modernizing web interfaces.',
    skills: ['React', 'PHP', 'SQL'],
  },
  {
    role: 'Full-Stack Developer (Solo Projects)',
    company: 'Personal & Academic Work',
    period: '2025 - 2026',
    desc: 'Built and deployed TIDE, Poopipoo, Neo Chess XD and Snapzy — plus e-commerce and logistics systems like SweepXpress.',
    skills: ['React', 'Next.js', 'Expo'],
  },
];

const academicTimeline = [
  {
    year: '4th Year',
    title: 'Professional Mastery',
    period: '2025 - 2026',
    project: 'Maritime LMS & Chess XD',
    desc: 'Developed a secure, anti-screenshot learning portal for maritime students. Currently finishing an IT internship.',
    achievement: 'Completed introductory training in Python essentials and backend concepts through DICT programs.',
    Icon: ShieldCheck,
  },
  {
    year: '3rd Year',
    title: 'Full-Stack Expansion',
    period: '2024 - 2025',
    project: 'SweepXpress & Soundlify',
    desc: 'Engineered a real-time logistics system and a modern music streaming interface using React and Tailwind.',
    achievement: 'Web development fundamentals, documentation, and practical IT operations.',
    Icon: Layers,
  },
  {
    year: '2nd Year',
    title: 'Systems & Databases',
    period: '2023 - 2024',
    project: 'Dough Re Mi (E-commerce)',
    desc: 'Built a full-stack bakery system using PHP and MySQL, practicing database normalization and CRUD operations.',
    achievement: 'Maintained steady academic progress across major IT coursework.',
    Icon: Code2,
  },
  {
    year: '1st Year',
    title: 'Foundations of Logic',
    period: '2022 - 2023',
    project: 'Banking Logic & CLI Tools',
    desc: 'Focused on algorithm design and basic data structures using Java and Python.',
    achievement: 'Joined introductory departmental programming activities and coding labs.',
    Icon: Cpu,
  },
];

const achievements = [
  { text: 'Bachelor of Science in Information Technology', Icon: GraduationCap },
  { text: 'Finished college with a 1.25 GWA', Icon: Star },
  { text: 'Completed the Accenture Technology Academy', Icon: Award },
  { text: 'Verified certifications from DICT, Cisco & Coursera', Icon: ShieldCheck },
];

const quickFacts = [
  { value: '1.25', label: 'GWA' },
  { value: 'BSIT', label: 'National Teachers College' },
  { value: 'Intern', label: 'Grandline Maritime' },
  { value: 'PH', label: 'Sta. Cruz, Manila' },
];

// iPhone 17 finishes — each phone wears one of the real colorways
const socials = [
  {
    name: 'Facebook',
    handle: 'Brian Francisco',
    screenshot: FacebookProfile,
    logo: FacebookLogo,
    url: 'https://web.facebook.com/Bryx.Francisco111/',
    finish: { name: 'Mist Blue', back: ['#D9E4F0', '#AFC3D8'], frame: ['#C9D6E4', '#8EA3BB'], brand: '#1877F2' },
  },
  {
    name: 'Instagram',
    handle: '@bryx_cinco',
    screenshot: InstagramProfile,
    logo: InstagramLogo,
    url: 'https://www.instagram.com/bryx_cinco/',
    finish: { name: 'Lavender', back: ['#E6DCF2', '#C3B1DD'], frame: ['#D6C8E8', '#A28FC2'], brand: '#E1306C' },
  },
  {
    name: 'LinkedIn',
    handle: 'Brian Francisco',
    screenshot: LinkedinProfile,
    logo: LinkedInLogo,
    url: 'https://www.linkedin.com/in/brian-francisco-419b163a4/',
    finish: { name: 'Sage', back: ['#DCE5D3', '#AFC1A2'], frame: ['#C7D3BC', '#8FA383'], brand: '#0A66C2' },
  },
];

// ============================================================================
// STYLES — scoped colour classes beat the global `.light/.dark h1..span`
// `!important` overrides in index.css.
// ============================================================================

const AboutStyles = () => (
  <style>{`
    .ab-scope :is(h1,h2,h3,h4,p,span,li).ab-acc { color: var(--acc) !important; }
    .ab-scope :is(h1,h2,h3,h4,p,span,li).ab-ink { color: var(--ink) !important; }
    .ab-scope :is(h1,h2,h3,h4,p,span,li).ab-white { color: #FFFFFF !important; }
    .ab-scope :is(h1,h2,h3,h4,p,span,li).ab-dark { color: #111111 !important; }
    .ab-scope :is(h1,h2,h3,h4,p,span,li).ab-tc { color: var(--tc) !important; }
    @keyframes ab-pulse { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.4); opacity: 0; } }
    @keyframes ab-spin { to { transform: rotate(360deg); } }
    @keyframes ab-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes ab-flash { 0% { opacity: 0; } 18% { opacity: 1; } 100% { opacity: 0; } }
    @keyframes ab-led { 0%, 100% { box-shadow: 0 0 0 rgba(255,255,255,0); } 30% { box-shadow: 0 0 18px 8px rgba(255,250,220,0.95); } }
    @media (prefers-reduced-motion: reduce) { .ab-anim { animation: none !important; } }
  `}</style>
);

// ============================================================================
// SHARED PIECES
// ============================================================================

const useReveal = (reduced) =>
  useCallback(
    (delay = 0, y = 30) =>
      reduced
        ? {}
        : {
            initial: { opacity: 0, y },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: '-60px' },
            transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
          },
    [reduced]
  );

const SectionTitle = ({ title, Icon }) => (
  <div className="flex items-center gap-4 sm:gap-6">
    <h3 className="ab-ink text-2xl sm:text-3xl font-black uppercase tracking-tighter italic">{title}</h3>
    <div className="h-px flex-1 bg-[color:var(--acc-line)]" />
    <Icon className="text-[color:var(--acc)] shrink-0" />
  </div>
);

// ============================================================================
// iPHONE 17 — front: aluminum frame, Dynamic Island, iOS status bar, side
// buttons incl. Camera Control. Back: colorway glass + vertical camera pill.
// All measurements scale off --pw (the phone's width).
// ============================================================================

const px = (k) => `calc(var(--pw) * ${k})`;

const SideButtons = ({ frame, mirrored }) => {
  const metal = `linear-gradient(90deg, ${frame[1]}, ${frame[0]} 50%, ${frame[1]})`;
  const left = mirrored ? 'right' : 'left';
  const right = mirrored ? 'left' : 'right';
  const btn = (side, top, h, extra = {}) => ({
    position: 'absolute',
    [side]: px(-0.012),
    top,
    width: px(0.014),
    height: h,
    background: metal,
    borderRadius: px(0.01),
    ...extra,
  });
  return (
    <>
      <span style={btn(left, '17%', '4.2%')} />
      <span style={btn(left, '24%', '7.5%')} />
      <span style={btn(left, '33%', '7.5%')} />
      <span style={btn(right, '27%', '11%')} />
      {/* Camera Control: flush, sapphire-faced */}
      <span
        style={btn(right, '52%', '8%', {
          background: `linear-gradient(90deg, ${frame[1]}, #3b3f47 40%, #23262c 60%, ${frame[1]})`,
        })}
      />
    </>
  );
};

const StatusBar = () => (
  <div
    className="absolute inset-x-0 top-0 z-20 flex items-center justify-between font-semibold"
    style={{ height: px(0.13), padding: `0 ${px(0.075)}`, fontSize: px(0.048), color: '#111' }}
  >
    <span className="ab-dark" style={{ letterSpacing: '-0.02em' }}>
      9:41
    </span>
    <span className="flex items-center" style={{ gap: px(0.016) }}>
      {/* signal */}
      <span className="flex items-end" style={{ gap: px(0.005), height: px(0.032) }}>
        {[0.4, 0.6, 0.8, 1].map((h) => (
          <span key={h} style={{ width: px(0.009), height: `${h * 100}%`, background: '#111', borderRadius: 1 }} />
        ))}
      </span>
      {/* wifi */}
      <svg viewBox="0 0 16 12" style={{ width: px(0.045) }} aria-hidden="true">
        <path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0L8 11.5Z" fill="#111" />
        <path d="M3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.3 1.3a4.6 4.6 0 0 0-6.6 0L3.4 6.8Z" fill="#111" />
        <path d="M1.2 4.6a9.6 9.6 0 0 1 13.6 0l-1.3 1.3a7.8 7.8 0 0 0-11 0L1.2 4.6Z" fill="#111" />
      </svg>
      {/* battery */}
      <span className="relative flex items-center" style={{ width: px(0.07), height: px(0.034) }}>
        <span className="absolute inset-0 rounded-[0.1875rem] border" style={{ borderColor: 'rgba(17,17,17,0.45)' }} />
        <span className="absolute rounded-[2px]" style={{ inset: px(0.005), right: '22%', background: '#111' }} />
        <span className="absolute rounded-r-sm" style={{ right: px(-0.008), width: px(0.006), height: '40%', background: 'rgba(17,17,17,0.45)' }} />
      </span>
    </span>
  </div>
);

const PhoneFront = ({ social, glareRef }) => {
  const { frame } = social.finish;
  return (
    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
      <SideButtons frame={frame} />
      {/* aluminum frame */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: px(0.19),
          background: `linear-gradient(135deg, ${frame[0]}, ${frame[1]} 45%, ${frame[0]} 70%, ${frame[1]})`,
          padding: px(0.012),
          boxShadow: '0 30px 60px -20px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.35)',
        }}
      >
        {/* black bezel */}
        <div className="relative w-full h-full bg-black" style={{ borderRadius: px(0.178), padding: px(0.03) }}>
          {/* screen */}
          <div className="relative w-full h-full overflow-hidden bg-white" style={{ borderRadius: px(0.15) }}>
            <StatusBar />
            {/* the Android status / nav bars in the screenshots are cropped off */}
            <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ top: px(0.12) }}>
              <img
                src={social.screenshot}
                alt={`${social.name} profile of Brian Francisco`}
                draggable={false}
                className="absolute left-0 top-0 w-full h-auto"
                style={{ transform: 'translateY(-5%)' }}
              />
            </div>
            {/* Dynamic Island */}
            <div
              className="absolute left-1/2 -translate-x-1/2 z-30 bg-black flex items-center justify-end"
              style={{ top: px(0.03), width: px(0.32), height: px(0.093), borderRadius: px(0.06), paddingRight: px(0.03) }}
            >
              <span style={{ width: px(0.03), height: px(0.03), borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #3a4a7a, #0b0d18 70%)' }} />
            </div>
            {/* iOS home-indicator strip — also hides the Android nav bar in the screenshots */}
            <div className="absolute inset-x-0 bottom-0 z-10 bg-white" style={{ height: px(0.105) }} />
            {/* home indicator */}
            <div
              className="absolute left-1/2 -translate-x-1/2 z-20 rounded-full"
              style={{ bottom: px(0.022), width: px(0.36), height: px(0.014), background: 'rgba(17,17,17,0.8)' }}
            />
            {/* glare follows the pointer */}
            <div
              ref={glareRef}
              className="absolute inset-0 z-40 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at var(--gx, 30%) var(--gy, 10%), rgba(255,255,255,0.35), transparent 45%)',
                opacity: 'var(--go, 0.5)',
                transition: 'opacity 300ms ease',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const PhoneBack = ({ social, flashing }) => {
  const { frame, back } = social.finish;
  const lens = (
    <span
      className="relative block rounded-full"
      style={{
        width: px(0.165),
        height: px(0.165),
        background: `radial-gradient(circle, ${frame[1]} 58%, ${frame[0]} 62%, ${frame[1]} 100%)`,
        boxShadow: '0 3px 8px rgba(0,0,0,0.35)',
      }}
    >
      <span
        className="absolute rounded-full"
        style={{ inset: '16%', background: 'radial-gradient(circle at 50% 50%, #1b2a4a 0%, #070910 55%, #141823 100%)', boxShadow: 'inset 0 0 0 2px #0a0a0a' }}
      />
      <span className="absolute rounded-full" style={{ inset: '34%', background: 'radial-gradient(circle at 40% 40%, #33508a, #050608 70%)' }} />
      <span className="absolute rounded-full bg-white/70" style={{ width: '14%', height: '14%', top: '30%', left: '32%' }} />
    </span>
  );
  return (
    <div
      className="absolute inset-0"
      style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
    >
      <SideButtons frame={frame} mirrored />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: px(0.19),
          background: `linear-gradient(160deg, ${back[0]}, ${back[1]})`,
          boxShadow: `0 30px 60px -20px rgba(0,0,0,0.55), inset 0 0 0 ${px(0.012)} ${frame[1]}, inset 0 0 0 ${px(0.016)} rgba(255,255,255,0.35)`,
        }}
      >
        {/* matte glass sheen */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.35), transparent 35%, transparent 65%, rgba(255,255,255,0.15))' }} />

        {/* vertical camera pill + flash + mic */}
        <div className="absolute flex items-start" style={{ top: px(0.06), left: px(0.07), gap: px(0.03) }}>
          <div
            className="flex flex-col items-center justify-between"
            style={{
              width: px(0.225),
              height: px(0.44),
              padding: px(0.03),
              borderRadius: px(0.12),
              background: `linear-gradient(160deg, ${rgba(back[0], 0.9)}, ${rgba(back[1], 0.9)})`,
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.5), 0 6px 14px rgba(0,0,0,0.18)`,
            }}
          >
            {lens}
            {lens}
          </div>
          <div className="flex flex-col items-center" style={{ gap: px(0.035), paddingTop: px(0.02) }}>
            <span
              className={flashing ? 'ab-anim' : ''}
              style={{
                width: px(0.05),
                height: px(0.05),
                borderRadius: '50%',
                background: flashing ? '#FFFCEB' : 'radial-gradient(circle, #fff6d8 0%, #e3d6a8 60%, #b9ad86 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)',
                animation: flashing ? 'ab-led 520ms ease-out' : 'none',
              }}
            />
            <span style={{ width: px(0.016), height: px(0.016), borderRadius: '50%', background: 'rgba(0,0,0,0.45)' }} />
          </div>
        </div>

        {/* center mark: the social it is about to open */}
        <div className="absolute inset-x-0 flex flex-col items-center" style={{ top: '46%', gap: px(0.04) }}>
          <img src={social.logo} alt="" className="opacity-80" style={{ width: px(0.16), height: px(0.16), objectFit: 'contain', filter: 'grayscale(0.3)' }} />
          <span className="ab-dark font-black uppercase" style={{ fontSize: px(0.04), letterSpacing: '0.3em', opacity: 0.55 }}>
            Say cheese
          </span>
        </div>
        <span
          className="ab-dark absolute inset-x-0 text-center font-semibold"
          style={{ bottom: px(0.08), fontSize: px(0.034), letterSpacing: '0.2em', opacity: 0.45 }}
        >
          iPHONE 17 · {social.finish.name.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

// full-screen camera flash, rendered on <body> so no transformed parent clips it
const CameraFlash = ({ id }) =>
  id
    ? createPortal(
        <div
          key={id}
          className="ab-anim fixed inset-0 z-[3000] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 45%, #FFFFFF 0%, #FFFDF2 60%, #FFF4D6 100%)', animation: 'ab-flash 650ms ease-out forwards' }}
        />,
        document.body
      )
    : null;

const FLIP_MS = 700;
const FLASH_DELAY = 120;

const IPhone17 = ({ social, reduced }) => {
  const phoneRef = useRef(null);
  const glareRef = useRef(null);
  const timers = useRef([]);
  const [stage, setStage] = useState('idle'); // idle → flipping → flash → returning
  const [flashId, setFlashId] = useState(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const flipped = stage === 'flipping' || stage === 'flash';

  const onMove = (e) => {
    const el = phoneRef.current;
    if (!el || reduced || stage !== 'idle' || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - y) * 16}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 18}deg`);
    glareRef.current?.style.setProperty('--gx', `${x * 100}%`);
    glareRef.current?.style.setProperty('--gy', `${y * 100}%`);
    glareRef.current?.style.setProperty('--go', '1');
  };
  const onLeave = () => {
    const el = phoneRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    glareRef.current?.style.setProperty('--go', '0.5');
  };

  const onClick = (e) => {
    // let modified clicks (new tab, etc.) behave like a normal link
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (stage !== 'idle') return;
    if (reduced) {
      window.open(social.url, '_blank', 'noopener,noreferrer');
      return;
    }
    setBlocked(false);
    onLeave();
    setStage('flipping');
    later(() => {
      setStage('flash');
      setFlashId(Date.now());
    }, FLIP_MS);
    later(() => {
      const win = window.open(social.url, '_blank');
      if (win) {
        try {
          win.opener = null;
        } catch {
          /* cross-origin window — nothing to detach */
        }
      } else {
        setBlocked(true);
      }
    }, FLIP_MS + FLASH_DELAY);
    later(() => setFlashId(null), FLIP_MS + 700);
    later(() => setStage('returning'), FLIP_MS + 900);
    later(() => setStage('idle'), FLIP_MS * 2 + 1000);
  };

  return (
    <div className="flex flex-col items-center gap-7">
      <div style={{ perspective: '1600px' }}>
        <a
          ref={phoneRef}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          aria-label={`Open Brian's ${social.name}`}
          className="relative block outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--acc)] rounded-[2.5rem]"
          style={{
            '--pw': 'clamp(230px, 22vw, 290px)',
            width: 'var(--pw)',
            aspectRatio: '9 / 19.4',
            transformStyle: 'preserve-3d',
            transform: `rotateX(var(--rx, 0deg)) rotateY(calc(var(--ry, 0deg) + ${flipped ? 180 : 0}deg))`,
            transition: stage === 'idle' ? 'transform 250ms ease-out' : `transform ${FLIP_MS}ms cubic-bezier(0.65,0,0.35,1)`,
          }}
        >
          <PhoneFront social={social} glareRef={glareRef} />
          <PhoneBack social={social} flashing={stage === 'flash'} />
        </a>
      </div>

      <div className="text-center space-y-1.5">
        <div className="flex items-center justify-center gap-2">
          <img src={social.logo} alt="" className="w-5 h-5 object-contain" />
          <h4 className="ab-ink text-lg sm:text-xl font-black uppercase tracking-tighter">{social.name}</h4>
        </div>
        <p className="ab-acc text-[0.625rem] sm:text-xs font-black uppercase tracking-widest">{social.handle}</p>
        <p className="ab-ink flex items-center justify-center gap-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.25em] opacity-50">
          <Camera size={11} /> Tap to flip & snap
        </p>
        {blocked && (
          <a
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-[0.625rem] font-black uppercase tracking-widest"
            style={{ background: social.finish.brand, color: '#FFFFFF' }}
          >
            Open {social.name} <ArrowUpRight size={12} />
          </a>
        )}
      </div>
      <CameraFlash id={flashId} />
    </div>
  );
};

// ============================================================================
// MAIN
// ============================================================================

const About = ({ darkMode = true }) => {
  const reduced = useReducedMotion();
  const reveal = useReveal(reduced);
  const vars = useMemo(() => cssVars(getPalette(darkMode)), [darkMode]);
  const photoRef = useRef(null);

  const onPhotoMove = (e) => {
    const el = photoRef.current;
    if (!el || reduced || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg)`;
  };

  return (
    <div className="ab-scope relative overflow-hidden pt-16 sm:pt-20 lg:pt-24 pb-20 px-1 sm:px-4" style={vars}>
      <AboutStyles />
      <HandStyles />

      <div className="max-w-[87.5rem] mx-auto space-y-24 sm:space-y-32">
        {/* ================= HERO ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          <div className="lg:col-span-7 space-y-7 sm:space-y-8 text-center lg:text-left">
            <motion.div
              {...reveal(0, 16)}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[color:var(--acc-line)] bg-[color:var(--acc-soft)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="ab-anim absolute inline-flex h-full w-full rounded-full bg-[color:var(--acc)]" style={{ animation: 'ab-pulse 1.6s ease-out infinite' }} />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--acc)]" />
              </span>
              <span className="ab-acc text-[0.625rem] sm:text-xs font-black uppercase tracking-[0.25em]">More things about me</span>
            </motion.div>

            <motion.h1 {...reveal(0.08)} className="ab-ink text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              Behind the{' '}
              <span className="relative inline-block">
                <span className="ab-acc">Pixels.</span>
                <Doodle type="underline" className="absolute left-0 -bottom-2 w-full h-3 sm:h-4" strokeWidth={4} delay={0.6} />
              </span>
            </motion.h1>
            <HandNote className="text-2xl sm:text-3xl" rot={-2} delay={0.8}>
              the human behind the code, hi! 👋
            </HandNote>

            <motion.p {...reveal(0.16)} className="ab-ink text-base sm:text-xl leading-relaxed opacity-80 max-w-3xl mx-auto lg:mx-0">
              I&apos;m <span className="ab-acc font-black">Brian Paul Francisco</span>, a BSIT graduate of National
              Teachers College who bridges secure backend architecture and fluid user experiences — pairing UI/UX design
              with solid database work. I build across the LAMP stack (Linux, Apache, MySQL, PHP) and modern JavaScript
              (Node.js, React, Next.js, Expo) to ship scalable, data-driven apps, and lately I wire LLMs into them, like
              TIDE's AI coach and Snapzy's screenshot sorter.
            </motion.p>

            <motion.div {...reveal(0.24)} className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto lg:mx-0">
              {quickFacts.map((f) => (
                <div key={f.label} className="px-4 py-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] text-left">
                  <p className="ab-acc text-xl sm:text-2xl font-black tracking-tighter leading-none">{f.value}</p>
                  <p className="ab-ink mt-1.5 text-[0.5625rem] sm:text-[0.625rem] font-black uppercase tracking-widest opacity-60 leading-tight">{f.label}</p>
                </div>
              ))}
            </motion.div>

            <motion.div {...reveal(0.3)} className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2">
              <span className="ab-ink flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest opacity-80">
                <MapPin size={16} className="text-[color:var(--acc)]" /> Manila, PH
              </span>
              <span className="ab-ink flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest opacity-80">
                <Globe size={16} className="text-[color:var(--acc)]" /> Full-Stack LLM Developer
              </span>
            </motion.div>
          </div>

          <motion.div {...reveal(0.1)} className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[25rem]" onPointerMove={onPhotoMove} onPointerLeave={() => {
                if (photoRef.current) photoRef.current.style.transform = '';
              }}>
              <span
                className="ab-anim absolute -inset-6 rounded-[2.5rem] opacity-60 blur-2xl"
                style={{ background: 'conic-gradient(from 0deg, var(--acc), var(--acc2), #FF007A, var(--acc))', animation: 'ab-spin 12s linear infinite' }}
              />
              <div
                ref={photoRef}
                className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-[color:var(--acc-line)] shadow-2xl"
                style={{ transition: 'transform 300ms ease-out' }}
              >
                <img src={brian1} alt="Brian Paul Francisco" className="w-full h-full object-cover" />
              </div>
              <Tape className="-top-3 -left-4" rot={-35} />
              <Tape className="-bottom-2 -right-5" rot={-35} />
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 whitespace-nowrap">
                <Doodle type="arrowLeft" className="w-8 h-6 -mt-3" delay={0.6} />
                <HandNote className="text-2xl" rot={-3} delay={0.7}>
                  me in &ldquo;formal mode&rdquo;
                </HandNote>
              </div>
              <div
                className="ab-anim absolute z-10 -left-4 sm:-left-8 top-8 flex items-center gap-2 px-3 py-2 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-strong)] shadow-xl"
                style={{ animation: 'ab-float 4s ease-in-out infinite' }}
              >
                <Sparkles size={14} className="text-[color:var(--acc)]" />
                <span className="ab-ink text-[0.625rem] font-black uppercase tracking-widest">LLM · Full-Stack</span>
              </div>
              <div
                className="ab-anim absolute z-10 -right-3 sm:-right-6 bottom-10 flex items-center gap-2 px-3 py-2 rounded-xl shadow-xl"
                style={{ background: 'var(--acc)', animation: 'ab-float 4.5s ease-in-out 1s infinite' }}
              >
                <GraduationCap size={14} style={{ color: 'var(--acc-ink)' }} />
                <span className="ab-tc text-[0.625rem] font-black uppercase tracking-widest" style={{ '--tc': 'var(--acc-ink)' }}>
                  1.25 GWA
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ================= ACADEMIC ROADMAP ================= */}
        <section className="space-y-10 sm:space-y-14">
          <motion.div {...reveal(0)}>
            <SectionTitle title="Academic Roadmap" Icon={History} />
            <HandNote className="text-2xl mt-2" rot={-2}>
              (4 years, a LOT of coffee ☕)
            </HandNote>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute left-[12.5%] right-[12.5%] top-6 h-px bg-[color:var(--acc-line)]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...academicTimeline].reverse().map((item, i) => (
                <motion.div key={item.year} {...reveal(i * 0.1)} className="relative flex flex-col items-center lg:items-stretch">
                  <span className="relative z-10 mx-auto w-12 h-12 rounded-full flex items-center justify-center border-2 border-[color:var(--acc)] bg-[color:var(--surface-strong)] text-[color:var(--acc)] shadow-[0_0_24px_var(--acc-glow)]">
                    <item.Icon size={20} />
                  </span>
                  <div className="group mt-5 w-full h-full p-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:var(--acc-line)]">
                    <p className="ab-acc font-mono text-[0.625rem] font-black uppercase tracking-widest">{item.period}</p>
                    <h4 className="ab-ink mt-2 text-lg font-black leading-tight">
                      {item.year}: {item.title}
                    </h4>
                    <p className="ab-ink mt-1 text-[0.625rem] font-black uppercase tracking-wider opacity-50">{item.project}</p>
                    <p className="ab-ink mt-4 text-sm leading-relaxed opacity-75">{item.desc}</p>
                    <div className="mt-5 pt-4 border-t border-[color:var(--line)] flex items-start gap-2">
                      <Star size={14} className="text-[color:var(--acc)] shrink-0 mt-0.5" />
                      <p className="ab-ink text-[0.6875rem] font-bold italic opacity-80">{item.achievement}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= EXPERIENCE + ACHIEVEMENTS ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <motion.div {...reveal(0)} className="p-7 sm:p-10 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] space-y-9">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="ab-ink text-xl sm:text-2xl font-black uppercase tracking-tighter italic">Work Experience</h3>
                <HandNote className="text-xl" rot={-2}>
                  where the real learning happens
                </HandNote>
              </div>
              <Briefcase className="text-[color:var(--acc)]" />
            </div>
            <div className="space-y-10">
              {experiences.map((exp) => (
                <div key={exp.role} className="group relative pl-8 border-l-2 border-[color:var(--acc-line)]">
                  <span className="absolute -left-[0.5625rem] top-0 w-4 h-4 rounded-full bg-[color:var(--acc)] shadow-[0_0_14px_var(--acc-glow)] transition-transform group-hover:scale-125" />
                  <p className="ab-acc font-mono text-[0.625rem] font-black uppercase tracking-widest">{exp.period}</p>
                  <h4 className="ab-ink mt-2 text-lg sm:text-xl font-black">{exp.role}</h4>
                  <p className="ab-ink text-xs sm:text-sm font-bold opacity-60">{exp.company}</p>
                  <p className="ab-ink mt-3 text-sm leading-relaxed opacity-80">{exp.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {exp.skills.map((s) => (
                      <span key={s} className="ab-acc px-2.5 py-1 rounded-md border border-[color:var(--acc-line)] bg-[color:var(--acc-soft)] text-[0.5625rem] font-black uppercase tracking-widest">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-6 sm:space-y-8">
            <motion.div
              {...reveal(0.1)}
              className="group relative overflow-hidden p-7 sm:p-10 rounded-2xl shadow-xl"
              style={{ background: 'linear-gradient(135deg, #FF007A, #A700FF)' }}
            >
              <Award className="absolute -right-10 -bottom-10 w-56 h-56 text-white opacity-10 -rotate-12 transition-transform duration-700 group-hover:rotate-0" />
              <h3 className="ab-white text-xl sm:text-2xl font-black uppercase tracking-tighter italic mb-6">Key Achievements</h3>
              <div className="relative space-y-4">
                {achievements.map(({ text, Icon }) => (
                  <div key={text} className="flex items-center gap-4">
                    <span className="w-10 h-10 shrink-0 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon size={18} className="text-white" />
                    </span>
                    <p className="ab-white font-bold text-sm sm:text-base">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...reveal(0.2)} className="grid grid-cols-2 gap-4 sm:gap-6">
              {[
                { Icon: ShieldCheck, label: 'Focus', value: 'Full-stack & LLM apps' },
                { Icon: Code2, label: 'Style', value: 'Clean & Scalable' },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="p-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] space-y-3">
                  <Icon className="text-[color:var(--acc)]" />
                  <p className="ab-ink text-[0.625rem] font-black uppercase tracking-widest opacity-50">{label}</p>
                  <p className="ab-ink text-sm sm:text-base font-black">{value}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================= MISSION ================= */}
        <motion.section {...reveal(0)} className="text-center py-6 sm:py-10 px-2">
          <h2 className="ab-ink text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter italic leading-tight">
            &ldquo;Coding with{' '}
            <span className="relative inline-block">
              <span className="ab-acc">purpose</span>
              <Doodle type="circle" className="absolute -inset-x-4 -inset-y-2 w-[calc(100%+2rem)] h-[calc(100%+1rem)]" strokeWidth={3} delay={0.4} />
            </span>
            , <br className="hidden sm:block" />
            designing for <span className="ab-acc">people</span>.&rdquo;
          </h2>
          <p className="ab-ink mt-6 sm:mt-8 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed opacity-70">
            My goal is to create digital solutions that are not just visually striking, but robust and user-centric.
            Every year of my BSIT journey has been a step toward building high-performance software and systems.
          </p>
        </motion.section>

        {/* ================= SOCIALS — iPHONE 17 ================= */}
        <section className="space-y-12 sm:space-y-16 pb-6">
          <motion.div {...reveal(0)} className="space-y-4">
            <SectionTitle title="My Socials" Icon={Smartphone} />
            <div className="flex flex-wrap items-center gap-3">
              <HandNote className="text-2xl sm:text-3xl" rot={-2}>
                go ahead, tap one 📸
              </HandNote>
              <Doodle type="arrowDown" className="w-7 h-10" delay={0.4} />
              <Sticker bg="#FFB8D9" rot={5} delay={0.6}>
                📱 real iPhone 17, kinda
              </Sticker>
            </div>
            <p className="ab-ink text-sm sm:text-base opacity-65 max-w-2xl">
              Tap a phone — it flips over, snaps a photo, and takes you straight to the profile.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:gap-8 justify-items-center">
            {socials.map((s, i) => (
              <motion.div key={s.name} {...reveal(i * 0.12, 40)}>
                <IPhone17 social={s} reduced={reduced} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
