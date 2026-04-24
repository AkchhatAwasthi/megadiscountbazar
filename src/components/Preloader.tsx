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

    // Phase 2 — Logo animate
    tl.from('.preloader-logo', {
      y: 40, opacity: 0, scale: 0.9,
      duration: 0.8,
      ease: 'back.out(1.5)',
    }, 0.5);

    // Phase 4 — progress bar
    tl.to(barFillRef.current, {
      width: '100%',
      duration: 1.0,
      ease: 'power1.inOut',
    }, 1.0);
    tl.to(barCartRef.current, {
      left: 'calc(100% - 20px)',
      duration: 1.0,
      ease: 'power1.inOut',
    }, 1.0);

    // Phase 6 — EXIT (Split screen wipe)
    tl.to([topPanelRef.current, botPanelRef.current], {
      duration: 0.01, display: 'block', opacity: 1
    }, 2.2);
    
    tl.to('.preloader-logo, .bar-track', {
      scale: 1.1, opacity: 0,
      duration: 0.25, ease: 'power2.in',
    }, 2.2);

    tl.to(topPanelRef.current, {
      y: '-100%',
      duration: 0.6,
      ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
    }, 2.3);
    tl.to(botPanelRef.current, {
      y: '100%',
      duration: 0.6,
      ease: 'cubic-bezier(0.76, 0, 0.24, 1)',
    }, 2.3);

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
        <img 
          src="https://res.cloudinary.com/dnxdgpe9c/image/upload/q_auto/f_auto/v1776801280/74b1d4a3-9fc2-4844-baae-7d978d626698_ucbosu.png" 
          alt="Megadiscountbazar Logo" 
          className="preloader-logo" 
          style={{ height: '80px', width: 'auto', objectFit: 'contain', marginBottom: '20px' }} 
        />

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
