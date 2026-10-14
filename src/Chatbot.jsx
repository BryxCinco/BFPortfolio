import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { X, ArrowUp, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const THINKING_LABELS = ['thinking...', 'analyzing...'];

// Pool of "prepared" starter questions — a random subset of these is shown
// each time the chat is opened, so returning visitors see a fresh set.
const QUESTION_BANK = [
  'Who is Brian?',
  'Why should we hire you?',
  'What work locations do you prefer?',
  'What is your expected salary?',
  'What can you build?',
  'How do you handle complex technical problems?',
  'Where do you see yourself in 2-3 years?',
  'What companies are you interested in working for?',
  'What work modality do you prefer?',
  'Tell me about a time you had a disagreement.',
  'What days do you work?',
  'What is your tech stack?',
  'What projects have you built?',
  'What tools do you use for design?',
  'What dev tools do you use?',
  'Which AI tools do you use?',
  'What are your hobbies?',
  'What is your dream job?',
];

// Fisher-Yates shuffle so the same handful of questions doesn't always
// surface first.
const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const Chatbot = forwardRef(({ darkMode, soundEnabled = true, onTypeTick }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false); // between send and first streamed character
  const [thinkingLabel, setThinkingLabel] = useState(THINKING_LABELS[0]);
  const [messages, setMessages] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [inputFocused, setInputFocused] = useState(false);

  // Speech-to-text dictation state
  const [isDictating, setIsDictating] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [micError, setMicError] = useState('');

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const thinkingIntervalRef = useRef(null);
  const lastResponseIndexRef = useRef(-1);
  const lastJokeIndexRef = useRef(-1);

  // Expose an imperative "open" method so the nav bar (desktop pill + mobile
  // drawer), which now owns the only entry point into the chat, can open
  // this widget from the parent component.
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
  }));

  // Lock page scroll while the overlay is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Focus the input shortly after the overlay finishes animating in
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Pick a fresh random set of 4-5 prepared questions every time the chat opens
  useEffect(() => {
    if (isOpen) {
      const count = Math.random() < 0.5 ? 4 : 5;
      setSuggestedQuestions(shuffleArray(QUESTION_BANK).slice(0, count));
    }
  }, [isOpen]);

  // Clean up any in-flight timers on unmount / close
  useEffect(() => {
    if (!isOpen) {
      clearInterval(streamIntervalRef.current);
      clearInterval(thinkingIntervalRef.current);
    }
  }, [isOpen]);

  // Speech recognition setup (dictation only — no speech synthesis)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    if (typeof window.isSecureContext === 'boolean' && !window.isSecureContext) {
      setVoiceSupported(false);
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      setIsDictating(false);
    };

    recognitionRef.current.onend = () => {
      setIsDictating(false);
    };

    recognitionRef.current.onerror = (event) => {
      setIsDictating(false);
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        setMicError('Mic access is blocked. Allow microphone permission for this site in your browser settings, then try again.');
      } else if (event?.error === 'network') {
        setMicError('Speech recognition needs an internet connection. Check your connection and try again.');
      } else if (event?.error && event.error !== 'no-speech' && event.error !== 'aborted') {
        setMicError('Voice input hit a snag (' + event.error + '). Try again.');
      }
    };

    return () => {
      recognitionRef.current?.stop?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startDictation = () => {
    if (!recognitionRef.current) return;
    setMicError('');
    try {
      setIsDictating(true);
      recognitionRef.current.start();
    } catch (err) {
      if (err?.name !== 'InvalidStateError') {
        setIsDictating(false);
        setMicError('Could not start the mic. Try again.');
      }
    }
  };

  const stopDictation = () => {
    recognitionRef.current?.stop?.();
    setIsDictating(false);
  };

  const toggleDictation = () => {
    if (isDictating) {
      stopDictation();
    } else {
      startDictation();
    }
  };

  // Keys that shouldn't trigger a click sound (pure modifiers/navigation)
  const SILENT_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape']);
  const handleTypingKeydown = (e) => {
    if (!soundEnabled || typeof onTypeTick !== 'function') return;
    if (SILENT_KEYS.has(e.key)) return;
    onTypeTick('key');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isWaiting]);

  // Cycle the "thinking... / analyzing..." label while we wait for a reply,
  // just like the reference — a couple of status words swapping in.
  const startThinkingCycle = () => {
    let idx = 0;
    setThinkingLabel(THINKING_LABELS[0]);
    clearInterval(thinkingIntervalRef.current);
    thinkingIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % THINKING_LABELS.length;
      setThinkingLabel(THINKING_LABELS[idx]);
    }, 700);
  };

  // Reveals a bot reply progressively into the message it belongs to,
  // ChatGPT-style, instead of dumping the whole string in at once.
  const streamReply = (id, fullText) => {
    clearInterval(streamIntervalRef.current);
    let i = 0;
    let tick = 0;
    const chunk = 2;
    streamIntervalRef.current = setInterval(() => {
      i += chunk;
      tick += 1;
      // Throttled so it reads as a soft "typewriter" texture rather than
      // firing on every single character reveal.
      if (soundEnabled && typeof onTypeTick === 'function' && tick % 2 === 0) {
        onTypeTick('type');
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, text: fullText.slice(0, i), streaming: i < fullText.length } : m))
      );
      if (i >= fullText.length) {
        clearInterval(streamIntervalRef.current);
      }
    }, 16);
  };

  // Shared pipeline: takes raw text from the input box,
  // adds it to the transcript, and streams a bot reply in.
  const processUserInput = (text) => {
    if (!text?.trim()) return;
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setIsWaiting(true);
    startThinkingCycle();

    const lower = text.toLowerCase();

    const deliverReply = (botReply) => {
      clearInterval(thinkingIntervalRef.current);
      setIsWaiting(false);
      const botId = Date.now() + 1;
      setMessages((prev) => [...prev, { id: botId, text: '', sender: 'bot', streaming: true }]);
      streamReply(botId, botReply);
    };

    // Weather needs a real network round-trip (geolocation + forecast API),
    // so it's handled separately from the synchronous canned responses.
    if (lower.includes('weather') || lower.includes('forecast')) {
      getWeatherReport().then((report) => {
        setTimeout(() => deliverReply(report), 500 + Math.random() * 400);
      });
      return;
    }

    setTimeout(() => {
      deliverReply(getBotResponse(lower));
    }, 900 + Math.random() * 500);
  };

  const handleSend = (e) => {
    e?.preventDefault?.();
    if (!input.trim()) return;
    processUserInput(input);
    setInput('');
  };

  const getGreetingByTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  // Weather codes from Open-Meteo's WMO weather_code field
  const WEATHER_CODES = {
    0: 'clear sky', 1: 'mostly clear skies', 2: 'partly cloudy skies', 3: 'overcast skies',
    45: 'foggy conditions', 48: 'foggy conditions with rime',
    51: 'a light drizzle', 53: 'drizzle', 55: 'a heavy drizzle',
    56: 'freezing drizzle', 57: 'heavy freezing drizzle',
    61: 'light rain', 63: 'rain', 65: 'heavy rain',
    66: 'freezing rain', 67: 'heavy freezing rain',
    71: 'light snow', 73: 'snow', 75: 'heavy snow', 77: 'snow grains',
    80: 'light rain showers', 81: 'rain showers', 82: 'violent rain showers',
    85: 'light snow showers', 86: 'heavy snow showers',
    95: 'a thunderstorm', 96: 'a thunderstorm with some hail', 99: 'a thunderstorm with heavy hail',
  };

  // Uses the browser's geolocation + the free Open-Meteo API (no key needed)
  // to fetch a live current-conditions report.
  const getWeatherReport = () =>
    new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        resolve("I can't check the weather without location access in this browser — sorry about that!");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`
            );
            const data = await res.json();
            const temp = Math.round(data?.current?.temperature_2m);
            const desc = WEATHER_CODES[data?.current?.weather_code] ?? "some kind of weather I can't quite classify";
            resolve(`Right now it's about ${Number.isFinite(temp) ? `${temp}°C` : 'a mild temperature'} with ${desc} where you are.`);
          } catch (err) {
            resolve("I tried to grab the forecast, but the weather service didn't come back in time. Try again in a bit?");
          }
        },
        () => resolve("I'd need location access to check your local weather — you can allow it in your browser and ask me again!"),
        { timeout: 8000 }
      );
    });

  const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs!",
    "I told my computer I needed a break, and now it won't stop showing me KitKat ads.",
    "Why did the developer go broke? Because he used up all his cache!",
    "There are only 10 types of people: those who understand binary and those who don't.",
    "Why do Java developers wear glasses? Because they don't C#!",
    "Why did the AI cross the road? To optimize the chicken's route.",
    "I'd tell you a UDP joke, but you might not get it.",
    "Debugging: being the detective in a crime movie where you're also the murderer.",
  ];

  const getRandomJoke = () => {
    let idx = Math.floor(Math.random() * jokes.length);
    if (idx === lastJokeIndexRef.current) idx = (idx + 1) % jokes.length;
    lastJokeIndexRef.current = idx;
    return jokes[idx];
  };

  const dayLines = [
    () => `It's been a pretty good ${getGreetingByTime()} so far — just here hanging out and answering questions about Brian's work! How's your day going? hehe`,
    () => `Chill ${getGreetingByTime()}, honestly. Talking about code, projects, and the occasional bad joke. What about you, how's yours been?`,
    () => `This ${getGreetingByTime()} has been fun, lots of good questions rolling in! How's your day treating you?`,
    () => `Can't complain — living my best digital ${getGreetingByTime()}. How about you, everything good on your end?`,
  ];

  // Small chance to tack on a bit of personality (a quick joke) after an
  // otherwise factual answer, so replies don't feel scripted every time.
  const maybeAddAside = (reply) => (Math.random() < 0.2 ? `${reply} Also — ${getRandomJoke()}` : reply);

  const getBotResponse = (query) => {
    // Prepared interview-style Q&A checked first, since some of these
    // questions contain generic words (e.g. "a time you had a disagreement"
    // contains "time") that would otherwise be swallowed by the looser
    // keyword checks further down.
    if (query.includes('who is brian') || query.includes('about brian') || query.includes('tell me about brian')) {
      return "I am Brian Paul Francisco, a BSIT graduate from National Teachers College specializing in full-stack integration. I bridge the gap between secure backend architecture and fluid user experiences by combining intuitive UI/UX design with robust database management. My technical toolkit spans both traditional and modern stacks—leveraging the LAMP stack (Linux, Apache, MySQL, PHP) alongside modern JavaScript ecosystems including Node.js and React to build scalable, data-driven applications.";
    }
    if (query.includes('hire you') || query.includes('why should we hire') || query.includes('why should i hire')) {
      return "I build fast, responsive, and reliable web applications designed to solve real-world problems. With end-to-end expertise across the full stack—from intuitive frontend interfaces to secure backend systems—I don't just write clean code. I focus on delivering scalable, user-centric solutions that deliver tangible business results.";
    }
    if (
      (query.includes('location') && (query.includes('work') || query.includes('prefer'))) ||
      query.includes('onsite location') ||
      query.includes('where do you want to work')
    ) {
      return "For onsite roles, I prefer locations around Manila, Cubao, Pasay, EDSA, San Juan, and Quezon City. For opportunities located in other cities or internationally, I am fully equipped to work remotely.";
    }
    if (query.includes('salary') || query.includes('compensation') || query.includes('expected pay')) {
      return "My expected salary range is between ₱22,000 and ₱40,000 per month, depending on the scope of responsibility, working arrangements, and full compensation package.";
    }
    if (
      query.includes('what can you build') ||
      query.includes('what can you do') ||
      query.includes('what can you make')
    ) {
      return "I can build full-stack web platforms across various domain models, including single-page landing sites with integrated mailing services, e-commerce stores, inventory and supply chain systems, booking platforms, and multi-department SaaS applications.";
    }
    if (
      query.includes('complex') ||
      query.includes('technical problem') ||
      query.includes('handle problem') ||
      query.includes('difficult problem')
    ) {
      return "I take a structured approach: 1. Root-Cause Analysis — I investigate logs and debug step-by-step to isolate the core issue. 2. Research & Collaboration — I consult documentation and reach out to senior engineers or peers for guidance when needed. 3. Pragmatic Delivery — when deadlines are tight, I prioritize delivering a core Minimum Viable Product (MVP) to ensure business continuity without sacrificing quality.";
    }
    if (
      query.includes('see yourself') ||
      query.includes('2 to 3 years') ||
      query.includes('2-3 years') ||
      query.includes('next few years') ||
      query.includes('5 years')
    ) {
      return "In 2 to 3 years, I see myself taking full ownership of end-to-end web products, including building advanced, AI-powered applications. I also plan to expand my technical range into complementary domains like Cybersecurity, Cloud Engineering, Data Science, and AI/LLM integration to continually evolve my overall development skill set.";
    }
    if (
      query.includes('companies') ||
      query.includes('company are you interested') ||
      query.includes('faang') ||
      query.includes('what company')
    ) {
      return "My goal is to work with leading tech organizations like FAANG (Meta, Apple, Amazon, Netflix, Google), as well as enterprise tech leaders like Nvidia, IBM, Oracle, and Accenture—or any forward-thinking company building scalable SaaS products.";
    }
    if (
      query.includes('modality') ||
      query.includes('hybrid') ||
      query.includes('work setup') ||
      query.includes('remote or onsite')
    ) {
      return "I thrive in Hybrid and Remote setups due to their focus on efficiency and productivity. However, I am equally open to Onsite arrangements to gain hands-on collaboration and professional real-world experience.";
    }
    if (
      query.includes('disagreement') ||
      query.includes('conflict') ||
      query.includes('leadership issue') ||
      query.includes('leadership')
    ) {
      return "I once worked in a project environment where team morale was low due to a lack of clear direction and accountability. Rather than waiting passively or letting the project stall, I took the initiative to step up: Proactive Communication — I initiated syncs with my team to clarify individual responsibilities and align our goals. Leading by Example — I worked on core features independently to demonstrate progress and keep momentum going. Establishing Structure — by breaking down tasks into clear deliverables, I helped re-engage the team, boost productivity, and keep our deployment on track.";
    }
    if (
      query.includes('workdays') ||
      query.includes('work days') ||
      query.includes('what days') ||
      query.includes('available days') ||
      query.includes('schedule') ||
      query.includes('hours a day') ||
      query.includes('how many hours')
    ) {
      return "I'm available Monday to Friday, anytime, for a total of 8-9 hours of work per day.";
    }
    if (query.includes('joke') || query.includes('funny') || query.includes('makakatawa')) return getRandomJoke();
    if (query.includes('time')) {
      const now = new Date();
      return `Right now it's ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    }
    if (query.includes('date') || query.includes('today') || query.includes("what day")) {
      const now = new Date();
      return `Today is ${now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }
    if (
      query.includes('dream job') ||
      query.includes('dream career') ||
      query.includes('what do you want to be') ||
      query.includes('future job') ||
      query.includes('career goal')
    ) {
      return "If I had to pick a dream job? Software engineering is at the top — building real products end-to-end. AI/LLM engineering is a close second, since that's basically what powers this chat! And graphic design rounds it out for the creative side — good visuals make everything better.";
    }
    if (
      query.includes('how are you') ||
      query.includes('hows your day') ||
      query.includes("how's your day") ||
      query.includes("how's it going") ||
      query.includes('hows it going') ||
      query.includes('your day') ||
      query.includes('kamusta')
    ) {
      return dayLines[Math.floor(Math.random() * dayLines.length)]();
    }
    if (query.includes('project')) return maybeAddAside("Brian built some cool stuff like TIDE (an AI productivity coach), Poopipoo (a crowdsourced toilet finder), and Neo Chess XD (an 8-bit chess game)! Check them out in the Projects tab.");
    if (query.includes('intern') || query.includes('work')) return maybeAddAside("He's currently killing it as an IT Intern at Grandline Maritime Training, in Kalaw!");
    if (query.includes('stack') || query.includes('tech') || query.includes('gamit')) return maybeAddAside("His stack is React, Node.js, HTML, CSS, JavaScript, Tailwind CSS, SQL, and PHP — a solid mix of frontend and backend tools.");
    if (
      query.includes('design tool') ||
      query.includes('canva') ||
      query.includes('figma') ||
      (query.includes('design') && (query.includes('app') || query.includes('tool') || query.includes('use')))
    ) {
      return maybeAddAside("For design he splits the work: Canva for quick, punchy graphics and social posts, and Figma when he needs real wireframes and clickable prototypes before touching code.");
    }
    if (
      query.includes('dev tool') ||
      query.includes('development tool') ||
      query.includes('vscode') ||
      query.includes('vs code') ||
      query.includes('editor') ||
      query.includes('ide') ||
      query.includes('github') ||
      query.includes('git ')
    ) {
      return maybeAddAside("His dev setup is VS Code as the main editor, Git/GitHub for version control, and Postman for testing APIs — plus a lot of coffee.");
    }
    if (
      query.includes('ai tool') ||
      query.includes('which ai') ||
      query.includes('what ai') ||
      query.includes('gemini') ||
      query.includes('deepseek') ||
      query.includes('perplexity') ||
      query.includes('chatgpt') ||
      query.includes('claude')
    ) {
      return maybeAddAside("He actually mixes a few AI tools depending on the task — Claude for deep reasoning and coding help, Gemini for fast research and brainstorming, DeepSeek when he wants a quick, low-cost second opinion on code, and Perplexity when he needs answers with sources attached.");
    }
    if (
      query.includes('hobby') ||
      query.includes('hobbies') ||
      query.includes('free time') ||
      query.includes('mma') ||
      query.includes('martial art') ||
      query.includes('barista') ||
      query.includes('coffee') ||
      query.includes('quote') ||
      query.includes('outside of')
    ) {
      return maybeAddAside("Outside of code, Brian trains mixed martial arts, works as a barista pulling shots on the side, and writes quotes/reflections whenever an idea hits him. Code, cardio, caffeine, and a bit of poetry — that's the rotation.");
    }
    if (
      query.includes('your name') ||
      query.includes('who are you') ||
      query.includes('what are you')
    ) {
      return "I'm here to help you explore Brian's projects, tools, and skills — or just chat if you want a break.";
    }
    if (query.includes('hi') || query.includes('hello')) return `Hey there! Good ${getGreetingByTime()}! How can I help you explore Brian's portfolio today?`;
    if (query.includes('pogi') || query.includes('gwapo')) return "Sobra! Kitang-kita naman sa profile pic diba?";
    if (query.includes('old') || query.includes('age')) return "Brian is currently 22 years old.";
    if (query.includes('contacts') || query.includes('email')) return "You can reach him at bp.francisco1003@gmail.com or 09564321020.";
    if (query.includes('student') || query.includes('study')) return "He is studying at the National Teachers College in Quiapo, Manila.";
    if (query.includes('bye') || query.includes('thank')) return "Anytime! Come back if you've got more questions about Brian.";

    const randomResponses = [
      "I'm not quite sure about that, but I can definitely tell you about Brian's tech stack!",
      "That's an interesting topic! Want to hear about the Maritime Training System he built instead?",
      "I'm listening! You can ask me about his projects, his design/dev/AI tools, his hobbies, the time, the weather, or just ask for a joke.",
      "Hmm, I don't have an answer for that one. Try asking about his projects, the date, or how to reach him!",
      "Good question! I'm best at talking about Brian's work, skills, tools, and hobbies — or the time and weather.",
      "Not sure about that one, but I do know a good joke if you want one",
      `Beats me! It's been a quiet ${getGreetingByTime()} otherwise. Ask me about Brian's projects, tools, hobbies, the weather, or tell me to tell a joke!`,
    ];
    // Avoid repeating the same filler answer twice in a row
    let idx = Math.floor(Math.random() * randomResponses.length);
    if (idx === lastResponseIndexRef.current) {
      idx = (idx + 1) % randomResponses.length;
    }
    lastResponseIndexRef.current = idx;
    return randomResponses[idx];
  };

  const closeChat = () => setIsOpen(false);

  // Suggestions in the input bar: while typing, filter the prepared bank to
  // matches containing the text so far; with an empty box, fall back to the
  // currently-randomized set so the popup still appears on focus (not just
  // in the very first empty-conversation screen).
  const typedQuery = input.trim().toLowerCase();
  const typeaheadMatches = typedQuery
    ? QUESTION_BANK.filter((q) => q.toLowerCase().includes(typedQuery)).slice(0, 4)
    : suggestedQuestions.slice(0, 4);

  // Pink in light mode, blue in dark mode — matches the accent language
  // used across the rest of the site (pink light / cyan-blue dark).
  const theme = darkMode
    ? {
        backdrop: 'bg-[#03050C]/75',
        text: 'text-white',
        title: 'text-white/70',
        userChip: 'bg-white/10 text-white/90 border-white/10',
        accent: '#3D9BFF',
        accentSoft: 'text-[#3D9BFF]',
        placeholder: 'placeholder:text-white/30',
        divider: 'border-white/10',
        iconIdle: 'text-white/40 hover:text-white/70 hover:bg-white/5',
      }
    : {
        backdrop: 'bg-white/70',
        text: 'text-[#1B1B2A]',
        title: 'text-[#1B1B2A]/60',
        userChip: 'bg-black/5 text-[#1B1B2A]/90 border-black/10',
        accent: '#FF3D8A',
        accentSoft: 'text-[#FF3D8A]',
        placeholder: 'placeholder:text-[#1B1B2A]/30',
        divider: 'border-black/10',
        iconIdle: 'text-[#1B1B2A]/40 hover:text-[#1B1B2A]/70 hover:bg-black/5',
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed inset-0 z-[1000] flex flex-col backdrop-blur-2xl ${theme.backdrop} ${theme.text} font-sans`}
        >
          {/* Top bar — centered "ASK ME" title + exit */}
          <div className="relative flex flex-col items-center justify-center gap-2 px-6 py-6 sm:py-8 shrink-0">
            <span className={`text-xs sm:text-sm font-black uppercase tracking-[0.5em] ${theme.title}`}>
              Ask Me
            </span>
            <span
              className={`inline-flex items-center gap-2 text-sm sm:text-base font-medium tracking-wide ${theme.title} opacity-90`}
            >
              <span className="xl:hidden">press</span>
              <kbd
                className={`xl:hidden px-2.5 py-1 rounded-md border text-sm font-bold ${theme.divider} ${theme.title}`}
              >
                X
              </kbd>
              <span className="hidden xl:inline">press</span>
              <kbd
                className={`hidden xl:inline-block px-2.5 py-1 rounded-md border text-sm sm:text-base font-bold ${theme.divider} ${theme.title}`}
              >
                esc
              </kbd>
              to close
            </span>
            <button
              onClick={closeChat}
              aria-label="Close chat"
              className={`cursor-target absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-colors ${theme.iconIdle}`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Conversation — no card, no bubbles, just the chat floating on the blur */}
          <div
            ref={scrollRef}
            className="relative flex-1 overflow-y-auto px-6 sm:px-12 md:px-24 lg:px-40 custom-scrollbar"
          >
            <div className="max-w-3xl mx-auto w-full min-h-full flex flex-col justify-center gap-8 sm:gap-10 py-10">
              {messages.length === 0 && !isWaiting && (
                <div className="flex flex-col gap-6">
                  <p className={`text-2xl sm:text-3xl md:text-4xl font-light leading-snug ${theme.title}`}>
                    what do you want to ask?
                  </p>
                  {suggestedQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => processUserInput(q)}
                          className={`cursor-target text-left px-4 py-2 rounded-full border text-sm sm:text-base transition-colors hover:opacity-80 ${theme.userChip}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {messages.map((msg) =>
                msg.sender === 'user' ? (
                  <div key={msg.id} className="flex justify-start">
                    <span className={`inline-block max-w-[85%] px-4 py-2 rounded-full border text-sm sm:text-base ${theme.userChip}`}>
                      {msg.text}
                    </span>
                  </div>
                ) : (
                  <p key={msg.id} className="text-xl sm:text-2xl md:text-3xl font-light leading-snug">
                    {msg.text}
                    {msg.streaming && (
                      <span
                        className="inline-block w-[2px] h-[0.9em] ml-1 align-middle animate-pulse"
                        style={{ backgroundColor: theme.accent }}
                      />
                    )}
                  </p>
                )
              )}

              {isWaiting && (
                <div className="flex items-center gap-3">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ backgroundColor: theme.accent }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ backgroundColor: theme.accent }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: theme.accent }} />
                  </span>
                  <span className={`text-lg sm:text-xl font-light ${theme.title}`}>{thinkingLabel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Input — sits directly on the blur, no boxed container */}
          <form
            onSubmit={handleSend}
            className={`relative shrink-0 px-6 sm:px-12 md:px-24 lg:px-40 pb-8 sm:pb-10 pt-4`}
          >
            <div className="max-w-3xl mx-auto w-full relative">
              <AnimatePresence>
                {inputFocused && typeaheadMatches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className={`absolute bottom-full left-0 right-0 mb-2 flex flex-col gap-0.5 rounded-2xl border p-1.5 backdrop-blur-xl shadow-lg ${theme.divider} ${darkMode ? 'bg-[#03050C]/95' : 'bg-white/95'}`}
                  >
                    {typeaheadMatches.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setInput('');
                          setInputFocused(false);
                          processUserInput(q);
                        }}
                        className={`cursor-target text-left px-3.5 py-2 rounded-xl text-sm sm:text-base transition-colors ${theme.text} ${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                      >
                        {q}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className={`flex items-center gap-3 border-b ${theme.divider} pb-3`}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleTypingKeydown}
                  onFocus={() => {
                    setInputFocused(true);
                    if (!input.trim()) {
                      const count = Math.random() < 0.5 ? 4 : 5;
                      setSuggestedQuestions(shuffleArray(QUESTION_BANK).slice(0, count));
                    }
                  }}
                  onBlur={() => setInputFocused(false)}
                  placeholder={micError || 'what do you want to ask?'}
                  className={`flex-1 bg-transparent outline-none text-lg sm:text-xl font-light ${theme.text} ${theme.placeholder}`}
                />
                <button
                  type="button"
                  onClick={toggleDictation}
                  disabled={!voiceSupported}
                  title={voiceSupported ? 'Dictate your message' : 'Voice input not supported in this browser'}
                  className={`cursor-target p-3.5 rounded-full transition-all disabled:opacity-30 ${isDictating ? 'bg-red-500/20 text-red-500' : theme.iconIdle}`}
                >
                  {isDictating ? <Mic size={24} className="animate-pulse" /> : <MicOff size={24} />}
                </button>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="cursor-target p-3.5 rounded-full disabled:opacity-30 hover:scale-105 active:scale-95 transition-transform"
                  style={{ color: theme.accent }}
                >
                  <ArrowUp size={26} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default Chatbot;