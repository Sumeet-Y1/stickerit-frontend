import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { creators } from '../data/stickers';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedCreators() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current;
    if (!section || !cards) return;

    const cardElements = cards.querySelectorAll('.creator-card');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true,
      },
    });

    tl.fromTo(
      cardElements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      id="creators"
      ref={sectionRef}
      className="relative w-full"
      style={{
        background: '#F5F0E8',
        paddingTop: '120px',
        paddingBottom: '120px',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2
            className="font-mono"
            style={{
              fontSize: 'clamp(28px, 3vw, 40px)',
              color: '#2A5040',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Meet the creators
          </h2>
          <p
            className="font-sans mt-2"
            style={{
              fontSize: '16px',
              color: '#3D3A36',
            }}
          >
            The artists behind your favorite sticker packs
          </p>
        </div>

        {/* Creator Cards */}
        <div
          ref={cardsRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="creator-card flex-shrink-0 snap-start rounded-xl p-6 text-center"
              style={{
                width: '220px',
                background: '#B5CEBC',
              }}
            >
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-lg font-mono font-bold"
                style={{
                  background: creator.color,
                  color: '#F5F0E8',
                }}
              >
                {creator.name.charAt(0)}
              </div>

              <h3
                className="font-mono mt-3"
                style={{
                  fontSize: '16px',
                  color: '#2A5040',
                }}
              >
                {creator.name}
              </h3>

              <p
                className="font-sans mt-1"
                style={{
                  fontSize: '12px',
                  color: '#3D3A36',
                }}
              >
                {creator.role}
              </p>

              <p
                className="font-sans mt-1"
                style={{
                  fontSize: '11px',
                  color: '#7AADA0',
                }}
              >
                {creator.stickerCount} stickers
              </p>

              <button
                className="w-full mt-4 font-mono text-xs uppercase tracking-wide py-2 rounded-full transition-colors hover:opacity-90"
                style={{
                  background: '#2A5040',
                  color: '#F5F0E8',
                }}
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
