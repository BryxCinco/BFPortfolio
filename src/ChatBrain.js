// ============================================================================
// CHATBRAIN.JS — what the "Ask Me" assistant (brian.ai) knows and how it answers.
// Personality: friendly, short, a little playful. It answers in Taglish when
// the visitor writes in Tagalog or Taglish, and in English otherwise.
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
import { WORK_LAYOUT, STATUS, SOFT_SKILLS, NOW } from './site/data';
import { TRACK } from './site/music';
import { CERT_TOTAL as CERT_COUNT } from './Certifications';

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

// Tagalog / Taglish markers: if the visitor writes like this, brian.ai answers in Taglish
const isTagalog = (q) =>
  has(q, 'ano', 'anong', 'sino', 'paano', 'bakit', 'saan', 'kailan', 'magkano', 'ilan', 'ba', 'po', 'naman', 'yung', 'mga', 'gusto', 'pwede', 'puwede', 'kasi', 'talaga', 'meron', 'wala', 'kwento', 'pakita', 'siya', 'niya', 'ginagawa', 'kanta', 'laro', 'salamat', 'kamusta', 'kumusta', 'musta', 'ikaw', 'sayo', 'mo', 'ka', 'isa pa', 'magpatawa', 'galing', 'nito', 'astig', 'lupet', 'malupet', 'ganda', 'grabe', 'sobra', 'naman', 'nga');
// pick the English or the Taglish line
const say = (tl, en, tag) => (tl ? tag : en);

