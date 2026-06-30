import { useEffect } from 'react';
import { Hero } from './components/Hero';
import { Install } from './components/Install';
import { HomeFeatures } from './components/HomeFeatures';
import { CTA } from './components/CTA';

/** Public marketing landing page, rendered at the dashboard root (`/`). */
export function Home() {
  // Smooth in-page anchor scrolling without bespoke CSS, toggle Tailwind's
  // `scroll-smooth` on <html> only while the landing is mounted + motion is allowed.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const html = document.documentElement;
    html.classList.add('scroll-smooth');
    return () => html.classList.remove('scroll-smooth');
  }, []);

  return (
    <>
      <span id="top" />
      <Hero />
      <Install />
      <HomeFeatures />
      <CTA />
    </>
  );
}
