import { createFileRoute, Link } from '@tanstack/react-router';
import type { IconSvgElement } from '@hugeicons/react';
import {
  Target01Icon,
  RocketIcon,
  ChartBarStackedIcon,
  Bug01Icon,
  Coins01Icon,
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
import { MockPair, DatadogMock } from '@/components/compare/ProductMockups';
import { CompareTable, type CompareGroup } from '@/components/compare/CompareTable';
import { DatadogGlyph } from '@/components/compare/DatadogGlyph';
import {
  SectionHead,
  ReasonCard,
  FrameworkCard,
  PricingCard,
  FeatureLegend,
} from '@/components/compare/sections';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_marketing/compare/datadog')({
  head: () =>
    seo({
      title: 'Nijam vs Datadog',
      description:
        'Nijam vs Datadog for test reporting. See why teams pick Nijam to turn Playwright, pytest, and Vitest reports into flakiness, history, and root cause, without the observability-platform setup, span metering, or enterprise pricing.',
      path: '/compare/datadog',
    }),
  component: CompareDatadogPage,
});

// Scoped to test reporting specifically, not Datadog as a whole platform. Claims
// are deliberately defensible and non-absolute.
const GROUPS: CompareGroup[] = [
  {
    title: 'Setup & scope',
    rows: [
      {
        feature: 'What it is',
        competitor: { state: 'partial', text: 'A test module inside a full observability suite' },
        nijam: { state: 'yes', text: 'A dashboard built only for test reporting' },
      },
      {
        feature: 'Onboarding',
        competitor: { state: 'partial', text: 'Instrument dd-trace per framework, configure the agent/CI' },
        nijam: { state: 'yes', text: 'Drop-in reporter reads the results your CI already produces' },
      },
      {
        feature: 'Runs your tests?',
        competitor: { state: 'no', text: 'Instruments and traces the test run' },
        nijam: { state: 'yes', text: 'Never runs your tests, read-only on the reports' },
      },
      {
        feature: 'Time to first dashboard',
        competitor: { state: 'partial', text: 'Hours to days' },
        nijam: { state: 'yes', text: 'Minutes' },
      },
    ],
  },
  {
    title: 'Frameworks',
    rows: [
      {
        feature: 'Playwright',
        competitor: { state: 'partial', text: 'Via dd-trace instrumentation' },
        nijam: { state: 'yes', text: 'First-class: attempts, shards, timeline' },
      },
      {
        feature: 'pytest',
        competitor: { state: 'partial', text: 'Via ddtrace' },
        nijam: { state: 'yes', text: 'First-class pytest plugin' },
      },
      {
        feature: 'Vitest',
        competitor: { state: 'no', text: 'Not a first-class integration' },
        nijam: { state: 'yes', text: 'First-class Vitest reporter' },
      },
      {
        feature: 'Playwright trace viewer',
        competitor: { state: 'no', text: 'Not integrated' },
        nijam: { state: 'yes', text: 'Opens the native Playwright trace' },
      },
    ],
  },
  {
    title: 'Insight',
    rows: [
      {
        feature: 'Flaky detection',
        competitor: { state: 'partial', text: 'Available on higher tiers' },
        nijam: { state: 'yes', text: 'Ranked and tracked per test, on every plan' },
      },
      {
        feature: 'Full run history',
        competitor: { state: 'partial', text: 'Retention tiers, sampling' },
        nijam: { state: 'yes', text: 'Every run and every attempt kept' },
      },
      {
        feature: 'Root cause in one place',
        competitor: { state: 'partial', text: 'Spread across separate views' },
        nijam: { state: 'yes', text: 'Error, trace, and artifacts on one page' },
      },
      {
        feature: 'Per-test trends',
        competitor: { state: 'yes', text: 'Yes' },
        nijam: { state: 'yes', text: 'Yes, across every run' },
      },
    ],
  },
  {
    title: 'Pricing',
    rows: [
      {
        feature: 'Model',
        competitor: { state: 'no', text: 'Usage-based across hosts, committers, and spans' },
        nijam: { state: 'yes', text: 'Simple credits, priced per test report' },
      },
      {
        feature: 'Free tier',
        competitor: { state: 'partial', text: 'Trial' },
        nijam: { state: 'yes', text: 'Free forever tier' },
      },
      {
        feature: 'Predictability',
        competitor: { state: 'no', text: 'Complex, easy to overspend' },
        nijam: { state: 'yes', text: 'Transparent, pay for what you report' },
      },
      {
        feature: 'Team members',
        competitor: { state: 'partial', text: 'Effectively per committer / host' },
        nijam: { state: 'yes', text: 'Unlimited members on Pro' },
      },
    ],
  },
  {
    title: 'Platform',
    rows: [
      {
        feature: 'AI / MCP access',
        competitor: { state: 'no', text: 'No MCP server for test data' },
        nijam: { state: 'yes', text: 'MCP server: let agents query your tests' },
      },
      {
        feature: 'Data footprint',
        competitor: { state: 'partial', text: 'Ingests traces and spans' },
        nijam: { state: 'yes', text: 'Test results only, minimal data' },
      },
      {
        feature: 'Focus',
        competitor: { text: 'Logs, APM, RUM, infra, and tests' },
        nijam: { text: 'Test reporting, nothing else' },
      },
      {
        feature: 'Best for',
        competitor: { text: 'Teams already all-in on Datadog observability' },
        nijam: { text: 'Teams that want great test reporting without the platform tax' },
      },
    ],
  },
];

