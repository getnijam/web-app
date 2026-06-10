import { useEffect, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons';
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

// Guest links keep the quiet default but light up in brand color (no hover
// pill) — the reframe.shadcn.io treatment.
const GUEST_LINK =
  'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary';

function NavLinks({
  linkClassName,
  onNavigate,
}: {
  linkClassName: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link to="/" hash="features" className={linkClassName} onClick={onNavigate}>
        Features
      </Link>
      <Link to="/" hash="flakiness" className={linkClassName} onClick={onNavigate}>
        Flakiness
      </Link>
      <Link to="/" hash="integrations" className={linkClassName} onClick={onNavigate}>
        Integrations
      </Link>
      <Link to="/pricing" className={linkClassName} onClick={onNavigate}>
        Pricing
      </Link>
      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        onClick={onNavigate}
      >
        Docs
      </a>
    </>
  );
}

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

  if (user) return <SignedInNav scrolled={scrolled} />;
  return <GuestNav scrolled={scrolled} loading={me.isLoading} />;
}

/**
 * Guest (and session-loading) nav: a floating bordered card under the top
 * edge with links centered and a pill CTA on the right — modeled on
 * reframe.shadcn.io. On mobile the links collapse into a hamburger menu that
 * expands inside the card.
 */
function GuestNav({ scrolled, loading }: { scrolled: boolean; loading: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  let actions: ReactNode;
  if (loading) {
    actions = (
      <Flex align="center" gap={2}>
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </Flex>
    );
  } else {
    actions = (
      <>
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link to="/login">Log in</Link>
        </Button>
        <Button asChild size="sm" className="rounded-full px-4">
          <Link to="/signup">Start free</Link>
        </Button>
      </>
    );
  }

  return (
    <header className="sticky top-0 z-50 pt-4">
      <div className="px-4 md:px-6">
        <Flex
          as="nav"
          direction="col"
          className={cn(
            'mx-auto w-full max-w-6xl rounded-lg border bg-background/80 px-2.5 py-2 backdrop-blur-md transition-shadow',
            scrolled && 'shadow-sm',
          )}
        >
          <Flex align="center" gap={3} className="w-full">
            {/* `flex` (not the default inline anchor) so no line-box strut adds
                space under the lockup and the logo centers exactly in the card. */}
            <Link
              to="/"
              hash="top"
              aria-label="Nijam.dev home"
              className="flex shrink-0 items-center pl-1.5"
            >
              <Logo />
            </Link>
            <Flex align="center" gap={1} className="ml-4 hidden md:flex">
              <NavLinks linkClassName={GUEST_LINK} />
            </Flex>
            <Flex align="center" gap={2} className="ml-auto shrink-0">
              <ThemeSegmentedControl minified />
              {actions}
              <Button
                variant="ghost"
                size="icon"
                type="button"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="size-9 text-muted-foreground md:hidden"
              >
                <HugeiconsIcon icon={menuOpen ? Cancel01Icon : Menu01Icon} size={18} />
              </Button>
            </Flex>
          </Flex>
          {menuOpen && (
            <Flex direction="col" gap={1} className="w-full pt-2 pb-1 md:hidden">
              <NavLinks linkClassName={GUEST_LINK} onNavigate={closeMenu} />
              <Link to="/login" className={cn(GUEST_LINK, 'sm:hidden')} onClick={closeMenu}>
                Log in
              </Link>
            </Flex>
          )}
        </Flex>
      </div>
    </header>
  );
}

/** Signed-in nav: the original full-width sticky bar with dashboard actions. */
function SignedInNav({ scrolled }: { scrolled: boolean }) {
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
        <Link to="/" hash="top" aria-label="Nijam.dev home" className="flex shrink-0 items-center">
          <Logo />
        </Link>
        <Flex as="nav" align="center" gap={1} className="ml-4 hidden md:flex">
          <NavLinks linkClassName={LINK} />
        </Flex>
        <Flex align="center" gap={2} className="ml-auto">
          <ThemeSegmentedControl minified />
          <Button asChild size="sm">
            <Link to="/orgs">Go to dashboard</Link>
          </Button>
          <AccountMenu variant="topnav" />
        </Flex>
      </Flex>
    </Flex>
  );
}
