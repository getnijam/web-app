import { useEffect, useRef, useState } from 'react';

// usehooks.io has no IntersectionObserver / in-view hook (checked the full
// catalog at https://www.usehooks.io), so this small one is hand-written.
//
// Returns a `ref` to attach to an element and `inView`, whether it has entered
// the viewport. `once` (default) stops observing after the first intersection.
interface UseInViewOptions {
  threshold?: number;
  once?: boolean;
}

export function useInView<T extends Element = HTMLDivElement>({
  threshold = 0,
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}
