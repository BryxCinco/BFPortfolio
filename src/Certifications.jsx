import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
  useScroll,
  useSpring,
  animate,
} from 'framer-motion';
import {
  Cpu,
  Database,
  Palette,
  Wifi,
  Network,
  Code2,
  ShieldCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  BadgeCheck,
  ExternalLink,
  Calendar,
  Building2,
  ArrowRight,
  Search,
  LayoutGrid,
  History,
  Sparkles,
  ZoomIn,
  Hand,
} from 'lucide-react';

import { rgba, getPalette, cssVars } from './theme';
import { HandStyles, HandNote, Doodle, StickyNote, Sticker } from './HandTouch';

// ============================================================================
// CERTIFICATE IMAGES
// Place every PNG in ./assets/PNGVER/ next to this file, using the exact
// filenames below (these match the certs you uploaded).
// ============================================================================

import daDataScienceEthics from './assets/PNGVER/DA-DSECoursera-1.png';
import uxuiAicaDict from './assets/PNGVER/UXUI-AICADICT-1.png';
import uxuiBrwc from './assets/PNGVER/UXUI-BRWCLinkedin.png';
import uxuiUicw from './assets/PNGVER/UXUI-UICWLinkedin.png';
import uxuiUxf from './assets/PNGVER/UXUI-UXFLinkedin.png';
import uxuiUxr from './assets/PNGVER/UXUI-UXRLinkedin.png';
import sweLngt from './assets/PNGVER/SWE-LNGTLinkedin.png';
import iotEmbeddedSystems from './assets/PNGVER/IOT-ESCEDUCBA-1.png';
import llmPredictiveModeling from './assets/PNGVER/LLM-IMCoursera-1.png';
import netCyberPhysical from './assets/PNGVER/NET-CPSCoursera-1.png';
import progCssEssentials from './assets/PNGVER/PROG-CSSECisco-1.png';
import progJsEssentials1 from './assets/PNGVER/PROG-JSE1Cisco-1.png';
import progJsEssentials2 from './assets/PNGVER/PROG-JSE2Cisco-1.png';
import progPythonEssentials1 from './assets/PNGVER/PROG-PHYCisco-1.png';
import progPythonEssentials2 from './assets/PNGVER/PROG-PHY2Cisco-1.png';
import sweBlockchainBasics from './assets/PNGVER/SWE-BLCBCoursera-1.png';
import sweCicd from './assets/PNGVER/SWE-CICDCoursera-1.png';
import sweReactFrontend from './assets/PNGVER/SWE-DFERIBM-1.png';
import sweNodeBackend from './assets/PNGVER/SWE-DNOEXJSIBM-1.png';
import sweIntroSoftwareEng from './assets/PNGVER/SWE-ISEIBM-1.png';
import sweSimulink from './assets/PNGVER/SWE-MSSCoursera-1.png';
import sweSimulationDecision from './assets/PNGVER/SWE-SMDMCoursera-1.png';
import sweSustainableDevGoals from './assets/PNGVER/SWE-TSDGCoursera-1.png';
import aiSustainableDevWebinar from './assets/PNGVER/AI-AISDDICT.png';
import aiAnalyzeReviews from './assets/PNGVER/AI-ARCisco.png';
import aiEthicalIssuesAI from './assets/PNGVER/AI-EIAICoursera.png';
import aiEthicalIssuesComputing from './assets/PNGVER/AI-EICACoursera.png';
import aiPromptEngineering from './assets/PNGVER/AI-IAIPEDICT.png';
import aiIntroModernAI from './assets/PNGVER/AI-IMAICisco.png';
import aiUpdateResume from './assets/PNGVER/AI-URCisco.png';
import acnCompletion from './assets/PNGVER/ACN-COC.png';
import acnParticipation from './assets/PNGVER/COP-ACN.png';
// Simple Icons dropped its css3 mark, so the CSS cert uses the local logo.
import cssLogo from './assets/CSS.png';

// ============================================================================
// CERTIFICATION DATA
// Each category carries its icon, an accent colour (used by the domain ring,
// chips, and card trim in both themes) and a short chip label.
// Every cert has TWO separate images:
//   - logo: the small issuer badge shown on the card.
//   - img:  the actual certificate screenshot, shown large in the modal.
// Also needs: title, issuer, date, description, and an optional verifyUrl
// (external credential link shown as a secondary action inside the modal).
// ============================================================================

// Official DICT (Department of Information and Communications Technology,
// Republic of the Philippines) seal — used as the badge icon for every
// DICT-issued certificate so they're correctly attributed instead of
// borrowing an unrelated platform icon.
const DICT_LOGO = 'https://commons.wikimedia.org/wiki/Special:FilePath/DICT-Logo-icon_only.png';
const LINKEDIN_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg';

