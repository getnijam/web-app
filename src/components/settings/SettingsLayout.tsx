import type { ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, UserIcon, SecurityIcon, Delete02Icon } from '@hugeicons/core-free-icons';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/auth/Logo';
import { ThemeSegmentedControl } from '@/components/theme/ThemeSegmentedControl';
import { AccountMenu } from '@/components/users/AccountMenu';
import { HoverHighlight } from '@/components/ui/hover-highlight';

const SECTIONS = [
  { to: '/profile', label: 'Profile', icon: UserIcon, exact: true },
  { to: '/profile/security', label: 'Security', icon: SecurityIcon, exact: false },
  { to: '/profile/danger', label: 'Danger zone', icon: Delete02Icon, exact: false },
] as const;

/**
 * Full-page chrome for the user account settings area, deliberately separate from the
 * org dashboard shell. A top bar (logo + theme + account menu), a "back to dashboard"
 * link, and a left section rail (Profile / Security / Danger) beside the routed content.
 */
export function SettingsLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  // Return to the org the user last opened (same as the post-login landing); fall
  // back to the picker when there isn't one.
  const lastOrgId = useQuery({ ...getMeOptions(), retry: false }).data?.user.lastOrgId ?? null;
  const backLabel = (
    <>
      <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
      Back to dashboard
    </>
  );

  return (
    <Flex direction="col" className="min-h-svh">
      <Flex
        as="header"
        align="center"
        justify="between"
        gap={4}
        className="border-b border-border px-6 py-3"
      >
        <Logo />
        <Flex align="center" gap={2}>
          <ThemeSegmentedControl />
          <AccountMenu variant="topnav" onSignedOut={() => navigate({ to: '/login' })} />
        </Flex>
      </Flex>

      <Flex direction="col" className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 w-fit text-muted-foreground"
        >
          {lastOrgId ? (
            <Link to="/orgs/$orgId/projects" params={{ orgId: lastOrgId }}>
              {backLabel}
            </Link>
          ) : (
            <Link to="/orgs">{backLabel}</Link>
          )}
        </Button>

        <Flex direction="col" gap={1} className="mb-8">
          <Text variant="h1">Account settings</Text>
          <Text color="muted">Manage your profile, security, and account.</Text>
        </Flex>

        <Flex direction="col" gap={8} align="start" className="w-full md:flex-row">
          {/* Mobile: a horizontal, scroll-if-needed tab strip; md+: the vertical rail. */}
          <Flex as="nav" direction="col" className="w-full shrink-0 md:w-48">
            <HoverHighlight
              highlightClassName="rounded-lg bg-accent"
              className="no-scrollbar flex gap-1 overflow-x-auto md:flex-col md:overflow-visible"
            >
              {SECTIONS.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  data-hover-item
                  activeOptions={{ exact: s.exact }}
                  className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{ className: 'bg-accent text-foreground' }}
                >
                  <HugeiconsIcon icon={s.icon} size={17} strokeWidth={1.8} />
                  {s.label}
                </Link>
              ))}
            </HoverHighlight>
          </Flex>

          <Flex direction="col" gap={6} className="min-w-0 flex-1">
            {children}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
