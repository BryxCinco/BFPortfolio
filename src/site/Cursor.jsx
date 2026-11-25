import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// CURSOR.JSX — a HUD-style cursor for mouse and trackpad users.
// · a small diamond follows the pointer exactly
// · a bracket frame trails it, and snaps around whatever you point at
//   (links, buttons, cards, chips), lightly tinting it
// · a tag on the frame says what a click will do (Open ↗, Download, View…)
// Touch screens never see it; text fields keep the normal text caret.
// Everything moves with direct style writes in one rAF loop, no re-renders.
// ============================================================================

const ACTIONABLE = [
  'a[href]',
  'button:not([disabled])',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  'label[for]',
  'select',
  'summary',
].join(',');
// not clickable, but worth pointing out
const INFORMATIVE = '.lchip, .soft-grid li, .sr-methods li, .cert-stats > div, .facts > div, .timeline li';
const TEXT_ENTRY = 'input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]), textarea, [contenteditable="true"]';

const PAD = 6;
const IDLE = 28;

const labelFor = (el) => {
  if (el.dataset.cursor) return el.dataset.cursor;
  if (el.matches('a[download]')) return 'Download';
  if (el.matches('a[href^="mailto:"]')) return 'Email';
  if (el.matches('a[href^="tel:"]')) return 'Call';
  if (el.matches('a[target="_blank"]')) return 'Open ↗';
  if (el.matches('a[href^="#"]')) return 'Go to';
  if (el.matches('.cert, .film button')) return 'View';
  if (el.matches('.play')) return 'Play';
  if (el.matches('a, button, [role]')) return 'Click';
  return '';
};

const useFinePointer = () => {
  const query = '(hover: hover) and (pointer: fine)';
  const [fine, setFine] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const on = (e) => setFine(e.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return fine;
};

export default function Cursor() {
  const fine = useFinePointer();
  const dot = useRef(null);
  const frame = useRef(null);
  const tag = useRef(null);

  useEffect(() => {
    if (!fine) return undefined;
    const root = document.documentElement;
    root.classList.add('cursor-on');
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const p = { x: -100, y: -100 };
    const f = { x: -100, y: -100, w: IDLE, h: IDLE };
    let target = null;
    let mode = 'idle'; // idle | target | text | hidden
    let pressed = false;
    let raf = 0;
    let shown = false;

    const setMode = (m, el) => {
      mode = m;
      target = el;
      const fr = frame.current;
      fr.dataset.mode = m;
      const text = m === 'target' ? labelFor(el) : '';
      tag.current.textContent = text;
      tag.current.style.display = text ? '' : 'none';
      dot.current.dataset.mode = m;
    };

    const pick = (el) => {
      if (!el || el === document.documentElement) return setMode('idle', null);
      if (el.closest('[data-cursor="none"]')) return setMode('idle', null);
      if (el.closest(TEXT_ENTRY)) return setMode('text', el.closest(TEXT_ENTRY));
      const hit = el.closest(ACTIONABLE) || el.closest(INFORMATIVE);
      if (!hit) return setMode('idle', null);
      setMode(hit.matches(ACTIONABLE) ? 'target' : 'info', hit);
    };

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      p.x = e.clientX;
      p.y = e.clientY;
      if (!shown) {
        shown = true;
        f.x = p.x - IDLE / 2;
        f.y = p.y - IDLE / 2;
        dot.current.style.opacity = '';
        frame.current.style.opacity = '';
      }
    };
    const onOver = (e) => pick(e.target);
    const onDown = () => {
      pressed = true;
      frame.current.dataset.pressed = 'true';
    };
    const onUp = () => {
      pressed = false;
      frame.current.dataset.pressed = 'false';
    };
    const onLeave = (e) => {
      if (e.relatedTarget) return;
      shown = false;
      dot.current.style.opacity = '0';
      frame.current.style.opacity = '0';
    };
    // a target can disappear under the pointer (a modal closes, a list collapses)
    const onScrollOrResize = () => {
      if (target && !target.isConnected) pick(document.elementFromPoint(p.x, p.y));
    };

    const tick = () => {
      let tx, ty, tw, th;
      if ((mode === 'target' || mode === 'info' || mode === 'text') && target?.isConnected) {
        const r = target.getBoundingClientRect();
        tx = r.left - PAD;
        ty = r.top - PAD;
        tw = r.width + PAD * 2;
        th = r.height + PAD * 2;
      } else {
        if (target && !target.isConnected) setMode('idle', null);
        tw = IDLE;
        th = IDLE;
        tx = p.x - IDLE / 2;
        ty = p.y - IDLE / 2;
      }
      const k = reduced ? 1 : 0.24;
      f.x += (tx - f.x) * k;
      f.y += (ty - f.y) * k;
      f.w += (tw - f.w) * k;
      f.h += (th - f.h) * k;

      const s = pressed ? 0.94 : 1;
      dot.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      frame.current.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) scale(${s})`;
      frame.current.style.width = `${f.w}px`;
      frame.current.style.height = `${f.h}px`;
      // keep the tag on screen: above the frame, or inside it when the frame touches the top
      tag.current.dataset.below = f.y < 26 ? 'true' : 'false';
      raf = requestAnimationFrame(tick);
    };

    dot.current.style.opacity = '0';
    frame.current.style.opacity = '0';
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerout', onLeave, { passive: true });
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove('cursor-on');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerout', onLeave);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [fine]);

  if (!fine) return null;
  return createPortal(
    <div className="hud-cursor" aria-hidden="true">
      <div ref={frame} className="hud-frame" data-mode="idle">
        <i />
        <i />
        <i />
        <i />
        <span ref={tag} className="hud-tag" style={{ display: 'none' }} />
      </div>
      <div ref={dot} className="hud-dot" data-mode="idle" />
    </div>,
    document.body
  );
}
