import type { ReactNode } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, BookOpen01Icon, PlugSocketIcon, Bug01Icon } from '@hugeicons/core-free-icons';
import { CTA } from '@/components/home/components/CTA';
import { Section, P, Bullets } from '@/components/legal/LegalLayout';
import { DOCS_URL } from '@/components/home/config';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_marketing/support')({
  head: () =>
    seo({
      title: 'Support',
      description:
        'Get help with Nijam, reach the team by email, browse the docs, troubleshoot reporter and CI setup, or report a security issue. We answer every message.',
      path: '/support',
    }),
  component: SupportPage,
});

const CONTACT = 'support@nijam.dev';
const UPDATED = 'June 20, 2026';

type Channel = {
  icon: ReactNode;
  tint: string;
  title: string;
  body: string;
  action: ReactNode;
};

const CHANNELS: Channel[] = [
  {
    icon: <HugeiconsIcon icon={Mail01Icon} size={22} />,
    tint: 'bg-primary/15 text-primary',
    title: 'Email us',
    body: 'The fastest way to reach a human. Account, billing, bugs, feature requests, anything. We usually reply within one business day.',
    action: (
      <a href={`mailto:${CONTACT}`} className="text-primary underline-offset-4 hover:underline">
        {CONTACT}
      </a>
    ),
  },
  {
    icon: <HugeiconsIcon icon={BookOpen01Icon} size={22} />,
    tint: 'bg-info/15 text-info',
    title: 'Read the docs',
    body: 'Setup guides for the Playwright, pytest, and Vitest reporters, CI integration, secret keys, and the MCP server, most answers live here.',
    action: (
      <a
        href={DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline-offset-4 hover:underline"
      >
        docs.nijam.dev
      </a>
    ),
  },
  {
    icon: <HugeiconsIcon icon={PlugSocketIcon} size={22} />,
    tint: 'bg-success/15 text-success',
    title: 'Integration help',
    body: 'Runs not showing up, a reporter not uploading, or Slack and GitHub checks misbehaving? Send us the project and a CI log and we’ll dig in.',
    action: (
      <a href={`mailto:${CONTACT}`} className="text-primary underline-offset-4 hover:underline">
        Email integration support
      </a>
    ),
  },
  {
    icon: <HugeiconsIcon icon={Bug01Icon} size={22} />,
    tint: 'bg-destructive/15 text-destructive',
    title: 'Report a security issue',
    body: 'Found a vulnerability? Email us with the details and steps to reproduce. Please give us a chance to fix it before disclosing publicly.',
    action: (
      <Link to="/security" className="text-primary underline-offset-4 hover:underline">
        See our security practices
      </Link>
    ),
  },
];

function SupportPage() {
  return (
    <>
      <main>
        {/* hero */}
        <section className="mx-auto max-w-3xl px-6 pt-16 pb-12 text-center md:pt-24">
          <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
            Support
          </Text>
          <Text as="h1" className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            How can we help?
          </Text>
          <Text className="mx-auto mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
            Nijam is built by a small team that reads every message. Whether you’re stuck on setup,
            have a billing question, or hit a bug, here’s how to get unblocked fast.
          </Text>
          <Text className="mt-4 text-sm text-muted-foreground">Last updated {UPDATED}</Text>
        </section>

        {/* channels */}
        <section className="mx-auto max-w-6xl px-6 pb-8">
          <Grid cols={[1, 2, 2]} gap={4}>
            {CHANNELS.map((c) => (
              <Flex
                key={c.title}
                direction="col"
                className="rounded-2xl border border-border bg-card p-6"
              >
                <Flex
                  inline
                  align="center"
                  justify="center"
                  className={cn('size-10.5 rounded-xl', c.tint)}
                >
                  {c.icon}
                </Flex>
                <Text as="h3" className="mt-4 text-base font-semibold tracking-tight">
                  {c.title}
                </Text>
                <Text className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</Text>
                <Text as="p" className="mt-3 text-sm font-medium">
                  {c.action}
                </Text>
              </Flex>
            ))}
          </Grid>
        </section>

        {/* detail */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <Flex direction="col" gap={8}>
            <Section title="Getting a fast answer">
              <P>
                Email{' '}
                <a
                  href={`mailto:${CONTACT}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {CONTACT}
                </a>{' '}
                from the address on your account and include as much as you can, the more context,
                the faster we can help:
              </P>
              <Bullets
                items={[
                  'Your organization and project name (or the project ID from the dashboard).',
                  'What you expected to happen and what happened instead.',
                  'For ingest or CI problems: which reporter and version, and a snippet of the CI log around the upload.',
                  'A link to the run or page in Nijam where you saw the issue, if there is one.',
                ]}
              />
            </Section>

            <Section title="Setup & integrations">
              <P>
                Most setup questions are covered in the{' '}
                <a
                  href={DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  documentation
                </a>
                . A few common ones:
              </P>
              <Bullets
                items={[
                  <>
                    <b>Runs aren’t appearing.</b> Check that your CI is sending a write-only ingest
                    key (<code className="font-mono">nij_sk_…</code>) for the right project, and
                    that the reporter step ran after your tests.
                  </>,
                  <>
                    <b>“No Branch Info” on a run.</b> Your CI didn’t pass a branch, set it in the
                    reporter config or CI environment as shown in the docs.
                  </>,
                  <>
                    <b>Slack or GitHub checks missing.</b> An organization admin needs to connect
                    the integration first; reconnect it from the org’s integration settings.
                  </>,
                ]}
              />
            </Section>

            <Section title="Account & billing">
              <P>
                You can change your password, set up two-factor authentication, and manage connected
                accounts from your account settings. For plan changes, invoices, or anything billing
                related, email{' '}
                <a
                  href={`mailto:${CONTACT}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {CONTACT}
                </a>{' '}
                and we’ll sort it out. Billing is handled by Polar, see the{' '}
                <Link to="/pricing" className="text-primary underline-offset-4 hover:underline">
                  pricing page
                </Link>{' '}
                for current plans.
              </P>
            </Section>

            <Section title="Security & privacy">
              <P>
                To report a vulnerability, email{' '}
                <a
                  href={`mailto:${CONTACT}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {CONTACT}
                </a>{' '}
                with steps to reproduce and give us a reasonable window to fix it before public
                disclosure. For how we handle and protect your data, see our{' '}
                <Link to="/security" className="text-primary underline-offset-4 hover:underline">
                  Security
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>{' '}
                pages.
              </P>
            </Section>

            <Section title="Response times">
              <P>
                We’re an early-stage team, so we don’t offer a formal SLA yet, but we read every
                message and aim to reply within one business day. Urgent, account-blocking issues
                get priority; please say so in the subject line.
              </P>
            </Section>
          </Flex>
        </section>
      </main>

      <CTA
        title="Still stuck? We’re one email away"
        description="Tell us what you’re trying to do and we’ll help you get your test results flowing into Nijam."
      />
    </>
  );
}
