import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { authUrl, healthUrl } from '../lib/backend';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = textRef.current;
    const arrow = arrowRef.current;
    if (!text || !arrow) return;

    // Text fade out on scroll
    const textTween = gsap.to(text, {
      opacity: 0,
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: '50% top',
        scrub: true,
      },
    });

    // Arrow fade out
    const arrowTween = gsap.to(arrow, {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: '100px top',
        scrub: true,
      },
    });

    return () => {
      textTween.kill();
      arrowTween.kill();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{ height: '100vh' }}
    >
      {/* Background pixel art image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/hero-pixel.jpg)',
        }}
      />

      {/* Hero text block */}
      <div
        ref={textRef}
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ paddingTop: '0', transform: 'translateY(-15%)' }}
      >
        <h1
          className="font-mono text-center leading-[1.1] px-4"
          style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            color: '#2A5040',
            letterSpacing: '-0.02em',
          }}
        >
          The internet's sticker book.
        </h1>

        <p
          className="font-sans text-center mt-4 px-4"
          style={{
            fontSize: '16px',
            color: '#3D3A36',
            maxWidth: '480px',
            lineHeight: 1.5,
          }}
        >
          Discover, collect, and share stickers &amp; GIFs that actually match your vibe.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <a
            href={authUrl('github')}
            className="font-mono text-[13px] uppercase tracking-wide px-8 py-3.5 rounded-full transition-all hover:-translate-y-0.5 hover:opacity-90"
            style={{
              background: '#E8604C',
              color: '#F5F0E8',
            }}
          >
            Start with GitHub &rarr;
          </a>

          <a
            href={authUrl('google')}
            className="font-mono text-[13px] uppercase tracking-wide px-8 py-3.5 rounded-full border transition-all hover:bg-forest/5"
            style={{
              borderColor: '#2A5040',
              color: '#2A5040',
            }}
          >
            Sign in with Google
          </a>

          <a
            href={healthUrl}
            className="font-mono text-[13px] uppercase tracking-wide px-8 py-3.5 rounded-full border transition-all hover:bg-forest/5"
            style={{
              borderColor: '#2A5040',
              color: '#2A5040',
            }}
          >
            View API health
          </a>
        </div>
      </div>

      {/* Scroll hint arrow */}
      <div
        ref={arrowRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-down"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2A5040"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}
