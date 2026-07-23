import { createFileRoute, Link } from '@tanstack/react-router';
import type { IconSvgElement } from '@hugeicons/react';
import {
  DatabaseIcon,
  CloudServerIcon,
  Coins01Icon,
  ShieldKeyIcon,
  Target01Icon,
  AiChat02Icon,
} from '@hugeicons/core-free-icons';
import { PRICING_ROUTE, SIGNUP_ROUTE } from '@/lib/routes';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { CTA } from '@/components/home/components/CTA';
import { Reveal } from '@/components/home/Reveal';
import { LogoMark } from '@/components/auth/Logo';
import { MockPair } from '@/components/compare/ProductMockups';
import { CurrentsMock } from '@/components/compare/CurrentsMock';
import { CompareTable, type CompareGroup } from '@/components/compare/CompareTable';
import { CurrentsGlyph } from '@/components/compare/CurrentsGlyph';
import {
  SectionHead,
  ReasonCard,
  FrameworkCard,
  PricingCard,
  FeatureLegend,
} from '@/components/compare/sections';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_marketing/compare/currents')({
  head: () =>
    seo({
      title: 'Nijam vs Currents',
      description:
        'Nijam vs Currents for test reporting. Currents is a hosted dashboard for Playwright and Cypress results and orchestration. Nijam reports Playwright, pytest, and Vitest runs and lets you keep every run and artifact in your own cloud on flat, predictable pricing.',
      path: '/compare/currents',
    }),
  component: CompareCurrentsPage,
});

// Currents is the closest real peer: a strong hosted results + orchestration cloud for
// Playwright and Cypress. The honest framing leads with the two places Nijam is genuinely
// different, data ownership (BYOC) and predictable pricing, and credits Currents where it
// wins (Cypress, orchestration).
const GROUPS: CompareGroup[] = [
  {
    title: 'Data ownership (bring your own cloud)',
    rows: [
      {
        feature: 'Your own database',
        competitor: { state: 'no', text: 'Results stored on Currents' },
        nijam: { state: 'yes', text: 'Runs live in your own Postgres' },
      },
      {
        feature: 'Your own storage',
        competitor: { state: 'no', text: 'Artifacts stored on Currents' },
        nijam: { state: 'yes', text: 'Traces & video in your S3/GCS/Azure' },
      },
      {
        feature: 'Data residency & compliance',
        competitor: { state: 'partial', text: 'Their infrastructure and regions' },
        nijam: { state: 'yes', text: 'Data never leaves your cloud' },
      },
      {
        feature: 'No lock-in',
        competitor: { state: 'partial', text: 'Export via their API' },
        nijam: { state: 'yes', text: 'It is already your database' },
      },
    ],
  },
  {
    title: 'Pricing',
    rows: [
      {
        feature: 'Model',
        competitor: { state: 'partial', text: 'Usage-based on test results' },
        nijam: { state: 'yes', text: 'Per report, with a flat BYOC option' },
      },
      {
        feature: 'Predictable cost',
        competitor: { state: 'no', text: 'Scales with every result recorded' },
        nijam: { state: 'yes', text: 'Flat $20/mo with BYOC (unmetered)' },
      },
      {
        feature: 'Included volume',
        competitor: { state: 'partial', text: 'Counts every test result' },
        nijam: { state: 'yes', text: '1 credit = 1 Playwright test (100 pytest/Vitest)' },
      },
      {
        feature: 'Free tier',
        competitor: { state: 'yes', text: 'Free tier with limits' },
        nijam: { state: 'yes', text: 'Free forever tier' },
      },
    ],
  },
  {
    title: 'Frameworks',
    rows: [
      {
        feature: 'Playwright',
        competitor: { state: 'yes', text: 'First-class' },
        nijam: { state: 'yes', text: 'First-class: attempts, shards, timeline' },
      },
      {
        feature: 'Cypress',
        competitor: { state: 'yes', text: 'First-class (Cypress heritage)' },
        nijam: { state: 'no', text: 'Not supported' },
      },
      {
        feature: 'pytest',
        competitor: { state: 'no', text: 'Not a focus' },
        nijam: { state: 'yes', text: 'First-class plugin' },
      },
      {
        feature: 'Vitest',
        competitor: { state: 'partial', text: 'Via a generic reporter' },
        nijam: { state: 'yes', text: 'First-class reporter' },
      },
    ],
  },
  {
    title: 'Insight & platform',
    rows: [
      {
        feature: 'Flaky detection',
        competitor: { state: 'yes', text: 'Yes' },
        nijam: { state: 'yes', text: 'Auto-detected and ranked per test' },
      },
      {
        feature: 'Orchestration',
        competitor: { state: 'yes', text: 'Parallelizes across machines' },
        nijam: { state: 'no', text: 'Reporting only, not a runner' },
      },
      {
        feature: 'Playwright trace viewer',
        competitor: { state: 'partial', text: 'Links artifacts' },
        nijam: { state: 'yes', text: 'Opens the native Playwright trace' },
      },
      {
        feature: 'AI / MCP access',
        competitor: { state: 'no', text: 'None' },
        nijam: { state: 'yes', text: 'MCP server for agents' },
      },
    ],
  },
];

