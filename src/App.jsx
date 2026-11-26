import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, Gamepad2, Keyboard, Layers, Menu, MessageSquare, MonitorSmartphone, Moon, Sun, Volume2, VolumeX, X, ArrowUp, ArrowUpRight } from 'lucide-react';

import './site/site.css';
import { NAV, SOCIALS } from './site/data';
import { Chars, Reveal } from './site/motion';
import { useThemeTransition } from './site/useThemeTransition';
import Hero from './site/Hero';
import Work from './site/Work';
import AboutBento from './site/AboutBento';
import StackBento from './site/StackBento';
import CertsBento from './site/CertsBento';
import PlayBento from './site/PlayBento';
import ContactBento from './site/ContactBento';
import Socials from './site/Socials';
import BrandMark from './site/BrandMark';
import Cursor from './site/Cursor';
import NowPlaying from './site/NowPlaying';
import { armAutostart, useMusic } from './site/music';

import Chatbot from './Chatbot';
import TypingTest from './TypingTest';
import PlayGame from './PlayGame';
import WarpHost from './WarpHost';
import IntroSplash from './IntroSplash';
import { useSoundEffects, useGlobalClickSounds } from './SoundEffects';
import { useThemePreference } from './useThemePreference';

// ============================================================================
// APP.JSX — one long page of bento sections. The old multi-page shell is gone;
// the games, the chat assistant, the warp launch and the case-study sheets are
// the same components as before, repainted with the new palette.
// ============================================================================

const NO_IDS = [];

const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', id === 'home' ? ' ' : `#${id}`);
};

// which section is under the middle of the screen
function useScrollSpy(ids) {
  const [active, setActive] = useState('home');
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

function useScrollProgress(ref) {
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (ref.current) ref.current.style.transform = `scaleX(${p})`;
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref]);
}

const ThemeSwitch = ({ darkMode, onToggle }) => (
  <button type="button" className="tswitch" onClick={onToggle} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={darkMode ? 'Light mode' : 'Dark mode'}>
    <Sun className="s-sun" />
    <Moon className="s-moon" />
    <span className="knob">{darkMode ? <Moon /> : <Sun />}</span>
  </button>
);

const AutoButton = ({ active, onClick }) => (
  <button type="button" className="auto-btn" aria-pressed={active} onClick={onClick} title={active ? 'Following your device' : 'Match my device'}>
    <MonitorSmartphone /> Auto
  </button>
);

