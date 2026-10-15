// ============================================================================
// CHATBRAIN.JS — what the "Ask Me" assistant knows and how it answers.
// getReply(text, ctx) returns { text, attach?, chips?, actions?, topic? }:
//   text     the spoken/streamed answer
//   attach   a rich card for the UI: projects, project, stack, certs,
//            profile, contact, gallery or wiki
//   chips    follow-up questions shown under the answer
//   actions  buttons: { label, nav } opens a page, { label, href } a link
// Questions about Brian are matched locally. Anything else falls through to
// a calculator, then a Wikipedia lookup (free, no key), so general questions
// get a real answer with a picture.
// ============================================================================

import { websites } from './Project';

const CONTACT = {
  email: 'bp.francisco1003@gmail.com',
  phone: '09564321020',
};

const JOKES = [
  'Why do programmers prefer dark mode? Because light attracts bugs!',
  "I told my computer I needed a break, and now it won't stop showing me KitKat ads.",
  'Why did the developer go broke? Because he used up all his cache!',
  "There are only 10 types of people: those who understand binary and those who don't.",
  "Why do Java developers wear glasses? Because they don't C#!",
  "Why did the AI cross the road? To optimize the chicken's route.",
  "I'd tell you a UDP joke, but you might not get it.",
  "Debugging: being the detective in a crime movie where you're also the murderer.",
];

let lastJoke = -1;
const randomJoke = () => {
  let i = Math.floor(Math.random() * JOKES.length);
  if (i === lastJoke) i = (i + 1) % JOKES.length;
  lastJoke = i;
  return JOKES[i];
};

const partOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
};

// whole-word / phrase test, so "hi" doesn't fire inside "this"
const has = (q, ...terms) => terms.some((t) => new RegExp(`(^|[^a-z])${t}([^a-z]|$)`, 'i').test(q));

const findProject = (q) =>
  websites.find((w) => {
    const n = w.name.toLowerCase();
    return q.includes(n) || (n.includes('chess') && has(q, 'chess', 'neo chess')) || (n === 'sweepxpress' && has(q, 'sweep'));
  });

const liveProjects = () => websites.filter((w) => w.url && w.url !== '#');

// ---------------------------------------------------------------------------
// calculator — only digits and operators ever reach Function()
// ---------------------------------------------------------------------------

