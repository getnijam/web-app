import { createFileRoute, Link } from '@tanstack/react-router';
import type { IconSvgElement } from '@hugeicons/react';
import {
  CloudUploadIcon,
  ChartBarStackedIcon,
  Bug01Icon,
  DashboardSquare01Icon,
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
import { AllureMock } from '@/components/compare/AllureMock';
import { CompareTable, type CompareGroup } from '@/components/compare/CompareTable';
import { AllureGlyph } from '@/components/compare/AllureGlyph';
import {
  SectionHead,
  ReasonCard,
  FrameworkCard,
  PricingCard,
  FeatureLegend,
} from '@/components/compare/sections';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_marketing/compare/allure')({
  head: () =>
    seo({
      title: 'Nijam vs Allure Report',
      description:
        'Nijam vs Allure Report for test reporting. See why teams pick Nijam as a hosted dashboard with cross-run history, flaky ranking, and team triage for Playwright, pytest, and Vitest, instead of generating, publishing, and retaining static Allure reports themselves.',
      path: '/compare/allure',
    }),
  component: CompareAllurePage,
});

// Baseline is Allure Report (the open-source reporter), not Allure TestOps (the
// paid hosted product); claims are kept fair and non-absolute.
const GROUPS: CompareGroup[] = [
  {
    title: 'Hosting & setup',
    rows: [
      {
        feature: 'What it is',
        competitor: { state: 'partial', text: 'An open-source report generator you run in CI' },
        nijam: { state: 'yes', text: 'A hosted dashboard, reports upload automatically' },
      },
      {
        feature: 'Where reports live',
        competitor: { state: 'no', text: 'A static HTML site you publish and host yourself' },
        nijam: { state: 'yes', text: 'Hosted for you, a link per run' },
      },
      {
        feature: 'Onboarding',
        competitor: { state: 'partial', text: 'Adapter + generate step + publish/retain in CI' },
        nijam: { state: 'yes', text: 'Add the reporter, push a run' },
      },
      {
        feature: 'Maintenance',
        competitor: { state: 'no', text: 'You own the generate, publish, and history pipeline' },
        nijam: { state: 'yes', text: 'Zero, nothing to deploy or retain' },
      },
    ],
  },
  {
    title: 'History & trends',
    rows: [
      {
        feature: 'Cross-run history',
        competitor: { state: 'partial', text: 'Needs a history folder persisted across CI runs' },
        nijam: { state: 'yes', text: 'Every run and attempt kept automatically' },
      },
      {
        feature: 'Trends over time',
        competitor: { state: 'partial', text: 'Limited, only when history is wired up' },
        nijam: { state: 'yes', text: 'Built in across runs, branches, and PRs' },
      },
      {
        feature: 'Flaky detection',
        competitor: { state: 'partial', text: 'Manual flaky marks or config' },
        nijam: { state: 'yes', text: 'Auto-detected and ranked per test' },
      },
      {
        feature: 'Per-test history',
        competitor: { state: 'no', text: 'The report covers a single run' },
        nijam: { state: 'yes', text: 'Every run for a test on one page' },
      },
    ],
  },
  {
    title: 'Frameworks',
    rows: [
      {
        feature: 'Playwright',
        competitor: { state: 'yes', text: 'Adapter available' },
        nijam: { state: 'yes', text: 'First-class: attempts, shards, timeline' },
      },
      {
        feature: 'pytest',
        competitor: { state: 'yes', text: 'Adapter available' },
        nijam: { state: 'yes', text: 'First-class plugin' },
      },
      {
        feature: 'Vitest',
        competitor: { state: 'partial', text: 'Community / generic support' },
        nijam: { state: 'yes', text: 'First-class reporter' },
      },
      {
        feature: 'Playwright trace viewer',
        competitor: { state: 'no', text: 'Attaches files only' },
        nijam: { state: 'yes', text: 'Opens the native Playwright trace' },
      },
      {
        feature: 'Framework breadth',
        competitor: { state: 'yes', text: 'Adapters for many frameworks' },
        nijam: { state: 'partial', text: 'Focused on Playwright, pytest, Vitest' },
      },
    ],
  },
  {
    title: 'Collaboration',
    rows: [
      {
        feature: 'Accounts & orgs',
        competitor: { state: 'no', text: 'A static report, no accounts' },
        nijam: { state: 'yes', text: 'Orgs, members, and roles' },
      },
      {
        feature: 'Shareable links',
        competitor: { state: 'partial', text: 'Share the hosted static site' },
        nijam: { state: 'yes', text: 'A link per run, access-controlled' },
      },
      {
        feature: 'Slack / GitHub',
        competitor: { state: 'no', text: 'Not built in' },
        nijam: { state: 'yes', text: 'PR checks and Slack alerts' },
      },
      {
        feature: 'AI / MCP access',
        competitor: { state: 'no', text: 'None' },
        nijam: { state: 'yes', text: 'MCP server for agents' },
      },
    ],
  },
  {
    title: 'Cost & ops',
    rows: [
      {
        feature: 'License',
        competitor: { state: 'yes', text: 'Open source and free' },
        nijam: { state: 'yes', text: 'Free tier, then simple credits' },
      },
      {
        feature: 'Hosted product',
        competitor: { state: 'partial', text: 'Allure TestOps, a paid enterprise product' },
        nijam: { state: 'yes', text: 'Hosting included, no separate SKU' },
      },
      {
        feature: 'Total effort',
        competitor: { state: 'no', text: 'CI glue, hosting, and retention are on you' },
        nijam: { state: 'yes', text: 'Managed end to end' },
      },
      {
        feature: 'Best for',
        competitor: { text: 'Teams that want a free per-run report and will run the pipeline' },
        nijam: { text: 'Teams that want hosted history and triage without the ops' },
      },
    ],
  },
];

