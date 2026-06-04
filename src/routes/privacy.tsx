import { createFileRoute, Link } from '@tanstack/react-router';
import { LegalLayout, Section, P, Bullets } from '@/components/legal/LegalLayout';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/privacy')({
  head: () =>
    seo({
      title: 'Privacy Policy',
      description: 'How Nijam collects, uses, and protects your data.',
      path: '/privacy',
    }),
  component: PrivacyPage,
});

const CONTACT = 'support@nijam.dev';

function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="June 4, 2026"
      intro={
        <>
          This Privacy Policy explains what information Nijam collects when you use the dashboard at
          nijam.dev, the Nijam API, and the <code className="font-mono">@nijam/pw-reporter</code>{' '}
          package, how we use it, and the choices you have. We aim to collect only what we need to
          run a test-analytics service — and nothing more.
        </>
      }
    >
      <Section title="1. Information we collect">
        <P>
          <strong className="font-semibold text-foreground">
            Account &amp; organization data.
          </strong>{' '}
          Your name, email address, password (stored only as a hash — see Security), and optional
          profile picture; and your organization’s name, optional logo, members, and invitations.
        </P>
        <P>
          <strong className="font-semibold text-foreground">Test &amp; run data you send.</strong>{' '}
          When your CI reports to Nijam we receive test results and run metadata — test names and
          file paths, pass/fail status, durations, retries, error messages, and CI context such as
          commit SHA, branch, run identifiers, and the commit author’s name and email.
        </P>
        <P>
          <strong className="font-semibold text-foreground">Source &amp; artifacts.</strong> By
          default, the reporter also uploads your test source files and any Playwright artifacts
          your test configuration produces — traces, screenshots, and videos — so they can be shown
          in the dashboard. You can turn off source uploads by setting{' '}
          <code className="font-mono">uploadSource: false</code> in the reporter, and you control
          which artifacts exist through your Playwright configuration.
        </P>
        <P>
          <strong className="font-semibold text-foreground">Usage &amp; billing data.</strong>{' '}
          Counts of test results ingested (to apply plan limits and meter usage) and, for paid
          plans, billing identifiers and subscription status from our payment processor. We never
          receive or store your full card number.
        </P>
        <P>
          <strong className="font-semibold text-foreground">Technical data.</strong> A session
          cookie to keep you signed in, and basic server logs (e.g. request metadata) used for
          security and reliability. Your theme preference is stored locally in your browser, not on
          our servers.
        </P>
      </Section>

      <Section title="2. How we use your information">
        <Bullets
          items={[
            'to provide the Service — store your runs and produce history, flakiness detection, and analytics;',
            'to authenticate you, secure accounts, enforce plan limits, and prevent abuse;',
            'to process payments and manage subscriptions for paid plans;',
            'to send transactional email (verification, password reset, organization invitations);',
            'to operate, debug, and improve the Service and keep it reliable.',
          ]}
        />
        <P>We do not sell your personal data, and we don’t use it for third-party advertising.</P>
      </Section>

      <Section title="3. Service providers (sub-processors)">
        <P>
          We share data with a small set of providers that help us run Nijam, only as needed to
          deliver the Service:
        </P>
        <Bullets
          items={[
            'Polar — payment processing and billing, as our Merchant of Record;',
            'Resend — sending transactional email;',
            'Neon — managed PostgreSQL database hosting;',
            'Cloudflare R2 — storage for artifacts (traces, screenshots, videos) and uploaded images;',
            'Vercel and Railway — hosting for the web app and API;',
            'Sentry — error monitoring and diagnostics, with personal data scrubbed before it is sent.',
          ]}
        />
        <P>
          We may also disclose information if required by law or to protect the rights, safety, and
          security of Nijam, our users, or the public.
        </P>
      </Section>

      <Section title="4. Data retention">
        <P>
          Run history and artifacts are retained for the window included in your plan — 7 days on
          Free and 90 days on Pro — and are then deleted automatically, including the underlying
          stored files. Account and organization data is kept while your account is active. If you
          delete your account, we delete or anonymize your data, except where we must retain limited
          records (for example, billing records) to meet legal obligations.
        </P>
      </Section>

      <Section title="5. Security">
        <Bullets
          items={[
            'Passwords are hashed with argon2id; verification, reset, session, and ingest tokens are stored only as SHA-256 hashes — never in plaintext.',
            'Data is encrypted in transit over HTTPS.',
            'Artifact storage is private; files are served only through short-lived, signed URLs.',
            'Ingest (secret) keys are write-only and shown once at creation; we store only their hash.',
          ]}
        />
        <P>
          No system is perfectly secure, but we work to protect your data and to limit access to it.
          Please keep your own credentials and ingest keys safe.
        </P>
      </Section>

      <Section title="6. Cookies & local storage">
        <P>
          We use a single essential cookie to keep you signed in. We don’t use third-party
          advertising or cross-site tracking cookies. Your theme preference (light/dark/system) is
          stored in your browser’s local storage under the key{' '}
          <code className="font-mono">nijam-theme</code> and never leaves your device.
        </P>
      </Section>

      <Section title="7. Your rights & choices">
        <P>
          Depending on where you live, you may have rights to access, correct, export, or delete
          your personal data, and to object to or restrict certain processing. You can update your
          profile and manage your organizations in the app, control source/artifact uploads in the
          reporter, and request deletion by contacting us. We’ll respond consistent with applicable
          law.
        </P>
      </Section>

      <Section title="8. International transfers">
        <P>
          Nijam and its providers may process and store data in countries other than your own. Where
          required, we rely on appropriate safeguards for such transfers.
        </P>
      </Section>

      <Section title="9. Children">
        <P>
          Nijam isn’t directed to children and isn’t intended for anyone under 16. We don’t
          knowingly collect personal data from children; if you believe a child has provided us
          data, contact us and we’ll delete it.
        </P>
      </Section>

      <Section title="10. Changes to this policy">
        <P>
          We may update this Privacy Policy from time to time. We’ll revise the “Last updated” date
          above and, for material changes, take reasonable steps to notify you. Your continued use
          of the Service after an update means you accept the revised policy.
        </P>
      </Section>

      <Section title="11. Contact">
        <P>
          Questions about your privacy or this policy? Email us at{' '}
          <a href={`mailto:${CONTACT}`} className="text-primary underline-offset-4 hover:underline">
            {CONTACT}
          </a>
          . See also our{' '}
          <Link to="/terms" className="text-primary underline-offset-4 hover:underline">
            Terms of Service
          </Link>
          .
        </P>
      </Section>
    </LegalLayout>
  );
}
