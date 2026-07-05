import { createFileRoute, Link } from '@tanstack/react-router';
import type { IconSvgElement } from '@hugeicons/react';
import {
  Target01Icon,
  CloudUploadIcon,
  Bug01Icon,
  ChartBarStackedIcon,
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
import { MockPair } from '@/components/compare/ProductMockups';
import { TestRailMock } from '@/components/compare/TestRailMock';
import { CompareTable, type CompareGroup } from '@/components/compare/CompareTable';
import { TestRailGlyph } from '@/components/compare/TestRailGlyph';
import {
  SectionHead,
  ReasonCard,
  FrameworkCard,
  PricingCard,
  FeatureLegend,
} from '@/components/compare/sections';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_marketing/compare/testrail')({
  head: () =>
    seo({
      title: 'Nijam vs TestRail',
      description:
        'Nijam vs TestRail for test reporting. TestRail is test case management for manual QA; Nijam is purpose-built for reporting automated Playwright, pytest, and Vitest runs from CI, with flakiness, retries, and traces.',
      path: '/compare/testrail',
    }),
  component: CompareTestRailPage,
});

// TestRail is a test case management tool; the honest framing is a different job,
// not a worse one. Its case authoring and planning are real strengths, called out.
const GROUPS: CompareGroup[] = [
  {
    title: 'What it is for',
    rows: [
      {
        feature: 'Primary job',
        competitor: { state: 'partial', text: 'Test case management and manual QA' },
        nijam: { state: 'yes', text: 'Automated test reporting from CI' },
      },
      {
        feature: 'Automated results',
        competitor: { state: 'partial', text: 'Pushed in via the API / integrations' },
        nijam: { state: 'yes', text: 'Read directly from your CI reports' },
      },
      {
        feature: 'Test authoring',
        competitor: { state: 'yes', text: 'Rich manual test cases and steps' },
        nijam: { state: 'no', text: 'Not a test-case manager' },
      },
      {
        feature: 'CI-native runs',
        competitor: { state: 'no', text: 'Runs are manual / organizational' },
        nijam: { state: 'yes', text: 'A run per CI execution, automatically' },
      },
    ],
  },
  {
    title: 'Frameworks',
    rows: [
      {
        feature: 'Playwright',
        competitor: { state: 'partial', text: 'Via API mapping you build' },
        nijam: { state: 'yes', text: 'First-class: attempts, shards, timeline' },
      },
      {
        feature: 'pytest',
        competitor: { state: 'partial', text: 'Via API mapping you build' },
        nijam: { state: 'yes', text: 'First-class plugin' },
      },
      {
        feature: 'Vitest',
        competitor: { state: 'partial', text: 'Via API mapping you build' },
        nijam: { state: 'yes', text: 'First-class reporter' },
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
        competitor: { state: 'no', text: 'Records a result, not flakiness' },
        nijam: { state: 'yes', text: 'Auto-detected and ranked per test' },
      },
      {
        feature: 'Retries & attempts',
        competitor: { state: 'no', text: 'A single result per test' },
        nijam: { state: 'yes', text: 'Every attempt kept' },
      },
      {
        feature: 'Traces & artifacts',
        competitor: { state: 'partial', text: 'Attach files by hand' },
        nijam: { state: 'yes', text: 'Trace, screenshots, video per attempt' },
      },
      {
        feature: 'Cross-run trends',
        competitor: { state: 'partial', text: 'Across manual test runs' },
        nijam: { state: 'yes', text: 'Across every CI run automatically' },
      },
    ],
  },
  {
    title: 'Collaboration & platform',
    rows: [
      {
        feature: 'Test planning',
        competitor: { state: 'yes', text: 'Milestones, suites, assignments' },
        nijam: { state: 'partial', text: 'Not a planning tool' },
      },
      {
        feature: 'Team management',
        competitor: { state: 'yes', text: 'Users and roles' },
        nijam: { state: 'yes', text: 'Orgs, members, and roles' },
      },
      {
        feature: 'Slack / GitHub',
        competitor: { state: 'partial', text: 'Via integrations' },
        nijam: { state: 'yes', text: 'PR checks and Slack alerts built in' },
      },
      {
        feature: 'AI / MCP access',
        competitor: { state: 'no', text: 'None' },
        nijam: { state: 'yes', text: 'MCP server for agents' },
      },
    ],
  },
  {
    title: 'Pricing',
    rows: [
      {
        feature: 'Model',
        competitor: { state: 'no', text: 'Per user, per month' },
        nijam: { state: 'yes', text: 'Per report, unlimited members' },
      },
      {
        feature: 'Free tier',
        competitor: { state: 'partial', text: 'Trial' },
        nijam: { state: 'yes', text: 'Free forever tier' },
      },
      {
        feature: 'Automated-first',
        competitor: { state: 'no', text: 'Built around manual QA' },
        nijam: { state: 'yes', text: 'Built for CI' },
      },
      {
        feature: 'Best for',
        competitor: { text: 'Teams managing manual test cases and QA plans' },
        nijam: { text: 'Teams reporting automated Playwright, pytest, and Vitest runs' },
      },
    ],
  },
];

