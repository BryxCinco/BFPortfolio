import React from 'react';

// ============================================================================
// APPICON.JSX — a project logo dressed as an iOS app icon: the rounded
// "squircle" corner (22.5% of the size), a hairline inner border, a soft
// top gloss and a drop shadow. Used on the Projects dock and cards, the Home
// work row and the chat assistant's project cards.
// ============================================================================

const AppIcon = ({ src, name, size = 64, className = '', style }) => (
  <span
    className={`relative inline-block shrink-0 overflow-hidden bg-white ${className}`}
    style={{
      width: size,
      height: size,
      borderRadius: '22.5%',
      boxShadow: `0 ${Math.round(size * 0.12)}px ${Math.round(size * 0.3)}px -${Math.round(size * 0.08)}px rgba(0,0,0,0.45)`,
      ...style,
    }}
  >
    <img src={src} alt={name ? `${name} app icon` : ''} draggable={false} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
    {/* gloss + hairline edge, like a real home-screen icon */}
    <span
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        borderRadius: 'inherit',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 42%)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.12)',
      }}
    />
  </span>
);

export default AppIcon;
