import React, { useState, useEffect, useRef, useCallback, useMemo, useId } from 'react';
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

import { getPalette, cssVars } from './theme';
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
import tideLogo from './assets/logos/tide.png';
import snapzyLogo from './assets/logos/snapzy.png';
import sweepXpressLogo from './assets/logos/sweepxpress.svg';
import poopipooLogo from './assets/logos/poopipoo.png';
import neoChessLogo from './assets/logos/neochess.svg';

// ============================================================================
// DATA
// ============================================================================

const experiences = [
  {
    role: 'IT Intern',
    company: 'Grandline Maritime Inc.',
    period: '2026 - Present',
    desc: 'Building secure Training Management Systems for maritime students, including a learning portal that protects paid course material from screenshots, and modernizing the web interfaces around them.',
    skills: ['React', 'PHP', 'SQL'],
  },
  {
    role: 'Full-Stack Developer (Solo Projects)',
    company: 'Personal & Academic Work',
    period: '2025 - 2026',
    desc: 'Designed, built and shipped five live apps from idea to deployment: TIDE, Snapzy, SweepXpress, Poopipoo and Neo Chess XD. Four of them have LLM features inside.',
    skills: ['React', 'Next.js', 'Expo', 'Supabase', 'Groq', 'Gemini'],
  },
];

const academicTimeline = [
  {
    year: '4th Year',
    title: 'Professional Mastery',
    period: '2025 - 2026',
    project: 'Maritime LMS, Neo Chess XD, TIDE, Snapzy & Poopipoo',
    desc: 'Developed a secure, anti-screenshot learning portal for maritime students during my IT internship, then shipped my own AI apps with RAG, tool calling and structured output.',
    achievement: 'Completed introductory training in Python essentials and backend concepts through DICT programs.',
    Icon: ShieldCheck,
  },
  {
    year: '3rd Year',
    title: 'Full-Stack Expansion',
    period: '2024 - 2025',
    project: 'SweepXpress & Soundlify',
    desc: 'Led SweepXpress, a supply-chain store in PHP and MySQL, and built Soundlify, a music streaming interface in React and Tailwind.',
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
  { text: 'Shipped five live apps, four with LLM features', Icon: Sparkles },
  { text: 'Completed the Accenture Technology Academy', Icon: Award },
  { text: 'Verified certifications from DICT, Cisco & Coursera', Icon: ShieldCheck },
];

const quickFacts = [
  { value: '1.25', label: 'GWA' },
  { value: 'BSIT', label: 'National Teachers College' },
  { value: 'Intern', label: 'Grandline Maritime' },
  { value: 'PH', label: 'Sta. Cruz, Manila' },
];

const builds = [
  { name: 'TIDE', kind: 'AI productivity coach', logo: tideLogo, url: 'https://tide-rust.vercel.app/', line: 'Focus timer, journal and tasks, with an AI coach that reads your real history and acts through 23 tools.', stack: ['Expo', 'Supabase', 'Groq'] },
  { name: 'Snapzy', kind: 'AI screenshot sorter', logo: snapzyLogo, url: 'https://snapzy-tau.vercel.app/', line: 'Reads every screenshot, writes a caption, files it in an album and pulls out receipts, WiFi and flight details.', stack: ['Next.js', 'Supabase', 'Gemini'] },
  { name: 'SweepXpress', kind: 'Supply-chain store', logo: sweepXpressLogo, url: 'https://sweepxpress.infinityfree.io/sweepxpress/', line: 'My capstone: B2C and B2B orders, reorder forecasts, supplier scorecards and an AI admin copilot.', stack: ['PHP', 'MySQL', 'Groq'] },
  { name: 'Poopipoo', kind: 'Crowdsourced toilet finder', logo: poopipooLogo, url: 'https://poopipoo.vercel.app/', line: 'A community restroom map with voice directions, moderation and an AI assistant in Tagalog and English.', stack: ['Next.js', 'Supabase', 'Groq'] },
  { name: 'Neo Chess XD', kind: '8-bit chess game', logo: neoChessLogo, url: 'https://neo-chess-xd.vercel.app/', line: 'Browser chess with my own CPU engine in a Web Worker, three difficulty levels and 17 capture effects.', stack: ['React', 'Vite', 'Web Workers'] },
  { name: 'Maritime Learning Portal', kind: 'Grandline internship', Icon: ShieldCheck, line: 'A secure portal for maritime students, with screenshot protection for paid course material.', stack: ['React', 'PHP', 'SQL'] },
];

// every phone is a Silver iPhone 17 Pro in a clear MagSafe case
const SILVER = { frame: ['#F2F2EF', '#BEBEBB'] };
const socials = [
  {
    name: 'Facebook',
    handle: 'Brian Francisco',
    screenshot: FacebookProfile,
    logo: FacebookLogo,
    url: 'https://web.facebook.com/Bryx.Francisco111/',
    finish: { ...SILVER, brand: '#1877F2' },
  },
  {
    name: 'Instagram',
    handle: '@bryx_cinco',
    screenshot: InstagramProfile,
    logo: InstagramLogo,
    url: 'https://www.instagram.com/bryx_cinco/',
    finish: { ...SILVER, brand: '#E1306C' },
  },
  {
    name: 'LinkedIn',
    handle: 'Brian Francisco',
    screenshot: LinkedinProfile,
    logo: LinkedInLogo,
    url: 'https://www.linkedin.com/in/brian-francisco-419b163a4/',
    finish: { ...SILVER, brand: '#0A66C2' },
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
    @keyframes ab-led { 0%, 100% { box-shadow: 0 0 0 rgba(255,255,255,0); } 30% { box-shadow: 0 0 18px 8px rgba(255,250,220,0.95); } }
    @media (prefers-reduced-motion: reduce) { .ab-anim { animation: none !important; } }
    @keyframes ab-dim { 0% { opacity: 0; } 100% { opacity: 0.68; } }
    @keyframes ab-preflash { 0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); } 40% { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
    @keyframes ab-burst { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.05); } 30% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1); } }
    @keyframes ab-streak { 0% { opacity: 0; transform: translate(-50%, -50%) scaleX(0); } 25% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -50%) scaleX(1); } }
    @keyframes ab-white { 0% { opacity: 0; } 14% { opacity: 1; } 100% { opacity: 0; } }
    @keyframes ab-print {
      0% { opacity: 0; transform: translate(-50%, -46%) rotate(-7deg) scale(1.16); filter: brightness(3.2) saturate(0.2); }
      28% { opacity: 1; }
      68%, 100% { opacity: 1; transform: translate(-50%, -50%) rotate(-2.5deg) scale(1); filter: brightness(1) saturate(1); }
    }
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
// iPHONE 17 PRO — front: aluminum frame, Dynamic Island, iOS status bar, side
// buttons incl. Camera Control. Back: clear MagSafe case over Silver, with the
// full-width camera plateau, triple lenses, flash and LiDAR.
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