const certCategories = [
  {
    id: 'ai',
    label: 'Artificial Intelligence',
    Icon: Cpu,
    color: '#A700FF',
    short: 'AI',
    certs: [
      {
        title: 'Introduction to Predictive Modeling',
        issuer: 'University of Minnesota · Coursera',
        date: 'Dec 12, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: llmPredictiveModeling,
        description: 'Covers the fundamentals of building predictive models, including regression techniques, model evaluation, and applying data-driven forecasting to real-world decisions.',
        verifyUrl: 'https://coursera.org/verify/3V1HSNI6OCYV'
      },
      {
        title: 'Ethical Issues in AI and Professional Ethics',
        issuer: 'University of Colorado Boulder · Coursera',
        date: 'Sep 26, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: aiEthicalIssuesAI,
        description: 'Examines ethical frameworks for evaluating AI systems, covering algorithmic bias, accountability, and the professional responsibilities of those who build AI-powered technology.',
        verifyUrl: 'https://coursera.org/verify/LV4LV62X1OLQ'
      },
      {
        title: 'Ethical Issues in Computing Applications',
        issuer: 'University of Colorado Boulder · Coursera',
        date: 'Dec 8, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: aiEthicalIssuesComputing,
        description: 'Explores ethical considerations across computing applications broadly, including privacy, security, professional codes of conduct, and the societal impact of software systems.',
        verifyUrl: 'https://coursera.org/verify/A01QN8X3MUU4'
      },
      {
        title: 'Introduction to Modern AI',
        issuer: 'Cisco Networking Academy · DICT-ITU DTC Initiative',
        date: 'Jun 24, 2026',
        logo: 'https://cdn.simpleicons.org/cisco/1BA0D7',
        img: aiIntroModernAI,
        description: 'Introduces the modern AI landscape, covering machine learning basics, generative AI, and how contemporary AI tools are applied across industries.',
        verifyUrl: '#'
      },
      {
        title: 'Introduction to Artificial Intelligence and Prompt Engineering Frameworks',
        issuer: 'DICT Region 2 · ILCDB',
        date: 'Jun 12, 2026',
        logo: DICT_LOGO,
        img: aiPromptEngineering,
        description: 'Government-led training on core AI concepts and prompt engineering frameworks, covering how to structure prompts effectively for reliable, high-quality AI outputs.',
        verifyUrl: '#'
      },
      {
        title: 'Apply AI: Analyze Customer Reviews',
        issuer: 'Cisco Networking Academy · DICT-ITU DTC Initiative',
        date: 'Jul 3, 2026',
        logo: 'https://cdn.simpleicons.org/cisco/1BA0D7',
        img: aiAnalyzeReviews,
        description: 'Hands-on application of AI tools to analyze customer review data, extracting sentiment and actionable insights from unstructured text.',
        verifyUrl: '#'
      },
      {
        title: 'Apply AI: Update Your Resume',
        issuer: 'Cisco Networking Academy · DICT-ITU DTC Initiative',
        date: 'Jul 3, 2026',
        logo: 'https://cdn.simpleicons.org/cisco/1BA0D7',
        img: aiUpdateResume,
        description: 'Practical use of AI tools to refine and strengthen a resume, covering prompt strategies for tailoring content, tone, and structure to a target role.',
        verifyUrl: '#'
      },
      {
        title: 'Artificial Intelligence For Sustainable Development',
        issuer: 'DICT Region 2 - Nueva Vizcaya',
        date: 'Jun 23, 2026',
        logo: DICT_LOGO,
        img: aiSustainableDevWebinar,
        description: 'Webinar attendance certificate covering how artificial intelligence can be applied to advance sustainable development goals and community-level initiatives.',
        verifyUrl: '#'
      }
    ]
  },
  {
    id: 'data',
    label: 'Data Analytics',
    Icon: Database,
    color: '#00B8D9',
    short: 'Data',
    certs: [
      {
        title: 'Data Science Ethics',
        issuer: 'University of Michigan · Coursera',
        date: 'Sep 12, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: daDataScienceEthics,
        description: 'Explores the ethical dimensions of data science practice, including data privacy, algorithmic bias, informed consent, and responsible use of data-driven systems.',
        verifyUrl: 'https://coursera.org/verify/FPM80HPH90HO'
      }
    ]
  },
  {
    id: 'uxui',
    label: 'UX/UI and Design',
    Icon: Palette,
    color: '#FF007A',
    short: 'UX/UI',
    certs: [
      {
        title: 'Basic Graphic Design Using AI-Powered Canva',
        issuer: 'DICT-ITU DTC Initiative',
        date: 'Jun 12, 2026',
        logo: DICT_LOGO,
        img: uxuiAicaDict,
        description: 'Hands-on training in fundamental graphic design principles using Canva\u2019s AI-powered tools, covering layout, composition, and rapid design workflows.',
        verifyUrl: '#'
      },
      {
        title: 'Building Responsive Websites with Canva',
        issuer: 'LinkedIn Learning',
        date: 'Jul 12, 2026',
        logo: LINKEDIN_LOGO,
        img: uxuiBrwc,
        description: 'Covers building responsive, multi-device layouts directly in Canva, including grids, breakpoints, and adapting designs across desktop and mobile screens.',
        verifyUrl: '#'
      },
      {
        title: 'Canva for Web and Digital Design Projects',
        issuer: 'LinkedIn Learning',
        date: 'Jul 12, 2026',
        logo: LINKEDIN_LOGO,
        img: uxuiUicw,
        description: 'Explores using Canva for end-to-end web and digital design projects, from wireframes and page layouts to exporting publish-ready assets.',
        verifyUrl: '#'
      },
      {
        title: 'UX Foundations: Usability Testing',
        issuer: 'LinkedIn Learning',
        date: 'Jul 12, 2026',
        logo: LINKEDIN_LOGO,
        img: uxuiUxf,
        description: 'Introduces usability testing fundamentals, including planning test sessions, recruiting participants, and turning user feedback into actionable design improvements.',
        verifyUrl: '#'
      },
      {
        title: 'UX Foundations: Research',
        issuer: 'LinkedIn Learning',
        date: 'Jul 12, 2026',
        logo: LINKEDIN_LOGO,
        img: uxuiUxr,
        description: 'Covers foundational UX research methods, including user interviews, surveys, and synthesizing qualitative data to inform design decisions.',
        verifyUrl: '#'
      }
    ]
  },
  {
    id: 'iot',
    label: 'Internet of Things',
    Icon: Wifi,
    color: '#FF8A00',
    short: 'IoT',
    certs: [
      {
        title: 'Embedded Systems using C',
        issuer: 'EDUCBA · Coursera',
        date: 'Dec 11, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: iotEmbeddedSystems,
        description: 'Covers embedded systems programming fundamentals in C, including microcontroller architecture, memory-constrained development, and hardware-level debugging for IoT devices.',
        verifyUrl: 'https://coursera.org/verify/2TMSH4V0ZMZJ'
      }
    ]
  },
  {
    id: 'networking',
    label: 'Networking & Systems',
    Icon: Network,
    color: '#3B82F6',
    short: 'Networking',
    certs: [
      {
        title: 'Cyber-Physical Systems: Modeling and Simulation',
        issuer: 'UC Santa Cruz · Coursera',
        date: 'Sep 26, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: netCyberPhysical,
        description: 'Examines how networked, physical, and computational systems interact, covering modeling techniques and simulation methods for cyber-physical infrastructure.',
        verifyUrl: 'https://coursera.org/verify/2PP5O5QYDXXJ'
      }
    ]
  },
  {
    id: 'programming',
    label: 'Programming',
    Icon: Code2,
    color: '#E0A800',
    short: 'Programming',
    certs: [
      {
        title: 'CSS Essentials',
        issuer: 'Cisco Networking Academy · JS Institute',
        date: 'Jun 9, 2026',
        logo: cssLogo,
        img: progCssEssentials,
        description: 'Covers core CSS concepts including selectors, the box model, flexbox, and responsive styling techniques for building modern web layouts.',
        verifyUrl: '#'
      },
      {
        title: 'JavaScript Essentials 1',
        issuer: 'Cisco Networking Academy · JS Institute',
        date: 'Jun 17, 2026',
        logo: 'https://cdn.simpleicons.org/javascript/F7DF1E',
        img: progJsEssentials1,
        description: 'Introduces JavaScript fundamentals, including variables, data types, control flow, functions, and basic program structure.',
        verifyUrl: '#'
      },
      {
        title: 'JavaScript Essentials 2',
        issuer: 'Cisco Networking Academy · JS Institute',
        date: 'Jul 1, 2026',
        logo: 'https://cdn.simpleicons.org/javascript/F7DF1E',
        img: progJsEssentials2,
        description: 'Builds on JavaScript fundamentals with object-oriented programming, exception handling, modules, and higher-order functions.',
        verifyUrl: '#'
      },
      {
        title: 'Python Essentials 1',
        issuer: 'Cisco Networking Academy · Python Institute',
        date: 'May 3, 2024',
        logo: 'https://cdn.simpleicons.org/python/3776AB',
        img: progPythonEssentials1,
        description: 'Foundational Python training covering syntax, data types, control flow, functions, and basic input/output operations.',
        verifyUrl: '#'
      },
      {
        title: 'Python Essentials 2',
        issuer: 'Cisco Networking Academy · Python Institute',
        date: 'May 16, 2024',
        logo: 'https://cdn.simpleicons.org/python/3776AB',
        img: progPythonEssentials2,
        description: 'Continues foundational Python training into intermediate territory, covering modules, exceptions, object-oriented programming, and file processing.',
        verifyUrl: '#'
      }
    ]
  },
  {
    id: 'softwareEngineering',
    label: 'Software Engineering',
    Icon: ShieldCheck,
    color: '#00C48C',
    short: 'Software Eng.',
    certs: [
      {
        title: 'Blockchain Basics',
        issuer: 'University at Buffalo, SUNY · Coursera',
        date: 'Dec 12, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: sweBlockchainBasics,
        description: 'Introduces blockchain fundamentals, including distributed ledgers, consensus mechanisms, cryptographic hashing, and smart contract concepts.',
        verifyUrl: 'https://coursera.org/verify/E673GPV87BUY'
      },
      {
        title: 'Continuous Integration and Continuous Delivery (CI/CD)',
        issuer: 'IBM · Coursera',
        date: 'Dec 12, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: sweCicd,
        description: 'Covers CI/CD pipeline design, automated testing and deployment strategies, and DevOps practices for shipping software reliably.',
        verifyUrl: 'https://coursera.org/verify/N9S8I5LFXP8R'
      },
      {
        title: 'Developing Front-End Apps with React',
        issuer: 'IBM · Coursera',
        date: 'Oct 24, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: sweReactFrontend,
        description: 'Covers building single-page applications with React, including components, hooks, state management, and connecting a front end to backend APIs.',
        verifyUrl: 'https://coursera.org/verify/STYJ5SJCM7VU'
      },
      {
        title: 'Developing Back-End Apps with Node.js and Express',
        issuer: 'IBM · Coursera',
        date: 'Dec 6, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: sweNodeBackend,
        description: 'Covers building a REST API backend with Node.js and Express, including routing, middleware, authentication, and connecting to a database.',
        verifyUrl: 'https://coursera.org/verify/GL2HRRRAWTSU'
      },
      {
        title: 'Introduction to Software Engineering',
        issuer: 'IBM · Coursera',
        date: 'Sep 26, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: sweIntroSoftwareEng,
        description: 'Introductory course covering the software development lifecycle, engineering best practices, version control, and foundational design principles.',
        verifyUrl: 'https://coursera.org/verify/QLJQVVK1PXVR'
      },
      {
        title: 'Modeling and Simulation with Simulink',
        issuer: 'MathWorks · Coursera',
        date: 'Sep 12, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: sweSimulink,
        description: 'Covers building and simulating dynamic system models in Simulink, including block diagrams, signal flow, and simulation analysis.',
        verifyUrl: 'https://coursera.org/verify/V2L5W23ZDPPO'
      },
      {
        title: 'Simulation Models for Decision Making',
        issuer: 'University of Minnesota · Coursera',
        date: 'Oct 24, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: sweSimulationDecision,
        description: 'Explores using simulation models to support business and engineering decisions, including scenario analysis and quantitative decision frameworks.',
        verifyUrl: 'https://coursera.org/verify/KHNNISYDJ83V'
      },
      {
        title: 'The Sustainable Development Goals \u2013 A Global, Transdisciplinary Vision for the Future',
        issuer: 'University of Copenhagen · Coursera',
        date: 'Dec 19, 2025',
        logo: 'https://cdn.simpleicons.org/coursera/0056D2',
        img: sweSustainableDevGoals,
        description: 'Explores the UN Sustainable Development Goals through a transdisciplinary lens, covering how technology and engineering practice intersect with global sustainability challenges.',
        verifyUrl: 'https://coursera.org/verify/L2KNLQ2U6PI3'
      },
      {
        title: 'Learning GitHub',
        issuer: 'LinkedIn Learning',
        date: 'Jul 24, 2026',
        logo: 'https://cdn.simpleicons.org/github/181717',
        img: sweLngt,
        description: 'Covers Git and GitHub fundamentals, including repositories, branching, commits, pull requests, and collaborative version control workflows.',
        verifyUrl: '#'
      }
    ]
  },
  {
    id: 'professional',
    label: 'Professional Training',
    Icon: Award,
    color: '#E11D48',
    short: 'Professional',
    certs: [
      {
        title: 'Accenture Technology Academy \u2013 Certificate of Completion',
        issuer: 'Accenture · Microsoft',
        date: 'May 22, 2026',
        logo: 'https://cdn.simpleicons.org/accenture/A100FF',
        img: acnCompletion,
        description: 'Awarded for successfully completing the Accenture Technology Academy under Microsoft, a 154-hour program run from April 30 to May 22, 2026.',
        verifyUrl: '#'
      },
      {
        title: 'Accenture Technology Academy \u2013 Certificate of Participation',
        issuer: 'Accenture · Microsoft',
        date: 'May 22, 2026',
        logo: 'https://cdn.simpleicons.org/accenture/A100FF',
        img: acnParticipation,
        description: 'Recognizes active participation in the 154-hour Accenture Technology Academy under Microsoft, running from April 30 to May 22, 2026.',
        verifyUrl: '#'
      }
    ]
  }
];

