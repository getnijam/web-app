import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { motion, type Transition } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon, Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons';
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

// Quiet links that light up in brand color on hover. The active route gets a
// brand-tinted pill: a static one per link on mobile (LINK_ACTIVE), or, on
// desktop, a single shared pill that slides between links, so there
// LINK_ACTIVE_TEXT keeps only the text treatment and the sliding pill owns the
// background. Colour/weight live in the active/inactive prop sets (not LINK) so
// TanStack's class-join never leaves two conflicting Tailwind utilities on one
// element.
const LINK = 'relative z-10 rounded-full px-3 py-2 text-sm transition-colors';
const LINK_INACTIVE = 'font-medium text-muted-foreground hover:text-primary';
const LINK_ACTIVE = 'bg-primary/10 font-semibold text-primary ring-1 ring-inset ring-primary/15';
const LINK_ACTIVE_TEXT = 'font-semibold text-primary';

// Same spring the tabs indicator uses, so both highlights feel identical.
const INDICATOR_TRANSITION: Transition = { type: 'spring', stiffness: 250, damping: 30 };

function NavLinks({ onNavigate, withPill }: { onNavigate?: () => void; withPill?: boolean }) {
  const linkProps = {
    className: LINK,
    activeProps: {
      className: withPill ? LINK_ACTIVE_TEXT : LINK_ACTIVE,
      'aria-current': 'page' as const,
    },
    inactiveProps: { className: LINK_INACTIVE },
  };
  return (
    <>
      {/* `/` is a prefix of every route, so match it exactly or it's always active. */}
      <Link to="/" activeOptions={{ exact: true }} onClick={onNavigate} {...linkProps}>
        Home
      </Link>
      <Link to="/features" onClick={onNavigate} {...linkProps}>
        Features
      </Link>
      <Link to="/pricing" onClick={onNavigate} {...linkProps}>
        Pricing
      </Link>
      {/* External: no active state; the new-tab arrow appears on hover. */}
      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(LINK, LINK_INACTIVE, 'group inline-flex items-center gap-1')}
        onClick={onNavigate}
      >
        Docs
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          size={14}
          strokeWidth={2}
          className="opacity-0 transition-opacity group-hover:opacity-100"
        />
      </a>
    </>
  );
}

type PillRect = { left: number; width: number };

/**
 * Desktop nav links with a single brand pill that springs to the active route
 * (mirrors the tabs indicator). A raw div holds the ref so we can measure the
 * active link; the pill sits behind the links (z-0) and slides on navigation.
 */
function DesktopNavLinks() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ref = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<PillRect | null>(null);

  const measure = useCallback(() => {
    const container = ref.current;
    if (!container) return;
    const active = container.querySelector<HTMLElement>('[data-status="active"]');
    setRect(active ? { left: active.offsetLeft, width: active.offsetWidth } : null);
  }, []);

  // Re-measure after paint, on route change, and on resize. Scheduled via rAF so
  // setState never runs synchronously inside the observer/effect body.
  useEffect(() => {
    let raf = requestAnimationFrame(measure);
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            raf = requestAnimationFrame(measure);
          })
        : null;
    if (observer && ref.current) observer.observe(ref.current);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, pathname]);

  return (
    <div ref={ref} className="relative ml-4 hidden items-center gap-1 md:flex">
      {rect && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 z-0 rounded-full bg-primary/10 ring-1 ring-inset ring-primary/15"
          initial={false}
          animate={{ left: rect.left, width: rect.width }}
          transition={INDICATOR_TRANSITION}
        />
      )}
      <NavLinks withPill />
    </div>
  );
}

/**
 * Home/marketing nav: one floating bordered card under the top edge, modeled on
 * reframe.shadcn.io, the SAME shell for everyone. Only the right-side cluster
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
  // overflow shown only inside the mobile menu, both vary with auth state.
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
            'mx-auto w-full max-w-6xl rounded-lg border bg-background px-2.5 py-2 transition-shadow',
            scrolled && 'shadow-sm',
          )}
        >
          <Flex align="center" gap={3} className="w-full">
            {/* `flex` (not the default inline anchor) so no line-box strut adds
                space under the lockup and the logo centers exactly in the card. */}
            <Link
              to="/"
              aria-label="Nijam.dev home"
              className="flex shrink-0 items-center pl-1.5"
            >
              <Logo />
            </Link>
            <DesktopNavLinks />
            <Flex align="center" gap={2} className="ml-auto shrink-0">
              <ThemeSegmentedControl minified />
              {actions}
              <Button
                variant="ghost"
                size="icon"
                type="button"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                aria-controls="nav-mobile-menu"
                onClick={() => setMenuOpen((open) => !open)}
                className="size-9 text-muted-foreground md:hidden"
              >
                <HugeiconsIcon icon={menuOpen ? Cancel01Icon : Menu01Icon} size={18} />
              </Button>
            </Flex>
          </Flex>
          {menuOpen && (
            <Flex
              id="nav-mobile-menu"
              direction="col"
              gap={1}
              className="w-full pt-2 pb-1 md:hidden"
            >
              <NavLinks onNavigate={closeMenu} />
              {menuExtras}
            </Flex>
          )}

        </Flex>
      </div>
    </header>
  );
}