// where the flash LED sits on the 300 x 626 back, used to aim the flash burst
const LED = { x: 238, y: 48, r: 12 };
const BACK_W = 300;
const BACK_H = 626;

const Lens = ({ cx, cy, uid }) => (
  <g>
    <circle cx={cx} cy={cy} r="30" fill="#000" opacity="0.14" transform="translate(0 2)" />
    <circle cx={cx} cy={cy} r="29" fill={`url(#${uid}-ring)`} />
    <circle cx={cx} cy={cy} r="25.5" fill="#08090D" />
    <circle cx={cx} cy={cy} r="20" fill={`url(#${uid}-glass)`} />
    <circle cx={cx} cy={cy} r="9" fill="#05060A" />
    <circle cx={cx} cy={cy} r="5" fill="#1E2C5C" opacity="0.8" />
    <ellipse cx={cx - 8} cy={cy - 10} rx="5" ry="3" fill="#fff" opacity="0.4" transform={`rotate(-35 ${cx - 8} ${cy - 10})`} />
    <circle cx={cx + 8} cy={cy + 9} r="1.6" fill="#8FA8FF" opacity="0.65" />
  </g>
);

const APPLE_MARK =
  'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701';

const PhoneBack = ({ social, flashing }) => {
  const uid = useId().replace(/:/g, '');
  return (
    <div
      className="absolute inset-0"
      style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
    >
      <SideButtons frame={social.finish.frame} mirrored />
      <div className="absolute inset-0" style={{ borderRadius: px(0.19), boxShadow: '0 30px 60px -20px rgba(0,0,0,0.55)' }}>
        <svg viewBox={`0 0 ${BACK_W} ${BACK_H}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F7F7F5" />
              <stop offset="0.55" stopColor="#ECECE9" />
              <stop offset="1" stopColor="#E2E2DE" />
            </linearGradient>
            <linearGradient id={`${uid}-plateau`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#E9E9E6" />
              <stop offset="0.5" stopColor="#DADAD6" />
              <stop offset="1" stopColor="#CFCFCB" />
            </linearGradient>
            <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.5" stopColor="#B4B4B0" />
              <stop offset="1" stopColor="#F0F0ED" />
            </linearGradient>
            <radialGradient id={`${uid}-glass`} cx="0.4" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#2A3A70" />
              <stop offset="0.5" stopColor="#10162E" />
              <stop offset="1" stopColor="#050609" />
            </radialGradient>
            <radialGradient id={`${uid}-led`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#FFF9E8" />
              <stop offset="0.65" stopColor="#E9DFC0" />
              <stop offset="1" stopColor="#B8B09A" />
            </radialGradient>
            <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="1" y2="0.7">
              <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
              <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.72" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.28" />
            </linearGradient>
          </defs>

          {/* clear case rim, then the phone inside it */}
          <rect x="0.5" y="0.5" width="299" height="625" rx="57" fill="#FFFFFF" fillOpacity="0.5" stroke="#C9C9C6" />
          <rect x="7" y="7" width="286" height="612" rx="50" fill={`url(#${uid}-body)`} stroke="#fff" strokeOpacity="0.8" />

          {/* full-width camera plateau */}
          <path
            d="M57 7H243a50 50 0 0 1 50 50V122a28 28 0 0 1-28 28H35a28 28 0 0 1-28-28V57a50 50 0 0 1 50-50Z"
            fill={`url(#${uid}-plateau)`}
            stroke="#fff"
            strokeOpacity="0.85"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.2))' }}
          />
          <Lens cx={76} cy={48} uid={uid} />
          <Lens cx={136} cy={79} uid={uid} />
          <Lens cx={76} cy={110} uid={uid} />
          <circle cx={LED.x} cy={LED.y} r={LED.r} fill={`url(#${uid}-led)`} stroke="#A9A9A5" />
          <circle cx="222" cy="80" r="2.6" fill="#2A2A2E" />
          <circle cx="238" cy="110" r="11" fill="#07080C" stroke="#9D9D99" />
          <circle cx="234.5" cy="106.5" r="3" fill="#39415F" />

          {/* MagSafe ring, alignment magnet and the Apple mark, as seen through the case */}
          <path d="M105.3 373.9A78 78 0 1 1 194.7 373.9" fill="none" stroke="#000" strokeOpacity="0.07" strokeWidth="19" strokeLinecap="round" />
          <path d="M105.3 373.9A78 78 0 1 1 194.7 373.9" fill="none" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" />
          <path d={APPLE_MARK} transform="translate(128 288) scale(1.83)" fill="#D2D2CE" />
          <rect x="139.5" y="424" width="21" height="36" rx="10.5" fill="#F4F4F2" stroke="#FFFFFF" strokeWidth="5" />
          <rect x="136.5" y="421" width="27" height="42" rx="13.5" fill="none" stroke="#000" strokeOpacity="0.07" />

          {/* case gloss */}
          <rect x="1" y="1" width="298" height="624" rx="56" fill={`url(#${uid}-gloss)`} />
        </svg>

        {/* the LED itself, so it can glow past the phone's edge */}
        <span
          className={flashing ? 'ab-anim' : ''}
          style={{
            position: 'absolute',
            left: `${((LED.x - LED.r) / BACK_W) * 100}%`,
            top: `${((LED.y - LED.r) / BACK_H) * 100}%`,
            width: `${((LED.r * 2) / BACK_W) * 100}%`,
            aspectRatio: '1',
            borderRadius: '50%',
            background: flashing ? '#FFFEF6' : 'transparent',
            animation: flashing ? 'ab-led 900ms ease-out' : 'none',
          }}
        />
      </div>
    </div>
  );
};