// ============================================================================
// DERIVED DATA
// ============================================================================

const PROVIDERS = ['Coursera', 'Cisco', 'LinkedIn', 'DICT', 'Accenture'];

// Flat list in data order, each cert tagged with its category, a stable id,
// a running number, and a parsed date for sorting the timeline.
const allCerts = certCategories.flatMap((category) =>
  category.certs.map((cert, i) => ({
    ...cert,
    id: `${category.id}-${i}`,
    category,
    categoryLabel: category.label,
    time: Date.parse(cert.date) || 0,
    verified: !!cert.verifyUrl && cert.verifyUrl !== '#',
    provider: PROVIDERS.find((p) => cert.issuer.includes(p)) ?? cert.issuer,
  }))
).map((cert, i) => ({ ...cert, n: i + 1 }));

const TOTAL = allCerts.length;
const certById = Object.fromEntries(allCerts.map((c) => [c.id, c]));

// Headline credentials for the spotlight carousel and the homepage preview.
const FEATURED_IDS = [
  'professional-0',
  'softwareEngineering-2',
  'softwareEngineering-3',
  'softwareEngineering-1',
  'ai-0',
];
const featuredCerts = FEATURED_IDS.map((id) => certById[id]).filter(Boolean);

const categoryCounts = Object.fromEntries(certCategories.map((c) => [c.id, c.certs.length]));
const STATS = [
  { label: 'Credentials', value: TOTAL },
  { label: 'Domains', value: certCategories.length },
  { label: 'Platforms', value: new Set(allCerts.map((c) => c.provider)).size },
  { label: 'Verifiable online', value: allCerts.filter((c) => c.verified).length },
];

const pad2 = (n) => String(n).padStart(2, '0');

// ============================================================================
// STYLES — scoped colour classes beat the global `.light/.dark h1..span`
// `!important` overrides in index.css, plus the holographic foil layers.
// ============================================================================

const vaultVars = (darkMode) => ({
  ...cssVars(getPalette(darkMode)),
  '--foil-blend': darkMode ? 'color-dodge' : 'multiply',
  '--foil-o': darkMode ? 0.9 : 0.45,
  '--glare-a': darkMode ? 0.22 : 0.65,
  '--card-shadow': darkMode ? '0 20px 45px -15px rgba(0,0,0,0.6)' : '0 20px 45px -18px rgba(27,27,42,0.35)',
});

