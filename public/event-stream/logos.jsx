// XACT — 5 logo concepts (wordmarks, all cutting-edge)
const { useEffect, useState } = React;

// ─── Logo 1: Beveled X with corner brackets — engineered crosshair ──────────
function LogoCrosshair() {
  return (
    <svg viewBox="0 0 360 120" width="100%" height="100%">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0" stopColor="#ff6b35"/>
          <stop offset="1" stopColor="#ff3500"/>
        </linearGradient>
      </defs>
      {/* corner brackets */}
      <path d="M16 24 V12 H28 M104 24 V12 H92 M16 96 V108 H28 M104 96 V108 H92"
        stroke="#9ba1b3" strokeWidth="1.5" fill="none"/>
      {/* X with bevel */}
      <g transform="translate(60 60)">
        <path d="M-22 -22 L22 22 M22 -22 L-22 22" stroke="url(#g1)" strokeWidth="8" strokeLinecap="square"/>
        <circle cx="0" cy="0" r="3.5" fill="#fff"/>
        <circle cx="0" cy="0" r="14" stroke="#ff6b35" strokeWidth="1" fill="none" opacity="0.4"/>
      </g>
      {/* wordmark */}
      <text x="140" y="68" fill="#e8eaf0"
        style={{ fontFamily: '"Inter Tight"', fontSize: '44px', fontWeight: 800, letterSpacing: '0.04em' }}>
        XACT
      </text>
      <text x="142" y="86" fill="#5d6478"
        style={{ fontFamily: '"JetBrains Mono"', fontSize: '9.5px', letterSpacing: '0.32em' }}>
        FIRE  ·  ESTIMATING
      </text>
    </svg>
  );
}

// ─── Logo 2: Stencil / cut-out monogram — industrial ─────────────────────
function LogoStencil() {
  return (
    <svg viewBox="0 0 360 120" width="100%" height="100%">
      <defs>
        <pattern id="stripes" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#ff6b35"/>
          <line x1="0" y1="0" x2="0" y2="6" stroke="#06070b" strokeWidth="2"/>
        </pattern>
      </defs>
      {/* Stencil X — bridges break the strokes */}
      <g transform="translate(60 60)">
        <rect x="-30" y="-30" width="60" height="60" rx="2" fill="url(#stripes)" opacity="0.3"/>
        <path d="M-22 -22 L-4 -4 M4 4 L22 22 M22 -22 L4 -4 M-4 4 L-22 22"
          stroke="#ff6b35" strokeWidth="10" strokeLinecap="square" fill="none"/>
      </g>
      <text x="140" y="62" fill="#e8eaf0"
        style={{ fontFamily: '"Inter Tight"', fontSize: '40px', fontWeight: 700, fontStretch: 'condensed', letterSpacing: '0.08em' }}>
        XACT
      </text>
      <line x1="142" y1="74" x2="290" y2="74" stroke="#ff6b35" strokeWidth="1"/>
      <text x="142" y="90" fill="#9ba1b3"
        style={{ fontFamily: '"JetBrains Mono"', fontSize: '9px', letterSpacing: '0.28em' }}>
        BUILT FOR FIRE PROTECTION
      </text>
    </svg>
  );
}

// ─── Logo 3: Hydraulic — X formed by sprinkler spray vectors ────────────
function LogoHydraulic() {
  return (
    <svg viewBox="0 0 360 120" width="100%" height="100%">
      <g transform="translate(60 60)">
        {/* four spray vectors forming an X */}
        {[45, 135, 225, 315].map(a => (
          <g key={a} transform={`rotate(${a})`}>
            <line x1="0" y1="0" x2="24" y2="0" stroke="#ff6b35" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="6" y1="-3" x2="20" y2="-3" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            <line x1="6" y1="3" x2="20" y2="3" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            <circle cx="26" cy="0" r="2" fill="#ff6b35"/>
          </g>
        ))}
        <circle cx="0" cy="0" r="6" fill="#06070b" stroke="#ff6b35" strokeWidth="1.5"/>
        <circle cx="0" cy="0" r="2" fill="#ff6b35"/>
      </g>
      <text x="140" y="68" fill="#e8eaf0"
        style={{ fontFamily: '"Inter Tight"', fontSize: '46px', fontWeight: 600, letterSpacing: '-0.02em' }}>
        Xact<tspan fill="#ff6b35">.</tspan>
      </text>
      <text x="142" y="88" fill="#5d6478"
        style={{ fontFamily: '"JetBrains Mono"', fontSize: '9.5px', letterSpacing: '0.24em' }}>
        FP / EST  ·  NFPA-13
      </text>
    </svg>
  );
}