// full-screen camera moment, rendered on <body> so no transformed parent clips it:
// the room dims, the LED fires a pre-flash then the real one, everything blows
// out to white, and the photo it "took" (the profile) develops out of the white.
const FLIP_MS = 650;
const PREFLASH_AT = FLIP_MS + 60;
const FLASH_AT = PREFLASH_AT + 300;
const OPEN_AT = FLASH_AT + 800;
const DONE_AT = OPEN_AT + 280;

const CameraFlash = ({ shot, social }) => {
  if (!shot) return null;
  const at = { left: shot.x, top: shot.y };
  const glow = (size, delay, name, dur, color = 'rgba(255,252,235,1)') => ({
    ...at,
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: '50%',
    background: `radial-gradient(circle, #FFFFFF 0%, ${color} 18%, rgba(255,245,210,0.35) 42%, transparent 70%)`,
    opacity: 0,
    animation: `${name} ${dur}ms ease-out ${delay}ms forwards`,
  });
  const streak = (w, h, angle) => ({
    ...at,
    position: 'absolute',
    width: w,
    height: h,
    marginLeft: 0,
    rotate: angle,
    opacity: 0,
    background: 'linear-gradient(90deg, transparent, rgba(190,225,255,0.95) 42%, #FFFFFF 50%, rgba(190,225,255,0.95) 58%, transparent)',
    animation: `ab-streak 420ms ease-out ${FLASH_AT}ms forwards`,
  });
  return createPortal(
    <div
      className="ab-anim fixed inset-0 z-[3000] overflow-hidden pointer-events-none"
      style={{ animation: `ab-fadeout 280ms ease-in ${OPEN_AT}ms forwards` }}
    >
      <style>{`@keyframes ab-fadeout { to { opacity: 0; } }`}</style>
      <div className="absolute inset-0 bg-black" style={{ opacity: 0, animation: `ab-dim ${FLIP_MS}ms ease-in forwards` }} />
      <div style={glow('38vmin', PREFLASH_AT, 'ab-preflash', 200)} />
      <div style={glow('260vmax', FLASH_AT, 'ab-burst', 560)} />
      <div style={streak('180vmax', '0.5vmin', '0deg')} />
      <div style={streak('90vmax', '0.3vmin', '90deg')} />
      <div className="absolute inset-0" style={{ background: '#FFFEF8', opacity: 0, animation: `ab-white 620ms ease-out ${FLASH_AT + 40}ms forwards` }} />
      <div
        className="absolute left-1/2 top-1/2 rounded-md"
        style={{
          width: 'min(70vw, 19rem)',
          padding: '0.75rem 0.75rem 0',
          background: '#FFFFFF',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.65)',
          opacity: 0,
          animation: `ab-print 620ms cubic-bezier(0.2,0.8,0.25,1) ${FLASH_AT + 120}ms forwards`,
        }}
      >
        <div className="relative overflow-hidden rounded-sm bg-black" style={{ aspectRatio: '1 / 1.08' }}>
          <img src={social.screenshot} alt="" className="absolute left-0 top-0 w-full h-auto" style={{ transform: 'translateY(-5%)' }} />
        </div>
        <div style={{ padding: '0.6rem 0 0.8rem', textAlign: 'center', color: '#1B1B2A', fontFamily: "'Caveat', cursive", fontSize: '1.5rem', lineHeight: 1.1 }}>
          say cheese! opening {social.name}...
        </div>
      </div>
    </div>,
    document.body
  );
};

