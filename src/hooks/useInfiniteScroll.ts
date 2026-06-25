import { useEffect, useRef } from 'react';

export function useInfiniteScroll(
  callback: () => void,
  options: { rootMargin?: string; threshold?: number } = {}
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callbackRef.current();
          }
        });
      },
      {
        rootMargin: options.rootMargin || '300px',
        threshold: options.threshold || 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [options.rootMargin, options.threshold]);

  return sentinelRef;
}
