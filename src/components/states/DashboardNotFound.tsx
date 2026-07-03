import { Link, useRouter } from '@tanstack/react-router';
import { ORGS_ROUTE } from '@/lib/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, BrokenBoneIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

/**
 * 404 for the authed dashboard, wired as `notFoundComponent` on the `_authed` and
 * org layouts so unmatched dashboard routes render in-app (within the shell where one
 * is present) instead of falling through to the public marketing 404 (Nav + Footer).
 */
export function DashboardNotFound() {
  const router = useRouter();

  return (
    <Flex
      as="main"
      direction="col"
      align="center"
      justify="center"
      gap={6}
      className="min-h-[60svh] px-6 py-20 text-center"
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

      <Flex gap={2.5} wrap align="center" justify="center">
        <Button variant="outline" onClick={() => router.history.back()}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Go back
        </Button>
        <Button asChild>
          <Link to={ORGS_ROUTE}>Go to dashboard</Link>
        </Button>
      </Flex>
    </Flex>
  );
}
