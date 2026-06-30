import type { ReactNode } from 'react';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Reveal } from '../Reveal';
import { FailureCard } from './FailureCard';
import { GitHubCard } from './GitHubCard';

function Row({
  id,
  flip,
  heading,
  body,
  proof,
  children,
}: {
  id?: string;
  flip?: boolean;
  heading: ReactNode;
  body: ReactNode;
  proof: ReactNode;
  children: ReactNode;
}) {
  return (
    <div id={id} className={id ? 'scroll-mt-24' : undefined}>
      <Reveal>
        <Grid cols={[1, 1, 2]} className="items-center gap-12">
          <div className={cn(flip && 'md:order-2')}>
            <Text
              as="h3"
              className="text-2xl font-bold tracking-tight text-balance sm:text-3xl"
            >
              {heading}
            </Text>
            <Text className="mt-3.5 max-w-md text-base text-muted-foreground">{body}</Text>
            <Text as="p" className="mt-5 max-w-md text-base font-medium text-foreground">
              {proof}
            </Text>
          </div>
          <div className={cn(flip && 'md:order-1')}>{children}</div>
        </Grid>
      </Reveal>
    </div>
  );
}

export function HighlightRows() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Flex direction="col" className="gap-20">
        <Row
          heading="Why it broke, and the commit that broke it"
          body="Open any failure to read the assertion, scrub the trace and the artifacts, then jump to the exact run and commit where the test first turned red."
          proof="First-failing commit pinpointed, with the trace, the artifacts, and the link to the CI run on one page."
        >
          <FailureCard />
        </Row>

        <Row
          flip
          id="github"
          heading="Every pull request gets a verdict"
          body="Install the GitHub App and Nijam posts a status check on each PR (green when it passes, red when it fails), plus a results comment it keeps up to date as you push."
          proof="One status check and one sticky results comment per PR. Updated in place on each rerun."
        >
          <GitHubCard />
        </Row>
      </Flex>
    </section>
  );
}