function tryMath(raw) {
  const expr = raw
    .toLowerCase()
    .replace(/^(what('?s| is)|calculate|compute|solve|magkano( ang)?|ilan( ang)?)\s+/, '')
    .replace(/[?=]+$/g, '')
    .replace(/\bx\b|×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\bplus\b/g, '+')
    .replace(/\bminus\b/g, '-')
    .replace(/\btimes\b/g, '*')
    .replace(/\b(divided by|over)\b/g, '/')
    .replace(/\^/g, '**')
    .trim();
  if (!/^[\d\s+\-*/().%]+$/.test(expr) || !/\d/.test(expr) || !/[+\-*/%]/.test(expr)) return null;
  try {
    const value = Function(`"use strict"; return (${expr});`)();
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    const pretty = Number.isInteger(value) ? value.toLocaleString() : Number(value.toFixed(6)).toLocaleString();
    return { text: `${expr.replace(/\*\*/g, '^')} = ${pretty}`, chips: ['Tell me a joke', 'What is your tech stack?'] };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Wikipedia — search, then the page summary (with thumbnail)
// ---------------------------------------------------------------------------

const withTimeout = (url, ms = 6000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
};

const topicOf = (raw) =>
  raw
    .replace(/^(hey|hi|yo|ok(ay)?)[,!\s]+/i, '')
    .replace(/^(can you |could you |please )?(tell me (about|what)|explain|define|describe|search( for)?|look up|who|what|where|when|why|how)\s+/i, '')
    .replace(/^(is|are|was|were|does|do|did)\s+/i, '')
    .replace(/^(ano( ang| yung| ba ang)?|sino( si| ang| ba si)?|saan( ang)?|kailan( ang)?)\s+/i, '')
    .replace(/^(an?|the)\s+/i, '')
    .replace(/[?!.]+$/g, '')
    .trim();

async function wikiLookup(raw) {
  const topic = topicOf(raw);
  if (topic.length < 2) return null;
  for (const lang of ['en', 'tl']) {
    try {
      const search = await withTimeout(
        `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&srlimit=3&format=json&origin=*`
      ).then((r) => r.json());
      for (const hit of search?.query?.search ?? []) {
        const sum = await withTimeout(
          `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title.replace(/ /g, '_'))}`
        ).then((r) => r.json());
        if (sum?.type === 'disambiguation' || !sum?.extract) continue;
        return {
          title: sum.title,
          description: sum.description,
          extract: sum.extract,
          thumb: sum.thumbnail?.source,
          url: sum.content_urls?.desktop?.page,
        };
      }
    } catch {
      /* offline or blocked — try the next language, then give up */
    }
  }
  return null;
}

const firstSentences = (text, n = 3) => {
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text];
  return parts.slice(0, n).join('').trim();
};

// ---------------------------------------------------------------------------
// weather — browser location + Open-Meteo (no key)
// ---------------------------------------------------------------------------

const WEATHER_CODES = {
  0: 'clear sky', 1: 'mostly clear skies', 2: 'partly cloudy skies', 3: 'overcast skies',
  45: 'fog', 48: 'freezing fog', 51: 'a light drizzle', 53: 'drizzle', 55: 'a heavy drizzle',
  61: 'light rain', 63: 'rain', 65: 'heavy rain', 80: 'light rain showers', 81: 'rain showers',
  82: 'heavy rain showers', 95: 'a thunderstorm', 96: 'a thunderstorm with hail', 99: 'a strong thunderstorm with hail',
};

const weatherReport = () =>
  new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve("I can't check the weather without location access in this browser — sorry!");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await withTimeout(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`
          ).then((r) => r.json());
          const temp = Math.round(data?.current?.temperature_2m);
          const desc = WEATHER_CODES[data?.current?.weather_code] ?? 'some hard-to-describe weather';
          resolve(`Right now it's about ${Number.isFinite(temp) ? `${temp}°C` : 'a mild temperature'} with ${desc} where you are.`);
        } catch {
          resolve("I tried to grab the forecast, but the weather service didn't answer in time. Try again in a bit?");
        }
      },
      () => resolve("I'd need location access to check your weather — allow it in your browser and ask me again!"),
      { timeout: 8000 }
    );
  });

// ---------------------------------------------------------------------------
// the intents — first match wins, so specific ones come first
// ---------------------------------------------------------------------------

