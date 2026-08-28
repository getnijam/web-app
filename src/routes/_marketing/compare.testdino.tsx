import { createFileRoute, Link } from '@tanstack/react-router';
import type { IconSvgElement } from '@hugeicons/react';
import {
  Target01Icon,
  DatabaseIcon,
  CloudServerIcon,
  Coins01Icon,
  UserGroupIcon,
  ClockIcon,
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
import { TestDinoMock } from '@/components/compare/TestDinoMock';
import { CompareTable, type CompareGroup } from '@/components/compare/CompareTable';
import { TestDinoWordmark } from '@/components/compare/TestDinoWordmark';
import {
  SectionHead,
  ReasonCard,
  FrameworkCard,
  PricingCard,
  FeatureLegend,
} from '@/components/compare/sections';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_marketing/compare/testdino')({
  head: () =>
    seo({
      title: 'Nijam vs TestDino',
      description:
        'Nijam vs TestDino for test reporting. TestDino is a hosted, Playwright-only cloud metered on test executions with per-plan seat, project, and retention caps. Nijam reports Playwright, pytest, and Vitest, gives every plan unlimited projects, and can keep every run and artifact in your own cloud on flat pricing.',
      path: '/compare/testdino',
    }),
  component: CompareTestDinoPage,
});

// TestDino is the nearest neighbour to Nijam: a hosted Playwright reporting cloud with
// flake detection, a trace viewer, PR comments, and an MCP server. The honest framing
// leads with the three places the products genuinely diverge, framework coverage, where
// the data lives, and what each plan caps, while crediting TestDino for live run
// monitoring, root-cause flake buckets, tracker integrations, and its certifications.
const GROUPS: CompareGroup[] = [
  {
    title: 'Frameworks',
    rows: [
      {
        feature: 'Playwright',
        competitor: { state: 'yes', text: 'First-class, the whole product' },
        nijam: { state: 'yes', text: 'First-class: attempts, shards, timeline' },
      },
      {
        feature: 'pytest',
        competitor: { state: 'no', text: 'Not supported' },
        nijam: { state: 'yes', text: 'First-class plugin' },
      },
      {
        feature: 'Vitest',
        competitor: { state: 'no', text: 'Not supported' },
        nijam: { state: 'yes', text: 'First-class reporter' },
      },
      {
        feature: 'One home for every suite',
        competitor: { state: 'no', text: 'Playwright runs only' },
        nijam: { state: 'yes', text: 'E2E, Python, and unit runs side by side' },
      },
    ],
  },
  {
    title: 'Data ownership (bring your own cloud)',
    rows: [
      {
        feature: 'Your own database',
        competitor: { state: 'no', text: 'Results stored on TestDino' },
        nijam: { state: 'yes', text: 'Runs live in your own Postgres' },
      },
      {
        feature: 'Your own storage',
        competitor: { state: 'partial', text: 'Bring your own bucket on Enterprise' },
        nijam: { state: 'yes', text: 'Traces & video in your S3/GCS/Azure, on Pro' },
      },
      {
        feature: 'Data residency & compliance',
        competitor: { state: 'partial', text: 'Their infrastructure and regions' },
        nijam: { state: 'yes', text: 'Data never leaves your cloud' },
      },
      {
        feature: 'Certifications',
        competitor: { state: 'yes', text: 'ISO 27001 and SOC 2 Type II' },
        nijam: { state: 'partial', text: 'None yet, but BYOC keeps data with you' },
      },
    ],
  },
  {
    title: 'Pricing & plan limits',
    rows: [
      {
        feature: 'Model',
        competitor: { state: 'partial', text: 'Tiers metered on test executions' },
        nijam: { state: 'yes', text: 'Per report, with a flat BYOC option' },
      },
      {
        feature: 'What counts as usage',
        competitor: { state: 'no', text: 'Every browser and every retry' },
        nijam: { state: 'yes', text: '1 credit = 1 Playwright test (100 pytest/Vitest)' },
      },
      {
        feature: 'Team members',
        competitor: { state: 'no', text: '1 free, 3 on Pro, 30 on Team' },
        nijam: { state: 'yes', text: '3 free, unlimited on Pro' },
      },
      {
        feature: 'Projects',
        competitor: { state: 'no', text: '1 free, 3 on Pro, 5 on Team' },
        nijam: { state: 'yes', text: 'Unlimited on every plan' },
      },
      {
        feature: 'History retention',
        competitor: { state: 'partial', text: '14 days free, 60 on Pro, 365 on Team' },
        nijam: { state: 'partial', text: '7 days free, 90 on Pro, unlimited with BYOC' },
      },
      {
        feature: 'Single sign-on (SSO/OIDC)',
        competitor: { state: 'partial', text: 'Enterprise only' },
        nijam: { state: 'yes', text: 'Included on Pro, $20/mo' },
      },
    ],
  },
  {
    title: 'Reporting & insight',
    rows: [
      {
        feature: 'Playwright trace viewer',
        competitor: { state: 'yes', text: 'Opens traces in the browser' },
        nijam: { state: 'yes', text: 'Opens the native Playwright trace' },
      },
      {
        feature: 'Flaky detection',
        competitor: { state: 'yes', text: 'Retry analysis with root-cause buckets' },
        nijam: { state: 'yes', text: 'Auto-detected and ranked per test' },
      },
      {
        feature: 'Live view of a running suite',
        competitor: { state: 'yes', text: 'Real-time monitoring across shards' },
        nijam: { state: 'no', text: 'The report lands when the run finishes' },
      },
      {
        feature: 'AI / MCP access',
        competitor: { state: 'yes', text: 'MCP server and AI PR summaries, Pro and up' },
        nijam: { state: 'yes', text: 'MCP server for agents' },
      },
    ],
  },
  {
    title: 'Workflow',
    rows: [
      {
        feature: 'GitHub pull requests',
        competitor: { state: 'yes', text: 'PR gates and AI summaries' },
        nijam: { state: 'yes', text: 'PR check plus a results comment' },
      },
      {
        feature: 'GitLab merge requests',
        competitor: { state: 'yes', text: 'GitLab CI integration' },
        nijam: { state: 'partial', text: 'Runs report from GitLab CI, no MR comments' },
      },
      {
        feature: 'Chat alerts',
        competitor: { state: 'yes', text: 'Slack' },
        nijam: { state: 'yes', text: 'Slack, per project and per event' },
      },
      {
        feature: 'Issue trackers',
        competitor: { state: 'yes', text: 'Jira, Linear, Azure DevOps, Asana, monday' },
        nijam: { state: 'no', text: 'Slack and GitHub today' },
      },
    ],
  },
];