const REASONS: { icon: IconSvgElement; tint: string; title: string; body: string }[] = [
  {
    icon: Target01Icon,
    tint: 'bg-primary/15 text-primary',
    title: 'Built for automated results',
    body: 'TestRail is a test case manager for planning and manual QA. Nijam is built for the automated results your CI already produces, with no cases to author or maintain.',
  },
  {
    icon: CloudUploadIcon,
    tint: 'bg-info/15 text-info',
    title: 'Reads your CI, no API glue',
    body: 'Getting automated results into TestRail means its API plus custom mapping you own. Nijam ingests Playwright, pytest, and Vitest reports directly, no scripting.',
  },
  {
    icon: Bug01Icon,
    tint: 'bg-warning/15 text-warning',
    title: 'Flakiness & retries, natively',
    body: 'Nijam understands attempts, retries, and flakiness as first-class ideas. TestRail records a pass or fail result, not the retry story behind it.',
  },
  {
    icon: ChartBarStackedIcon,
    tint: 'bg-info/15 text-info',
    title: 'CI-native history',
    body: 'Runs, branches, PRs, shards, and traces, tracked automatically. TestRail organizes cases and manual runs, not CI executions.',
  },
  {
    icon: Coins01Icon,
    tint: 'bg-success/15 text-success',
    title: 'No per-user licensing',
    body: 'TestRail is priced per user. Nijam has unlimited members on Pro and charges per report, so the whole team can see results without buying more seats.',
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
    body: 'A first-class Vitest reporter turns unit and component runs into the same hosted history, flakiness scoring, and failure views as the rest.',
  },
];

const TR_PRICE = [
  'Priced per user, per month',
  'Automated results arrive via API integration',
  'Built around manual test management',
  'Great for QA planning, not CI reporting',
];
const NIJAM_PRICE = [
  'Reads your CI reports directly, no mapping',
  '1 credit = one Playwright report',
  'Unlimited members, no per-seat pricing',
  'Flakiness, retries, and traces built in',
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is Nijam a TestRail replacement?',
    a: 'Not for manual test case management, that is TestRail’s strength. For reporting automated Playwright, pytest, and Vitest runs from CI, Nijam is purpose-built and needs no API glue. Many teams use TestRail for planning and Nijam for automated results.',
  },
  {
    q: 'Can TestRail show my automated results?',
    a: 'Yes, through its API and a custom mapping, but you build and maintain that integration. Nijam reads the reports your CI already produces, with nothing to script.',
  },
  {
    q: 'Does TestRail track flakiness?',
    a: 'It records a pass or fail result per test; it is not designed to detect or rank flaky tests or keep every retry. Nijam does both natively.',
  },
  {
    q: 'How is pricing different?',
    a: 'TestRail is priced per user. Nijam charges per report with unlimited members on Pro, so viewing results never costs another seat.',
  },
  {
    q: 'Which frameworks are supported?',
    a: 'Playwright, pytest, and Vitest are first-class in Nijam, each with a real reporter or plugin rather than a hand-built API mapping.',
  },
  {
    q: 'Can I use both?',
    a: 'Yes. Keep TestRail for test planning and manual QA, and send your automated CI results to Nijam for flakiness, retries, traces, and history.',
  },
];

function CompareTestRailPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
            Comparison
          </Text>
          <Text as="h1" className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Nijam vs TestRail
          </Text>
          <Text className="mx-auto mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
            TestRail is a test case management tool for planning and manual QA. Nijam is purpose-built
            for reporting automated Playwright, pytest, and Vitest runs straight from CI, with the
            flakiness, retries, and traces TestRail was never meant to track.
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
          <SectionHead
            eyebrow="Different jobs"
            title="Test case management vs automated reporting"
          >
            TestRail organizes what to test and records manual results. Nijam reads what your CI
            actually ran and makes the automated results obvious.
          </SectionHead>
          <Reveal>
            <MockPair
              competitor={<TestRailMock />}
              competitorCaption="TestRail: test cases, suites, and milestones for planning and manual QA, with automated results added by hand or via its API."
            />
          </Reveal>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHead eyebrow="Why Nijam" title="Why teams pick Nijam for automated results">
            Everything about reporting an automated run, flakiness, retries, and traces, without
            authoring cases or maintaining an integration.
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
          <SectionHead eyebrow="Feature by feature" title="How they compare for test reporting">
            TestRail is genuinely good at case authoring and planning, which is why those rows go its
            way. For reporting automated runs, the story flips.
          </SectionHead>
          <Reveal>
            <CompareTable
              competitorName="TestRail"
              competitorGlyph={<TestRailGlyph className="size-5 shrink-0 text-testrail" />}
              groups={GROUPS}
            />
          </Reveal>
          <FeatureLegend />
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
          <SectionHead eyebrow="Pricing" title="Per user, or per report">
            TestRail charges for every seat that needs access. Nijam charges for the reports you send
            and lets the whole team watch.
          </SectionHead>
          <Reveal>
            <Grid cols={[1, 2]} gap={5} className="mx-auto max-w-4xl items-start">
              <PricingCard
                header={
                  <>
                    <TestRailGlyph className="size-6 shrink-0 text-testrail" />
                    <Text as="span" className="text-base font-semibold tracking-tight">
                      TestRail
                    </Text>
                  </>
                }
                kicker="Per-user licensing"
                rows={TR_PRICE}
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
                kicker="Per report, unlimited seats"
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
        title="Report your automated runs the right way"
        description="Keep TestRail for planning if you like it, and let Nijam handle automated Playwright, pytest, and Vitest results, with flakiness, retries, and traces, from your CI."
      />
    </>
  );
}
