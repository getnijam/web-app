import { createFileRoute, Link } from '@tanstack/react-router';
import { LegalLayout, Section, P, Bullets } from '@/components/legal/LegalLayout';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/terms')({
  head: () =>
    seo({
      title: 'Terms of Service',
      description: 'The terms governing your use of Nijam, the Nijam API, and @nijam/pw-reporter.',
      path: '/terms',
    }),
  component: TermsPage,
});

const CONTACT = 'support@nijam.dev';

function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="June 4, 2026"
      intro={
        <>
          These Terms of Service (“Terms”) govern your access to and use of Nijam — the
          test-analytics dashboard at nijam.dev, the Nijam API, and the{' '}
          <code className="font-mono">@nijam/pw-reporter</code> package (together, the “Service”).
          By creating an account or using the Service, you agree to these Terms. If you’re using
          Nijam on behalf of an organization, you’re agreeing on its behalf.
        </>
      }
      ctaTitle="Ready to put your test results to work?"
      ctaDescription="Point your CI at Nijam and turn the results you already produce into flakiness detection and failure analytics — no agents, no re-runs."
    >
      <Section title="1. The Service">
        <P>
          Nijam is a read-only reporting layer for Playwright. It ingests the test results your CI
          already produces — runs, test outcomes, timings, and optional artifacts — and turns them
          into history, flakiness detection, and failure analytics. Nijam never executes or re-runs
          your tests.
        </P>
      </Section>

      <Section title="2. Eligibility & accounts">
        <Bullets
          items={[
            'You must be at least 16 years old and able to form a binding contract to use the Service.',
            'You’re responsible for the information you provide, for keeping your credentials secure, and for all activity under your account and your ingest (secret) keys.',
            'Notify us promptly at the contact below if you suspect unauthorized use of your account or keys.',
          ]}
        />
      </Section>

      <Section title="3. Organizations & members">
        <P>
          Projects, runs, and data belong to an organization. Every member of an organization can
          access and act on that organization’s data — there are no per-member roles. The person who
          creates an organization is responsible for who they invite. To limit abuse, an account may
          create a limited number of organizations.
        </P>
      </Section>

      <Section title="4. Acceptable use">
        <P>You agree not to:</P>
        <Bullets
          items={[
            'use the Service for anything unlawful, or upload data you don’t have the right to share;',
            'upload content (including test source files) that infringes others’ rights or contains others’ personal data without a lawful basis;',
            'attempt to breach, probe, or disrupt the Service, circumvent usage limits or authentication, or access data that isn’t yours;',
            'resell, sublicense, or provide the Service to third parties except as permitted, or scrape it in bulk;',
            'send malware or use the Service to store or transmit unlawful or harmful material.',
          ]}
        />
      </Section>

      <Section title="5. Your content & data">
        <P>
          You retain all rights to the data you send to Nijam — test results, run metadata, and,
          unless you disable source uploads, your test source files and the Playwright artifacts
          your configuration produces (traces, screenshots, and videos). You grant Nijam a limited
          license to host, process, and display that data solely to operate and provide the Service
          to you.
        </P>
        <P>
          The reporter, <code className="font-mono">@nijam/pw-reporter</code>, is open source under
          the MIT license; your use of it is governed by that license.
        </P>
      </Section>

      <Section title="6. Plans, billing & payments">
        <Bullets
          items={[
            'Free includes up to 1,000 test results per month, 2 members, and 7-day history retention.',
            'Pro is $20/month and includes 10,000 test results per month and unlimited members, with 90-day retention. Usage beyond the included amount is billed at $0.001 per additional test result (an early-bird rate, half the standard $0.002), calculated and invoiced in arrears at the end of each billing period.',
            'Payments are processed by Polar, our Merchant of Record. Polar handles checkout, billing, applicable taxes, and invoices; your card details are handled by Polar, not stored by Nijam.',
            'Paid subscriptions renew automatically each period until cancelled. You can cancel anytime from the billing portal; cancellation takes effect at the end of the current period and your plan reverts to Free.',
            'Except where required by law or stated otherwise, payments are non-refundable. We may change prices or plan limits with reasonable notice; changes apply to the following billing period.',
          ]}
        />
      </Section>

      <Section title="7. Usage limits & fair use">
        <P>
          We may enforce plan limits (test volume, members, and organizations per account) and apply
          reasonable rate limits to keep the Service stable. On the Free plan, ingestion pauses once
          a monthly limit is reached; reporting resumes when the period resets or you upgrade.
          Hitting a limit never fails your CI — the reporter logs a warning and continues.
        </P>
      </Section>

      <Section title="8. Data retention">
        <P>
          Run history and artifacts are retained for the window included in your plan (7 days on
          Free, 90 days on Pro) and are then deleted automatically. See our{' '}
          <Link to="/privacy" className="text-primary underline-offset-4 hover:underline">
            Privacy Policy
          </Link>{' '}
          for how we handle your data.
        </P>
      </Section>

      <Section title="9. Availability & changes">
        <P>
          We work to keep the Service available but don’t guarantee uninterrupted or error-free
          operation. We may add, change, or remove features, and we may suspend the Service for
          maintenance. We’ll aim to give notice of material changes where practical.
        </P>
      </Section>

      <Section title="10. Intellectual property">
        <P>
          The Service, including its software, design, and trademarks (other than the MIT-licensed
          reporter and your own data), is owned by Nijam and its licensors. These Terms don’t grant
          you any rights in our intellectual property except the limited right to use the Service.
        </P>
      </Section>

      <Section title="11. Termination">
        <P>
          You may stop using the Service and delete your account at any time. We may suspend or
          terminate your access if you breach these Terms or use the Service in a way that risks
          harm to others or to the Service. On termination, your right to use the Service ends and
          your data may be deleted in accordance with our retention practices.
        </P>
      </Section>

      <Section title="12. Disclaimers">
        <P>
          The Service is provided “as is” and “as available”, without warranties of any kind,
          whether express or implied, including fitness for a particular purpose and
          non-infringement. Nijam is an analytics aid; you’re responsible for decisions you make
          based on it.
        </P>
      </Section>

      <Section title="13. Limitation of liability">
        <P>
          To the maximum extent permitted by law, Nijam and its suppliers will not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or for lost profits or
          data. Our total liability arising out of or relating to the Service is limited to the
          amount you paid us in the 12 months before the event giving rise to the claim.
        </P>
      </Section>

      <Section title="14. Indemnification">
        <P>
          You agree to indemnify and hold Nijam harmless from claims and expenses arising out of
          your data, your use of the Service, or your breach of these Terms.
        </P>
      </Section>

      <Section title="15. Governing law">
        <P>
          These Terms are governed by the laws of the jurisdiction in which Nijam is established,
          without regard to its conflict-of-law rules, and you agree to the exclusive jurisdiction
          of its courts for any dispute not subject to arbitration or a small-claims forum.
        </P>
      </Section>

      <Section title="16. Changes to these Terms">
        <P>
          We may update these Terms from time to time. When we do, we’ll revise the “Last updated”
          date above and, for material changes, take reasonable steps to notify you. Continuing to
          use the Service after changes take effect means you accept the updated Terms.
        </P>
      </Section>

      <Section title="17. Contact">
        <P>
          Questions about these Terms? Email us at{' '}
          <a href={`mailto:${CONTACT}`} className="text-primary underline-offset-4 hover:underline">
            {CONTACT}
          </a>
          .
        </P>
      </Section>
    </LegalLayout>
  );
}
