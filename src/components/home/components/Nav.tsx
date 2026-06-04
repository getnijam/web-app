import { useEffect, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';
import { Logo } from '@/components/auth/Logo';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeSegmentedControl } from '@/components/theme/ThemeSegmentedControl';
import { AccountMenu } from '@/components/users/AccountMenu';
import { cn } from '@/lib/utils';
import { DOCS_URL } from '../config';

const LINK =
  'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  // Session, read optimistically (a 401 just means "guest"). Cached, so the
  // other home sections that read it share this one request.
  const me = useQuery({ ...getMeOptions(), retry: false, staleTime: 5 * 60 * 1000 });
  const user = me.data?.user;
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Right-side cluster: skeleton while /me is in flight, then the signed-in or
  // guest actions. (Computed up-front to avoid nested ternaries in the JSX.)
  let authActions: ReactNode;
  if (me.isLoading) {
    authActions = (
      <Flex align="center" gap={2}>
        <Skeleton className="h-7 w-14" />
        <Skeleton className="h-7 w-20" />
      </Flex>
    );
  } else if (user) {
    authActions = (
      <>
        <Button asChild size="sm">
          <Link to="/orgs">Go to dashboard</Link>
        </Button>
        <AccountMenu variant="topnav" />
      </>
    );
  } else {
    authActions = (
      <>
        <Button asChild variant="ghost" size="sm">
          <Link to="/login">Log in</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/signup">Start free</Link>
        </Button>
      </>
    );
  }

  return (
    <Flex
      as="header"
      align="center"
      className={cn(
        'sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md transition-colors',
        scrolled ? 'border-border' : 'border-transparent',
      )}
    >
      <Flex align="center" gap={3} className="mx-auto h-16 w-full max-w-6xl px-6">
        <Link to="/" hash="top" aria-label="Nijam.dev home" className="shrink-0">
          <Logo />
        </Link>
        <Flex as="nav" align="center" gap={1} className="ml-4 hidden md:flex">
          <Link to="/" hash="features" className={LINK}>
            Features
          </Link>
          <Link to="/" hash="flakiness" className={LINK}>
            Flakiness
          </Link>
          <Link to="/" hash="integrations" className={LINK}>
            Integrations
          </Link>
          <Link to="/pricing" className={LINK}>
            Pricing
          </Link>
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
            Docs
          </a>
        </Flex>
        <Flex align="center" gap={2} className="ml-auto">
          <ThemeSegmentedControl minified />
          {authActions}
        </Flex>
      </Flex>
    </Flex>
  );
}
