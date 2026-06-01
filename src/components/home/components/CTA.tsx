import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Reveal } from '../Reveal';

export function CTA() {
  return (
    <section className="bg-foreground text-background">
      <Reveal className="mx-auto max-w-6xl px-6 py-24 text-center">
        <Text as="h2" className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Stop guessing why your tests fail
        </Text>
        <Text className="mx-auto mt-4 max-w-xl text-lg text-background/75">
          Point your CI at Nijam and get the Playwright dashboard your suite has been missing —
          flakiness, analytics and root cause in one place.
        </Text>
        <Flex justify="center" gap={3} wrap className="mt-7">
          <Button asChild size="lg">
            <Link to="/login">Log in to your dashboard</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background"
          >
            <a href="#features">Explore features</a>
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