const statusOf = (name) => {
  const w = WORK_LAYOUT.find((x) => x.name === name);
  return w && STATUS[w.status] ? STATUS[w.status].label : null;
};
const byStatus = (key) => WORK_LAYOUT.filter((w) => w.status === key).map((w) => w.name);
const joinWith = (names, and) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} ${and} ${names[names.length - 1]}` : names[0] || '');
const list = (names) => joinWith(names, 'and');
const listTl = (names) => joinWith(names, 'at');

const findProject = (q) =>
  websites.find((w) => {
    const n = w.name.toLowerCase();
    return q.includes(n) || (n.includes('chess') && has(q, 'chess', 'fantasy', 'neo chess')) || (n === 'sweepxpress' && has(q, 'sweep'));
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
  // ---- the assistant itself ----
  {
    test: (q) => has(q, 'who (made|built|created) you', 'sino (gumawa|nagawa) (sayo|sa ?yo)', 'who coded you'),
    reply: (q, tl) => ({
      text: say(tl,
        "Brian built me himself — I'm a hand-made assistant, no paid AI API behind me. I know his work inside out, and for everything else I check Wikipedia, do math, or peek at the weather.",
        'Si Brian mismo ang gumawa sa akin — gawa-kamay, walang bayad na AI API sa likod. Kabisado ko ang mga gawa niya, at sa ibang tanong, tumitingin ako sa Wikipedia, nagma-math, o sumisilip sa weather.'),
      chips: tl ? ['Ano mga project niya?', 'Paano ginawa itong site?'] : ['What projects have you built?', 'How was this site built?'],
    }),
  },
  {
    test: (q) => has(q, 'who are you', 'who r u', 'what are you', 'your name', 'are you (an? )?(ai|bot|real)', 'sino ka', 'ano ka'),
    reply: (q, tl) => ({
      text: say(tl,
        "I'm brian.ai, Brian's portfolio sidekick. Ask me about his projects, stack, certificates, soft skills or how to reach him — English or Taglish, both work. I can also look things up, do quick math, check the weather, and talk out loud (speaker button up top).",
        'Ako si brian.ai, ang sidekick ng portfolio ni Brian. Tanungin mo ako tungkol sa projects, stack, certificates, soft skills niya o kung paano siya makokontak — English o Taglish, okay lang. Kaya ko ring mag-search, mag-math, tumingin ng weather, at magsalita (speaker button sa taas).'),
      chips: tl ? ['Sino si Brian?', 'Ano mga project niya?', 'Kaya mo bang mag-Tagalog?'] : ['Who is Brian?', 'What projects have you built?', 'Can you speak Tagalog?'],
    }),
  },
  {
    test: (q) => has(q, 'speak tagalog', 'tagalog ka', 'mag-?tagalog', 'can you (speak|understand) filipino', 'taglish'),
    reply: () => ({
      text: 'Oo naman! Kapag Tagalog o Taglish ang tanong mo, sasagot din ako nang ganoon. Try mo: "Ano mga project ni Brian?"',
      chips: ['Ano mga project niya?', 'Ano soft skills niya?', 'Anong kanta yung tumutugtog?'],
    }),
  },

  // ---- hiring ----
  {
    test: (q) => has(q, 'hire (you|him|brian)', 'why should (we|i) hire', 'bakit (namin )?(siya|ka) (dapat )?(i-?hire|kunin)', 'dapat i-?hire'),
    reply: (q, tl) => ({
      text: say(tl,
        'Because he ships. Seven live apps, five with LLMs doing real work inside, built end to end — from the interface people touch to the secure backend underneath. Add a 1.25 GWA, an internship at Grandline Maritime, and a habit of caring how things feel, not just whether they work.',
        'Kasi nagsi-ship siya. Pitong live na apps, lima may LLM na talagang may silbi, gawa mula UI hanggang secure na backend. Dagdag pa ang 1.25 GWA, internship sa Grandline Maritime, at yung ugali niyang inaalala kung gaano kasarap gamitin ang app, hindi lang kung gumagana.'),
      attach: { type: 'projects' },
      chips: tl ? ['Ano tech stack niya?', 'Paano siya makokontak?'] : ['What is your tech stack?', 'How can I contact Brian?'],
    }),
  },
  {
    test: (q) => has(q, 'open (to|for) work', 'available (for|to) work', 'is (he|brian) available', 'hiring', 'looking for (a )?(job|work|role)', 'job hunting', 'naghahanap (ba )?(siya )?ng (trabaho|work)', 'available (ba )?siya'),
    reply: (q, tl) => ({
      text: say(tl,
        "Yes — Brian is open to work: full-time roles, internships and collabs. He's based in Manila, happy with hybrid, remote or onsite, and usually replies within 24 hours.",
        'Oo! Open si Brian sa full-time, internship at collabs. Taga-Manila siya, okay sa hybrid, remote o onsite, at kadalasan sumasagot within 24 hours.'),
      attach: { type: 'contact' },
      chips: tl ? ['Magkano expected salary niya?', 'Ano mga project niya?'] : ['What is your expected salary?', 'What projects have you built?'],
    }),
  },
  {
    test: (q) => has(q, 'salary', 'compensation', 'expected pay', 'rate', 'sahod', 'sweldo'),
    reply: (q, tl) => ({
      text: say(tl,
        'His expected salary is ₱22,000 to ₱40,000 a month, depending on the scope of the role, the work setup and the full package.',
        'Ang expected salary niya ay ₱22,000 hanggang ₱40,000 kada buwan, depende sa scope ng role, work setup at buong package.'),
      chips: tl ? ['Remote ba o onsite?', 'Paano siya makokontak?'] : ['What work modality do you prefer?', 'How can I contact Brian?'],
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
    test: (q) => has(q, 'modality', 'hybrid', 'remote', 'work setup', 'wfh', 'onsite'),
    reply: (q, tl) => ({
      text: say(tl,
        "He does his best work in hybrid and remote setups, but he's just as happy onsite — especially for the hands-on collaboration.",
        'Pinakamaganda ang trabaho niya sa hybrid at remote, pero game din siya sa onsite — lalo na kung hands-on ang collab.'),
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
      chips: ['What are your soft skills?', 'Why should we hire you?'],
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
    test: (q) => has(q, 'dream job', 'dream career', 'career goal', 'what do you want to be', 'pangarap'),
    reply: () => ({
      text: 'Software engineering is number one — building real products end to end. AI and LLM engineering is a close second, and graphic design keeps the creative side alive.',
    }),
  },

  // ---- soft skills ----
  {
    test: (q) => has(q, 'soft skills?', 'strengths?', 'traits?', 'personality', 'attitude', 'ugali', 'katangian', 'what kind of (person|teammate)', 'work ethic'),
    reply: (q, tl) => {
      const names = SOFT_SKILLS.map(([n]) => n);
      return {
        text: say(tl,
          `Twelve of them, and he means every one: ${list(names)}. The short version — he questions the brief, stays calm when the stack changes, and owns his misses.`,
          `Labindalawa, at seryoso siya sa lahat: ${listTl(names)}. Short version — tinatanong niya muna ang brief, kalmado kahit magbago ang stack, at inaamin niya ang mali tapos inaayos.`),
        actions: [{ label: tl ? 'Tingnan sa About' : 'See them on About', nav: 'about' }],
        chips: tl ? ['Bakit siya dapat i-hire?', 'Ano mga project niya?'] : ['Why should we hire you?', 'How do you handle complex technical problems?'],
      };
    },
  },

  // ---- project status (before single projects, so "which are done?" lists them all) ----
  {
    test: (q) =>
      has(q, 'status', 'ongoing', 'on-?going', 'in progress', 'updating', 'completed', 'finished', 'done', 'tapos', 'ginagawa', 'inaayos', 'work in progress', 'wip') &&
      !findProject(q),
    reply: (q, tl) => {
      const done = byStatus('completed');
      const upd = byStatus('updating');
      const wip = byStatus('in-progress');
      const en = `Completed: ${list(done) || 'none yet'}. Live and still getting updates: ${list(upd) || 'none'}.${wip.length ? ` In progress: ${list(wip)}.` : ''} Every card on the site wears its status, so you can tell at a glance.`;
      const tg = `Tapos na: ${listTl(done) || 'wala pa'}. Live pero inaayos pa: ${listTl(upd) || 'wala'}.${wip.length ? ` Hindi pa tapos: ${listTl(wip)}.` : ''} May status pill din ang bawat card sa site, kaya kita agad.`;
      return {
        text: say(tl, en, tg),
        attach: { type: 'projects' },
        actions: [{ label: tl ? 'Buksan ang My creations' : 'Open My creations', nav: 'projects' }],
        chips: tl ? ['Kwento mo yung TIDE', 'Ano paborito niyang project?'] : ['Tell me about TIDE', 'Which project should I check first?'],
      };
    },
  },
  {
    test: (q) => has(q, 'which project (should|to)', 'where (should|do) i start', 'best project', 'favou?rite project', 'fave', 'paborito', 'unang (titingnan|tignan)'),
    reply: (q, tl) => ({
      text: say(tl,
        "Start with TIDE — it's his favourite. It's a productivity coach whose AI actually reads your history and acts through 23 tools. Then try Poopipoo for the laughs (yes, it's real).",
        'Simulan mo sa TIDE — paborito niya iyan. Productivity coach na binabasa talaga ng AI ang history mo at kumikilos gamit ang 23 tools. Tapos subukan mo ang Poopipoo para matawa (oo, totoo iyan).'),
      attach: { type: 'project', name: 'TIDE' },
      chips: tl ? ['Kwento mo yung Poopipoo', 'Ano status ng mga project?'] : ['Tell me about Poopipoo', 'Which projects are finished?'],
    }),
  },

  // ---- this site (before the project intents, which also match "built") ----
  {
    test: (q) => has(q, 'this (site|website|portfolio|page)', 'how (was|did|is) (this|you|it) (site )?(built|made|build|make)', 'paano ginawa', 'built with', 'made with', 'source code', 'repo(sitory)?', 'github repo'),
    reply: (q, tl) => ({
      text: say(tl,
        'This portfolio is React + Vite, designed from scratch: a bento layout in navy, lilac and sky blue, Cabinet Grotesk and Instrument Serif type, a BP monogram, a HUD cursor, anime impact frames on the LIVE buttons, a record player, and two mini games. The whole thing is open source.',
        'React + Vite ang portfolio na ito, dinisenyo mula sa simula: bento layout na navy, lilac at sky blue, Cabinet Grotesk at Instrument Serif na fonts, BP na logo, HUD cursor, anime impact frames sa LIVE buttons, record player, at dalawang mini games. Open source ang lahat.'),
      actions: [{ label: tl ? 'Tingnan ang code sa GitHub' : 'See the code on GitHub', href: 'https://github.com/BryxCinco/BFPortfolio' }],
      chips: tl ? ['Anong kanta yung tumutugtog?', 'Anong laro meron?'] : ['What song is playing?', 'What games are there?'],
    }),
  },
  // ---- rich answers ----
  {
    test: (q) => !!findProject(q),
    reply: (q, tl) => {
      const p = findProject(q);
      const live = p.url && p.url !== '#';
      const st = statusOf(p.name);
      return {
        text: say(tl,
          `${p.name} — ${p.subtitle}. ${p.desc}${live ? " It's live, so you can try it right now." : ' A live demo is coming soon.'}${st ? ` Status: ${st}.` : ''}`,
          `${p.name} — ${p.subtitle}. ${p.desc}${live ? ' Live na ito, kaya masusubukan mo agad.' : ' May live demo na darating.'}${st ? ` Status: ${st}.` : ''}`),
        attach: { type: 'project', name: p.name },
        chips: websites
          .filter((w) => w.name !== p.name)
          .slice(0, 2)
          .map((w) => (tl ? `Kwento mo yung ${w.name}` : `Tell me about ${w.name}`))
          .concat(tl ? 'Ano status ng mga project?' : 'Which projects are finished?'),
        topic: p.name,
      };
    },
  },
  {
    test: (q) => has(q, 'projects?', 'portfolio', 'built', 'did (you|he|brian) (build|make|create)', 'what (did|has|have) (you|he|brian) (build|made|make|create)', 'shipped', 'ship', 'launched', 'live apps?', 'apps?', 'websites?', 'gawa', 'ginawa', 'creations?', 'what can you (build|do|make)', 'work samples?'),
    reply: (q, tl) => ({
      text: say(tl,
        `Here's what Brian has shipped — ${liveProjects().length} live apps, five with LLMs inside. Tap a card to open the real site, or ask me about any one.`,
        `Ito ang mga nagawa ni Brian — ${liveProjects().length} live na apps, lima may LLM sa loob. I-tap mo ang card para buksan ang totoong site, o tanungin mo ako tungkol sa kahit alin.`),
      attach: { type: 'projects' },
      actions: [{ label: tl ? 'Buksan ang My creations' : 'Open My creations', nav: 'projects' }],
      chips: tl ? ['Kwento mo yung TIDE', 'Ano status ng mga project?', 'Ano tech stack niya?'] : ['Tell me about TIDE', 'Which projects are finished?', 'What stack do you use?'],
    }),
  },

  // ---- the site, its music and games ----
  {
    test: (q) => has(q, 'song', 'music', 'kanta', 'tugtog', 'tumutugtog', 'soundtrack', 'playing', 'spotify', 'youtube', 'ice on my baby', 'yung bleu', 'background music', 'bgm'),
    reply: (q, tl) => ({
      text: say(tl,
        `The soundtrack is "${TRACK.title}" by ${TRACK.artist}, starting at the 0:51 highlight and looping. It kicks in on your first tap or click — pause it anytime from the record player in Side quests.`,
        `Ang soundtrack ay "${TRACK.title}" ni ${TRACK.artist}, nagsisimula sa 0:51 na highlight at paulit-ulit. Tumutugtog ito sa unang tap o click mo — puwede mong i-pause sa record player sa Side quests.`),
      actions: [{ label: tl ? 'Buksan ang record player' : 'Open the record player', nav: 'play' }],
      chips: tl ? ['Anong laro meron?', 'Paano ginawa itong site?'] : ['What games are there?', 'How was this site built?'],
    }),
  },
  {
    test: (q) => has(q, 'games?', 'typing test', 'stack game', 'laro', 'side quests?', 'play something', 'bored'),
    reply: (q, tl) => ({
      text: say(tl,
        'Two mini games live in Side quests: a typing test (15 to 120 seconds, with personal bests) and Stack the Tech, where you drop blocks to build a tower. Beat your own record and you get an anime impact frame. 😤',
        'Dalawang mini games ang nasa Side quests: typing test (15 hanggang 120 seconds, may personal best) at Stack the Tech, kung saan magpapatong ka ng blocks. Kapag natalo mo ang sarili mong record, may anime impact frame ka. 😤'),
      actions: [{ label: tl ? 'Pumunta sa Side quests' : 'Go to Side quests', nav: 'play' }],
      chips: tl ? ['Anong kanta yung tumutugtog?', 'Magpatawa ka'] : ['What song is playing?', 'Tell me a joke'],
    }),
  },
  {
    test: (q) => has(q, 'fun fact', 'trivia', 'random fact', 'something interesting', 'surprise me'),
    reply: (q, tl) => {
      const facts = tl
        ? ['May 35 tools ang Krea, at hindi lumalabas ng device mo ang files mo.', 'May 24 capture finishers ang Chess Fantasy — bawat nakaing piyesa may sariling eksena.', 'Ang AI coach ng TIDE ay kumikilos gamit ang 23 tools, hindi lang nagsasalita.', 'Totoo ang Poopipoo: mapa ng mga CR sa Metro Manila, may bidet info pa.']
        : ['Krea has 35 tools, and your files never leave your device.', 'Chess Fantasy has 24 capture finishers — every taken piece gets its own scene.', "TIDE's AI coach acts through 23 tools instead of just chatting.", "Poopipoo is real: a community map of Metro Manila's restrooms, bidet info included."];
      return { text: facts[Math.floor(Math.random() * facts.length)], chips: tl ? ['Isa pang fun fact', 'Ano mga project niya?'] : ['Another fun fact', 'What projects have you built?'] };
    },
  },
  {
    test: (q) => has(q, 'photos?', 'pictures?', 'pics?', 'gallery', 'litrato', 'selfie'),
    reply: (q, tl) => ({
      text: say(tl, 'Here are a few from My gallery — life outside the IDE.', 'Ito ang ilan mula sa My gallery — buhay sa labas ng IDE.'),
      attach: { type: 'gallery' },
      actions: [{ label: tl ? 'Buksan ang My gallery' : 'Open My gallery', nav: 'about' }],
    }),
  },
  {
    test: (q) => has(q, 'what are you (doing|working on)', 'what is he (doing|working on)', 'right now', 'currently', 'ginagawa (niya|mo) ngayon'),
    reply: (q, tl) => ({
      text: say(tl, `Right now: ${NOW.map((n) => n[0].toLowerCase() + n.slice(1)).join('; ')}.`, `Ngayon: ${NOW.join('; ')}.`),
      chips: tl ? ['Ano status ng mga project?'] : ['Which projects are finished?'],
    }),
  },

  // ---- stack ----
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
      text: "For mobile he uses React Native with Expo and NativeWind — that's how TIDE was built.",
      attach: { type: 'stack', category: 'mobile' },
      chips: ['Tell me about TIDE', 'What is your tech stack?'],
    }),
  },
  {
    test: (q) => has(q, 'stacks?', 'tech', 'tools?', 'skills?', 'languages?', 'frameworks?', 'gamit', 'technolog(y|ies)'),
    reply: (q, tl) => ({
      text: say(tl,
        "Here's his whole toolbox — frontend, backend, AI, shipping, design and mobile. The little ×n on the site shows how many of his apps use each one.",
        'Ito ang buong toolbox niya — frontend, backend, AI, shipping, design at mobile. Yung maliit na ×n sa site ay kung ilang app niya ang gumagamit ng bawat isa.'),
      attach: { type: 'stack' },
      actions: [{ label: tl ? 'Buksan ang The toolbox' : 'Open The toolbox', nav: 'stacks' }],
      chips: tl ? ['Anong AI tools gamit niya?', 'Ano soft skills niya?'] : ['Which AI tools do you use?', 'What are your soft skills?'],
    }),
  },
  {
    test: (q) => has(q, 'certs?', 'certificates?', 'certifications?', 'credentials?', 'courses?', 'accenture', 'coursera', 'cisco'),
    reply: (q, tl) => ({
      text: say(tl,
        `${CERT_COUNT} certificates from Coursera, Cisco, LinkedIn, DICT and the Accenture Technology Academy. Here are the highlights.`,
        `${CERT_COUNT} na certificates mula Coursera, Cisco, LinkedIn, DICT at Accenture Technology Academy. Ito ang mga highlight.`),
      attach: { type: 'certs' },
      actions: [{ label: tl ? 'Buksan ang Paper trail' : 'Open Paper trail', nav: 'certificates' }],
      chips: tl ? ['Ano mga project niya?', 'Sino si Brian?'] : ['What projects have you built?', 'Who is Brian?'],
    }),
  },
  {
    test: (q) => has(q, 'contacts?', 'email', 'phone', 'number', 'reach', 'message (him|brian)', 'socials?', 'linkedin', 'facebook', 'instagram', 'kontak', 'makokontak', 'makausap'),
    reply: (q, tl) => ({
      text: say(tl,
        `Email Brian at ${CONTACT.email} or call ${CONTACT.phone}. He's also on GitHub, LinkedIn, Facebook and Instagram — and he usually replies within a day.`,
        `I-email mo si Brian sa ${CONTACT.email} o tawagan sa ${CONTACT.phone}. Nasa GitHub, LinkedIn, Facebook at Instagram din siya — kadalasan sumasagot within a day.`),
      attach: { type: 'contact' },
      chips: tl ? ['Magkano expected salary niya?', 'Remote ba o onsite?'] : ['What is your expected salary?', 'What work modality do you prefer?'],
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
    test: (q) => has(q, 'who is brian', 'about brian', 'tell me about (him|brian)', 'introduce', 'sino si brian', 'kwento (mo )?(si|tungkol kay) brian'),
    reply: (q, tl) => ({
      text: say(tl,
        "Brian Paul Francisco is a fresh BSIT graduate from National Teachers College who finished with a 1.25 GWA. He's an aspiring full-stack LLM developer with a UI/UX eye, building web and mobile apps with React, Next.js, Expo, Node and Supabase — and he's an IT intern at Grandline Maritime.",
        'Si Brian Paul Francisco ay fresh BSIT graduate ng National Teachers College na may 1.25 GWA. Aspiring full-stack LLM developer siya na may mata sa UI/UX, gumagawa ng web at mobile apps gamit ang React, Next.js, Expo, Node at Supabase — at IT intern siya sa Grandline Maritime.'),
      attach: { type: 'profile' },
      actions: [{ label: tl ? 'Basahin ang buong kwento' : 'Read the full story', nav: 'about' }],
      chips: tl ? ['Ano mga project niya?', 'Bakit siya dapat i-hire?'] : ['What projects have you built?', 'Why should we hire you?'],
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
  { test: (q) => has(q, 'joke', 'funny', 'makakatawa', 'patawa', 'magpatawa', 'isa pa'), reply: (q, tl) => ({ text: randomJoke(), chips: tl ? ['Isa pa', 'Ano mga project niya?'] : ['Another joke', 'What projects have you built?'] }) },
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
    reply: (q, tl) => ({
      text: say(tl,
        `Having a good ${partOfDay()}, thanks for asking! Just here talking up Brian's work. How's yours going?`,
        'Okay na okay, salamat sa pagtanong! Nandito lang ako, kinukwento ang mga gawa ni Brian. Ikaw, kamusta?'),
      chips: tl ? ['Ano mga project niya?', 'Magpatawa ka'] : ['What projects have you built?', 'Tell me a joke'],
    }),
  },
  {
    test: (q) => has(q, 'cool', 'nice', 'awesome', 'amazing', 'great', 'galing', 'ganda', 'astig', 'angas', 'lupet', 'malupet', 'wow', 'love (it|this)', 'impressive'),
    reply: (q, tl) => ({
      text: say(tl,
        "Thank you! Brian put a lot of late nights into this — I'll pass it along. 😄 Want to see what he's built?",
        'Salamat! Maraming puyat ni Brian dito — sasabihin ko sa kanya. 😄 Gusto mo bang makita ang mga gawa niya?'),
      chips: tl ? ['Ano mga project niya?', 'Sino si Brian?'] : ['What projects have you built?', 'Who is Brian?'],
    }),
  },
  {
    test: (q) => has(q, 'thanks?', 'thank you', 'salamat', 'bye', 'goodbye', 'see you', 'paalam'),
    reply: (q, tl) => ({ text: say(tl, 'Anytime! Come back if you have more questions about Brian. 👋', 'Walang anuman! Balik ka lang kung may tanong ka pa tungkol kay Brian. 👋') }),
  },
  {
    test: (q) => has(q, 'hi', 'hello', 'hey', 'yo', 'good (morning|afternoon|evening)', 'hola', 'sup', 'uy', 'pre', 'lods'),
    reply: (q, tl) => ({
      text: say(tl,
        `Hey, good ${partOfDay()}! I'm brian.ai. Ask me about Brian's projects, stack or soft skills — or anything else you're curious about.`,
        'Uy, hello! Ako si brian.ai. Tanungin mo ako tungkol sa projects, stack o soft skills ni Brian — o kahit ano pang gusto mong malaman.'),
      chips: tl ? ['Ano mga project niya?', 'Ano status ng mga project?', 'Anong kanta yung tumutugtog?'] : ['What projects have you built?', 'Which projects are finished?', 'What song is playing?'],
    }),
  },
];

const FALLBACK_CHIPS = ['What projects have you built?', 'Which projects are finished?', 'Tell me a joke'];

// ---------------------------------------------------------------------------

export async function getReply(raw) {
  const q = raw.trim().toLowerCase();

  if (has(q, 'weather', 'forecast', 'panahon')) {
    return { text: await weatherReport(), chips: ['What time is it?', 'Tell me a joke'] };
  }

  const math = tryMath(q);
  if (math) return math;

  const tl = isTagalog(q);
  for (const intent of INTENTS) {
    if (intent.test(q)) return intent.reply(q, tl);
  }

  // only look things up for actual questions, not statements like "this is cool"
  const isQuestion =
    /\?\s*$/.test(q) ||
    /^(what|who|whom|where|when|why|how|which|define|explain|describe|tell me (about|what)|meaning of|search|look up|ano|sino|saan|kailan|bakit|paano)/.test(q);
  // questions about Brian never go to Wikipedia ("what has Brian shipped?" is not a band)
  const aboutBrian = has(q, 'brian', 'he', 'his', 'him', 'siya', 'niya', 'kanya');
  const wiki = isQuestion && !aboutBrian ? await wikiLookup(raw) : null;
  if (wiki) {
    return {
      text: firstSentences(wiki.extract),
      attach: { type: 'wiki', ...wiki },
      chips: ['What projects have you built?', 'Tell me a joke'],
    };
  }

  if (aboutBrian) {
    return {
      text: say(tl,
        "I don't have that one about Brian yet. I can tell you about his projects and their status, his stack, soft skills, certificates, school, internship or how to reach him.",
        'Wala pa akong sagot diyan tungkol kay Brian. Pero kaya kong ikwento ang projects at status nila, stack, soft skills, certificates, school, internship o paano siya makokontak.'),
      chips: tl ? ['Ano mga project niya?', 'Ano soft skills niya?'] : FALLBACK_CHIPS,
    };
  }

  return {
    text: say(tl,
      "Hmm, I couldn't find anything on that one. I'm best at Brian's projects, stack, soft skills and contact details — but I can also look up general topics, do math, or check the weather.",
      'Hmm, wala akong nahanap diyan. Pinakamagaling ako sa projects, stack, soft skills at contact ni Brian — pero kaya ko ring mag-search ng general topics, mag-math, o tumingin ng weather.'),
    chips: tl ? ['Ano mga project niya?', 'Magpatawa ka'] : FALLBACK_CHIPS,
  };
}

export { CONTACT };
