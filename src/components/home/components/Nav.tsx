import { useEffect, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';
import { DashboardLink } from './DashboardLink';
import { Logo } from '@/components/auth/Logo';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeSegmentedControl } from '@/components/theme/ThemeSegmentedControl';
import { AccountMenu } from '@/components/users/AccountMenu';
import { cn } from '@/lib/utils';
import { DOCS_URL } from '../config';

// Quiet link that lights up in brand color on hover (no hover pill) — the
// reframe.shadcn.io treatment, shared by the desktop bar and the mobile menu.
const LINK =
  'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary';

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link to="/" hash="features" className={LINK} onClick={onNavigate}>
        Features
      </Link>
      <Link to="/" hash="flakiness" className={LINK} onClick={onNavigate}>
        Flakiness
      </Link>
      <Link to="/" hash="integrations" className={LINK} onClick={onNavigate}>
        Integrations
      </Link>
      <Link to="/pricing" className={LINK} onClick={onNavigate}>
        Pricing
      </Link>
      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK}
        onClick={onNavigate}
      >
        Docs
      </a>
    </>
  );
}

/**
 * Home/marketing nav: one floating bordered card under the top edge, modeled on
 * reframe.shadcn.io — the SAME shell for everyone. Only the right-side cluster
 * changes with the session: a skeleton while /me loads, signed-in (dashboard +
 * account menu) or guest (log in + start free). On mobile the links collapse
 * into a hamburger menu that expands inside the card.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
  const closeMenu = () => setMenuOpen(false);

  // Right-side cluster (after the theme toggle, before the hamburger) plus any
  // overflow shown only inside the mobile menu — both vary with auth state.
  // (Computed up-front to keep the JSX free of nested ternaries.)
  let actions: ReactNode;
  let menuExtras: ReactNode = null;
  if (me.isLoading) {
    actions = (
      <Flex align="center" gap={2}>
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </Flex>
    );
  } else if (user) {
    actions = (
      <>
        <Button asChild size="sm" className="hidden rounded-full px-4 sm:inline-flex">
          <DashboardLink>Go to dashboard</DashboardLink>
        </Button>
        <AccountMenu variant="topnav" />
      </>
    );
    menuExtras = (
      <DashboardLink className={cn(LINK, 'sm:hidden')} onClick={closeMenu}>
        Go to dashboard
      </DashboardLink>
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
    menuExtras = (
      <Link to="/login" className={cn(LINK, 'sm:hidden')} onClick={closeMenu}>
        Log in
      </Link>
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
              <NavLinks />
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
              <NavLinks onNavigate={closeMenu} />
              {menuExtras}
            </Flex>
          )}
        </Flex>
      </div>
    </header>
  );
}