const IPhone17 = ({ social, reduced }) => {
  const phoneRef = useRef(null);
  const glareRef = useRef(null);
  const timers = useRef([]);
  const [stage, setStage] = useState('idle'); // idle → flipping → flash → returning
  const [shot, setShot] = useState(null);
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
    // aim the burst at the LED; the back faces us once flipped, unmirrored
    const r = phoneRef.current.getBoundingClientRect();
    setShot({ x: r.left + (LED.x / BACK_W) * r.width, y: r.top + (LED.y / BACK_H) * r.height, id: Date.now() });
    setStage('flipping');
    later(() => setStage('flash'), PREFLASH_AT);
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
    }, OPEN_AT);
    later(() => {
      setShot(null);
      setStage('returning');
    }, DONE_AT);
    later(() => setStage('idle'), DONE_AT + FLIP_MS + 100);
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
            aspectRatio: '71.9 / 150',
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
      <CameraFlash shot={shot} social={social} />
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
              I&apos;m <span className="ab-acc font-black">Brian Paul Francisco</span>, a fresh BSIT graduate of National
              Teachers College and an IT intern at Grandline Maritime. I build full-stack web and mobile apps, then wire
              LLMs into them where they actually help: TIDE&apos;s AI coach, Snapzy&apos;s screenshot sorter,
              Poopipoo&apos;s Tagalog assistant and SweepXpress&apos;s admin copilot. I care as much about how an app feels
              as how it&apos;s built, so UI/UX design and database work get equal attention.
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
                className="ab-anim absolute z-10 -left-4 sm:-left-8 top-16 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 shadow-xl"
                style={{ background: '#14141F', animation: 'ab-float 4s ease-in-out infinite' }}
              >
                <Sparkles size={14} style={{ color: '#2EE6A8' }} />
                <span className="ab-white text-[0.625rem] font-black uppercase tracking-widest">LLM · Full-Stack</span>
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

        {/* ================= WHAT I'VE BUILT ================= */}
        <section className="space-y-8 sm:space-y-10">
          <motion.div {...reveal(0)} className="space-y-2">
            <SectionTitle title="What I've Built" Icon={Layers} />
            <HandNote className="text-xl sm:text-2xl" rot={-1}>
              go ahead, tap one and try it
            </HandNote>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {builds.map((b, i) => {
              const Card = b.url ? 'a' : 'div';
              return (
                <motion.div key={b.name} {...reveal(i * 0.06)}>
                  <Card
                    {...(b.url ? { href: b.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className={`group h-full flex flex-col gap-4 p-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] transition-all duration-300 ${
                      b.url ? 'cursor-target hover:-translate-y-1 hover:border-[color:var(--acc-line)] hover:shadow-[0_18px_40px_-22px_var(--acc-glow)]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {b.logo ? (
                        <img src={b.logo} alt="" loading="lazy" className="w-12 h-12 shrink-0 rounded-[0.8rem] object-cover shadow-md" />
                      ) : (
                        <span className="w-12 h-12 shrink-0 rounded-[0.8rem] flex items-center justify-center bg-[color:var(--acc-soft)] border border-[color:var(--acc-line)]">
                          <b.Icon size={22} className="text-[color:var(--acc)]" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="ab-ink text-base sm:text-lg font-black tracking-tight leading-tight">{b.name}</h4>
                        <p className="ab-acc mt-0.5 text-[0.6875rem] font-bold">{b.kind}</p>
                      </div>
                      {b.url && <ArrowUpRight size={18} className="shrink-0 text-[color:var(--acc)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                    </div>
                    <p className="ab-ink flex-1 text-sm leading-relaxed opacity-80">{b.line}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {b.stack.map((t) => (
                        <span key={t} className="ab-acc px-2.5 py-1 rounded-md border border-[color:var(--acc-line)] bg-[color:var(--acc-soft)] text-[0.5625rem] font-black uppercase tracking-widest">
                          {t}
                        </span>
                      ))}
                      <span className="ab-ink ml-auto inline-flex items-center gap-1.5 text-[0.625rem] font-bold opacity-60">
                        <span className={`w-1.5 h-1.5 rounded-full ${b.url ? 'bg-[#34C759]' : 'bg-[#8E8E93]'}`} />
                        {b.url ? 'Live' : 'Private'}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
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

        {/* ================= SOCIALS — iPHONE 17 PRO ================= */}
        <section className="space-y-12 sm:space-y-16 pb-6">
          <motion.div {...reveal(0)} className="space-y-4">
            <SectionTitle title="My Socials" Icon={Smartphone} />
            <div className="flex flex-wrap items-center gap-3">
              <HandNote className="text-2xl sm:text-3xl" rot={-2}>
                go ahead, tap one 📸
              </HandNote>
              <Doodle type="arrowDown" className="w-7 h-10" delay={0.4} />
              <Sticker bg="#FFB8D9" rot={5} delay={0.6}>
                📱 iPhone 17 Pro, kinda
              </Sticker>
            </div>
            <p className="ab-ink text-sm sm:text-base opacity-65 max-w-2xl">
              Tap a phone: it flips over, fires the flash, develops the shot, then takes you straight to the profile.
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
