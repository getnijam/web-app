import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { ProductMock } from './ProductMock';
import { CIStrip } from './CIStrip';

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-16 md:pt-20">
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

          <Text as="h1" className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            The missing <span className="text-primary">Playwright dashboard</span>
          </Text>

          <Text className="mt-5 max-w-xl text-lg text-muted-foreground text-pretty">
            Nijam reads the test results your CI already uploads and turns them into flakiness
            detection, failure analytics, and a clear answer to <em>why</em> — and{' '}
            <em>since when</em> — your tests started failing.
          </Text>

          <Flex gap={3} wrap className="mt-7">
            <Button asChild size="lg">
              <Link to="/login">Log in to your dashboard</Link>
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
    </section>
  );
}
