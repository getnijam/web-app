import { Link } from '@tanstack/react-router';
import {
  COMPARE_ALLURE_ROUTE,
  COMPARE_DATADOG_ROUTE,
  COMPARE_REPORTPORTAL_ROUTE,
  COMPARE_TESTRAIL_ROUTE,
  FEATURES_ROUTE,
  HOME_ROUTE,
  LOGIN_ROUTE,
  PRICING_ROUTE,
  PRIVACY_ROUTE,
  SECURITY_ROUTE,
  SIGNUP_ROUTE,
  SUPPORT_ROUTE,
  TERMS_ROUTE,
} from '@/lib/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { Logo } from '@/components/auth/Logo';
import { FooterStatus } from './FooterStatus';
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
const H5 = 'mb-3.5 text-sm font-semibold text-background';

// The published reporter packages, linked to their registry pages.
const REPORTERS = [
  { label: 'Playwright (npm)', href: 'https://www.npmjs.com/package/@nijam/pw-reporter' },
  { label: 'pytest (PyPI)', href: 'https://pypi.org/project/pytest-nijam/' },
  { label: 'Vitest (npm)', href: 'https://www.npmjs.com/package/@nijam/vitest-reporter' },
] as const;

/** New-tab indicator for the footer's external links. */
function ExtIcon() {
  return <HugeiconsIcon icon={ArrowUpRight01Icon} size={12} strokeWidth={2} className="shrink-0" />;
}

export function Footer() {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* Brand on the left, link columns left-aligned on the right; justify-between
            opens a wide gap between the brand block and the links. */}
        <Flex direction="col" gap={10} className="md:flex-row md:items-start md:justify-between">
          <div className="shrink-0">
            <Flex
              as={Link}
              to={HOME_ROUTE}
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

          <Grid cols={[2, 4]} gap={8}>
            <div>
              <Text as="p" className={H5}>
                Product
              </Text>
              <Link to={FEATURES_ROUTE} className={COL}>
                Features
              </Link>
              <Link to={PRICING_ROUTE} className={COL}>
                Pricing
              </Link>
              <Link to={LOGIN_ROUTE} className={COL}>
                Log in
              </Link>
              <Link to={SIGNUP_ROUTE} className={COL}>
                Sign up
              </Link>
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
                Comparison
              </Text>
              <Link to={COMPARE_DATADOG_ROUTE} className={COL}>
                Nijam vs Datadog
              </Link>
              <Link to={COMPARE_ALLURE_ROUTE} className={COL}>
                Nijam vs Allure Report
              </Link>
              <Link to={COMPARE_REPORTPORTAL_ROUTE} className={COL}>
                Nijam vs ReportPortal
              </Link>
              <Link to={COMPARE_TESTRAIL_ROUTE} className={COL}>
                Nijam vs TestRail
              </Link>
            </div>

            <div>
              <Text as="p" className={H5}>
                Resources
              </Text>
              <a href={DOCS_URL} {...ext} className={COL_EXT}>
                Docs
                <ExtIcon />
              </a>
              <Link to={SUPPORT_ROUTE} className={COL}>
                Support
              </Link>
              <Link to={TERMS_ROUTE} className={COL}>
                Terms of Service
              </Link>
              <Link to={PRIVACY_ROUTE} className={COL}>
                Privacy Policy
              </Link>
              <Link to={SECURITY_ROUTE} className={COL}>
                Security
              </Link>
            </div>
          </Grid>
        </Flex>

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