// Weighted to the two things this comparison is about: owning your data and predictable cost.
const REASONS: { icon: IconSvgElement; tint: string; title: string; body: string }[] = [
  {
    icon: DatabaseIcon,
    tint: 'bg-primary/15 text-primary',
    title: 'Your runs, your database',
    body: 'Point Nijam at your own Postgres and every run and project lives there. With Currents, results sit on their cloud; with Nijam, the data is already yours.',
  },
  {
    icon: CloudServerIcon,
    tint: 'bg-info/15 text-info',
    title: 'Your artifacts, your bucket',
    body: 'Traces, screenshots, and video stream straight to your own S3, Google Cloud Storage, or Azure bucket, so heavy artifacts never leave your infrastructure.',
  },
  {
    icon: Coins01Icon,
    tint: 'bg-success/15 text-success',
    title: 'Flat, predictable pricing',
    body: 'Currents meters the number of test results you record. Turn on bring your own cloud and Nijam waives metering entirely, you pay a flat $20/month, whatever the volume.',
  },
  {
    icon: ShieldKeyIcon,
    tint: 'bg-primary/15 text-primary',
    title: 'Data residency, handled',
    body: 'Because your test data stays in infrastructure you control, residency and compliance stop being a vendor question and become a setting you own.',
  },
  {
    icon: Target01Icon,
    tint: 'bg-warning/15 text-warning',
    title: 'Beyond Playwright',
    body: 'First-class pytest and Vitest support, not just Playwright, so unit, component, and Python suites land in the same hosted history, flakiness, and failure views.',
  },
  {
    icon: AiChat02Icon,
    tint: 'bg-info/15 text-info',
    title: 'AI-ready via MCP',
    body: 'Point your agents at Nijam’s MCP server to ask about failures, flakiness, and history in plain language, right from your editor or CI.',
  },
];

const FRAMEWORKS: { name: string; body: string }[] = [
  {
    name: 'Playwright',
    body: 'Attempts, shards, and a run timeline, plus one click into the native Playwright trace viewer with screenshots and video attached.',
  },
  {
    name: 'pytest',
    body: 'A lightweight pytest plugin streams results from every CI job. No traces required, and flaky tracking is included from the first run.',
  },
  {
    name: 'Vitest',
    body: 'A first-class Vitest reporter turns unit and component runs into the same hosted history, flakiness scoring, and failure views as the rest.',
  },
];

const CU_PRICE = [
  'Usage-based: billed on test results per month',
  'Fully hosted, your data lives on Currents',
  'Strong for Cypress and Playwright orchestration',
  'No bring-your-own-cloud option',
];
const NIJAM_PRICE = [
  'Bring your own cloud: flat $20/mo, unmetered',
  'Or per report: 1 credit = 1 Playwright test (100 pytest/Vitest)',
  'Your runs and artifacts in your own Postgres + storage',
  'Unlimited members, free forever tier',
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is the biggest difference between Nijam and Currents?',
    a: 'Where your data lives and how you pay for it. Currents is fully hosted and meters the number of test results you record. Nijam lets you keep every run and artifact in your own Postgres and storage (bring your own cloud), and enabling that waives metering for a flat monthly price.',
  },
  {
    q: 'Can I keep my test data in my own cloud?',
    a: 'Yes. With Nijam’s bring your own cloud, runs and projects live in your own Postgres and artifacts go to your own S3, Google Cloud Storage, or Azure bucket. We keep only your account, organization, and billing. Currents is a hosted service, so your data stays on their infrastructure.',
  },
  {
    q: 'How does pricing compare?',
    a: 'Currents is usage-based on test results, so cost scales with volume. Nijam charges per report (1 credit = one Playwright test, or 100 pytest/Vitest tests) with unlimited members, and bring your own cloud replaces metering with a flat $20/month base since your data lives in your own cloud.',
  },
  {
    q: 'Does Nijam support Cypress?',
    a: 'No. Nijam is first-class for Playwright, pytest, and Vitest. Currents has deep Cypress support and Playwright orchestration, so if Cypress is central to your suite, Currents is a strong fit there.',
  },
  {
    q: 'Does Nijam run or parallelize my tests?',
    a: 'No. Nijam is a reporting and analytics layer, it reads the results your CI already produces and never executes or orchestrates your tests. Currents also does orchestration (parallelization across machines). You can run Nijam alongside any runner or CI setup.',
  },
  {
    q: 'Is there a free tier?',
    a: 'Yes, Nijam has a free forever tier so you can connect a project and see it working before upgrading.',
  },
];

function CompareCurrentsPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
            Comparison
          </Text>
          <Text as="h1" className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Nijam vs Currents
          </Text>
          <Text className="mx-auto mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
            Currents is a hosted dashboard for Playwright and Cypress test results and
            orchestration. Nijam reports your Playwright, pytest, and Vitest runs with the same
            clarity, and lets you keep every run and artifact in your own cloud on flat, predictable
            pricing.
          </Text>
          <Flex justify="center" gap={3} wrap className="mt-7">
            <Button asChild size="lg">
              <Link to={SIGNUP_ROUTE}>Start free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={PRICING_ROUTE}>See pricing</Link>
            </Button>
          </Flex>
        </Reveal>

        <section className="mt-16 md:mt-24">
          <SectionHead eyebrow="Hosted vs your cloud" title="Two ways to hold your test data">
            Currents keeps your results and artifacts on its cloud and meters usage. Nijam can keep
            the very same data in your own Postgres and storage bucket.
          </SectionHead>
          <Reveal>
            <MockPair
              competitor={<CurrentsMock />}
              competitorCaption="Currents: a hosted results + orchestration dashboard for Playwright and Cypress, with usage metered on the number of test results you record."
            />
          </Reveal>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHead eyebrow="Why Nijam" title="Own your data, and your bill">
            The two reasons teams move from a hosted dashboard to Nijam: keeping test data in their
            own cloud, and swapping metered usage for a flat, predictable price.
          </SectionHead>
          <Reveal>
            <Grid cols={[1, 2, 3]} gap={5}>
              {REASONS.map((r) => (
                <ReasonCard key={r.title} {...r} />
              ))}
            </Grid>
          </Reveal>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHead eyebrow="Feature by feature" title="How they compare">
            Currents is genuinely strong at Cypress and orchestration, which is why those rows go
            its way. On data ownership and pricing, the story flips.
          </SectionHead>
          <Reveal>
            <CompareTable
              competitorName="Currents"
              competitorGlyph={<CurrentsGlyph className="size-5 shrink-0 text-currents" />}
              groups={GROUPS}
            />
          </Reveal>
          <FeatureLegend />
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHead eyebrow="Pricing" title="Metered usage, or flat and yours">
            Currents bills on the test results you record. Nijam charges per report, and bring your
            own cloud replaces metering with a flat monthly base.
          </SectionHead>
          <Reveal>
            <Grid cols={[1, 2]} gap={5} className="mx-auto max-w-4xl items-start">
              <PricingCard
                header={
                  <>
                    <CurrentsGlyph className="size-6 shrink-0 text-currents" />
                    <Text as="span" className="text-base font-semibold tracking-tight">
                      Currents
                    </Text>
                  </>
                }
                kicker="Usage-based, fully hosted"
                rows={CU_PRICE}
              />
              <PricingCard
                highlight
                header={
                  <>
                    <LogoMark className="size-6" />
                    <Text as="span" className="text-base font-semibold tracking-tight">
                      Nijam
                    </Text>
                  </>
                }
                kicker="Per report, or flat with your own cloud"
                rows={NIJAM_PRICE}
                footer={
                  <Button asChild variant="outline" className="w-full">
                    <Link to={PRICING_ROUTE}>See full pricing</Link>
                  </Button>
                }
              />
            </Grid>
          </Reveal>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHead
            eyebrow="Playwright · pytest · Vitest"
            title="First-class for the frameworks you automate"
          >
            Real reporters and plugins for the three we focus on, so results flow in without an API
            mapping to build.
          </SectionHead>
          <Reveal>
            <Grid cols={[1, 1, 3]} gap={5}>
              {FRAMEWORKS.map((f) => (
                <FrameworkCard key={f.name} {...f} />
              ))}
            </Grid>
          </Reveal>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHead eyebrow="FAQ" title="Questions teams ask us" />
          <Reveal className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible>
              {FAQS.map((f, i) => (
                <AccordionItem key={f.q} value={`q${i}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-pretty text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </section>
      </main>

      <CTA
        title="Keep your test data in your own cloud"
        description="Report your Playwright, pytest, and Vitest runs with flakiness, retries, and traces, and store every run and artifact in your own Postgres and bucket on flat, predictable pricing."
      />
    </>
  );
}
