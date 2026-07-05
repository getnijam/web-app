import { createFileRoute, Link } from '@tanstack/react-router';
import type { IconSvgElement } from '@hugeicons/react';
import {
  CloudUploadIcon,
  RocketIcon,
  Bug01Icon,
  Target01Icon,
  AiChat02Icon,
  Wrench01Icon,
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
import { ReportPortalMock } from '@/components/compare/ReportPortalMock';
import { CompareTable, type CompareGroup } from '@/components/compare/CompareTable';
import { ReportPortalWordmark } from '@/components/compare/ReportPortalWordmark';
import {
  SectionHead,
  ReasonCard,
  FrameworkCard,
  PricingCard,
  FeatureLegend,
} from '@/components/compare/sections';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_marketing/compare/reportportal')({
  head: () =>
    seo({
      title: 'Nijam vs ReportPortal',
      description:
        'Nijam vs ReportPortal for test reporting. See why teams pick Nijam as a hosted, zero-ops dashboard for Playwright, pytest, and Vitest, instead of standing up and operating a self-hosted ReportPortal analytics platform.',
      path: '/compare/reportportal',
    }),
  component: CompareReportPortalPage,
});

// Baseline is ReportPortal the open-source, typically self-hosted platform; claims
// are kept fair (ReportPortal's ML auto-analysis and breadth are real strengths).
const GROUPS: CompareGroup[] = [
  {
    title: 'Hosting & setup',
    rows: [
      {
        feature: 'What it is',
        competitor: { state: 'partial', text: 'An open-source test analytics platform' },
        nijam: { state: 'yes', text: 'A focused, hosted test-reporting dashboard' },
      },
      {
        feature: 'Hosting',
        competitor: { state: 'no', text: 'Self-host the stack, or pay for managed' },
        nijam: { state: 'yes', text: 'Fully hosted, nothing to run' },
      },
      {
        feature: 'Infrastructure',
        competitor: { state: 'no', text: 'Docker, Postgres, and analytics services to operate' },
        nijam: { state: 'yes', text: 'None, it is a SaaS' },
      },
      {
        feature: 'Onboarding',
        competitor: { state: 'partial', text: 'Stand up the platform, configure agents' },
        nijam: { state: 'yes', text: 'Add the reporter, push a run' },
      },
    ],
  },
  {
    title: 'Frameworks',
    rows: [
      {
        feature: 'Playwright',
        competitor: { state: 'partial', text: 'Via a community / agent integration' },
        nijam: { state: 'yes', text: 'First-class: attempts, shards, timeline' },
      },
      {
        feature: 'pytest',
        competitor: { state: 'yes', text: 'Official agent' },
        nijam: { state: 'yes', text: 'First-class plugin' },
      },
      {
        feature: 'Vitest',
        competitor: { state: 'no', text: 'No first-class agent' },
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
        feature: 'Failure analysis',
        competitor: { state: 'yes', text: 'ML auto-analysis of failures' },
        nijam: { state: 'yes', text: 'Root cause, trace, and artifacts on one page' },
      },
      {
        feature: 'Flaky ranking',
        competitor: { state: 'partial', text: 'Not a first-class flaky ranking' },
        nijam: { state: 'yes', text: 'Auto-detected and ranked per test' },
      },
      {
        feature: 'Run history',
        competitor: { state: 'yes', text: 'Kept in your instance' },
        nijam: { state: 'yes', text: 'Every run and attempt, hosted' },
      },
      {
        feature: 'Time to value',
        competitor: { state: 'partial', text: 'Dashboards and rules to configure' },
        nijam: { state: 'yes', text: 'Useful on the first run, no config' },
      },
    ],
  },
  {
    title: 'Collaboration & platform',
    rows: [
      {
        feature: 'Team management',
        competitor: { state: 'yes', text: 'Projects, members, roles' },
        nijam: { state: 'yes', text: 'Orgs, members, roles' },
      },
      {
        feature: 'Slack / GitHub',
        competitor: { state: 'partial', text: 'Via plugins / config' },
        nijam: { state: 'yes', text: 'PR checks and Slack alerts built in' },
      },
      {
        feature: 'AI / MCP access',
        competitor: { state: 'no', text: 'No MCP server for agents' },
        nijam: { state: 'yes', text: 'MCP server for agents' },
      },
      {
        feature: 'Data footprint',
        competitor: { state: 'partial', text: 'You store and secure it (self-host)' },
        nijam: { state: 'yes', text: 'Managed, minimal test data' },
      },
    ],
  },
  {
    title: 'Cost & ops',
    rows: [
      {
        feature: 'License',
        competitor: { state: 'yes', text: 'Open source' },
        nijam: { state: 'yes', text: 'Free tier, then simple credits' },
      },
      {
        feature: 'Managed option',
        competitor: { state: 'partial', text: 'Paid managed SaaS' },
        nijam: { state: 'yes', text: 'Hosting included' },
      },
      {
        feature: 'Ongoing effort',
        competitor: { state: 'no', text: 'Patching, scaling, and backups on you' },
        nijam: { state: 'yes', text: 'Zero, fully managed' },
      },
      {
        feature: 'Best for',
        competitor: { text: 'Teams wanting a self-run analytics platform with ML auto-analysis' },
        nijam: { text: 'Teams that want hosted reporting for JS and Python tests without the ops' },
      },
    ],
  },
];