// ---- page content (cards come from the shared compare/sections helpers) ----

const REASONS: { icon: IconSvgElement; tint: string; title: string; body: string }[] = [
  {
    icon: Target01Icon,
    tint: 'bg-primary/15 text-primary',
    title: 'Purpose-built for tests',
    body: 'Nijam does one job: turn your test reports into a dashboard you actually read. No suite to configure, no modules to buy, no observability platform to adopt.',
  },
  {
    icon: RocketIcon,
    tint: 'bg-info/15 text-info',
    title: 'Live in minutes',
    body: 'Add the reporter and push a run. It reads the output your CI already produces. No dd-trace, no agent, no instrumentation, and it never touches your test code.',
  },
  {
    icon: ChartBarStackedIcon,
    tint: 'bg-warning/15 text-warning',
    title: 'Flakiness, ranked',
    body: 'Every flaky test is scored and tracked across runs, on every plan, not gated behind an enterprise tier or a separate product SKU.',
  },
  {
    icon: Bug01Icon,
    tint: 'bg-destructive/15 text-destructive',
    title: 'Root cause on one page',
    body: 'Error message, Playwright trace, screenshots, video, and per-attempt timing sit together, so triage is one screen instead of a hunt across dashboards.',
  },
  {
    icon: Coins01Icon,
    tint: 'bg-success/15 text-success',
    title: 'Pricing you can predict',
    body: 'Simple credits: one Playwright report, or a hundred pytest / Vitest reports. Free tier, $20/mo Pro, no per-seat pricing and no span metering.',
  },
  {
    icon: AiChat02Icon,
    tint: 'bg-primary/15 text-primary',
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
    body: 'A first-class Vitest reporter turns unit and component runs into the same history, flakiness scoring, and failure views as the rest.',
  },
];

const DD_PRICE = [
  'Metered across hosts, committers, and spans',
  'Annual contracts and sales calls',
  'Retention tiers and sampling',
  'Easy to overspend as your suite grows',
];
const NJ_PRICE = [
  '1 credit = one Playwright report',
  '1 credit = 100 pytest / Vitest reports',
  'Free forever tier, then $20/mo Pro',
  'Unlimited members, no per-seat pricing',
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Does Nijam replace Datadog?',
    a: 'For test reporting, it is a focused alternative that most teams find faster to live in. If you also use Datadog for APM, logs, or RUM, keep it, Nijam just owns the test-reporting job and does it well. Plenty of teams run both.',
  },
  {
    q: 'Do I need to instrument my tests?',
    a: 'No. Nijam reads the reports Playwright, pytest, and Vitest already emit in CI. There is no dd-trace, no agent, and no changes to your test code, so you cannot accidentally slow down or alter a run.',
  },
  {
    q: 'How is the pricing different?',
    a: 'Datadog meters usage across hosts, committers, and spans, usually on an annual contract. Nijam is simple credits: one credit is one Playwright report or a hundred pytest / Vitest reports, with a free forever tier, $20/mo Pro, and unlimited members.',
  },
  {
    q: 'Is my data safe?',
    a: 'Nijam is read-only and stores only your test results and their artifacts (traces, screenshots, video), never application spans or production traffic. It never runs your tests.',
  },
  {
    q: 'Can I use Nijam and Datadog together?',
    a: 'Yes. Send your CI test reports to Nijam for triage and history, and keep Datadog for the rest of your observability. They do not conflict.',
  },
  {
    q: 'Which frameworks are supported?',
    a: 'Playwright, pytest, and Vitest today, each with a first-class reporter or plugin rather than a generic integration.',
  },
];

