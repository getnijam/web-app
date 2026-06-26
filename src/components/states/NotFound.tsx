import { useRouter } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, BrokenBoneIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Nav } from '@/components/home/components/Nav';
import { Footer } from '@/components/home/components/Footer';

/** Full-page 404, shown by the router (`defaultNotFoundComponent`) when no route matches. */
export function NotFound() {
  const router = useRouter();

  return (
    <Flex direction="col" className="min-h-svh bg-background text-foreground">
      <Nav />

      <Flex
        as="main"
        direction="col"
        align="center"
        justify="center"
        gap={6}
        className="flex-1 px-6 py-20 text-center"
      >
        <Flex direction="col" align="center" gap={2}>
          <HugeiconsIcon icon={BrokenBoneIcon} size={56} className="text-muted-foreground" />
          <Text as="span" className="font-heading text-8xl leading-none font-bold tracking-tight">
            404
          </Text>
          <Text variant="h2">Page not found</Text>
          <Text color="muted" className="max-w-sm">
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
          </Text>
        </Flex>

        <Button variant="outline" onClick={() => router.history.back()}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Go back
        </Button>
      </Flex>

      <Footer />
    </Flex>
  );
}