const VaultStyles = () => (
  <style>{`
    .cv-scope :is(h1,h2,h3,h4,p,span,li).cv-acc { color: var(--acc) !important; }
    .cv-scope :is(h1,h2,h3,h4,p,span,li).cv-hi { color: var(--acc-hi) !important; }
    .cv-scope :is(h1,h2,h3,h4,p,span,li).cv-ink { color: var(--ink) !important; }
    .cv-scope :is(h1,h2,h3,h4,p,span,li).cv-white { color: #ffffff !important; }
    .cv-scope :is(h1,h2,h3,h4,p,span,li).cv-dark { color: #1B1B2A !important; }
    .cv-scope :is(h1,h2,h3,h4,p,span,li).cv-inherit { color: inherit !important; }
    .cv-scope :is(h1,h2,h3,h4,p,span,li).cv-cat { color: var(--c) !important; }
    .cv-scope :is(h1,h2,h3,h4,p,span,li).cv-tc { color: var(--tc) !important; }

    .cv-foil {
      background: linear-gradient(115deg, transparent 18%, rgba(255,0,122,0.4) 30%, rgba(0,255,179,0.4) 40%,
        rgba(167,0,255,0.4) 50%, rgba(0,240,255,0.4) 60%, rgba(255,234,0,0.35) 68%, transparent 80%);
      background-size: 260% 260%;
      background-position: var(--px, 50%) var(--py, 50%);
      mix-blend-mode: var(--foil-blend);
      opacity: calc(var(--holo-o, 0) * var(--foil-o));
      transition: opacity 300ms ease;
    }
    .cv-glare {
      background: radial-gradient(circle at var(--px, 50%) var(--py, 50%), rgba(255,255,255,var(--glare-a)), transparent 52%);
      opacity: var(--holo-o, 0);
      transition: opacity 300ms ease;
    }
    .cv-sparkle {
      background-image: radial-gradient(circle, rgba(255,255,255,0.9) 0.8px, transparent 1.4px);
      background-size: 16px 16px;
      background-position: calc(var(--px, 50%) / 4) calc(var(--py, 50%) / 4);
      opacity: calc(var(--holo-o, 0) * 0.35);
      mix-blend-mode: overlay;
      transition: opacity 300ms ease;
    }
    @keyframes cv-spin { to { transform: rotate(360deg); } }
    @keyframes cv-pulse { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.6); opacity: 0; } }
    .cv-no-scrollbar::-webkit-scrollbar { display: none; }
    @media (prefers-reduced-motion: reduce) { .cv-anim { animation: none !important; } }
  `}</style>
);

// ============================================================================
// SHARED PIECES
// ============================================================================

const SectionEyebrow = ({ label, icon }) => (
  <div className="flex items-center gap-4 sm:gap-6">
    <h3 className="cv-acc text-[0.625rem] sm:text-[0.6875rem] md:text-[0.75rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] whitespace-nowrap">
      {label}
    </h3>
    <div className="h-px flex-1 bg-[color:var(--acc-line)]" />
    <span className="cv-acc shrink-0">{icon}</span>
  </div>
);

const IssuerLogo = ({ cert, size = 'md' }) => {
  const dims = size === 'lg' ? 'w-16 h-16 p-3' : size === 'sm' ? 'w-10 h-10 p-2' : 'w-14 h-14 p-2.5';
  return (
    <div className={`${dims} rounded-lg bg-white flex items-center justify-center shadow-md overflow-hidden shrink-0`}>
      <img src={cert.logo} alt="" loading="lazy" className="w-full h-full object-contain" />
    </div>
  );
};

const CategoryPill = ({ category }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[0.5625rem] font-black uppercase tracking-widest"
    style={{ '--c': category.color, borderColor: rgba(category.color, 0.35), background: rgba(category.color, 0.1) }}
  >
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: category.color }} />
    <span className="cv-cat">{category.short}</span>
  </span>
);

// pointer-driven holo tilt shared by cards and the spotlight
const useHolo = (reduced, strength = 14) => {
  const ref = useRef(null);
  const onPointerMove = (e) => {
    const el = ref.current;
    if (!el || reduced || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--px', `${px * 100}%`);
    el.style.setProperty('--py', `${py * 100}%`);
    el.style.setProperty('--holo-o', '1');
    if (strength) {
      el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * strength}deg) rotateY(${(px - 0.5) * strength}deg) scale(1.03)`;
    }
  };
  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    if (strength) el.style.transform = '';
    el.style.setProperty('--holo-o', '0');
  };
  return { ref, onPointerMove, onPointerLeave };
};

const HoloLayers = () => (
  <>
    <div className="cv-foil pointer-events-none absolute inset-0 rounded-[inherit]" />
    <div className="cv-sparkle pointer-events-none absolute inset-0 rounded-[inherit]" />
    <div className="cv-glare pointer-events-none absolute inset-0 rounded-[inherit]" />
  </>
);

const CountUp = ({ to, reduced }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  useEffect(() => {
    if (!inView || !ref.current) return undefined;
    if (reduced) {
      ref.current.textContent = pad2(to);
      return undefined;
    }
    const controls = animate(0, to, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = pad2(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, to, reduced]);
  return (
    <span ref={ref} className="cv-ink tabular-nums">
      00
    </span>
  );
};

// ============================================================================
// HOLO CARD — collectible-style credential card
// ============================================================================

const HoloCard = ({ cert, index = 0, reduced, onOpen }) => {
  const holo = useHolo(reduced);
  const { category } = cert;
  const Icon = category.Icon;

  return (
    <motion.div
      layout={!reduced}
      initial={reduced ? false : { opacity: 0, y: 28, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 26, delay: reduced ? 0 : Math.min(index, 12) * 0.035 }}
      className="h-full"
    >
      <button
        ref={holo.ref}
        onClick={(e) => onOpen(cert, e.currentTarget)}
        onPointerMove={holo.onPointerMove}
        onPointerLeave={holo.onPointerLeave}
        aria-label={`Inspect ${cert.title}`}
        className="group relative w-full h-full flex flex-col gap-5 p-6 sm:p-7 rounded-xl border text-left overflow-hidden backdrop-blur-md border-[color:var(--line)] bg-[color:var(--surface)] hover:border-[color:var(--acc-line)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
        style={{
          '--c': category.color,
          boxShadow: 'var(--card-shadow)',
          transition: 'transform 180ms ease-out, border-color 300ms ease',
          willChange: 'transform',
        }}
      >
        <span className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${category.color}, transparent)` }} />
        <Icon
          size={120}
          strokeWidth={1}
          className="pointer-events-none absolute -right-6 -bottom-6 opacity-[0.07] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6"
          style={{ color: category.color }}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="relative">
            <span
              className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
              style={{ background: rgba(category.color, 0.45) }}
            />
            <div className="relative">
              <IssuerLogo cert={cert} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="cv-ink font-mono text-[0.625rem] opacity-50">
              #{pad2(cert.n)}/{TOTAL}
            </span>
            {cert.verified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00C48C] text-[0.5625rem] font-black uppercase tracking-widest">
                <BadgeCheck size={11} className="text-white" />
                <span className="cv-white">Verifiable</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[color:var(--line)] text-[0.5625rem] font-black uppercase tracking-widest">
                <Award size={11} className="opacity-60" />
                <span className="cv-ink opacity-70">Issued</span>
              </span>
            )}
          </div>
        </div>

        <div className="relative space-y-2 flex-1">
          <h4 className="cv-ink text-base sm:text-lg font-black leading-tight line-clamp-3">{cert.title}</h4>
          <p className="cv-acc text-[0.625rem] sm:text-[0.6875rem] font-black uppercase tracking-widest">{cert.issuer}</p>
        </div>

        <div className="relative flex items-center justify-between gap-2 pt-4 border-t border-[color:var(--line)]">
          <CategoryPill category={category} />
          <span className="cv-ink flex items-center gap-1.5 font-mono text-[0.625rem] opacity-60">
            <Calendar size={11} /> {cert.date}
          </span>
        </div>

        <HoloLayers />
      </button>
    </motion.div>
  );
};

// ============================================================================
// SPOTLIGHT — draggable 3D coverflow of headline certificates
// ============================================================================

