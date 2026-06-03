import { useLayoutEffect, useRef, type PointerEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { useQuery } from '@tanstack/react-query';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';
import { ProductMock } from './ProductMock';
import { CIStrip } from './CIStrip';

export function Hero() {
  const user = useQuery({ ...getMeOptions(), retry: false, staleTime: 5 * 60 * 1000 }).data?.user;

  // Cursor-following glow orb. Its transform is written straight to the DOM
  // through a ref so pointer moves never re-render the hero subtree.
  const sectionRef = useRef<HTMLElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  // Until the pointer first drives the orb we keep it centered (and re-center
  // on resize); once the cursor takes over it stays wherever it was left.
  const trackedRef = useRef(false);

  useLayoutEffect(() => {
    const center = () => {
      const el = orbRef.current;
      const section = sectionRef.current;
      if (!el || !section) return;
      el.style.transform = `translate(${section.clientWidth / 2}px, ${section.clientHeight / 2}px) translate(-50%, -50%)`;
    };
    center(); // before paint → starts centered, no flash, no animate-in
    const onResize = () => {
      if (!trackedRef.current) center();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const moveOrb = (e: PointerEvent<HTMLElement>) => {
    const el = orbRef.current;
    if (!el) return;
    trackedRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    el.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) translate(-50%, -50%)`;
  };

  return (
    <section ref={sectionRef} onPointerMove={moveOrb} className="relative overflow-hidden">
      {/* Full-bleed background: a faint grid + a cursor-following glow that
          shimmers over it. Spans the whole page width, clipped to the hero by the
          section's overflow-hidden so it never bleeds into the nav above or the
          section below. The orb is moved by moveOrb(). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 hero-grid" />
        <div
          ref={orbRef}
          className="absolute top-0 left-0 hero-orb transition-transform duration-300 ease-out motion-reduce:transition-none"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-16 md:pt-20">
        <Grid cols={[1, 1, 2]} className="items-center gap-12">
          <div>
            <Flex
              inline
              align="center"
              gap={2}
              className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-primary"
            >
              <span className="size-1.5 rounded-full bg-primary ring-4 ring-primary/20" />
              Built for Playwright
            </Flex>

            <Text
              as="h1"
              className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            >
              The missing <span className="text-primary">Playwright dashboard</span>
            </Text>

            <Text className="mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
              Nijam reads the test results your CI already uploads and turns them into flakiness
              detection, failure analytics, and a clear answer to <em>why</em> — and{' '}
              <em>since when</em> — your tests started failing.
            </Text>

            <Flex gap={3} wrap className="mt-7">
              <Button asChild size="lg">
                {user ? (
                  <Link to="/orgs">Go to dashboard</Link>
                ) : (
                  <Link to="/login">Log in to your dashboard</Link>
                )}
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">See features</a>
              </Button>
            </Flex>

            <Flex align="center" gap={2} className="mt-5 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Tick02Icon} size={17} className="text-success" />
              No agents, no re-runs — just point your CI at Nijam.
            </Flex>
          </div>

          <ProductMock />
        </Grid>

        <CIStrip />
      </div>
    </section>
  );
}
