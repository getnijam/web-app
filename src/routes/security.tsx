import type { ReactNode } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SquareLock02Icon,
  FingerPrintIcon,
  Key01Icon,
  Shield01Icon,
  EyeOffIcon,
  ServerStack01Icon,
} from '@hugeicons/core-free-icons';
import { Nav } from '@/components/home/components/Nav';
import { Footer } from '@/components/home/components/Footer';
import { CTA } from '@/components/home/components/CTA';
import { Section, P, Bullets } from '@/components/legal/LegalLayout';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/security')({
  head: () =>
    seo({
      title: 'Security',
      description:
        'How Nijam protects your Playwright test data — encryption, scoped ingest keys, tenant isolation, privacy-first telemetry, and the providers we build on.',
      path: '/security',
    }),
  component: SecurityPage,
});

const CONTACT = 'support@nijam.dev';
const UPDATED = 'June 5, 2026';

type Pillar = { icon: ReactNode; tint: string; title: string; body: string };

const PILLARS: Pillar[] = [
  {
    icon: <HugeiconsIcon icon={SquareLock02Icon} size={22} />,
    tint: 'bg-primary/15 text-primary',
    title: 'Encryption everywhere',
    body: 'All traffic runs over HTTPS/TLS. Passwords are hashed with argon2id, session and ingest tokens are stored only as SHA-256 hashes, and Slack tokens are encrypted with AES-256-GCM — never in plaintext.',
  },
  {
    icon: <HugeiconsIcon icon={FingerPrintIcon} size={22} />,
    tint: 'bg-info/15 text-info',
    title: 'Authentication & sessions',
    body: 'Email + password (argon2id) plus optional Google and GitHub sign-in. Sessions live in HttpOnly, Secure, SameSite cookies and are revoked on logout, password change, and reset.',
  },
  {
    icon: <HugeiconsIcon icon={Key01Icon} size={22} />,
    tint: 'bg-warning/15 text-warning',
    title: 'Split secret keys',
    body: 'CI uploads use write-only ingestion keys that can never read data — a leaked CI key exposes nothing. MCP/agent reads use separate read-only keys that can never write. Each key is shown once, stored as a SHA-256 hash, and revocable at any time.',
  },
  {
    icon: <HugeiconsIcon icon={Shield01Icon} size={22} />,
    tint: 'bg-success/15 text-success',
    title: 'Tenant isolation',
    body: "Every project belongs to an organization. Requests are checked against your membership, and anything you can't access returns a plain 404 — no resource enumeration.",
  },
  {
    icon: <HugeiconsIcon icon={EyeOffIcon} size={22} />,
    tint: 'bg-destructive/15 text-destructive',
    title: 'Privacy-first telemetry',
    body: 'Error monitoring runs with PII disabled. Cookies, auth headers, and request bodies are stripped before they leave, and session replays mask all text and inputs.',
  },
  {
    icon: <HugeiconsIcon icon={ServerStack01Icon} size={22} />,
    tint: 'bg-primary/15 text-primary',
    title: 'Trusted infrastructure',
    body: 'Data lives on managed providers (Neon Postgres, Cloudflare R2) that encrypt at rest, and trace artifacts are served through short-lived, 15-minute signed URLs.',
  },
];

function SecurityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main>
        {/* hero */}
        <section className="mx-auto max-w-3xl px-6 pt-16 pb-12 text-center md:pt-24">
          <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
            Security
          </Text>
          <Text as="h1" className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            How we protect your test data
          </Text>
          <Text className="mx-auto mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
            Nijam is a read-only reporting layer for Playwright — it ingests the results your CI
            already produces and never executes or re-runs your tests. Here's how we keep that data
            safe, end to end.
          </Text>
          <Text className="mt-4 text-sm text-muted-foreground">Last updated {UPDATED}</Text>
        </section>

        {/* pillars */}
        <section className="mx-auto max-w-6xl px-6 pb-8">
          <Grid cols={[1, 2, 3]} gap={4}>
            {PILLARS.map((p) => (
              <Flex
                key={p.title}
                direction="col"
                className="rounded-2xl border border-border bg-card p-6"
              >
                <Flex
                  inline
                  align="center"
                  justify="center"
                  className={cn('size-10.5 rounded-xl', p.tint)}
                >
                  {p.icon}
                </Flex>
                <Text as="h3" className="mt-4 text-base font-semibold tracking-tight">
                  {p.title}
                </Text>
                <Text className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</Text>
              </Flex>
            ))}
          </Grid>
        </section>

        {/* detail */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <Flex direction="col" gap={8}>
            <Section title="Data encryption">
              <P>
                Every connection to Nijam — the dashboard, the API, and the reporter — is served
                over HTTPS/TLS, and session cookies are marked{' '}
                <code className="font-mono">Secure</code> in production. Sensitive values are never
                stored in the clear:
              </P>
              <Bullets
                items={[
                  <>
                    <b>Passwords</b> are hashed with <b>argon2id</b> (never bcrypt, never
                    plaintext).
                  </>,
                  <>
                    <b>Session, ingest, email-verification, and password-reset tokens</b> are stored
                    only as <b>SHA-256 hashes</b> — the raw token exists only in your browser cookie
                    or the one-time key you copy.
                  </>,
                  <>
                    <b>Slack bot tokens</b> are encrypted at rest with <b>AES-256-GCM</b> and are
                    never returned to clients or written to logs.
                  </>,
                  <>
                    Our managed database (Neon Postgres) and object storage (Cloudflare R2) encrypt
                    data at rest.
                  </>,
                ]}
              />
            </Section>

            <Section title="Authentication & account security">
              <P>
                You can sign in with email and password or with Google or GitHub. We took care to
                make accounts hard to attack and hard to enumerate:
              </P>
              <Bullets
                items={[
                  'Login returns the same error for an unknown email and a wrong password, and equalizes timing so it can’t be used to discover which emails have accounts.',
                  'Email verification and password-reset links are single-use and time-limited (24 hours and 1 hour respectively); a password reset signs you out of every session.',
                  'Google and GitHub sign-in use an HMAC-signed, short-lived state parameter to prevent CSRF, and only match accounts on a verified email address.',
                  'Sessions are stored server-side, expire after 30 days, and are revoked on logout and on any password change.',
                ]}
              />
            </Section>

            <Section title="API access & ingest keys">
              <P>
                Secret keys come in two strictly separated kinds. <b>Ingestion keys</b> (
                <code className="font-mono">nij_sk_…</code>) are what your CI uses as a bearer token
                — they can submit runs, results, and artifacts but <b>can never read your data</b>,
                so the key most exposed to leaks (the one in CI config) unlocks nothing.{' '}
                <b>Read keys</b> (<code className="font-mono">nij_rk_…</code>) power the Nijam MCP
                server and other read integrations — they can read test data within their scope but
                can never write. Neither kind can change settings, manage members, or touch billing.
                Each key is scoped to a single organization or project, shown in full exactly once
                at creation, stored only as a SHA-256 hash, and can be revoked at any time.
              </P>
            </Section>

            <Section title="Access control & tenant isolation">
              <P>
                Projects belong to organizations, and every read is scoped to your membership in
                that organization. If you request something you’re not a member of, you get a plain{' '}
                <code className="font-mono">404</code> rather than a “forbidden” — so the API never
                reveals whether a resource exists. Sensitive organization actions (members, billing,
                settings) are additionally gated to organization admins.
              </P>
            </Section>

            <Section title="Abuse protection & input validation">
              <P>Public and authentication endpoints are hardened against abuse:</P>
              <Bullets
                items={[
                  'Rate limiting on signup, login, verification resend, and password-reset requests.',
                  'Every request body and parameter is validated against a strict schema before it reaches any handler.',
                  'Cross-origin requests are restricted to our own web app.',
                ]}
              />
            </Section>

            <Section title="Monitoring & data minimization">
              <P>
                We use error monitoring only to keep the service reliable, and we minimize what it
                ever sees. Telemetry is disabled unless explicitly configured; when it runs,
                personal data collection is off, and cookies, authorization headers, and request
                bodies are stripped before anything is sent. On the web, error session replays mask{' '}
                <b>all</b> text and inputs. The browser never stores your test data — only a session
                cookie (set by the API) and your theme preference.
              </P>
            </Section>

            <Section title="Infrastructure & sub-processors">
              <P>
                Nijam runs on established managed providers, each responsible for the security of
                their own platform. We use:
              </P>
              <Bullets
                items={[
                  <>
                    <b>Neon</b> — managed Postgres database.
                  </>,
                  <>
                    <b>Cloudflare R2</b> — object storage for traces, screenshots, and videos.
                  </>,
                  <>
                    <b>Vercel</b> — hosting for the web app; <b>Railway</b> — hosting for the API.
                  </>,
                  <>
                    <b>Resend</b> — transactional email (verification and password-reset messages).
                  </>,
                  <>
                    <b>Sentry</b> — error monitoring (PII disabled); <b>Polar</b> — billing and
                    payments.
                  </>,
                  <>
                    <b>Slack</b> and <b>Google/GitHub</b> — only for the integrations and sign-in
                    methods you choose to enable.
                  </>,
                ]}
              />
            </Section>

            <Section title="Your data & ownership">
              <P>
                Your test results are yours. Nijam is a read-only layer that stores the runs, test
                outcomes, timings, and artifacts your CI sends us — it never executes or re-runs
                your tests. Deleting a project removes its runs, results, and artifacts. For details
                on what we collect and why, see our{' '}
                <Link to="/privacy" className="text-primary underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                .
              </P>
            </Section>

            <Section title="Compliance">
              <P>
                We want to be straight with you: Nijam is an independent, early-stage product and we
                do <b>not</b> currently hold formal certifications such as SOC 2 or ISO 27001. What
                we do have is the set of engineering practices described on this page, built on top
                of infrastructure providers that maintain their own security and compliance
                programs. If your organization needs specific security documentation, reach out and
                we’ll do our best to help.
              </P>
            </Section>

            <Section title="Reporting a vulnerability">
              <P>
                If you believe you’ve found a security issue, please email{' '}
                <a
                  href={`mailto:${CONTACT}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {CONTACT}
                </a>{' '}
                with the details and steps to reproduce. We’ll acknowledge your report, investigate,
                and keep you updated. Please give us a reasonable chance to fix the issue before
                disclosing it publicly.
              </P>
            </Section>
          </Flex>
        </section>
      </main>

      <CTA
        title="Bring your test results somewhere safe"
        description="Point your CI at Nijam and turn the results you already produce into flakiness detection and failure analytics — no agents, no re-runs."
      />
      <Footer />
    </div>
  );
}
