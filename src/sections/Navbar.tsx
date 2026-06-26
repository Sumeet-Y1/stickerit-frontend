import { useEffect, useState } from 'react';
import { authUrl } from '../lib/backend';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className="sticky top-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(245, 240, 232, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
      }}
    >
      <div className="flex items-center justify-between px-6 md:px-12 py-5">
        {/* Logo */}
        <div
          className="font-mono text-lg uppercase tracking-[0.1em]"
          style={{ color: '#2A5040' }}
        >
          StickerIT
        </div>

        {/* Nav Links - hidden on mobile */}
        <div className="hidden md:flex items-center gap-8">
          {['Explore', 'Creators', 'Trending'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="font-mono text-[11px] uppercase tracking-[0.1em] transition-colors hover:text-coral"
              style={{ color: '#2A5040' }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a
            href={authUrl('github')}
            className="font-mono text-xs uppercase tracking-[0.08em] px-4 py-2 rounded-full transition-colors hover:opacity-90"
            style={{
              background: '#2A5040',
              color: '#F5F0E8',
            }}
          >
            GitHub
          </a>
          <a
            href={authUrl('google')}
            className="font-mono text-xs uppercase tracking-[0.08em] px-4 py-2 rounded-full transition-colors hover:opacity-90"
            style={{
              background: '#E8604C',
              color: '#F5F0E8',
            }}
          >
            Google
          </a>
        </div>
      </div>
    </nav>
  );
}
