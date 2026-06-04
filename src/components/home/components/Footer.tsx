import { Link } from '@tanstack/react-router';
import { Logo } from '@/components/auth/Logo';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { DOCS_URL } from '../config';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
const COL = 'block py-1 text-sm text-background/80 transition-colors hover:text-background';
const H5 = 'mb-3.5 text-xs font-bold tracking-wide text-background/60 uppercase';

export function Footer() {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <Grid cols={[1, 2, 4]} gap={8}>
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
            <Text className="mt-3.5 max-w-70 text-sm text-background/60">
              The reporting layer for Playwright. Reads the results your CI already produces — never
              runs your tests.
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
            <Link to="/login" className={COL}>
              Dashboard
            </Link>
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
                className={COL}
              >
                {p}
              </a>
            ))}
          </div>

          <div>
            <Text as="p" className={H5}>
              Resources
            </Text>
            <a href={DOCS_URL} {...ext} className={COL}>
              Docs
            </a>
            <Link to="/terms" className={COL}>
              Terms of Service
            </Link>
            <Link to="/privacy" className={COL}>
              Privacy Policy
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
          <span>© 2026 Nijam.dev — a read-only test reporting dashboard.</span>
          <span className="font-mono">Built for Playwright</span>
        </Flex>
      </div>
    </footer>
  );
}
