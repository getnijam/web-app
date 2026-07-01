import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { useSessionUser } from '@/hooks/use-session-user';
import { DashboardLink } from './DashboardLink';
import { Reveal } from '../Reveal';
import { DOCS_URL } from '../config';

/**
 * Closing call-to-action band. Sits right above the Footer on every public page;
 * the heading/blurb vary per page (defaults to the home copy) but the buttons +
 * note stay identical. Guest funnel matches Nav: primary CTA is "Start free".
 */
export function CTA({
  title = 'Stop guessing why your tests fail',
  description = 'Point your CI at Nijam and get the dashboard your test suite has been missing, flakiness, analytics and root cause in one place, for Playwright, pytest and Vitest.',
}: {
  title?: string;
  description?: ReactNode;
} = {}) {
  const user = useSessionUser().data?.user;
  return (
    <section className="bg-foreground text-background">
      <Reveal className="mx-auto max-w-6xl px-6 py-24 text-center">
        <Text as="h2" className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {title}
        </Text>
        <Text className="mx-auto mt-4 max-w-xl text-lg text-background/75">{description}</Text>
        <Flex justify="center" gap={3} wrap className="mt-7">
          <Button asChild size="lg">
            {user ? (
              <DashboardLink>Go to dashboard</DashboardLink>
            ) : (
              <Link to="/signup">Start free</Link>
            )}
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background"
          >
            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
              Read the docs
            </a>
          </Button>
        </Flex>
        <Text className="mt-4.5 text-xs text-background/60">
          Free while you connect your first project · works with GitHub Actions, Jenkins, GitLab CI
          &amp; CircleCI
        </Text>
      </Reveal>
    </section>
  );
}
