import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import emailjs from '@emailjs/browser';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  X,
  Clock,
  AlertCircle,
  Circle,
  Terminal as TerminalIcon
} from 'lucide-react';

import Chatbot from './Chatbot';

// Scroll Animation Wrapper
const ScrollReveal = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 20 } }}
    >
      {children}
    </motion.div>
  );
};

// A single "line" in the terminal-style form
const FieldLine = ({ prompt, children, top = false }) => (
  <div className={`flex flex-col sm:flex-row gap-2 sm:gap-4 ${top ? 'sm:items-start' : 'sm:items-center'}`}>
    <span className={`text-[var(--ct-acc)] font-mono text-sm shrink-0 select-none ${top ? 'sm:pt-2' : ''}`}>{prompt}</span>
    <div className="flex-1">{children}</div>
  </div>
);

const Contact = ({ darkMode, soundEnabled, onTypeTick }) => {
  // Resolve colors directly from the darkMode prop rather than Tailwind's
  // `dark:` variant, which only works if something adds a `dark` class to
  // an ancestor element. This guarantees correct text color regardless of
  // how dark mode is wired up elsewhere in the app.
  const t = (light, dark) => (darkMode ? dark : light);

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const contactInfo = [
    { icon: <Mail size={16} />, label: 'email', val: 'bp.francisco1003@gmail.com', href: 'mailto:brian@example.com' },
    { icon: <Phone size={16} />, label: 'phone', val: '+63 956 432 1020', href: 'tel:+639564321020' },
    { icon: <MapPin size={16} />, label: 'location', val: 'Manila, PH', href: null }
  ];

  const handleSubmitContact = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const serviceID = 'service_1111';
    const templateID = 'template_yjvv0ch';
    const publicKey = 'lwxim5qaSvPtwlwxL';

    const templateParams = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      title: 'Portfolio Inquiry'
    };

    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        setIsSent(true);
        setShowModal(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setIsSent(false), 3000);
      })
      .catch((err) => {
        console.error('FAILED...', err);
        setErrorMsg(
          `May error: ${err.text || 'Unknown Error'}. Status: ${err.status || 'N/A'}. Siguraduhin na ang variables sa EmailJS Dashboard ay tugma sa: name, email, message.`
        );
      })
      .finally(() => setIsSubmitting(false));
  };

  // Keys that shouldn't trigger a click sound (pure modifiers/navigation)
  const SILENT_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape']);
  const handleTypingKeydown = (e) => {
    if (!soundEnabled || typeof onTypeTick !== 'function') return;
    if (SILENT_KEYS.has(e.key)) return;
    onTypeTick('key');
  };

  const inputClasses = `w-full bg-transparent border-b border-[var(--ct-acc)]/20 focus:border-[var(--ct-acc)] outline-none py-2 text-sm font-mono transition-colors ${t(
    'text-[#1B1B2A] placeholder:text-[#1B1B2A]/30',
    'text-white placeholder:text-white/40'
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative space-y-10 pb-20 pt-10 max-w-4xl mx-auto px-4"
      style={{
        '--ct-acc': darkMode ? '#2EE6A8' : '#007A59',
        '--ct-acc-ink': darkMode ? '#1B1B2A' : '#FFFFFF',
        '--ct-acc2': darkMode ? '#FF4D9A' : '#D6006A',
      }}
    >
      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ '--ct-acc': '#2EE6A8' }}
              className="relative bg-[#1B1B2A] border border-[var(--ct-acc)]/30 rounded-md w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden font-mono"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-black/30 border-b border-[var(--ct-acc)]/10">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF007A]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFEA00]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--ct-acc)]" />
                <span className="ml-auto text-[0.625rem] text-white/40">message.log</span>
                <button onClick={() => setShowModal(false)} aria-label="Close" className="text-white/40 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="p-8 text-center">
                <CheckCircle2 size={36} className="text-[var(--ct-acc)] mx-auto mb-4" />
                <p className="text-sm text-[var(--ct-acc)] mb-1">$ send --status</p>
                <h2 className="text-lg font-bold text-white mb-2">200 OK — message delivered</h2>
                <p className="text-xs text-white/50 mb-6 leading-relaxed">
                  Salamat sa pag-message! Makakarating ito sa aking Gmail at susubukan kong sumagot agad.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 bg-[var(--ct-acc)]/10 border border-[var(--ct-acc)]/30 text-[var(--ct-acc)] rounded-md text-xs uppercase tracking-widest hover:bg-[var(--ct-acc)] hover:text-[#1B1B2A] transition-all"
                >
                  close_window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER — terminal title */}
      <ScrollReveal>
        <div className={`flex items-center gap-2 font-mono text-[0.6875rem] ${t('text-[#1B1B2A]/50', 'text-white/40')}`}>
          <TerminalIcon size={13} />
          <span>~/portfolio/contact.sh</span>
        </div>
        <h1 className={`mt-3 text-4xl sm:text-6xl font-black tracking-tighter leading-none ${t('text-[#1B1B2A]', 'text-white')}`}>
          <span className="text-[var(--ct-acc)]">$</span> contact --me
        </h1>
        <p className={`mt-3 text-sm sm:text-base font-mono ${t('text-[#1B1B2A]/60', 'text-white/50')}`}>
          // open for collaboration, internships, or a friendly "Hello World!"
        </p>
      </ScrollReveal>

      {/* TERMINAL WINDOW */}
      <ScrollReveal delay={0.1}>
        <div className="bg-white/5 backdrop-blur-md border border-[var(--ct-acc)]/10 rounded-md overflow-hidden shadow-xl">
          {/* title bar */}
          <div className={`flex items-center gap-2 px-4 py-3 border-b border-[var(--ct-acc)]/10 ${t('bg-black/[0.04]', 'bg-black/20')}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF007A]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFEA00]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--ct-acc)]" />
            <span className={`ml-3 text-[0.625rem] font-mono ${t('text-[#1B1B2A]/40', 'text-white/40')}`}>new_message — form</span>
            <span className="ml-auto flex items-center gap-2 text-[0.625rem] font-mono text-[var(--ct-acc)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ct-acc)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ct-acc)]" />
              </span>
              online
            </span>
          </div>

          <form onSubmit={handleSubmitContact} className="p-6 sm:p-8 space-y-6">
            <FieldLine prompt="name    &gt;">
              <input
                required
                type="text"
                className={inputClasses}
                placeholder="Juan Dela Cruz"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyDown={handleTypingKeydown}
              />
            </FieldLine>
            <FieldLine prompt="email   &gt;">
              <input
                required
                type="email"
                className={inputClasses}
                placeholder="juan@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onKeyDown={handleTypingKeydown}
              />
            </FieldLine>
            <FieldLine prompt="message &gt;" top>
              <textarea
                required
                rows="4"
                className={`${inputClasses} resize-none`}
                placeholder="Tell me about your project..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                onKeyDown={handleTypingKeydown}
              />
            </FieldLine>

            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-md p-4 text-red-400"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-mono leading-relaxed">{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[var(--ct-acc)] text-[var(--ct-acc-ink)] rounded-md font-black text-xs uppercase tracking-widest hover:bg-[var(--ct-acc2)] hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSent ? (
                <>
                  <CheckCircle2 size={16} /> sent
                </>
              ) : isSubmitting ? (
                'sending...'
              ) : (
                <>
                  <Send size={16} /> ./send
                </>
              )}
            </motion.button>
          </form>
        </div>
      </ScrollReveal>

      {/* STATUS + INFO — printed as terminal output */}
      <ScrollReveal delay={0.2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-sm">
          <div className="border border-[var(--ct-acc)]/10 rounded-md p-5 bg-white/5">
            <p className="text-[var(--ct-acc)] text-xs mb-2">$ status --availability</p>
            <div className={`flex items-center gap-2 ${t('text-[#1B1B2A]', 'text-white')}`}>
              <Circle size={8} className="fill-[#A700FF] text-[#A700FF]" />
              <span className="font-bold">currently available for new missions</span>
            </div>
            <div className={`flex items-center gap-2 mt-2 text-xs ${t('text-[#1B1B2A]/50', 'text-white/40')}`}>
              <Clock size={12} /> usual reply time: within 24 hours
            </div>
          </div>

          <div className="border border-[var(--ct-acc)]/10 rounded-md p-5 bg-white/5">
            <p className="text-[var(--ct-acc)] text-xs mb-3">$ cat direct_lines.txt</p>
            <div className="space-y-2">
              {contactInfo.map((item, i) => {
                const Wrapper = item.href ? 'a' : 'div';
                return (
                  <Wrapper
                    key={i}
                    {...(item.href ? { href: item.href } : {})}
                    className={`flex items-center gap-2 ${t('text-[#1B1B2A]', 'text-white')} ${item.href ? 'hover:text-[var(--ct-acc)] cursor-pointer' : ''}`}
                  >
                    <span className={t('text-[#1B1B2A]/40', 'text-white/40')}>{item.icon}</span>
                    <span className={t('text-[#1B1B2A]/40', 'text-white/40')}>{item.label}:</span>
                    <span className="font-bold truncate">{item.val}</span>
                  </Wrapper>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollReveal>

      <Chatbot darkMode={darkMode} soundEnabled={soundEnabled} onTypeTick={onTypeTick} />
    </motion.div>
  );
};

export default Contact;