const REASONS: { icon: IconSvgElement; tint: string; title: string; body: string }[] = [
  {
    icon: CloudUploadIcon,
    tint: 'bg-primary/15 text-primary',
    title: 'Hosted, not homework',
    body: 'Allure gives you a static report to generate and publish yourself. Nijam hosts every run automatically, a link per run, with nothing to deploy, publish, or babysit.',
  },
  {
    icon: ChartBarStackedIcon,
    tint: 'bg-info/15 text-info',
    title: 'History without the glue',
    body: 'Allure trends need a history folder carried between CI runs, which is easy to get wrong. Nijam keeps every run and attempt automatically, no pipeline plumbing.',
  },
  {
    icon: Bug01Icon,
    tint: 'bg-warning/15 text-warning',
    title: 'Flakiness, ranked',
    body: 'Allure flags a test as flaky only if you configure it. Nijam auto-detects flakiness and ranks it per test across every run, on every plan.',
  },
  {
    icon: DashboardSquare01Icon,
    tint: 'bg-primary/15 text-primary',
    title: 'A dashboard, not a file',
    body: 'Allure is one report per run. Nijam is a living dashboard across runs, branches, and PRs, so you can watch quality over time instead of opening one report at a time.',
  },
  {
    icon: AiChat02Icon,
    tint: 'bg-success/15 text-success',
    title: 'AI-ready via MCP',
    body: 'Point your agents at Nijam’s MCP server to ask about failures, flakiness, and history in plain language. A static Allure report has nothing to query.',
  },
  {
    icon: Wrench01Icon,
    tint: 'bg-info/15 text-info',
    title: 'Zero maintenance',
    body: 'No generate step, no publishing job, no history or retention to manage. Send the results your CI already produces and Nijam takes it from there.',
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

const ALLURE_PRICE = [
  'Allure Report is free and open source',
  'You host, publish, and retain reports yourself',
  'Hosted history means Allure TestOps (paid)',
  'The real cost is CI and ops time',
];
const NIJAM_PRICE = [
  'Hosting, history, and flaky tracking included',
  '1 credit = one Playwright report',
  'Free forever tier, then $20/mo Pro',
  'No pipeline to build or maintain',
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Does Nijam replace Allure Report?',
    a: 'For hosted reporting, yes. Allure Report is great at generating a per-run HTML report; Nijam adds hosting, cross-run history, and flaky ranking without the CI plumbing. You can also keep generating Allure locally and use Nijam as the hosted dashboard.',
  },
  {
    q: 'Do I have to host anything?',
    a: 'No. Allure produces a static site you publish and retain yourself; Nijam hosts every run for you at a URL, with history kept automatically and nothing to deploy.',
  },
  {
    q: 'How do history and trends compare?',
    a: 'Allure trends rely on a history folder persisted across CI runs, which is easy to get wrong. Nijam stores every run and attempt automatically, so history and flakiness just work.',
  },
  {
    q: 'Is Allure not free?',
    a: 'Allure Report is free and open source, and it is excellent for per-run reports. The hosted, team-oriented product is Allure TestOps, which is paid. Nijam is a hosted service with a free tier and simple per-report credits.',
  },
  {
    q: 'Which frameworks are supported?',
    a: 'Playwright, pytest, and Vitest are first-class in Nijam. Allure supports more frameworks via adapters, so if you need that breadth today, Allure may fit better.',
  },
  {
    q: 'Can I use both?',
    a: 'Yes. Generate Allure locally when you want its report, and send your CI results to Nijam for hosted history, flaky ranking, and triage.',
  },
];

function CompareAllurePage() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        {/* hero */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
            Comparison
          </Text>
          <Text as="h1" className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Nijam vs Allure Report
          </Text>
          <Text className="mx-auto mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
            Allure Report is a great open-source way to turn a test run into a rich HTML report.
            Nijam is the hosted dashboard that adds cross-run history, flaky ranking, and team
            triage for Playwright, pytest, and Vitest, with no report to generate, publish, or
            retain yourself.
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
          <SectionHead eyebrow="One run vs every run" title="A hosted dashboard, not a static file">
            Same test results. One is a report you generate and publish per run; the other is a
            living dashboard that remembers every run for you.
          </SectionHead>
          <Reveal>
            <MockPair
              competitor={<AllureMock />}
              competitorCaption="Allure Report: a polished static report for one run that you generate, publish, and host yourself, with history only if you wire it up."
            />
          </Reveal>
        </section>

        {/* why Nijam */}
        <section className="mt-20 md:mt-28">
          <SectionHead eyebrow="Why Nijam" title="Why teams pick Nijam over Allure Report">
            Everything Allure gives you per run, plus hosting, history, and flakiness, without owning
            the pipeline.
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
            Baseline is Allure Report, the open-source reporter, not the paid Allure TestOps product.
          </SectionHead>
          <Reveal>
            <CompareTable
              competitorName="Allure Report"
              competitorGlyph={<AllureGlyph className="size-5 shrink-0" />}
              groups={GROUPS}
            />
          </Reveal>
          <FeatureLegend />
        </section>

        {/* frameworks */}
        <section className="mt-20 md:mt-28">
          <SectionHead
            eyebrow="Playwright · pytest · Vitest"
            title="First-class for the frameworks you report"
          >
            Deep, hosted support for the three we focus on, with the history and flakiness that a
            per-run report can’t give you on its own.
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
          <SectionHead eyebrow="Pricing" title="Free to generate, or hosted for you">
            Allure Report is free to run yourself; Nijam hosts everything, history and all, for a
            simple per-report price.
          </SectionHead>
          <Reveal>
            <Grid cols={[1, 2]} gap={5} className="mx-auto max-w-4xl items-start">
              <PricingCard
                header={
                  <>
                    <AllureGlyph className="size-6 shrink-0" />
                    <Text as="span" className="text-base font-semibold tracking-tight">
                      Allure Report
                    </Text>
                  </>
                }
                kicker="Open source + TestOps"
                rows={ALLURE_PRICE}
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
        title="Give your Allure reports a home"
        description="Keep the reports you love and let Nijam host them with cross-run history, flaky ranking, and triage for Playwright, pytest, and Vitest, with no pipeline to build."
      />
    </>
  );
}
