import { useEffect, useRef } from 'react';

export function useScrollReveal<T extends HTMLElement>(
  options: { threshold?: number; stagger?: number } = {}
) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll('[data-reveal]');
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const index = parseInt(el.dataset.reveal || '0');
            const stagger = options.stagger || 50;

            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, index * stagger);

            observer.unobserve(el);
          }
        });
      },
      { threshold: options.threshold || 0.1 }
    );

    items.forEach((item) => {
      const el = item as HTMLElement;
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      el.style.transition = 'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1)';
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.stagger]);

  return containerRef;
}
