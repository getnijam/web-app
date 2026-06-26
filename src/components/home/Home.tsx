import { useEffect } from 'react';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HighlightRows } from './components/HighlightRows';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';

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
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <span id="top" />
      <Hero />
      <Features />
      <HighlightRows />
      <CTA />
      <Footer />
    </div>
  );
}