// Weighted to what actually separates the two: framework coverage, where the data
// lives, and the caps each plan puts around your team.
const REASONS: { icon: IconSvgElement; tint: string; title: string; body: string }[] = [
  {
    icon: Target01Icon,
    tint: 'bg-warning/15 text-warning',
    title: 'More than Playwright',
    body: 'TestDino is a Playwright-only cloud. Nijam is first-class for Playwright, pytest, and Vitest, so your E2E, Python, and unit suites land in one history with one flakiness view.',
  },
  {
    icon: DatabaseIcon,
    tint: 'bg-primary/15 text-primary',
    title: 'Your runs, your database',
    body: 'Point Nijam at your own Postgres and every run and project lives there. With TestDino, results sit on their cloud; with Nijam, the data is already yours.',
  },
  {
    icon: CloudServerIcon,
    tint: 'bg-info/15 text-info',
    title: 'Your bucket, not an upsell',
    body: 'TestDino puts bring your own storage behind an Enterprise contract. Nijam streams traces, screenshots, and video straight to your own S3, Google Cloud Storage, or Azure bucket on the $20 Pro plan.',
  },
  {
    icon: Coins01Icon,
    tint: 'bg-success/15 text-success',
    title: 'Executions add up, credits do not',
    body: 'TestDino counts every test execution, so three browsers and a retry turn one test into four. Nijam counts one credit per Playwright test report, and bring your own cloud drops metering entirely for a flat $20/month.',
  },
  {
    icon: UserGroupIcon,
    tint: 'bg-primary/15 text-primary',
    title: 'No seat or project math',
    body: 'TestDino gates members and projects by tier: 1 and 1 on free, 3 and 3 on Pro. Nijam gives every plan unlimited projects, and Pro adds unlimited members, so nobody is left outside the dashboard.',
  },
  {
    icon: ClockIcon,
    tint: 'bg-info/15 text-info',
    title: 'History on your terms',
    body: 'Hosted retention on both products is a plan setting, 60 days on TestDino Pro, 90 on Nijam Pro. With bring your own cloud the window disappears: the rows are in your database for as long as you keep them.',
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

const TD_PRICE = [
  'Free: 5,000 executions, 1 member, 1 project, 14-day history',
  'Pro $39/mo: 10,000 executions, 3 members, 3 projects',
  'Team $79/mo: 40,000 executions, 30 members, 5 projects',
  'Bring your own bucket and SSO: Enterprise only',
];
const NIJAM_PRICE = [
  'Free: 1,000 credits, up to 3 members, unlimited projects',
  'Pro $20/mo: 10,000 credits, then $0.001 per extra (early bird)',
  'Unlimited members and SSO/OIDC on Pro, no per-seat pricing',
  'Bring your own cloud: flat $20/mo, unmetered, unlimited retention',
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is the biggest difference between Nijam and TestDino?',
    a: 'Coverage and ownership. TestDino is a Playwright-only cloud and every plan caps members, projects, and how long history is kept. Nijam reports Playwright, pytest, and Vitest, keeps projects unlimited on every plan, and can store every run and artifact in your own Postgres and bucket.',
  },
  {
    q: 'Does TestDino support pytest or Vitest?',
    a: 'No. TestDino describes itself as a Playwright cloud companion, so Python and unit suites have no home there. Nijam ships a pytest plugin and a Vitest reporter alongside the Playwright one, and all three feed the same history, flakiness, and failure views.',
  },
  {
    q: 'Can I keep my test data in my own cloud?',
    a: 'Yes. With Nijam’s bring your own cloud, runs and projects live in your own Postgres and artifacts go to your own S3, Google Cloud Storage, or Azure bucket, on the standard $20 Pro plan. TestDino offers a bring your own storage bucket on Enterprise, and the run data itself stays in their database either way.',
  },
  {
    q: 'How does pricing compare?',
    a: 'TestDino meters test executions, where each browser and each retry counts as its own execution: 5,000 free, 10,000 on Pro at $39/month, 40,000 on Team at $79/month. Nijam charges one credit per Playwright test report (or 100 pytest/Vitest reports), includes 10,000 credits on the $20 Pro plan, and replaces metering with a flat $20/month when you bring your own cloud.',
  },
  {
    q: 'What does TestDino do that Nijam does not?',
    a: 'Several things worth naming: live monitoring of a suite while it is still running across shards, flake classification into root-cause buckets, ticket creation in Jira, Linear, Azure DevOps, Asana, and monday, and formal ISO 27001 and SOC 2 Type II certification. Nijam reports when the run finishes, integrates with Slack and GitHub today, and has no certification yet.',
  },
  {
    q: 'Can I try Nijam without leaving TestDino?',
    a: 'Yes. Reporters are independent, so you can add Nijam’s reporter to the same Playwright config and send results to both while you compare. Nijam has a free forever tier, so it costs nothing to run them side by side for a few weeks.',
  },
];

function CompareTestDinoPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
            Comparison
          </Text>
          <Text as="h1" className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Nijam vs TestDino
          </Text>
          <Text className="mx-auto mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
            TestDino is a hosted, Playwright-only reporting cloud, metered on test executions and
            tiered by seats, projects, and how long your history survives. Nijam reports Playwright,
            pytest, and Vitest with the same clarity, keeps projects unlimited, and lets every run
            and artifact live in your own cloud.
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
          <SectionHead eyebrow="One framework vs three" title="The same run, two ceilings">
            TestDino reads Playwright and meters every execution it sees. Nijam reads three
            frameworks and can put the whole record in infrastructure you own.
          </SectionHead>
          <Reveal>
            <MockPair
              competitor={<TestDinoMock />}
              competitorCaption="TestDino: a hosted Playwright cloud with run reports, flake buckets, and an in-browser trace viewer, metered on test executions where every browser and every retry counts."
            />
          </Reveal>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHead eyebrow="Why Nijam" title="Wider coverage, and no cap on your team">
            The three reasons teams move: suites TestDino cannot read, data they would rather keep,
            and plan limits they would rather not think about.
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
            TestDino is a good Playwright product, which is why the live-run, flake-classification,
            and tracker rows go its way. On frameworks, ownership, and plan limits, the story flips.
          </SectionHead>
          <Reveal>
            <CompareTable competitorGlyph={<TestDinoWordmark className="h-5" />} groups={GROUPS} />
          </Reveal>
          <FeatureLegend />
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHead eyebrow="Pricing" title="Executions and seats, or credits and your cloud">
            TestDino prices tiers around executions, members, projects, and retention. Nijam charges
            per report, keeps members unlimited on Pro, and drops metering when the data is yours.
          </SectionHead>
          <Reveal>
            <Grid cols={[1, 2]} gap={5} className="mx-auto max-w-4xl items-start">
              <PricingCard
                header={<TestDinoWordmark className="h-5" />}
                kicker="Metered executions, fully hosted"
                rows={TD_PRICE}
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
        title="Report every suite, not just Playwright"
        description="Bring your Playwright, pytest, and Vitest runs into one dashboard with flakiness, retries, and traces, and keep every run and artifact in your own Postgres and bucket when you want to."
      />
    </>
  );
}
