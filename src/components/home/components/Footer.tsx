import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { SquareArrowUpRightIcon } from '@hugeicons/core-free-icons';
import { Logo } from '@/components/auth/Logo';
import { FooterStatus } from './FooterStatus';
import { DashboardLink } from './DashboardLink';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { DOCS_URL } from '../config';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
const COL = 'block py-1 text-sm text-background/80 transition-colors hover:text-background';
// External links carry a new-tab affordance: each on its own line (like COL),
// laid out as a flex row so the icon sits next to the label.
const COL_EXT =
  'flex w-fit items-center gap-1 py-1 text-sm text-background/80 transition-colors hover:text-background';
const H5 = 'mb-3.5 text-xs font-bold tracking-wide text-background/60 uppercase';

// The published reporter packages, linked to their registry pages.
const REPORTERS = [
  { label: 'Playwright (npm)', href: 'https://www.npmjs.com/package/@nijam/pw-reporter' },
  { label: 'pytest (PyPI)', href: 'https://pypi.org/project/pytest-nijam/' },
  { label: 'Vitest (npm)', href: 'https://www.npmjs.com/package/@nijam/vitest-reporter' },
] as const;

/** New-tab indicator for the footer's external links. */
function ExtIcon() {
  return (
    <HugeiconsIcon icon={SquareArrowUpRightIcon} size={12} strokeWidth={1.8} className="shrink-0" />
  );
}

export function Footer() {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <Grid cols={[1, 2, 5]} gap={8}>
          <div className="sm:col-span-2 md:col-span-1">
            <Flex
              as={Link}
              to="/"
              hash="top"
              aria-label="Nijam.dev home"
              inline
              className="text-background"
            >
              <Logo />
            </Flex>
            {/* Live system status, sourced from the Better Stack status page JSON API. */}
            <FooterStatus />
            <Text className="mt-3.5 max-w-70 text-sm text-background/60">
              The reporting layer for Playwright, pytest &amp; Vitest. Reads the results your CI
              already produces, never runs your tests.
            </Text>
          </div>

          <div>
            <Text as="p" className={H5}>
              Product
            </Text>
            <Link to="/" hash="features" className={COL}>
              Features
            </Link>
            <Link to="/" hash="flakiness" className={COL}>
              Flakiness detector
            </Link>
            <Link to="/" hash="integrations" className={COL}>
              Integrations
            </Link>
            <Link to="/pricing" className={COL}>
              Pricing
            </Link>
            <DashboardLink className={COL}>Dashboard</DashboardLink>
          </div>

          <div>
            <Text as="p" className={H5}>
              Connect
            </Text>
            {['GitHub Actions', 'Jenkins', 'GitLab CI', 'CircleCI'].map((p) => (
              <a
                key={p}
                href={`${DOCS_URL}/reporter/ci-integration/#supported-providers`}
                {...ext}
                className={COL_EXT}
              >
                {p}
                <ExtIcon />
              </a>
            ))}
          </div>

          <div>
            <Text as="p" className={H5}>
              Reporters
            </Text>
            {REPORTERS.map((r) => (
              <a key={r.label} href={r.href} {...ext} className={COL_EXT}>
                {r.label}
                <ExtIcon />
              </a>
            ))}
          </div>

          <div>
            <Text as="p" className={H5}>
              Resources
            </Text>
            <a href={DOCS_URL} {...ext} className={COL_EXT}>
              Docs
              <ExtIcon />
            </a>
            <Link to="/support" className={COL}>
              Support
            </Link>
            <Link to="/terms" className={COL}>
              Terms of Service
            </Link>
            <Link to="/privacy" className={COL}>
              Privacy Policy
            </Link>
            <Link to="/security" className={COL}>
              Security
            </Link>
            <Link to="/signup" className={COL}>
              Start free
            </Link>
            <Link to="/login" className={COL}>
              Log in
            </Link>
          </div>
        </Grid>

        <Flex
          align="center"
          justify="between"
          wrap
          gap={3}
          className="mt-11 border-t border-background/10 pt-6 text-xs text-background/60"
        >
          <span>© 2026 Nijam.dev, a read-only test reporting dashboard.</span>
          <span className="font-mono">Playwright · pytest · Vitest</span>
        </Flex>
      </div>
    </footer>
  );
}
