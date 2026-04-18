import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const botPanelRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const barCartRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(true);

  useGSAP(() => {
    // Skip if already shown this session
    if (sessionStorage.getItem('preloader_done')) {
      setShow(false);
      onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('preloader_done', 'true');
        onComplete();
        setShow(false);
      }
    });

    // Phase 0 — silence
    tl.set(containerRef.current, { opacity: 1 });

    // Phase 1 — grid lines
    tl.from('.grid-line-h', {
      scaleX: 0,
      duration: 0.4,
      stagger: 0.04,
      transformOrigin: 'center center',
      ease: 'power3.out',
    }, 0.15);
    tl.from('.grid-line-v', {
      scaleY: 0,
      duration: 0.4,
      stagger: 0.04,
      transformOrigin: 'center center',
      ease: 'power3.out',
    }, 0.2);

    // Phase 2 — cart draw (using standard stroke-dashoffset)
    tl.from('.cart-path', {
      strokeDashoffset: 400,
      duration: 0.6,
      ease: 'power2.inOut',
    }, 0.55);
    
    tl.from('.wheel-left', {
      x: -40, rotation: -360, opacity: 0,
      duration: 0.3, ease: 'back.out(1.8)',
    }, 0.9);
    tl.from('.wheel-right', {
      x: 40, rotation: 360, opacity: 0,
      duration: 0.3, ease: 'back.out(1.8)',
    }, 0.95);
    tl.from('.price-tag', {
      rotation: -60, opacity: 0, transformOrigin: 'top right',
      duration: 0.35, ease: 'elastic.out(1, 0.5)',
    }, 1.05);

    // Cart landing bounce
    tl.to('.cart-group', {
      keyframes: [
        { scale: 1.12, duration: 0.1 },
        { scale: 0.94, duration: 0.1 },
        { scale: 1.0,  duration: 0.15 },
      ],
      ease: 'none',
    }, 1.15);

    // Phase 3 — text
    tl.from('.letter-mega', {
      y: -60, opacity: 0, rotateX: -90,
      duration: 0.5, stagger: 0.05,
      ease: 'back.out(1.4)',
    }, 1.1);
    tl.from('.letter-discount', {
      x: 40, opacity: 0,
      duration: 0.4, stagger: 0.025,
      ease: 'power3.out',
    }, 1.35);
    tl.from('.word-bazar', {
      y: 70, rotation: 4, opacity: 0,
      duration: 0.45, ease: 'expo.out',
    }, 1.6);
    tl.from('.underline-bazar', {
      scaleX: 0, transformOrigin: 'left center',
      duration: 0.3, ease: 'power2.out',
    }, 1.9);

    // Phase 4 — progress bar
    tl.to(barFillRef.current, {
      width: '100%',
      duration: 1.0,
      ease: 'power1.inOut',
    }, 1.7);
    tl.to(barCartRef.current, {
      left: 'calc(100% - 20px)',
      duration: 1.0,
      ease: 'power1.inOut',
    }, 1.7);

    // Phase 5 — tagline
    tl.from('.tagline-word', {
      y: 12, opacity: 0,
      duration: 0.35, stagger: 0.08,
      ease: 'power2.out',
    }, 2.2);

    // Phase 6 — EXIT (Split screen wipe)
    tl.to([topPanelRef.current, botPanelRef.current], {
      duration: 0.01, display: 'block', opacity: 1
    }, 2.45);
    
    tl.to('.cart-group, .text-group, .tagline-row, .bar-track', {
      scale: 2.2, opacity: 0,
      duration: 0.25, ease: 'power2.in',
    }, 2.45);

    tl.to(topPanelRef.current, {
      y: '-100%',
      duration: 0.6,
      ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
    }, 2.55);
    tl.to(botPanelRef.current, {
      y: '100%',
      duration: 0.6,
      ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
    }, 2.55);

    // Hide entire container
    tl.set(containerRef.current, { display: 'none' });
  }, { scope: containerRef });

  if (!show) return null;

  return (
    <div ref={containerRef} style={styles.container}>
      {/* Grid lines layer */}
      <div style={styles.gridLayer}>
        {[...Array(10)].map((_, i) => (
          <div key={`h${i}`} className="grid-line-h" style={{
            ...styles.gridLineH,
            top: `${(i + 1) * 9}%`,
          }} />
        ))}
        {[...Array(10)].map((_, i) => (
          <div key={`v${i}`} className="grid-line-v" style={{
            ...styles.gridLineV,
            left: `${(i + 1) * 9}%`,
          }} />
        ))}
      </div>

      {/* Main content */}
      <div style={styles.center}>
        {/* Cart SVG */}
        <div className="cart-group" style={styles.cartGroup}>
          <svg width="120" height="100" viewBox="0 0 120 100" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <path className="cart-path"
              d="M10 15 L25 15 L38 62 L90 62 L100 30 L30 30"
              stroke="#FFD600" strokeWidth="5" strokeLinecap="round"
              strokeLinejoin="round" fill="none" 
              strokeDasharray="400" strokeDashoffset="0" />
            <path className="cart-path"
              d="M38 62 L90 62 L100 30 L30 30 Z"
              stroke="#FFD600" strokeWidth="3" strokeLinecap="round"
              fill="rgba(255,214,0,0.08)"
              strokeDasharray="400" strokeDashoffset="0" />
            {/* Vertical lines in basket */}
            <line className="cart-path" x1="55" y1="30" x2="50" y2="62"
              stroke="#FFD600" strokeWidth="2" opacity="0.5"
              strokeDasharray="100" strokeDashoffset="0" />
            <line className="cart-path" x1="70" y1="30" x2="67" y2="62"
              stroke="#FFD600" strokeWidth="2" opacity="0.5"
              strokeDasharray="100" strokeDashoffset="0" />
            <line className="cart-path" x1="85" y1="30" x2="84" y2="62"
              stroke="#FFD600" strokeWidth="2" opacity="0.5"
              strokeDasharray="100" strokeDashoffset="0" />
            {/* Wheels */}
            <circle className="wheel-left"  cx="48" cy="78" r="8"
              stroke="#FFD600" strokeWidth="4" fill="none" />
            <circle cx="48" cy="78" r="2" fill="#FFD600" className="wheel-left" />
            <circle className="wheel-right" cx="80" cy="78" r="8"
              stroke="#FFD600" strokeWidth="4" fill="none" />
            <circle cx="80" cy="78" r="2" fill="#FFD600" className="wheel-right" />
            {/* Price tag */}
            <g className="price-tag">
              <rect x="88" y="5" width="28" height="22" rx="4"
                fill="#FFD600" />
              <text x="102" y="20" textAnchor="middle"
                fontSize="13" fontWeight="700" fill="#B71C1C">%</text>
              <circle cx="91" cy="9" r="2.5" fill="#D32F2F" />
              <line x1="88" y1="9" x2="85" y2="9"
                stroke="#D32F2F" strokeWidth="1.5" />
            </g>
          </svg>
          <div style={styles.cartGlow} />
        </div>

        {/* Text group */}
        <div className="text-group" style={styles.textGroup}>
          <div style={styles.megaRow}>
            {'MEGA'.split('').map((l, i) => (
              <span key={i} className="letter-mega" style={styles.megaLetter}>{l}</span>
            ))}
          </div>
          <div style={styles.discountRow}>
            {'DiScount'.split('').map((l, i) => (
              <span key={i} className="letter-discount"
                style={{ ...styles.discountLetter, color: l === 'S' ? '#FFFFFF' : '#FFD600' }}>
                {l === 'S' ? '$' : l}
              </span>
            ))}
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div className="word-bazar" style={styles.bazarWord}>BAZAR</div>
            <div className="underline-bazar" style={styles.bazarUnderline} />
          </div>
        </div>

        {/* Tagline */}
        <div className="tagline-row" style={styles.taglineRow}>
          {'Mega Deals Everyday'.split(' ').map((w, i) => (
            <span key={i} className="tagline-word" style={styles.taglineWord}>{w}&nbsp;</span>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bar-track" style={styles.barTrack}>
          <div ref={barCartRef} style={styles.barCartIcon}>🛒</div>
          <div ref={barFillRef} style={styles.barFill}>
            <div style={styles.barShimmer} />
          </div>
        </div>
      </div>

      {/* Split panels */}
      <div ref={topPanelRef} style={{ ...styles.splitPanel, top: 0, background: '#0A0A0A' }} />
      <div ref={botPanelRef} style={{ ...styles.splitPanel, bottom: 0, background: '#0A0A0A' }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 9999,
    background: '#0A0A0A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: "'Poppins', sans-serif",
  },
  gridLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  gridLineH: {
    position: 'absolute',
    left: 0, right: 0,
    height: '1px',
    background: 'rgba(211,47,47,0.12)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: '1px',
    background: 'rgba(211,47,47,0.10)',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    zIndex: 10,
  },
  cartGroup: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  cartGlow: {
    position: 'absolute',
    inset: '-20px',
    background: 'radial-gradient(circle, rgba(255,214,0,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  megaRow: {
    display: 'flex',
    gap: '2px',
  },
  megaLetter: {
    fontSize: '56px',
    fontWeight: '600',
    color: '#FFD600',
    lineHeight: 1,
    display: 'inline-block',
    textShadow: '0 0 30px rgba(255,214,0,0.4)',
  },
  discountRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0px',
    marginTop: '-6px',
  },
  discountLetter: {
    fontSize: '34px',
    fontWeight: '400',
    display: 'inline-block',
    letterSpacing: '1px',
  },
  bazarWord: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: '0.35em',
    textAlign: 'center',
    marginTop: '4px',
  },
  bazarUnderline: {
    height: '2px',
    background: '#FFD600',
    marginTop: '3px',
    borderRadius: '2px',
  },
  taglineRow: {
    display: 'flex',
    gap: '4px',
    marginTop: '12px',
  },
  taglineWord: {
    fontSize: '13px',
    fontWeight: '400',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  barTrack: {
    position: 'relative',
    width: '280px',
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '999px',
    marginTop: '20px',
    overflow: 'visible',
  },
  barFill: {
    height: '100%',
    width: '0%',
    background: '#FFD600',
    borderRadius: '999px',
    position: 'relative',
    overflow: 'hidden',
  },
  barShimmer: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: '100px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
    animation: 'shimmer 1.2s ease infinite',
  },
  barCartIcon: {
    position: 'absolute',
    top: '-14px',
    left: '0',
    fontSize: '20px',
    lineHeight: 1,
    filter: 'drop-shadow(0 0 6px rgba(255,214,0,0.8))',
    transform: 'translateX(-50%)',
  },
  splitPanel: {
    position: 'absolute',
    left: 0, right: 0,
    height: '50%',
    display: 'none',
    zIndex: 20,
    pointerEvents: 'none',
  },
};