const Spotlight = ({ items, reduced, darkMode, onOpen }) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragRef = useRef(null);
  const suppressClick = useRef(false);
  const holo = useHolo(reduced, 0);
  const n = items.length;

  const go = useCallback((d) => setActive((a) => (a + d + n) % n), [n]);

  useEffect(() => {
    if (reduced || paused || n < 2) return undefined;
    const t = setInterval(() => go(1), 4200);
    return () => clearInterval(t);
  }, [reduced, paused, go, n]);

  const rel = (i) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  const onPointerDown = (e) => {
    dragRef.current = { x: e.clientX, dx: 0 };
    suppressClick.current = false;
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    dragRef.current.dx = e.clientX - dragRef.current.x;
    if (Math.abs(dragRef.current.dx) > 8) suppressClick.current = true;
  };
  const onPointerUp = () => {
    const d = dragRef.current?.dx ?? 0;
    if (Math.abs(d) > 50) go(d < 0 ? 1 : -1);
    dragRef.current = null;
  };

  const current = items[active];

  return (
    <div
      className="relative select-none overflow-x-clip py-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        else if (e.key === 'ArrowLeft') go(-1);
      }}
    >
      <div
        className="relative touch-pan-y"
        style={{ perspective: '1400px' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          dragRef.current = null;
        }}
      >
        {/* sizing spacer — the cards are absolutely stacked on top of it */}
        <div className="invisible mx-auto w-[74vw] max-w-[33.75rem] aspect-[1.414/1]" />
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-6 w-[60%] h-12 rounded-full blur-2xl"
          style={{ background: 'var(--acc-glow)', opacity: 0.6 }}
        />

        {items.map((cert, i) => {
          const d = rel(i);
          const abs = Math.abs(d);
          const hidden = abs > 2;
          const isActive = d === 0;
          return (
            <button
              key={cert.id}
              ref={isActive ? holo.ref : undefined}
              onPointerMove={isActive ? holo.onPointerMove : undefined}
              onPointerLeave={isActive ? holo.onPointerLeave : undefined}
              onClick={(e) => {
                if (suppressClick.current) return;
                if (isActive) onOpen(cert, e.currentTarget, items);
                else setActive(i);
              }}
              tabIndex={hidden ? -1 : 0}
              aria-label={isActive ? `Inspect ${cert.title}` : `Show ${cert.title}`}
              className="absolute left-1/2 top-0 w-[74vw] max-w-[33.75rem] aspect-[1.414/1] rounded-xl overflow-hidden bg-white border-2 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
              style={{
                '--holo-o': 0,
                borderColor: isActive ? 'var(--acc)' : 'var(--line)',
                transform: `translateX(-50%) translateX(${d * 56}%) translateZ(${-abs * 220}px) rotateY(${d * -38}deg)`,
                zIndex: 10 - abs,
                opacity: hidden ? 0 : 1 - abs * 0.2,
                filter: isActive ? 'none' : `brightness(${darkMode ? 0.5 : 0.85}) blur(${abs * 1.2}px)`,
                boxShadow: isActive ? '0 30px 60px -20px var(--acc-glow)' : 'none',
                transition: reduced
                  ? 'none'
                  : 'transform 750ms cubic-bezier(0.22,1,0.36,1), opacity 500ms ease, filter 500ms ease, border-color 300ms',
                pointerEvents: hidden ? 'none' : 'auto',
              }}
            >
              <img
                src={cert.img}
                alt={cert.title}
                draggable={false}
                decoding="async"
                className="w-full h-full object-contain pointer-events-none"
              />
              <div className="absolute bottom-3 left-3">
                <IssuerLogo cert={cert} size="sm" />
              </div>
              {isActive && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 text-[0.5625rem] font-black uppercase tracking-widest">
                  <ZoomIn size={11} className="text-white" />
                  <span className="cv-white">Inspect</span>
                </span>
              )}
              {isActive && <HoloLayers />}
            </button>
          );
        })}
      </div>

      <div className="mt-12 sm:mt-14 flex flex-col items-center gap-5 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={reduced ? false : { opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
            transition={{ duration: 0.35 }}
            className="space-y-2 max-w-2xl px-4"
          >
            <p className="cv-acc text-[0.625rem] sm:text-[0.6875rem] font-black uppercase tracking-[0.3em]">
              {current.issuer}
            </p>
            <h4 className="cv-ink text-xl sm:text-3xl font-black tracking-tight leading-tight">{current.title}</h4>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-4">
          <button
            onClick={() => go(-1)}
            aria-label="Previous highlight"
            className="p-2.5 rounded-full border border-[color:var(--acc-line)] text-[color:var(--acc)] hover:bg-[color:var(--acc)] hover:text-[color:var(--acc-ink)] transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            {items.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActive(i)}
                aria-label={`Go to ${c.title}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === active ? 28 : 8, background: i === active ? 'var(--acc)' : 'var(--acc-line)' }}
              />
            ))}
          </div>
          <button
            onClick={() => go(1)}
            aria-label="Next highlight"
            className="p-2.5 rounded-full border border-[color:var(--acc-line)] text-[color:var(--acc)] hover:bg-[color:var(--acc)] hover:text-[color:var(--acc-ink)] transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <p className="cv-ink flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.25em] opacity-50">
          <Hand size={12} /> Drag, swipe, or use ← → · click the front card to inspect
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// DOMAIN RING — interactive donut of certificates per category
// ============================================================================

const DomainRing = ({ filter, onPick, reduced }) => {
  const [hover, setHover] = useState(null);
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef, { once: true, margin: '-60px' });
  const drawn = inView || reduced;

  const R = 78;
  const STROKE = 20;
  const CIRC = 2 * Math.PI * R;
  const GAP = 3;
  const maxCount = Math.max(...Object.values(categoryCounts));

  let offset = 0;
  const segments = certCategories.map((cat, i) => {
    const len = (categoryCounts[cat.id] / TOTAL) * CIRC;
    const seg = { cat, i, len: Math.max(0, len - GAP), offset };
    offset += len;
    return seg;
  });

  const focusId = hover ?? (filter !== 'all' ? filter : null);
  const focus = focusId ? certCategories.find((c) => c.id === focusId) : null;

  return (
    <div ref={wrapRef} className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-8 sm:gap-10">
      <div className="relative mx-auto w-52 h-52 sm:w-60 sm:h-60">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" role="img" aria-label="Certificates by domain">
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--line)" strokeWidth={STROKE} />
          {segments.map((s) => {
            const isFocus = focusId === s.cat.id;
            const dim = focusId && !isFocus;
            return (
              <circle
                key={s.cat.id}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={s.cat.color}
                strokeWidth={isFocus ? STROKE + 8 : STROKE}
                strokeDasharray={drawn ? `${s.len} ${CIRC}` : `0 ${CIRC}`}
                strokeDashoffset={-s.offset}
                onMouseEnter={() => setHover(s.cat.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onPick(filter === s.cat.id ? 'all' : s.cat.id)}
                style={{
                  cursor: 'pointer',
                  opacity: dim ? 0.3 : 1,
                  filter: isFocus ? `drop-shadow(0 0 6px ${s.cat.color})` : 'none',
                  transition: `stroke-dasharray 1100ms cubic-bezier(0.22,1,0.36,1) ${reduced ? 0 : s.i * 90}ms, stroke-width 250ms ease, opacity 250ms ease`,
                }}
              >
                <title>{`${s.cat.label}: ${categoryCounts[s.cat.id]}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={focus?.id ?? 'total'}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
            >
              <p className="cv-ink text-4xl sm:text-5xl font-black tracking-tighter tabular-nums leading-none">
                {pad2(focus ? categoryCounts[focus.id] : TOTAL)}
              </p>
              <p
                className={`${focus ? 'cv-cat' : 'cv-acc'} mt-1 text-[0.5625rem] sm:text-[0.625rem] font-black uppercase tracking-[0.2em] leading-tight`}
                style={focus ? { '--c': focus.color } : undefined}
              >
                {focus ? focus.label : 'Credentials'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ul className="space-y-1.5">
        {certCategories.map((cat) => {
          const count = categoryCounts[cat.id];
          const isOn = filter === cat.id;
          const dim = focusId && focusId !== cat.id;
          return (
            <li key={cat.id}>
              <button
                onClick={() => onPick(isOn ? 'all' : cat.id)}
                onMouseEnter={() => setHover(cat.id)}
                onMouseLeave={() => setHover(null)}
                aria-pressed={isOn}
                className={`w-full grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-200 ${
                  isOn ? 'bg-[color:var(--acc-soft)]' : 'hover:bg-[color:var(--surface-strong)]'
                }`}
                style={{ opacity: dim ? 0.45 : 1 }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color, boxShadow: `0 0 8px ${cat.color}` }} />
                <span className="min-w-0">
                  <span className="cv-ink block text-xs sm:text-sm font-black truncate">{cat.label}</span>
                  <span className="block h-1 mt-1 rounded-full bg-[color:var(--line)] overflow-hidden">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: drawn ? `${(count / maxCount) * 100}%` : '0%',
                        background: cat.color,
                        transition: 'width 1000ms cubic-bezier(0.22,1,0.36,1) 300ms',
                      }}
                    />
                  </span>
                </span>
                <span className="cv-ink font-mono text-xs opacity-70 tabular-nums">{pad2(count)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// ============================================================================
// TIMELINE — every credential in date order, line draws as you scroll
// ============================================================================

const Timeline = ({ certs, reduced, onOpen }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const groups = useMemo(() => {
    const sorted = [...certs].sort((a, b) => b.time - a.time);
    const map = new Map();
    sorted.forEach((c) => {
      const key = new Date(c.time).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    });
    return [...map.entries()];
  }, [certs]);

  return (
    <div ref={ref} className="relative pl-8 sm:pl-12">
      <div className="absolute left-3 sm:left-5 top-2 bottom-2 w-px bg-[color:var(--line)]" />
      <motion.div
        className="absolute left-3 sm:left-5 top-2 bottom-2 w-px origin-top"
        style={{
          scaleY: reduced ? 1 : lineScale,
          background: 'linear-gradient(to bottom, var(--acc), var(--acc2))',
          boxShadow: '0 0 10px var(--acc-glow)',
        }}
      />

      <div className="space-y-10">
        {groups.map(([month, list]) => (
          <section key={month} className="space-y-4">
            <div className="relative">
              <span className="absolute -left-[1.625rem] sm:-left-[2.125rem] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[color:var(--acc)] bg-[color:var(--surface-strong)]" />
              <h4 className="cv-acc font-mono text-[0.6875rem] sm:text-xs font-black uppercase tracking-[0.3em]">{month}</h4>
            </div>
            {list.map((cert, i) => (
              <motion.button
                key={cert.id}
                initial={reduced ? false : { opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => onOpen(cert, e.currentTarget)}
                className="group relative w-full grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 sm:p-5 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-md text-left hover:border-[color:var(--acc-line)] hover:translate-x-1 transition-[transform,border-color] duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
              >
                <span className="absolute -left-[1.375rem] sm:-left-[1.875rem] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: cert.category.color }}>
                  <span
                    className="cv-anim absolute inset-0 rounded-full"
                    style={{ background: cert.category.color, animation: 'cv-pulse 1.8s ease-out infinite' }}
                  />
                </span>
                <IssuerLogo cert={cert} size="sm" />
                <span className="min-w-0 space-y-1">
                  <span className="cv-ink block text-sm sm:text-base font-black leading-snug">{cert.title}</span>
                  <span className="cv-acc block text-[0.625rem] font-black uppercase tracking-widest truncate">{cert.issuer}</span>
                </span>
                <span className="col-span-2 sm:col-span-1 flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                  <CategoryPill category={cert.category} />
                  <span className="cv-ink font-mono text-[0.625rem] opacity-60">{cert.date}</span>
                </span>
              </motion.button>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAGNIFIER — zoom lens that follows the cursor over the certificate image
// ============================================================================

const LENS = 150;
const ZOOM = 2.6;

const Magnifier = ({ src, alt }) => {
  const [lens, setLens] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setLens({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height });
  };

  return (
    <div
      className="relative inline-block max-w-full cursor-zoom-in"
      onPointerMove={onMove}
      onPointerLeave={() => setLens(null)}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="cv-anim w-10 h-10 rounded-full border-2 border-[color:var(--line)] border-t-[color:var(--acc)]"
            style={{ animation: 'cv-spin 0.8s linear infinite' }}
          />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onLoad={() => setLoaded(true)}
        className="block max-w-full max-h-[44vh] lg:max-h-[72vh] w-auto h-auto rounded-md shadow-xl"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'scale(1)' : 'scale(0.96)',
          transition: 'opacity 400ms ease, transform 500ms cubic-bezier(0.22,1,0.36,1)',
          minWidth: loaded ? undefined : 240,
          minHeight: loaded ? undefined : 170,
        }}
      />
      {lens && loaded && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-white"
          style={{
            width: LENS,
            height: LENS,
            left: lens.x - LENS / 2,
            top: lens.y - LENS / 2,
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${lens.w * ZOOM}px ${lens.h * ZOOM}px`,
            backgroundPosition: `${-(lens.x * ZOOM - LENS / 2)}px ${-(lens.y * ZOOM - LENS / 2)}px`,
            boxShadow: '0 12px 30px rgba(0,0,0,0.45), 0 0 0 4px var(--acc-line)',
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// INSPECT MODAL — springs out of the clicked card, swipe / ← → to browse
// ============================================================================

const CertModal = ({ open, darkMode, onClose, onNav }) => {
  const reduced = useReducedMotion();
  const cert = open?.cert;
  const list = open?.list ?? [];
  const index = cert ? list.findIndex((c) => c.id === cert.id) : -1;
  const hasNav = list.length > 1;
  const dirRef = useRef(1);

  const nav = useCallback(
    (d) => {
      dirRef.current = d;
      onNav(d);
    },
    [onNav]
  );

  useEffect(() => {
    if (!cert) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && hasNav) nav(1);
      else if (e.key === 'ArrowLeft' && hasNav) nav(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [cert, hasNav, nav, onClose]);

  const origin = useMemo(() => {
    const r = open?.rect;
    if (!r || typeof window === 'undefined') return { x: 0, y: 40, scale: 0.85 };
    return {
      x: r.left + r.width / 2 - window.innerWidth / 2,
      y: r.top + r.height / 2 - window.innerHeight / 2,
      scale: 0.25,
    };
    // the origin is fixed per opening, not per navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open?.openId]);

  if (typeof document === 'undefined') return null;
  const palette = getPalette(darkMode);

  return createPortal(
    <div className="cv-scope" style={vaultVars(darkMode)}>
      <AnimatePresence>
        {cert && (
          <motion.div
            key="cv-modal"
            className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={cert.title}
              initial={reduced ? { opacity: 0 } : { opacity: 0, ...origin, rotateX: 18 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className="relative w-full max-w-lg lg:max-w-6xl max-h-[92vh] overflow-y-auto lg:overflow-hidden rounded-2xl border shadow-2xl lg:flex"
              style={{
                background: darkMode ? 'rgba(20,20,34,0.96)' : 'rgba(255,253,245,0.98)',
                borderColor: rgba(cert.category.color, 0.45),
                color: palette.ink,
                transformPerspective: 1200,
              }}
            >
              <span
                className="absolute inset-x-0 top-0 h-1 z-10"
                style={{ background: `linear-gradient(90deg, ${cert.category.color}, var(--acc2), transparent)` }}
              />
              <button
                onClick={onClose}
                aria-label="Close certificate"
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
              >
                <X size={18} />
              </button>

              <AnimatePresence mode="wait" custom={dirRef.current}>
                <motion.div
                  key={cert.id}
                  custom={dirRef.current}
                  initial={reduced ? false : { opacity: 0, x: dirRef.current * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: dirRef.current * -60 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  drag={hasNav ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  dragSnapToOrigin
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -90) nav(1);
                    else if (info.offset.x > 90) nav(-1);
                  }}
                  className="w-full lg:flex"
                >
                  <div
                    className="relative flex items-center justify-center p-5 sm:p-8 lg:p-10 lg:w-3/5 lg:shrink-0 min-h-[13.75rem]"
                    style={{
                      background: darkMode
                        ? `radial-gradient(circle at 50% 40%, ${rgba(cert.category.color, 0.18)}, rgba(0,0,0,0.25) 70%)`
                        : `radial-gradient(circle at 50% 40%, ${rgba(cert.category.color, 0.14)}, #F4F1E8 70%)`,
                    }}
                  >
                    <Magnifier src={cert.img} alt={cert.title} />
                    <span className="hidden lg:inline-flex absolute bottom-4 left-1/2 -translate-x-1/2 items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 text-[0.5625rem] font-black uppercase tracking-widest">
                      <ZoomIn size={11} className="text-white" />
                      <span className="cv-white">Hover to magnify</span>
                    </span>
                  </div>

                  <div className="p-6 sm:p-8 lg:p-10 space-y-5 lg:w-2/5 lg:flex lg:flex-col lg:justify-center">
                    <div className="flex flex-wrap items-center gap-2 pr-10">
                      <CategoryPill category={cert.category} />
                      <span className="cv-ink font-mono text-[0.625rem] opacity-50">
                        Credential #{pad2(cert.n)} / {TOTAL}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      <IssuerLogo cert={cert} size="lg" />
                      <h3 className="cv-ink text-xl sm:text-2xl lg:text-3xl font-black leading-tight tracking-tight">
                        {cert.title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-[0.6875rem] font-black uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <Building2 size={14} style={{ color: cert.category.color }} />
                        <span className="cv-ink opacity-75">{cert.issuer}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: cert.category.color }} />
                        <span className="cv-ink opacity-75">{cert.date}</span>
                      </span>
                    </div>

                    {cert.description && (
                      <p className="cv-ink text-sm leading-relaxed opacity-80">{cert.description}</p>
                    )}

                    {cert.verified ? (
                      <a
                        href={cert.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/v inline-flex w-fit items-center gap-2 px-5 py-3 rounded-md font-black text-[0.6875rem] uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--acc)]"
                        style={{ background: 'var(--acc)', color: 'var(--acc-ink)' }}
                      >
                        <BadgeCheck size={15} /> Verify credential
                        <ExternalLink size={13} className="transition-transform group-hover/v:translate-x-0.5" />
                      </a>
                    ) : (
                      <p className="cv-ink flex items-center gap-2 text-[0.6875rem] font-black uppercase tracking-widest opacity-60">
                        <Award size={14} /> Issued certificate · no public verify link
                      </p>
                    )}

                    {hasNav && (
                      <div className="flex items-center justify-between gap-3 pt-5 border-t border-[color:var(--line)]">
                        <button
                          onClick={() => nav(-1)}
                          aria-label="Previous certificate"
                          className="p-2.5 rounded-full border border-[color:var(--acc-line)] text-[color:var(--acc)] hover:bg-[color:var(--acc)] hover:text-[color:var(--acc-ink)] transition-colors"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="cv-ink font-mono text-[0.625rem] uppercase tracking-[0.2em] opacity-60 text-center">
                          {pad2(index + 1)} / {pad2(list.length)}
                          <span className="hidden sm:inline"> · ← → or swipe</span>
                        </span>
                        <button
                          onClick={() => nav(1)}
                          aria-label="Next certificate"
                          className="p-2.5 rounded-full border border-[color:var(--acc-line)] text-[color:var(--acc)] hover:bg-[color:var(--acc)] hover:text-[color:var(--acc-ink)] transition-colors"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

// open / close / browse state for the modal, shared by both exports
const useCertModal = () => {
  const [open, setOpen] = useState(null);
  const openCert = useCallback((cert, el, list) => {
    setOpen({ cert, list: list ?? [cert], rect: el?.getBoundingClientRect?.() ?? null, openId: Date.now() });
  }, []);
  const close = useCallback(() => setOpen(null), []);
  const nav = useCallback((d) => {
    setOpen((o) => {
      if (!o || o.list.length < 2) return o;
      const i = o.list.findIndex((c) => c.id === o.cert.id);
      return { ...o, cert: o.list[(i + d + o.list.length) % o.list.length] };
    });
  }, []);
  return { open, openCert, close, nav };
};

// ============================================================================
// FULL CERTIFICATIONS PAGE
// Used on its own nav section, e.g. activeSection === 'certificates'.
// ============================================================================

const ToggleGroup = ({ id, value, options, onChange }) => (
  <div className="relative inline-flex p-1 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)]">
    {options.map(({ value: v, label, Icon }) => {
      const on = value === v;
      return (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-pressed={on}
          className="relative flex items-center gap-2 px-3.5 py-2 rounded text-[0.625rem] font-black uppercase tracking-[0.18em]"
        >
          {on && (
            <motion.span
              layoutId={`${id}-pill`}
              className="absolute inset-0 rounded bg-[color:var(--acc)]"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <span className="cv-tc relative flex items-center gap-2" style={{ '--tc': on ? 'var(--acc-ink)' : 'var(--ink)' }}>
            <Icon size={13} />
            <span className="cv-inherit">{label}</span>
          </span>
        </button>
      );
    })}
  </div>
);

export default function Certifications({ darkMode = true }) {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('grid');
  const collectionRef = useRef(null);
  const modal = useCertModal();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCerts.filter(
      (c) =>
        (filter === 'all' || c.category.id === filter) &&
        (!q || c.title.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q))
    );
  }, [filter, query]);

  const pickFromRing = (id) => {
    setFilter(id);
    collectionRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const openFromCollection = (cert, el) => modal.openCert(cert, el, filtered);

  const chips = [{ id: 'all', short: 'All', color: null, count: TOTAL }].concat(
    certCategories.map((c) => ({ id: c.id, short: c.short, color: c.color, count: categoryCounts[c.id] }))
  );

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    <section className="cv-scope space-y-16 sm:space-y-24 pt-6 sm:pt-10" style={vaultVars(darkMode)}>
      <VaultStyles />
      <CertModal open={modal.open} darkMode={darkMode} onClose={modal.close} onNav={modal.nav} />

      {/* ================= HEADER ================= */}
      <header className="relative space-y-5 sm:space-y-6">
        <HandStyles />
        <div className="hidden lg:block absolute right-2 top-0 w-60">
          <StickyNote title="confession:" rot={-3} bg="#B8FFE4">
            I collect certificates like trading cards. Gotta catch &apos;em all.
          </StickyNote>
        </div>
        <motion.p {...reveal(0)} className="cv-acc font-mono text-[0.6875rem] uppercase tracking-[0.4em]">
          ~/credentials
        </motion.p>
        <motion.h2 {...reveal(0.08)} className="cv-ink text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.95]">
          The Credential{' '}
          <span className="relative inline-block px-2 ml-2 sm:ml-4">
            <span className="cv-acc">Vault.</span>
            <Doodle type="circle" className="absolute -inset-x-3 -inset-y-2 sm:-inset-x-5 sm:-inset-y-3 w-[calc(100%+1.5rem)] sm:w-[calc(100%+2.5rem)] h-[calc(100%+1rem)] sm:h-[calc(100%+1.5rem)]" strokeWidth={3} delay={0.7} />
          </span>
        </motion.h2>
        <div className="flex flex-wrap items-center gap-3">
          <HandNote className="text-2xl sm:text-3xl" rot={-2} delay={0.9}>
            ({TOTAL} and counting!)
          </HandNote>
          <Sticker bg="#FFE873" rot={4} delay={1}>
            🏅 Accenture Tech Academy grad
          </Sticker>
        </div>
        <motion.p {...reveal(0.16)} className="cv-ink text-sm sm:text-lg opacity-70 max-w-2xl leading-relaxed">
          {TOTAL} certificates across {certCategories.length} domains — from university courses on Coursera to the
          Accenture Technology Academy. Hover a card to catch the foil, click it to inspect the certificate up close.
        </motion.p>
      </header>

      {/* ================= SPOTLIGHT ================= */}
      <motion.div {...reveal(0)} className="space-y-10 sm:space-y-12">
        <SectionEyebrow label="Spotlight" icon={<Sparkles size={16} />} />
        <div className="flex items-center justify-center gap-2 -mt-4">
          <HandNote className="text-2xl" rot={-3}>
            the ones I&apos;m proudest of
          </HandNote>
          <Doodle type="arrowDown" className="w-6 h-9" delay={0.3} />
        </div>
        <Spotlight items={featuredCerts} reduced={reduced} darkMode={darkMode} onOpen={modal.openCert} />
      </motion.div>

      {/* ================= STATS + DOMAIN RING ================= */}
      <motion.div {...reveal(0)} className="space-y-8 sm:space-y-10">
        <SectionEyebrow label="By the numbers" icon={<ShieldCheck size={16} />} />
        <HandNote className="text-2xl -mt-3" rot={-2}>
          psst — click a slice of the ring to filter ↓
        </HandNote>
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 sm:gap-8">
          <div className="p-6 sm:p-10 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-md">
            <DomainRing filter={filter} onPick={pickFromRing} reduced={reduced} />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col justify-between gap-6 p-5 sm:p-7 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] backdrop-blur-md"
              >
                <span className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">
                  <CountUp to={s.value} reduced={reduced} />
                </span>
                <span className="cv-acc text-[0.625rem] sm:text-[0.6875rem] font-black uppercase tracking-[0.2em]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ================= COLLECTION ================= */}
      <div ref={collectionRef} className="space-y-8 sm:space-y-10 scroll-mt-28">
        <SectionEyebrow label="The Collection" icon={<Award size={16} />} />
        <HandNote className="text-2xl -mt-3" rot={-2}>
          hover for the shiny foil ✨ · click to read the fine print
        </HandNote>

        <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:justify-between">
          <div className="cv-no-scrollbar -mx-4 px-4 flex gap-2 overflow-x-auto xl:flex-wrap xl:overflow-visible xl:mx-0 xl:px-0" style={{ scrollbarWidth: 'none' }}>
            {chips.map((chip) => {
              const on = filter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setFilter(chip.id)}
                  aria-pressed={on}
                  className={`relative shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-md border text-[0.625rem] font-black uppercase tracking-[0.18em] transition-colors ${
                    on ? 'border-transparent' : 'border-[color:var(--line)] hover:border-[color:var(--acc-line)]'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="cv-chip-pill"
                      className="absolute inset-0 rounded-md bg-[color:var(--acc)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="cv-tc relative flex items-center gap-2" style={{ '--tc': on ? 'var(--acc-ink)' : 'var(--ink)' }}>
                    {chip.color && <span className="w-2 h-2 rounded-full" style={{ background: chip.color }} />}
                    <span className="cv-inherit">{chip.short}</span>
                    <span className="cv-inherit font-mono opacity-60">{pad2(chip.count)}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="relative flex-1 min-w-[12.5rem] xl:w-64 xl:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-[color:var(--ink)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title or issuer…"
                aria-label="Search certificates"
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-[color:var(--line)] bg-[color:var(--surface)] text-sm font-medium text-[color:var(--ink)] placeholder:opacity-50 outline-none focus:border-[color:var(--acc)] transition-colors"
              />
            </label>
            <ToggleGroup
              id="cv-view"
              value={view}
              onChange={setView}
              options={[
                { value: 'grid', label: 'Grid', Icon: LayoutGrid },
                { value: 'timeline', label: 'Timeline', Icon: History },
              ]}
            />
          </div>
        </div>

        <p className="cv-ink font-mono text-[0.6875rem] uppercase tracking-[0.2em] opacity-55">
          Showing {pad2(filtered.length)} of {TOTAL}
          {filter !== 'all' && ` · ${certCategories.find((c) => c.id === filter)?.label}`}
          {query && ` · “${query}”`}
        </p>

        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-4 rounded-xl border border-dashed border-[color:var(--line)]">
            <p className="cv-ink text-lg font-black">No credentials match that.</p>
            <button
              onClick={() => {
                setFilter('all');
                setQuery('');
              }}
              className="px-4 py-2 rounded-md border border-[color:var(--acc-line)] text-[0.6875rem] font-black uppercase tracking-widest text-[color:var(--acc)] hover:bg-[color:var(--acc-soft)]"
            >
              Reset filters
            </button>
          </div>
        ) : view === 'grid' ? (
          <motion.div layout={!reduced} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
            <AnimatePresence>
              {filtered.map((cert, idx) => (
                <HoloCard key={cert.id} cert={cert} index={idx} reduced={reduced} onOpen={openFromCollection} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <Timeline certs={filtered} reduced={reduced} onOpen={openFromCollection} />
        )}
      </div>
    </section>
  );
}

// ============================================================================
// HOMEPAGE PREVIEW (headline certs + a "View All" button leading to the
// full Certificates nav section)
// ============================================================================

export function CertificationsPreview({ darkMode = true, count = 4, onViewAll }) {
  const reduced = useReducedMotion();
  const modal = useCertModal();
  const featured = featuredCerts.concat(allCerts.filter((c) => !FEATURED_IDS.includes(c.id))).slice(0, count);

  return (
    <section className="cv-scope space-y-8 sm:space-y-10" style={vaultVars(darkMode)}>
      <VaultStyles />
      <CertModal open={modal.open} darkMode={darkMode} onClose={modal.close} onNav={modal.nav} />

      <SectionEyebrow label="Certifications" icon={<ShieldCheck size={16} />} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {featured.map((cert, idx) => (
          <HoloCard
            key={cert.id}
            cert={cert}
            index={idx}
            reduced={reduced}
            onOpen={(c, el) => modal.openCert(c, el, featured)}
          />
        ))}
      </div>

      {onViewAll && (
        <button
          onClick={onViewAll}
          className="group w-full flex items-center justify-center gap-3 py-5 sm:py-6 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] font-black text-xs uppercase tracking-widest text-[color:var(--acc)] hover:border-[color:var(--acc)] hover:-translate-y-0.5 transition-all"
        >
          Open the Credential Vault · {TOTAL} certificates
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </section>
  );
}

// shared with the chat assistant
export { allCerts, featuredCerts, TOTAL as CERT_TOTAL };
