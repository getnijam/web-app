import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { useQuery } from '@tanstack/react-query';
import { meQueryOptions } from '@/lib/me-query';
import { DashboardLink } from './DashboardLink';
import { ProductMock } from './ProductMock';
import { CIStrip } from './CIStrip';

// px width of one grid cell, matches the 3.5rem rhythm of hero-grid / grid-cells.
const CELL = 56;

export function Hero() {
  const user = useQuery(meQueryOptions()).data?.user;

  // Interactive grid backdrop: we fill it with exactly enough cells to cover the
  // hero, recomputed on resize. Hover lighting/fading is pure CSS on each cell -
  // no pointer tracking, no re-renders as the cursor moves.
  const gridRef = useRef<HTMLDivElement>(null);
  const [cells, setCells] = useState(0);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const compute = () => {
      const next = Math.ceil(el.clientWidth / CELL) * Math.ceil(el.clientHeight / CELL);
      setCells((prev) => (prev === next ? prev : next));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="relative -mt-18 overflow-hidden">
      {/* Full-bleed background: a faint grid plus an interactive layer of cells on
          the same rhythm that light up toward the brand color under the cursor and
          fade back out. The section is pulled up behind the (transparent) floating
          nav by -mt-18, slightly more than the nav's height, so the grid starts
          at the very top of the viewport; the inner container's pt compensates,
          keeping the content where it was. overflow-hidden clips the backdrop from
          the section below. */}
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <div className="pointer-events-none absolute inset-0 hero-grid" />
        <div ref={gridRef} className="absolute inset-0 grid-cells">
          {Array.from({ length: cells }, (_, i) => (
            <span
              key={i}
              className="transition-colors duration-2000 ease-out hover:bg-primary/45 hover:duration-0 motion-reduce:transition-none"
            />
          ))}
        </div>
      </div>

      {/* Content sits above the grid, but is pointer-events-none so the cursor
          falls through the empty space (and behind the text) to light the cells;
          only genuinely interactive bits re-enable events. */}
      <div className="pointer-events-none relative z-10 mx-auto max-w-6xl px-6 pt-34 pb-16 md:pt-30">
        <Grid cols={[1, 1, 2]} className="items-center gap-12">
          <div>
            <Flex
              inline
              align="center"
              gap={2}
              className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-primary"
            >
              <span className="size-1.5 rounded-full bg-primary ring-4 ring-primary/20" />
              Playwright · pytest · Vitest
            </Flex>

            <Text
              as="h1"
              className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            >
              The missing <span className="text-primary">test dashboard</span>
            </Text>

            <Text className="mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
              Nijam reads the test results your CI already uploads, from Playwright, pytest, or
              Vitest, and answers the two questions a pass-or-fail build never does: <em>why</em> a
              test failed, and <em>since when</em> it has been flaky.
            </Text>

            <Flex gap={3} wrap className="pointer-events-auto mt-7">
              <Button asChild size="lg">
                {user ? (
                  <DashboardLink>Go to dashboard</DashboardLink>
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
              No agents, no re-runs, just point your CI at Nijam.
            </Flex>
          </div>

          <ProductMock />
        </Grid>

        <CIStrip />
      </div>
    </section>
  );
}
