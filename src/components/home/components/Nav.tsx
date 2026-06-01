import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Logo } from '@/components/auth/Logo';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { ThemeSegmentedControl } from '@/components/theme/ThemeSegmentedControl';
import { HomeUserMenu } from './HomeUserMenu';
import { useHomeUser } from '../use-home-user';
import { cn } from '@/lib/utils';
import { DOCS_URL } from '../config';

const LINK = 'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const user = useHomeUser();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        <a href="#top" aria-label="Nijam.dev home" className="shrink-0">
          <Logo />
        </a>
        <Flex as="nav" align="center" gap={1} className="ml-4 hidden md:flex">
          <a href="#features" className={LINK}>
            Features
          </a>
          <a href="#flakiness" className={LINK}>
            Flakiness
          </a>
          <a href="#integrations" className={LINK}>
            Integrations
          </a>
          <a href="#pricing" className={LINK}>
            Pricing
          </a>
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
            Docs
          </a>
        </Flex>
        <Flex align="center" gap={2} className="ml-auto">
          <ThemeSegmentedControl minified />
          {user ? (
            <>
              <Button asChild size="sm">
                <Link to="/orgs">Go to dashboard</Link>
              </Button>
              <HomeUserMenu user={user} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Start free</Link>
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