// ─── Logo 4: Event Stream wordmark — XACT with C-cut + accent dot ──────────────
function LogoSchematic() {
  return (
    <svg viewBox="0 0 520 130" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <text x="15" y="94"
        fontFamily='"Archivo", system-ui, sans-serif'
        fontSize="108" fontWeight="900"
        style={{ letterSpacing: '-0.055em' }}
        fill="currentColor">XACT</text>
      {/* vertical cut slicing through the C — colored to match light card bg */}
      <rect x="190" y="46" width="18" height="60" fill="#f5f1ea" stroke="none"/>
      {/* red signal dot, top-right */}
      <circle cx="458" cy="28" r="10" style={{ fill: '#FF5E5B' }}/>
    </svg>
  );
}

// ─── Logo 5: Geometric — X as overlapping triangles, modern monogram ────
function LogoGeo() {
  return (
    <svg viewBox="0 0 360 120" width="100%" height="100%">
      <defs>
        <linearGradient id="gx5a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6b35"/>
          <stop offset="1" stopColor="#c2410c"/>
        </linearGradient>
        <linearGradient id="gx5b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffa07a"/>
          <stop offset="1" stopColor="#ff6b35"/>
        </linearGradient>
      </defs>
      <g transform="translate(60 60)">
        {/* two interlocking triangles forming X */}
        <path d="M-26 -26 L26 -26 L0 0 Z" fill="url(#gx5a)"/>
        <path d="M-26 26 L26 26 L0 0 Z" fill="url(#gx5a)" opacity="0.85"/>
        <path d="M-26 -26 L-26 26 L0 0 Z" fill="url(#gx5b)" opacity="0.75"/>
        <path d="M26 -26 L26 26 L0 0 Z" fill="url(#gx5b)" opacity="0.75"/>
        <circle cx="0" cy="0" r="3" fill="#fff"/>
      </g>
      <text x="140" y="74" fill="#e8eaf0"
        style={{ fontFamily: '"Space Grotesk"', fontSize: '54px', fontWeight: 700, letterSpacing: '-0.04em' }}>
        XACT
      </text>
      <text x="276" y="74" fill="#ff6b35"
        style={{ fontFamily: '"Space Grotesk"', fontSize: '54px', fontWeight: 300, letterSpacing: '-0.04em' }}>
        °
      </text>
    </svg>
  );
}

window.XACT_LOGOS = [
  { id: 'crosshair', name: 'CROSSHAIR', tag: 'Engineered mark · brackets + bevel', comp: LogoCrosshair, vibe: 'precision · technical · cutting-edge' },
  { id: 'stencil', name: 'STENCIL', tag: 'Industrial · hazard pattern', comp: LogoStencil, vibe: 'rugged · field-ready · brand-loud' },
  { id: 'hydraulic', name: 'HYDRAULIC', tag: 'Spray vectors form the X', comp: LogoHydraulic, vibe: 'literal · friendly · soft-tech' },
  { id: 'schematic', name: 'EVENT STREAM', tag: 'XACT wordmark · C-cut + signal dot', comp: LogoSchematic, vibe: '' },
  { id: 'geo', name: 'PRISM', tag: 'Faceted X as four planes', comp: LogoGeo, vibe: 'editorial · bold · contemporary' },
];