const INTENTS = [
  {
    test: (q) => has(q, 'hire you', 'why should (we|i) hire'),
    reply: () => ({
      text: "Brian builds fast, responsive and reliable apps that solve real problems. He works across the whole stack, from friendly interfaces to secure backends, and he cares about shipping things people actually enjoy using — three of his apps are live right now.",
      attach: { type: 'projects' },
      chips: ['What is your tech stack?', 'How can I contact Brian?'],
    }),
  },
  {
    test: (q) => has(q, 'salary', 'compensation', 'expected pay', 'rate'),
    reply: () => ({
      text: 'His expected salary is ₱22,000 to ₱40,000 a month, depending on the scope of the role, the work setup and the full package.',
      chips: ['What work modality do you prefer?', 'How can I contact Brian?'],
    }),
  },
  {
    test: (q) => (has(q, 'location', 'where') && has(q, 'work', 'prefer', 'onsite')) || has(q, 'onsite location'),
    reply: () => ({
      text: "For onsite roles he prefers Manila, Cubao, Pasay, EDSA, San Juan and Quezon City. Anywhere else in the country or abroad, he's fully set up to work remotely.",
      chips: ['What work modality do you prefer?', 'What days do you work?'],
    }),
  },
  {
    test: (q) => has(q, 'modality', 'hybrid', 'remote', 'work setup', 'wfh'),
    reply: () => ({
      text: "He does his best work in hybrid and remote setups, but he's just as happy onsite — especially for the hands-on collaboration.",
      chips: ['What work locations do you prefer?', 'What is your expected salary?'],
    }),
  },
  {
    test: (q) => has(q, 'what days', 'work days', 'workdays', 'schedule', 'how many hours', 'availability'),
    reply: () => ({ text: "He's available Monday to Friday, at any time, for 8 to 9 hours a day.", chips: ['How can I contact Brian?'] }),
  },
  {
    test: (q) => has(q, 'complex', 'technical problem', 'difficult problem', 'problem solving'),
    reply: () => ({
      text: 'He keeps it structured. First, root-cause analysis: read the logs and debug step by step until the real issue shows up. Then research and ask — docs first, then seniors or peers. And when deadlines are tight, he ships a solid core version first, without cutting corners on quality.',
    }),
  },
  {
    test: (q) => has(q, 'see yourself', '2-3 years', '2 to 3 years', '5 years', 'next few years', 'future plan'),
    reply: () => ({
      text: 'In two to three years he wants to own web products end to end, including AI-powered apps, while growing into cybersecurity, cloud engineering, data science and LLM integration.',
    }),
  },
  {
    test: (q) => has(q, 'compan(y|ies)', 'faang', 'where do you want to work'),
    reply: () => ({
      text: 'He aims for leading tech companies like Meta, Apple, Amazon, Netflix and Google, enterprise names like Nvidia, IBM, Oracle and Accenture — or any forward-thinking team building great products.',
    }),
  },
  {
    test: (q) => has(q, 'disagreement', 'conflict', 'leadership'),
    reply: () => ({
      text: 'On one project the team had low morale and no clear direction. Instead of waiting, he set up syncs to clarify who owned what, built core features himself to get momentum going, and broke the work into clear deliverables — that got the team re-engaged and the release back on track.',
    }),
  },
  {
    test: (q) => has(q, 'dream job', 'dream career', 'career goal', 'what do you want to be'),
    reply: () => ({
      text: "Software engineering is number one — building real products end to end. AI and LLM engineering is a close second, and graphic design keeps the creative side alive.",
    }),
  },

  {
    test: (q) => has(q, 'who are you', 'who r u', 'what are you', 'your name', 'are you (an? )?(ai|bot|real)'),
    reply: () => ({
      text: "I'm Brian's portfolio assistant. I know his projects, stack, certificates and how to reach him — and I can look up general topics, do quick math, tell the time, or check the weather. I can even talk: turn my voice on or off with the speaker button up top.",
      chips: ['Who is Brian?', 'What projects have you built?', 'Who is José Rizal?'],
    }),
  },

  // ---- rich answers ----
  {
    test: (q) => !!findProject(q),
    reply: (q) => {
      const p = findProject(q);
      const live = p.url && p.url !== '#';
      return {
        text: `${p.name} — ${p.subtitle}. ${p.desc}${live ? ' It\'s live, so you can try it right now.' : ' A live demo is coming soon.'}`,
        attach: { type: 'project', name: p.name },
        chips: websites.filter((w) => w.name !== p.name).slice(0, 2).map((w) => `Tell me about ${w.name}`).concat('What is your tech stack?'),
        topic: p.name,
      };
    },
  },
  {
    test: (q) => has(q, 'projects?', 'portfolio', 'built', 'apps?', 'websites?', 'gawa', 'ginawa', 'what can you (build|do|make)', 'work samples?'),
    reply: () => ({
      text: `Here's what Brian has shipped. ${liveProjects().length} of them are live — tap a card to open the real site, or ask me about any one.`,
      attach: { type: 'projects' },
      actions: [{ label: 'Open Projects page', nav: 'projects' }],
      chips: ['Tell me about TIDE', 'Tell me about Poopipoo', 'What stack do you use?'],
    }),
  },
  {
    test: (q) => has(q, 'design tools?', 'canva', 'figma', 'photoshop', 'design'),
    reply: () => ({
      text: 'For design he uses Canva for quick social graphics, Figma for wireframes and clickable prototypes, plus Photoshop, Framer, CapCut and DaVinci for visuals and video.',
      attach: { type: 'stack', category: 'design' },
      chips: ['Which AI tools do you use?', 'What dev tools do you use?'],
    }),
  },
  {
    test: (q) => has(q, 'ai tools?', 'which ai', 'what ai', 'chatgpt', 'gemini', 'claude', 'deepseek', 'perplexity', 'copilot'),
    reply: () => ({
      text: 'He mixes AI tools by task: Claude for deep reasoning and coding help, Gemini for quick research, DeepSeek for a fast second opinion, Perplexity when he needs sources, and Copilot inside the editor.',
      attach: { type: 'stack', category: 'ai' },
      chips: ['What design tools do you use?', 'What projects have you built?'],
    }),
  },
  {
    test: (q) => has(q, 'dev tools?', 'development tools?', 'vs ?code', 'editor', 'ide', 'github', 'git', 'deploy(ment)?', 'vercel'),
    reply: () => ({
      text: 'His setup is VS Code, Git and GitHub for version control, Vercel for shipping, and Postman for testing APIs — plus a lot of coffee.',
      attach: { type: 'stack', category: 'ship' },
      chips: ['What is your tech stack?', 'What projects have you built?'],
    }),
  },
  {
    test: (q) => has(q, 'backend', 'database', 'server', 'sql', 'node', 'php', 'supabase', 'postgres(ql)?'),
    reply: () => ({
      text: 'On the backend he works with Node.js and Express, Supabase and PostgreSQL, MySQL and PHP, plus Python when it fits.',
      attach: { type: 'stack', category: 'backend' },
      chips: ['What frontend tools do you use?', 'What projects have you built?'],
    }),
  },
  {
    test: (q) => has(q, 'frontend', 'front-end', 'react', 'next(\\.js|js)?', 'tailwind', 'ui'),
    reply: () => ({
      text: 'His frontend toolkit is React and Next.js with TypeScript and JavaScript, Vite for fast builds, Tailwind for styling, and lucide-react for icons.',
      attach: { type: 'stack', category: 'frontend' },
      chips: ['What backend tools do you use?', 'Do you build mobile apps?'],
    }),
  },
  {
    test: (q) => has(q, 'mobile', 'expo', 'react native', 'android', 'ios'),
    reply: () => ({
      text: 'For mobile he uses React Native with Expo and NativeWind — that\'s how TIDE was built.',
      attach: { type: 'stack', category: 'mobile' },
      chips: ['Tell me about TIDE', 'What is your tech stack?'],
    }),
  },
  {
    test: (q) => has(q, 'stacks?', 'tech', 'tools?', 'skills?', 'languages?', 'frameworks?', 'gamit', 'technolog(y|ies)'),
    reply: () => ({
      text: 'Here\'s his whole toolbox, grouped the same way as the Stack page — frontend, backend, mobile, design, AI and shipping.',
      attach: { type: 'stack' },
      actions: [{ label: 'Open the Stack tree', nav: 'stacks' }],
      chips: ['What backend tools do you use?', 'Which AI tools do you use?'],
    }),
  },
  {
    test: (q) => has(q, 'certs?', 'certificates?', 'certifications?', 'credentials?', 'courses?', 'accenture', 'coursera', 'cisco'),
    reply: () => ({
      text: 'Brian has a full vault of certificates from Coursera, Cisco, LinkedIn, DICT and the Accenture Technology Academy. Here are the highlights.',
      attach: { type: 'certs' },
      actions: [{ label: 'Open the Credential Vault', nav: 'certificates' }],
      chips: ['What projects have you built?', 'Who is Brian?'],
    }),
  },
  {
    test: (q) => has(q, 'contacts?', 'email', 'phone', 'number', 'reach', 'message (him|brian)', 'socials?', 'linkedin', 'facebook', 'instagram'),
    reply: () => ({
      text: `You can email Brian at ${CONTACT.email} or call ${CONTACT.phone}. He's also on GitHub, LinkedIn and Facebook.`,
      attach: { type: 'contact' },
      chips: ['What is your expected salary?', 'What work modality do you prefer?'],
    }),
  },
  {
    test: (q) => has(q, 'hobby', 'hobbies', 'free time', 'mma', 'martial arts?', 'barista', 'coffee', 'outside (of )?code'),
    reply: () => ({
      text: 'Outside of code he trains mixed martial arts, pulls espresso shots as a barista, and writes quotes and reflections whenever an idea hits. Code, cardio, caffeine and a little poetry.',
      attach: { type: 'gallery' },
      chips: ['What is your dream job?', 'Tell me a joke'],
    }),
  },
  {
    test: (q) => has(q, 'who is brian', 'about brian', 'tell me about (him|yourself|brian)', 'introduce', 'sino si brian'),
    reply: () => ({
      text: "Brian Paul Francisco is a fresh BSIT graduate from National Teachers College who finished with a 1.25 GWA. He's a full-stack developer and UI/UX designer who builds web and mobile apps with React, Next.js, Expo, Node and Supabase — and he's an IT intern at Grandline Maritime.",
      attach: { type: 'profile' },
      actions: [{ label: 'Read the full story', nav: 'about' }],
      chips: ['What projects have you built?', 'Why should we hire you?'],
    }),
  },
  {
    test: (q) => has(q, 'intern(ship)?', 'experience', 'current job', 'grandline', 'where (do|does) (you|he|brian) work'),
    reply: () => ({
      text: "He's currently an IT intern at Grandline Maritime Training in Kalaw, Manila, and he's completed the Accenture Technology Academy.",
      actions: [{ label: 'See his experience', nav: 'about' }],
      chips: ['What projects have you built?', 'What certificates do you have?'],
    }),
  },
  {
    test: (q) => has(q, 'school', 'college', 'study', 'student', 'education', 'gwa', 'graduate', 'degree'),
    reply: () => ({
      text: 'He graduated with a BSIT from National Teachers College in Quiapo, Manila, with a 1.25 GWA.',
      chips: ['What certificates do you have?', 'Who is Brian?'],
    }),
  },
  { test: (q) => has(q, 'age', 'how old', 'ilang taon'), reply: () => ({ text: 'Brian is 22 years old.' }) },
  { test: (q) => has(q, 'pogi', 'gwapo', 'handsome', 'cute'), reply: () => ({ text: 'Sobra! Kitang-kita naman sa profile pic, diba? 😎', attach: { type: 'profile' } }) },
  { test: (q) => has(q, 'joke', 'funny', 'makakatawa', 'patawa'), reply: () => ({ text: randomJoke(), chips: ['Another joke', 'What projects have you built?'] }) },
  {
    test: (q) => has(q, 'what time', 'time is it', 'anong oras', 'oras na'),
    reply: () => ({ text: `It's ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} right now.` }),
  },
  {
    test: (q) => has(q, 'date', 'today', 'what day', 'anong araw'),
    reply: () => ({ text: `Today is ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.` }),
  },
  {
    test: (q) => has(q, 'how are you', "how'?s (your day|it going)", 'kamusta', 'kumusta', 'musta'),
    reply: () => ({
      text: `Having a good ${partOfDay()}, thanks for asking! Just here answering questions about Brian's work. How's yours going?`,
      chips: ['What projects have you built?', 'Tell me a joke'],
    }),
  },
  {
    test: (q) => has(q, 'cool', 'nice', 'awesome', 'amazing', 'great', 'galing', 'ganda', 'astig', 'angas', 'wow', 'love (it|this)', 'impressive'),
    reply: () => ({
      text: "Thank you! Brian put a lot of late nights into this portfolio — I'll pass the compliment along. 😄 Want to see what he's built?",
      chips: ['What projects have you built?', 'Who is Brian?'],
    }),
  },
  {
    test: (q) => has(q, 'thanks?', 'thank you', 'salamat', 'bye', 'goodbye', 'see you'),
    reply: () => ({ text: 'Anytime! Come back if you have more questions about Brian. 👋' }),
  },
  {
    test: (q) => has(q, 'hi', 'hello', 'hey', 'yo', 'good (morning|afternoon|evening)', 'hola', 'sup'),
    reply: () => ({
      text: `Hey there, good ${partOfDay()}! I'm Brian's assistant. Ask me about his projects, stack or certificates — or anything else you're curious about.`,
      chips: ['What projects have you built?', 'What is your tech stack?', 'Who is José Rizal?'],
    }),
  },
];