// ---- page ----

function CompareDatadogPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        {/* hero */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
            Comparison
          </Text>
          <Text
            as="h1"
            className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl"
          >
            Nijam vs Datadog
          </Text>
          <Text className="mx-auto mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
            Datadog is a whole observability platform with test reporting bolted on. Nijam is built
            for one job: turning your Playwright, pytest, and Vitest reports into flakiness, history,
            and root cause you can actually act on.
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

        {/* product side-by-side */}
        <section className="mt-16 md:mt-24">
          <SectionHead eyebrow="Same runs, different screen" title="One focused view, not a whole platform">
            The exact same test runs, read from the reports your pipeline already produces. One reads
            like an observability console; the other reads like a test report.
          </SectionHead>
          <Reveal>
            <MockPair
              competitor={<DatadogMock />}
              competitorCaption="Datadog: test runs are one screen inside a sprawling observability suite, dense with services, spans, and filters to wade through."
            />
          </Reveal>
        </section>

        {/* why Nijam */}
        <section className="mt-20 md:mt-28">
          <SectionHead eyebrow="Why Nijam" title="Why teams choose Nijam for test reporting">
            Everything below ships on the reports you already generate, with none of the setup or
            spend of a full observability suite.
          </SectionHead>
          <Reveal>
            <Grid cols={[1, 2, 3]} gap={5}>
              {REASONS.map((r) => (
                <ReasonCard key={r.title} {...r} />
              ))}
            </Grid>
          </Reveal>
        </section>

        {/* feature matrix */}
        <section className="mt-20 md:mt-28">
          <SectionHead eyebrow="Feature by feature" title="How they compare for test reporting">
            Scoped to reporting on your test runs, not Datadog as an entire observability platform.
          </SectionHead>
          <Reveal>
            <CompareTable
              competitorName="Datadog"
              competitorGlyph={<DatadogGlyph className="size-5 shrink-0 text-datadog" />}
              groups={GROUPS}
            />
          </Reveal>
          <FeatureLegend />
        </section>

        {/* frameworks */}
        <section className="mt-20 md:mt-28">
          <SectionHead
            eyebrow="Playwright · pytest · Vitest"
            title="First-class for every framework you report"
          >
            Not a generic tracer bolted onto three languages, a purpose-built reporter or plugin for
            each, with the depth that comes from focusing on tests.
          </SectionHead>
          <Reveal>
            <Grid cols={[1, 1, 3]} gap={5}>
              {FRAMEWORKS.map((f) => (
                <FrameworkCard key={f.name} {...f} />
              ))}
            </Grid>
          </Reveal>
        </section>

        {/* pricing contrast */}
        <section className="mt-20 md:mt-28">
          <SectionHead eyebrow="Pricing" title="Pay for reports, not for a platform">
            Datadog meters your whole footprint. Nijam charges for the test reports you send, and
            nothing else.
          </SectionHead>
          <Reveal>
            <Grid cols={[1, 2]} gap={5} className="mx-auto max-w-4xl items-start">
              <PricingCard
                header={
                  <>
                    <DatadogGlyph className="size-6 shrink-0 text-datadog" />
                    <Text as="span" className="text-base font-semibold tracking-tight">
                      Datadog
                    </Text>
                  </>
                }
                kicker="Usage-based, enterprise"
                rows={DD_PRICE}
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
                kicker="Simple credits"
                rows={NJ_PRICE}
                footer={
                  <Button asChild variant="outline" className="w-full">
                    <Link to={PRICING_ROUTE}>See full pricing</Link>
                  </Button>
                }
              />
            </Grid>
          </Reveal>
        </section>

        {/* FAQ */}
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
        title="Give your tests a home of their own"
        description="Point your CI at Nijam and get flakiness, history, and root cause for Playwright, pytest, and Vitest, without the observability-platform setup or the enterprise bill."
      />
    </>
  );
}
