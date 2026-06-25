import { useRef, useEffect, useState } from 'react';
import { useScrollTransition } from '../hooks/useScrollTransition';

export default function ScrollBridge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);

  useScrollTransition(canvasRef);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      const bridgeStart = heroHeight;
        const bridgeEnd = heroHeight * 2.5;

      if (scrollY > bridgeStart && scrollY < bridgeEnd) {
        const progress = (scrollY - bridgeStart) / (bridgeEnd - bridgeStart);
        // Show text between 0.4 and 0.8 progress
        if (progress >= 0.4 && progress <= 0.8) {
          const textProgress = (progress - 0.4) / 0.4;
          if (textProgress < 0.5) {
            setOpacity(textProgress * 2);
          } else {
            setOpacity(2 - textProgress * 2);
          }
        } else {
          setOpacity(0);
        }
      } else {
        setOpacity(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="scroll-bridge">
      <canvas ref={canvasRef} aria-hidden="true" />
      <div
        ref={overlayRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          opacity,
          transition: 'opacity 0.3s ease',
        }}
      >
        <h2
          className="font-mono text-center px-4"
          style={{
            fontSize: 'clamp(24px, 4vw, 40px)',
            color: '#F5F0E8',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            letterSpacing: '-0.02em',
          }}
        >
          Dive into millions of stickers
        </h2>
      </div>
    </section>
  );
}