const FALLBACK_CHIPS = ['What projects have you built?', 'What is your tech stack?', 'Tell me a joke'];

// ---------------------------------------------------------------------------

export async function getReply(raw) {
  const q = raw.trim().toLowerCase();

  if (has(q, 'weather', 'forecast', 'panahon')) {
    return { text: await weatherReport(), chips: ['What time is it?', 'Tell me a joke'] };
  }

  const math = tryMath(q);
  if (math) return math;

  for (const intent of INTENTS) {
    if (intent.test(q)) return intent.reply(q);
  }

  // only look things up for actual questions, not statements like "this is cool"
  const isQuestion =
    /\?\s*$/.test(q) ||
    /^(what|who|whom|where|when|why|how|which|define|explain|describe|tell me (about|what)|meaning of|search|look up|ano|sino|saan|kailan|bakit|paano)/.test(q);
  const wiki = isQuestion ? await wikiLookup(raw) : null;
  if (wiki) {
    return {
      text: firstSentences(wiki.extract),
      attach: { type: 'wiki', ...wiki },
      chips: ['What projects have you built?', 'Tell me a joke'],
    };
  }

  return {
    text: "Hmm, I couldn't find anything on that one. I'm best at Brian's projects, stack, certificates and contact details — but I can also look up general topics, do math, or check the weather.",
    chips: FALLBACK_CHIPS,
  };
}

export { CONTACT };
