// ============================================================================
// DATA.JS — copy for the redesign. Project details (stack, screenshots, case
// studies) still come from Project.jsx so the details sheet, the warp launch
// and the chat assistant all read from one place.
// ============================================================================

export const NAV = [
  { id: 'projects', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'stacks', label: 'Stack' },
  { id: 'certificates', label: 'Certs' },
  { id: 'play', label: 'Play' },
  { id: 'socials', label: 'Socials' },
  { id: 'contact', label: 'Contact' },
];

export const ROLES = ['Full-stack LLM developer', 'AI app builder', 'UI/UX-minded engineer', 'Coffee-powered problem solver'];

export const TOOLS = ['React', 'Next.js', 'TypeScript', 'Expo', 'Node.js', 'Supabase', 'PostgreSQL', 'Groq', 'Gemini', 'PHP', 'MySQL', 'Tailwind', 'Figma', 'Vercel'];

// order + bento shape of the work grid; `tl` is the Taglish one-liner
export const WORK_LAYOUT = [
  {
    name: 'TIDE',
    cls: 't-8 r-2 big',
    tone: 'yale',
    tl: 'Coach na talagang naaalala ang linggo mo. Focus, journal at tasks, iisang lugar lang.',
  },
  {
    name: 'Matchie',
    cls: 't-4 r-2',
    tone: 'lav',
    tl: 'Pagkagising mo, may shortlist ka na ng trabahong swak sa resume mo.',
  },
  {
    name: 'Poopipoo',
    cls: 't-4 m-3',
    tone: 'air',
    tl: 'Para sa mga emergency na hindi makapaghintay. Pinakamalapit na CR, may bidet info pa.',
  },
  {
    name: 'Snapzy',
    cls: 't-4 m-3',
    tone: 'pomp',
    tl: 'Yung libo-libong screenshot mo? Siya na ang bahalang mag-ayos.',
  },
  {
    name: 'Krea',
    cls: 't-4 m-3',
    tone: 'poly',
    tl: '35 tools para sa files mo, pero ni isa, hindi lalabas ng device mo.',
  },
  {
    name: 'Chess Fantasy',
    cls: 't-6 m-3',
    tone: 'yale',
    tl: 'Chess na parang arcade noong 90s. Subukan mong talunin yung CPU sa Hard Core.',
  },
  {
    name: 'SweepXpress',
    cls: 't-6',
    tone: 'lav',
    tl: 'Capstone na naging totoong supply-chain system, may AI copilot pa si admin.',
  },
];

export const FACTS = [
  ['Status', 'Fresh BSIT graduate'],
  ['School', 'National Teachers College'],
  ['GWA', '1.25'],
  ['Now', 'IT Intern, Grandline Maritime'],
  ['Based in', 'Sta. Cruz, Manila'],
  ['Focus', 'Full-stack · LLM apps'],
];

export const EXPERIENCE = [
  {
    period: '2026 — Now',
    role: 'IT Intern',
    company: 'Grandline Maritime Inc.',
    desc: 'Building secure Training Management Systems for maritime students, including a learning portal that protects paid course material from screenshots, and modernizing the web interfaces around them.',
    skills: ['React', 'PHP', 'SQL'],
  },
  {
    period: '2025 — 2026',
    role: 'Full-Stack Developer',
    company: 'Solo projects',
    desc: 'Designed, built and shipped seven live apps from idea to deployment: TIDE, Krea, Matchie, Snapzy, SweepXpress, Poopipoo and Chess Fantasy. Five of them have LLM features inside.',
    skills: ['React', 'Next.js', 'Expo', 'Supabase', 'Groq', 'Gemini'],
  },
];

export const TIMELINE = [
  { yr: '4th', title: 'Professional Mastery', period: '2025–26', desc: 'Anti-screenshot maritime LMS at my internship, then my own AI apps with RAG, tool calling and structured output.' },
  { yr: '3rd', title: 'Full-Stack Expansion', period: '2024–25', desc: 'Led SweepXpress (PHP + MySQL supply chain) and built Soundlify, a music streaming UI in React.' },
  { yr: '2nd', title: 'Systems & Databases', period: '2023–24', desc: 'Dough Re Mi, a full-stack bakery system: normalization, CRUD, the works.' },
  { yr: '1st', title: 'Foundations of Logic', period: '2022–23', desc: 'Algorithms and data structures in Java and Python. Banking logic and CLI tools.' },
];

export const ACHIEVEMENTS = [
  'BS Information Technology, 1.25 GWA',
  'Seven live apps shipped, five with LLM features',
  'Completed the Accenture Technology Academy',
  'Verified certifications from DICT, Cisco & Coursera',
];

export const NOW = [
  'Interning at Grandline Maritime',
  'Shipping TIDE, Krea, Matchie and Snapzy updates',
  'Collecting certificates, still counting',
];

export const SOCIALS = [
  { name: 'Facebook', handle: 'Brian Francisco', url: 'https://web.facebook.com/Bryx.Francisco111/', note: 'Life updates and the occasional meme' },
  { name: 'Instagram', handle: '@bryx_cinco', url: 'https://www.instagram.com/bryx_cinco/', note: 'Photos from outside the IDE' },
  { name: 'LinkedIn', handle: 'Brian Francisco', url: 'https://www.linkedin.com/in/brian-francisco-419b163a4/', note: 'Work, certificates and the CV' },
  { name: 'GitHub', handle: '@BryxCinco', url: 'https://github.com/BryxCinco', note: 'Source for the apps on this page' },
];

export const CONTACT = {
  email: 'bp.francisco1003@gmail.com',
  phone: '+63 956 432 1020',
  tel: '+639564321020',
};

export const METHODS = ['Agile', 'Scrum', 'SDLC', 'Waterfall', 'Kanban'];

export const SOFT_SKILLS = [
  ['Critical Thinking', 'Questions the brief before building it'],
  ['Adaptive', 'New stack, new team, still ships'],
  ['Creative', 'Looks for the less obvious answer'],
  ['Problem Solving', 'Breaks big bugs into small ones'],
  ['Logical Thinking', 'Step by step, cause to effect'],
  ['Cooperative', 'Plays well in a shared repo'],
  ['Understanding', 'Listens for what users really need'],
  ['Empathetic', 'Designs for the person on the other side'],
  ['Transparent', 'Says what is done and what is not'],
  ['Accountable', 'Owns the miss, then fixes it'],
  ['Optimistic', 'There is always a next build'],
  ['Ideator', 'Never short of the next idea'],
];
