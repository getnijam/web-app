import { HugeiconsIcon } from '@hugeicons/react';
import { GoogleIcon, GithubIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

// The OAuth flow starts on the API domain, so these are real top-level navigations
// (plain <a>, not SPA links). The browser hits the API's /start route, which
// redirects to the provider; the callback sets the session cookie and bounces back.
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

function startHref(provider: 'google' | 'github', next: string): string {
  return `${API_BASE}/v1/auth/oauth/${provider}/start?next=${encodeURIComponent(next)}`;
}

/**
 * "Continue with Google / GitHub" buttons + an "or" divider, shown above the
 * email form on the login and signup pages. `next` is the in-app path to land on
 * after sign-in (the server validates it as a same-origin relative path).
 */
export function OAuthButtons({ next = '/orgs' }: { next?: string }) {
  return (
    <Flex direction="col" gap={4}>
      <Flex direction="col" gap={2.5}>
        <Button asChild variant="outline" size="lg" className="w-full">
          <a href={startHref('google', next)}>
            <HugeiconsIcon icon={GoogleIcon} size={18} />
            Continue with Google
          </a>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <a href={startHref('github', next)}>
            <HugeiconsIcon icon={GithubIcon} size={18} />
            Continue with GitHub
          </a>
        </Button>
      </Flex>
      <Flex align="center" gap={3}>
        <div className="h-px flex-1 bg-border" />
        <Text as="span" className="text-xs text-muted-foreground">
          or
        </Text>
        <div className="h-px flex-1 bg-border" />
      </Flex>
    </Flex>
  );
}
