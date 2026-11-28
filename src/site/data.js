// ============================================================================
// DATA.JS — copy for the redesign. Project details (stack, screenshots, case
// studies) still come from Project.jsx so the details sheet, the warp launch
// and the chat assistant all read from one place.
// ============================================================================

export const NAV = [
  { id: 'projects', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'stacks', label: 'Stack' },
  { id: 'certificates', label: 'Certs' },
  { id: 'play', label: 'Play' },
  { id: 'socials', label: 'Socials' },
  { id: 'contact', label: 'Contact' },
];

export const ROLES = ['Full-stack LLM developer', 'AI app builder', 'UI/UX-minded engineer', 'Coffee-powered problem solver'];

export const TOOLS = ['React', 'Next.js', 'TypeScript', 'Expo', 'Node.js', 'Supabase', 'PostgreSQL', 'Groq', 'Gemini', 'PHP', 'MySQL', 'Tailwind', 'Figma', 'Vercel'];

// project status shown on each card: change a project's `status` below to one of these
export const STATUS = {
  completed: { label: 'Completed', note: 'Done and live' },
  updating: { label: 'Updating', note: 'Live, still getting improvements' },
  'in-progress': { label: 'In progress', note: 'Not finished yet' },
};

// order + bento shape of the work grid; `tl` is the Taglish one-liner
export const WORK_LAYOUT = [
  {
    name: 'TIDE',
    status: 'updating',
    cls: 't-7 big',
    tone: 'yale',
    tl: 'Coach na talagang naaalala ang linggo mo. Focus, journal at tasks, iisang lugar lang.',
  },
  {
    name: 'Matchie',
    status: 'updating',
    cls: 't-5 tb-3 big',
    tone: 'lav',
    tl: 'Pagkagising mo, may shortlist ka na ng trabahong swak sa resume mo.',
  },
  {
    name: 'Poopipoo',
    status: 'completed',
    cls: 't-4 tb-3',
    tone: 'air',
    tl: 'Para sa mga emergency na hindi makapaghintay. Pinakamalapit na CR, may bidet info pa.',
  },
  {
    name: 'Snapzy',
    status: 'updating',
    cls: 't-4 tb-3',
    tone: 'pomp',
    tl: 'Yung libo-libong screenshot mo? Siya na ang bahalang mag-ayos.',
  },
  {
    name: 'Krea',
    status: 'updating',
    cls: 't-4 tb-3',
    tone: 'poly',
    tl: '35 tools para sa files mo, pero ni isa, hindi lalabas ng device mo.',
  },
  {
    name: 'Chess Fantasy',
    status: 'completed',
    cls: 't-6 tb-3',
    tone: 'yale',
    tl: 'Chess na parang arcade noong 90s. Subukan mong talunin yung CPU sa Hard Core.',
  },
  {
    name: 'SweepXpress',
    status: 'completed',
    cls: 't-6 tb-3',
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

// ---------- freelance ----------
// What Brian offers clients. `example` points at his real projects; `price`
// stays "Quote" until he sets starting prices (e.g. 'from ₱15,000').
export const SERVICES = [
  {
    id: 'ai',
    title: 'AI features',
    line: 'Chatbots, assistants and automations that work on your own data, not generic answers.',
    includes: ['Chat assistants trained on your content', 'Smart search and summaries', 'Workflow automation'],
    example: 'TIDE, Snapzy, Poopipoo',
    price: 'Quote',
  },
  {
    id: 'web',
    title: 'Websites & landing pages',
    line: 'Fast, responsive sites that look sharp on every phone — for businesses, brands and launches.',
    includes: ['Custom design, no templates', 'Mobile-first and fast', 'Contact forms, SEO basics, launch'],
    example: 'This portfolio',
    price: 'Quote',
  },
  {
    id: 'app',
    title: 'Web apps',
    line: 'Full-stack apps with accounts, dashboards and databases, built to be used every day.',
    includes: ['Login, roles and dashboards', 'Supabase, PostgreSQL or MySQL', 'Admin panels and reports'],
    example: 'SweepXpress, Matchie',
    price: 'Quote',
  },
  {
    id: 'mobile',
    title: 'Mobile apps',
    line: 'iOS and Android apps from one codebase, sharing a backend with your web app.',
    includes: ['React Native + Expo', 'One codebase, both stores', 'Same backend as the web'],
    example: 'TIDE',
    price: 'Quote',
  },
  {
    id: 'design',
    title: 'UI/UX design',
    line: 'Wireframes and clickable prototypes you can try before a single line of code.',
    includes: ['Figma wireframes and prototypes', 'Design systems', 'Redesigns of existing sites'],
    example: 'Chess Fantasy, Krea',
    price: 'Quote',
  },
];

export const PROCESS = [
  ['Discovery', 'A quick call or chat about your goal, your users and your budget.'],
  ['Plan & design', 'Scope, timeline and a design you approve before anything gets built.'],
  ['Build', 'Regular progress you can open and try, not just screenshots.'],
  ['Launch', 'Live on your domain, with a walkthrough of how everything works.'],
  ['Support', 'Fixes and small updates after launch, so it keeps running.'],
];

// options in the contact form's freelance mode
export const BUDGETS = ['Under ₱10k', '₱10k – ₱30k', '₱30k – ₱60k', '₱60k+', 'Not sure yet'];
export const TIMELINES = ['ASAP', 'Within a month', '1 – 3 months', 'Flexible'];
export const REACH = ['Email', 'Messenger', 'Viber', 'WhatsApp', 'Phone call'];
