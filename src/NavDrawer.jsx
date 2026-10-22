import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ArrowUpRight, MessageSquare, Layers, ChevronRight } from 'lucide-react';

import { getPalette, cssVars } from './theme';
import brian1 from './assets/Brian1.png';

// ============================================================================
// NAVDRAWER.JSX — the slide-in menu for phones, tablets and narrow windows.
// A paper-like sheet from the right: who you're visiting, big numbered links,
// quick actions, the theme/sound switches and socials. Animations are
// transform/opacity only. `nd-` classes beat the global color overrides.
// ============================================================================

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/BryxCinco' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/brianfrancisco10/' },
  { label: 'Facebook', href: 'https://www.facebook.com/Bryx.Francisco111/' },
];

const DrawerStyles = () => (
  <style>{`
    :is(.light,.dark) .nd-scope :is(h2,h3,p,span).nd-ink { color: var(--ink) !important; }
    :is(.light,.dark) .nd-scope :is(h2,h3,p,span).nd-acc { color: var(--acc) !important; }
    :is(.light,.dark) .nd-scope :is(h2,h3,p,span).nd-on { color: var(--acc-ink) !important; }
    .nd-hand { font-family: 'Caveat', 'Segoe Print', cursive; font-weight: 700; }
    .nd-paper {
      background-image: radial-gradient(var(--line) 1px, transparent 1px);
      background-size: 18px 18px;
    }
  `}</style>
);

const NavDrawer = ({
  open,
  onClose,
  darkMode,
  navItems,
  activeSection,
  onNavigate,
  onAskMe,
  onPlayGame,
  themeSwitch,
  autoSwitch,
  soundSwitch,
  soundEnabled,
}) => {
  const reduced = useReducedMotion();
  const p = getPalette(darkMode);

  // Escape closes; the page behind doesn't scroll while the sheet is open
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const item = (i) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, x: 36 },
          animate: { opacity: 1, x: 0 },
          transition: { type: 'spring', stiffness: 260, damping: 24, delay: 0.08 + i * 0.045 },
        };

  return (
    <AnimatePresence>
      {open && (
        <div className="nd-scope fixed inset-0 z-[1000]" style={cssVars(p)} role="dialog" aria-modal="true" aria-label="Site menu">
          <DrawerStyles />
          <motion.div
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <motion.aside
            initial={reduced ? { opacity: 0 } : { x: '105%' }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: '105%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="nd-paper absolute top-0 right-0 h-[100dvh] w-[min(88vw,24rem)] rounded-l-[2rem] border-l border-[color:var(--acc-line)] shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
            style={{ backgroundColor: darkMode ? '#151524' : '#FFFDF6' }}
          >
            {/* who you're visiting */}
            <div className="flex items-center gap-3 px-5 pt-6 pb-5">
              <div className="relative shrink-0">
                <img
                  src={brian1}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover object-top bg-neutral-200 ring-2 ring-[color:var(--acc)] ring-offset-2 ring-offset-transparent"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2" style={{ borderColor: darkMode ? '#151524' : '#FFFDF6' }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="nd-ink text-base font-black tracking-tight leading-tight truncate">Brian Francisco</p>
                <p className="nd-hand nd-acc mt-1 text-xl leading-none -rotate-2 origin-left">where to, friend?</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="cursor-target shrink-0 w-10 h-10 rounded-full border border-[color:var(--line)] flex items-center justify-center transition-transform hover:rotate-90 active:scale-90"
                style={{ color: 'var(--ink)', background: 'var(--surface-strong)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
              {/* big numbered links */}
              <nav aria-label="Pages" className="space-y-1">
                {navItems.map((n, i) => {
                  const on = activeSection === n.id;
                  return (
                    <motion.button
                      key={n.id}
                      {...item(i)}
                      onClick={() => onNavigate(n.id)}
                      aria-current={on ? 'page' : undefined}
                      className="cursor-target group relative w-full flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-2xl text-left transition-colors"
                      style={{ background: on ? 'var(--acc)' : 'transparent', color: on ? 'var(--acc-ink)' : 'var(--ink)' }}
                    >
                      <span className={`${on ? 'nd-on' : 'nd-acc'} w-7 text-[0.6875rem] font-black tabular-nums tracking-widest`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:-rotate-6 group-active:scale-90"
                        style={{ background: on ? 'rgba(255,255,255,0.22)' : 'var(--acc-soft)', color: on ? 'var(--acc-ink)' : 'var(--acc)' }}
                      >
                        {n.icon}
                      </span>
                      <span className={`${on ? 'nd-on' : 'nd-ink'} flex-1 text-xl font-black tracking-tight`}>{n.name}</span>
                      {on ? (
                        <span className="nd-hand nd-on text-lg -rotate-3">you&apos;re here</span>
                      ) : (
                        <ChevronRight size={18} className="opacity-30 transition-transform group-hover:translate-x-1 group-hover:opacity-70" />
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* quick actions */}
              <motion.div {...item(navItems.length)} className="grid grid-cols-2 gap-2 mt-4 px-1">
                {[
                  { label: 'Ask Me', hint: 'chat with my bot', Icon: MessageSquare, onClick: onAskMe },
                  { label: 'Play Game', hint: 'stack some blocks', Icon: Layers, onClick: onPlayGame },
                ].map(({ label, hint, Icon, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="cursor-target group text-left p-3.5 rounded-2xl border border-[color:var(--acc-line)] transition-transform active:scale-95 hover:-translate-y-0.5"
                    style={{ background: 'var(--acc-soft)' }}
                  >
                    <Icon size={20} className="text-[color:var(--acc)] transition-transform group-hover:-rotate-12" />
                    <p className="nd-ink mt-2 text-sm font-black uppercase tracking-widest">{label}</p>
                    <p className="nd-hand nd-acc text-base leading-none mt-1">{hint}</p>
                  </button>
                ))}
              </motion.div>

              {/* switches */}
              <motion.div
                {...item(navItems.length + 1)}
                className="mt-2 mx-1 rounded-2xl border border-[color:var(--line)] divide-y divide-[color:var(--line)]"
                style={{ background: 'var(--surface-strong)' }}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="nd-ink text-xs font-black uppercase tracking-widest">{darkMode ? 'Dark mode' : 'Light mode'}</span>
                  {themeSwitch}
                </div>
                {autoSwitch && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="nd-ink text-xs font-black uppercase tracking-widest">Match my device</span>
                    {autoSwitch}
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="nd-ink text-xs font-black uppercase tracking-widest">Sound {soundEnabled ? 'on' : 'off'}</span>
                  {soundSwitch}
                </div>
              </motion.div>
            </div>

            {/* socials + status */}
            <div className="px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-[color:var(--line)]">
              <div className="flex gap-1.5">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-target inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[color:var(--line)] text-[0.625rem] font-black uppercase tracking-wider whitespace-nowrap transition-colors hover:border-[color:var(--acc)]"
                    style={{ color: 'var(--ink)' }}
                  >
                    {s.label} <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
              <p className="nd-ink mt-3 flex items-center gap-2 text-[0.6875rem] font-black uppercase tracking-[0.2em] opacity-60">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
                </span>
                Available for work · Manila
              </p>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NavDrawer;