const PlayMenu = ({ onTyping, onStack, soundEnabled, onToggleSound }) => {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const down = (e) => !root.current?.contains(e.target) && setOpen(false);
    const key = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('keydown', key);
    };
  }, [open]);
  const pick = (fn) => () => {
    setOpen(false);
    fn();
  };
  return (
    <div ref={root} style={{ position: 'relative' }}>
      <button type="button" className="auto-btn" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)} style={{ color: 'var(--ink)' }}>
        <Gamepad2 /> Play
        <ChevronDown style={{ transition: 'transform .3s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="menu nav-pop" role="menu">
          <button type="button" role="menuitem" onClick={pick(onTyping)}>
            <span className="mi-ic">
              <Keyboard />
            </span>
            <span>
              <b>Typing test</b>
              <small>How fast can you type?</small>
            </span>
          </button>
          <button type="button" role="menuitem" onClick={pick(onStack)}>
            <span className="mi-ic">
              <Layers />
            </span>
            <span>
              <b>Stack game</b>
              <small>Stack the tech, climb the ladder</small>
            </span>
          </button>
          <hr />
          <button type="button" role="menuitemcheckbox" aria-checked={soundEnabled} data-no-sound="true" onClick={onToggleSound}>
            <span className="mi-ic">{soundEnabled ? <Volume2 /> : <VolumeX />}</span>
            <span>
              <b>Typing sounds</b>
            </span>
            <span className={`pill ${soundEnabled ? 'on' : ''}`}>{soundEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const NavLinks = ({ active, go }) => {
  const ref = useRef(null);
  const [ind, setInd] = useState({ left: 0, width: 0, opacity: 0 });
  useLayoutEffect(() => {
    const place = () => {
      const a = ref.current?.querySelector(`[data-id="${active}"]`);
      if (!a) return setInd((s) => ({ ...s, opacity: 0 }));
      setInd({ left: a.offsetLeft + 12, width: a.offsetWidth - 24, opacity: 1 });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [active]);
  return (
    <nav ref={ref} className="nav" aria-label="Sections">
      {NAV.map((n, i) => (
        <a key={n.id} data-id={n.id} href={`#${n.id}`} onClick={go(n.id)} aria-current={active === n.id}>
          <sup>0{i + 1}</sup>
          {n.label}
        </a>
      ))}
      <span className="nav-ind" style={ind} aria-hidden="true" />
    </nav>
  );
};

function App() {
  const { darkMode, setDarkMode, followsSystem, followSystem } = useThemePreference();
  const toggleTheme = useThemeTransition(setDarkMode);
  const { soundEnabled, toggleSound, playClick } = useSoundEffects();
  useGlobalClickSounds(soundEnabled, playClick);

  const chatbotRef = useRef(null);
  const typingRef = useRef(null);
  const gameRef = useRef(null);
  const progressRef = useRef(null);
  const [sheet, setSheet] = useState(false);
  const [preview, setPreview] = useState(null);

  // soundtrack: starts on the first tap, click or key anywhere, intro included
  useEffect(() => armAutostart(), []);

  // the theme lives on <html> so portals, scrollbars and the view transition all see it
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.classList.toggle('light', !darkMode);
  }, [darkMode]);

  // intro plays once per browser session; returning visitors get the short cut
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem('hasAnimated') && !window.location.hash;
    } catch {
      return false;
    }
  });
  const [introShort] = useState(() => {
    try {
      return !!localStorage.getItem('bp_intro_seen');
    } catch {
      return false;
    }
  });
  const [introOpening, setIntroOpening] = useState(false);
  const finishIntro = useCallback(() => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('hasAnimated', 'true');
      localStorage.setItem('bp_intro_seen', '1');
    } catch {
      /* storage may be unavailable */
    }
  }, []);

  // a tap on the intro asks for music: mount the page behind the intro right away
  // so the record player (and Spotify) can load while the greetings still run
  const { status: musicStatus } = useMusic();
  const ready = !showIntro || introOpening || musicStatus !== 'idle';
  const ids = useRef(['home', ...NAV.map((n) => n.id)]).current;
  const active = useScrollSpy(ready ? ids : NO_IDS);
  useScrollProgress(progressRef);

  const go = (id) => (e) => {
    e?.preventDefault?.();
    setSheet(false);
    scrollToId(id);
  };
  const navigate = (id) => scrollToId(id);

  useEffect(() => {
    document.body.style.overflow = sheet || preview ? 'hidden' : '';
    const key = (e) => {
      if (e.key !== 'Escape') return;
      setSheet(false);
      setPreview(null);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [sheet, preview]);

  // deep links (#projects etc.) land on the right section once everything has mounted
  useEffect(() => {
    if (!ready) return;
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView(), 60);
  }, [ready]);

  const ask = (q) => (q ? chatbotRef.current?.ask(q) : chatbotRef.current?.open());
  const openTyping = () => typingRef.current?.open();
  const openGame = () => gameRef.current?.open();

  return (
    <>
      {showIntro && <IntroSplash dark={darkMode} short={introShort} onLeave={() => setIntroOpening(true)} onDone={finishIntro} />}
      {ready && (
        <div className={`site ${darkMode ? 'is-dark' : ''}`}>
          <div ref={progressRef} className="progress" style={{ transform: 'scaleX(0)' }} aria-hidden="true" />

          {/* ---------------- top bar ---------------- */}
          <header className="bar">
            <div className="wrap bar-in">
              <a className="brand" href="#home" onClick={go('home')} aria-label="Brian Francisco, back to top">
                <BrandMark className="brand-mark" height={34} />
                <span className="brand-name">
                  Brian Francisco
                  <small>Full-stack · LLM</small>
                </span>
              </a>

              <NavLinks active={active} go={go} />

              <div className="bar-tools">
                <button type="button" className="auto-btn hide-m" onClick={() => ask()} style={{ color: 'var(--ink)' }}>
                  <MessageSquare /> Ask me
                </button>
                <span className="hide-m">
                  <PlayMenu onTyping={openTyping} onStack={openGame} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
                </span>
                <span className="hide-m">
                  <AutoButton active={followsSystem} onClick={followSystem} />
                </span>
                <ThemeSwitch darkMode={darkMode} onToggle={toggleTheme} />
                <button type="button" className="icon-btn only-m" aria-label="Open menu" aria-expanded={sheet} onClick={() => setSheet(true)}>
                  <Menu />
                </button>
              </div>
            </div>
          </header>

          {/* ---------------- mobile sheet ---------------- */}
          <div className={`sheet ${sheet ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!sheet}>
            <div className="sheet-top">
              <span className="mono mute">Menu</span>
              <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setSheet(false)} tabIndex={sheet ? 0 : -1}>
                <X />
              </button>
            </div>
            <nav aria-label="Sections">
              {NAV.map((n, i) => (
                <a key={n.id} href={`#${n.id}`} onClick={go(n.id)} style={{ '--i': i }} tabIndex={sheet ? 0 : -1}>
                  {n.label}
                  <span className="mono">0{i + 1}</span>
                </a>
              ))}
            </nav>
            <div className="sheet-tools">
              <button type="button" className="btn" tabIndex={sheet ? 0 : -1} onClick={() => { setSheet(false); ask(); }}>
                <MessageSquare /> Ask me
              </button>
              <button type="button" className="btn" tabIndex={sheet ? 0 : -1} onClick={() => { setSheet(false); openGame(); }}>
                <Layers /> Stack game
              </button>
              <button type="button" className="btn" tabIndex={sheet ? 0 : -1} onClick={() => { setSheet(false); openTyping(); }}>
                <Keyboard /> Typing test
              </button>
              <button type="button" className="btn" tabIndex={sheet ? 0 : -1} onClick={toggleSound} data-no-sound="true">
                {soundEnabled ? <Volume2 /> : <VolumeX />} Sound {soundEnabled ? 'on' : 'off'}
              </button>
              <button type="button" className="btn" tabIndex={sheet ? 0 : -1} onClick={followSystem} aria-pressed={followsSystem}>
                <MonitorSmartphone /> Auto {followsSystem ? 'on' : 'off'}
              </button>
              <button type="button" className="btn" tabIndex={sheet ? 0 : -1} onClick={toggleTheme}>
                {darkMode ? <Sun /> : <Moon />} {darkMode ? 'Light' : 'Dark'} mode
              </button>
            </div>
          </div>

          {/* ---------------- page ---------------- */}
          <main>
            <Hero darkMode={darkMode} go={go} onAsk={ask} />
            <Work darkMode={darkMode} />
            <AboutBento onPreview={setPreview} />
            <StackBento />
            <CertsBento onPreview={setPreview} />
            <PlayBento
              darkMode={darkMode}
              onTyping={openTyping}
              onStack={openGame}
              onChat={() => ask()}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              onToggleTheme={toggleTheme}
            />
            <Socials />
            <ContactBento soundEnabled={soundEnabled} onTypeTick={playClick} />
          </main>

          {/* ---------------- footer ---------------- */}
          <footer className="foot wrap">
            <div className="foot-row">
              <span className="mono mute">© {new Date().getFullYear()} Brian Paul Francisco · Built by hand in Manila</span>
              <nav className="mono" aria-label="Social">
                {SOCIALS.map((s) => (
                  <a key={s.name} className="link-u" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.name}
                  </a>
                ))}
                <a className="link-u" href="#home" onClick={go('home')}>
                  Top <ArrowUp size={11} style={{ display: 'inline', verticalAlign: '-1px' }} />
                </a>
              </nav>
            </div>
            <Reveal rv="fade">
              <div className="foot-word display" aria-hidden="true">
                <Chars text="Francisco" />
              </div>
            </Reveal>
          </footer>

          {/* ---------------- lightbox ---------------- */}
          {preview && (
            <div className="lb" role="dialog" aria-modal="true" aria-label={preview.title} onClick={() => setPreview(null)}>
              <button type="button" className="icon-btn close" aria-label="Close preview" onClick={() => setPreview(null)}>
                <X />
              </button>
              <figure onClick={(e) => e.stopPropagation()}>
                <img src={preview.src} alt={preview.title} />
                <figcaption>
                  <div>
                    <div className="mono" style={{ opacity: 0.7 }}>
                      {preview.sub || preview.title}
                    </div>
                    {preview.sub && <strong style={{ display: 'block', marginTop: '0.35rem', fontSize: '1.1rem' }}>{preview.title}</strong>}
                    {preview.desc && <p>{preview.desc}</p>}
                  </div>
                  {preview.link && (
                    <a className="btn sm" href={preview.link} target="_blank" rel="noopener noreferrer" style={{ '--b': '#fff', color: '#fff', flex: 'none' }}>
                      Verify <ArrowUpRight />
                    </a>
                  )}
                </figcaption>
              </figure>
            </div>
          )}

          <NowPlaying />
          <Cursor />
          <WarpHost darkMode={darkMode} />
          <Chatbot ref={chatbotRef} darkMode={darkMode} soundEnabled={soundEnabled} onTypeTick={playClick} onNavigate={navigate} />
          <TypingTest ref={typingRef} darkMode={darkMode} soundEnabled={soundEnabled} onKeyPress={playClick} />
          <PlayGame ref={gameRef} darkMode={darkMode} soundEnabled={soundEnabled} onAction={playClick} />
        </div>
      )}
    </>
  );
}

export default App;