const REASONS: { icon: IconSvgElement; tint: string; title: string; body: string }[] = [
  {
    icon: CloudUploadIcon,
    tint: 'bg-primary/15 text-primary',
    title: 'Hosted, zero ops',
    body: 'ReportPortal is powerful, but that power ships as infrastructure: self-host Docker, Postgres, and analytics services, or pay for managed. Nijam is hosted, with nothing to run.',
  },
  {
    icon: RocketIcon,
    tint: 'bg-info/15 text-info',
    title: 'Live in minutes',
    body: 'No cluster to stand up and no agents to wire per project. Add the reporter, push a run, and the dashboard is there.',
  },
  {
    icon: Bug01Icon,
    tint: 'bg-warning/15 text-warning',
    title: 'Flakiness, ranked',
    body: 'Nijam auto-detects flaky tests and ranks them across runs, out of the box. Flaky ranking is not ReportPortal’s model.',
  },
  {
    icon: Target01Icon,
    tint: 'bg-primary/15 text-primary',
    title: 'Focused, not sprawling',
    body: 'ReportPortal is a broad analytics platform with dashboards, widgets, and rules to configure. Nijam does reporting for three frameworks, well, with no setup.',
  },
  {
    icon: AiChat02Icon,
    tint: 'bg-success/15 text-success',
    title: 'AI-ready via MCP',
    body: 'Point your agents at Nijam’s MCP server to ask about failures, flakiness, and history in plain language, right from your editor or CI.',
  },
  {
    icon: Wrench01Icon,
    tint: 'bg-info/15 text-info',
    title: 'No maintenance',
    body: 'No services to patch, scale, or back up, and no upgrades to schedule. Uptime and updates are on us.',
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

const RP_PRICE = [
  'Open source, self-hosted for free',
  'You run Docker, Postgres, and analytics services',
  'Managed SaaS is a paid plan',
  'The real cost is infra and ops time',
];
const NIJAM_PRICE = [
  'Hosting, history, and flaky tracking included',
  '1 credit = one Playwright report',
  'Free forever tier, then $20/mo Pro',
  'No cluster to run or maintain',
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Does Nijam replace ReportPortal?',
    a: 'For hosted reporting of Playwright, pytest, and Vitest, yes, without running a platform. ReportPortal is broader (ML auto-analysis, agents for many languages); if you want that and can operate it, it is a strong tool.',
  },
  {
    q: 'Do I need to host anything?',
    a: 'No. ReportPortal is typically self-hosted (or paid managed), which means running and scaling several services. Nijam is fully hosted, so there is nothing to deploy or maintain.',
  },
  {
    q: 'What about ReportPortal’s ML auto-analysis?',
    a: 'It is a genuine strength for triaging large suites. Nijam takes a different tack: make each run and its flakiness obvious with zero setup, and let your own agents query the data over MCP.',
  },
  {
    q: 'Which frameworks are supported?',
    a: 'Playwright, pytest, and Vitest are first-class in Nijam. ReportPortal has agents for many languages, so for other stacks it may be a better fit.',
  },
  {
    q: 'Can I use both?',
    a: 'Yes. Keep ReportPortal where it already fits and send your JavaScript and Python CI results to Nijam for hosted, zero-ops reporting.',
  },
  {
    q: 'Is my data managed?',
    a: 'With Nijam, yes, it stores only your test results and artifacts. A self-hosted ReportPortal means you store, secure, and back up results yourself.',
  },
];

function CompareReportPortalPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
            Comparison
          </Text>
          <Text as="h1" className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Nijam vs ReportPortal
          </Text>
          <Text className="mx-auto mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
            ReportPortal is a powerful open-source test analytics platform you run yourself. Nijam is
            the hosted, zero-ops dashboard focused on Playwright, pytest, and Vitest, useful from the
            very first run, with no cluster to operate.
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
          <SectionHead eyebrow="Platform vs product" title="A hosted dashboard, not a platform to run">
            The same test results. One is an analytics platform you stand up and operate; the other
            is a hosted dashboard that works the moment you push a run.
          </SectionHead>
          <Reveal>
            <MockPair
              competitor={<ReportPortalMock />}
              competitorCaption="ReportPortal: a capable analytics platform, but one you self-host and operate, with services, agents, and rules to configure."
            />
          </Reveal>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHead eyebrow="Why Nijam" title="Why teams pick Nijam over ReportPortal">
            All the reporting you need for JavaScript and Python tests, hosted, with none of the
            infrastructure to run.
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
            Baseline is the open-source, self-hosted ReportPortal. Its ML auto-analysis and language
            breadth are real strengths, called out below.
          </SectionHead>
          <Reveal>
            <CompareTable
              competitorGlyph={<ReportPortalWordmark className="h-5" />}
              groups={GROUPS}
            />
          </Reveal>
          <FeatureLegend />
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHead
            eyebrow="Playwright · pytest · Vitest"
            title="First-class for the frameworks you report"
          >
            Deep, hosted support for the three we focus on, ready to use without agents or a platform
            to configure.
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
          <SectionHead eyebrow="Pricing" title="Free to self-run, or hosted for you">
            ReportPortal is free to host yourself; the real bill is infrastructure and operations.
            Nijam hosts everything for a simple per-report price.
          </SectionHead>
          <Reveal>
            <Grid cols={[1, 2]} gap={5} className="mx-auto max-w-4xl items-start">
              <PricingCard
                header={<ReportPortalWordmark className="h-6" />}
                kicker="Open source + managed"
                rows={RP_PRICE}
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
                kicker="Hosted, simple credits"
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
        title="Reporting without the platform to run"
        description="Point your CI at Nijam and get hosted history, flaky ranking, and root cause for Playwright, pytest, and Vitest, with no services to operate."
      />
    </>
  );
}
