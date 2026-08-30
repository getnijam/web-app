import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { WebhookIcon } from '@hugeicons/core-free-icons';
import { CTA } from '@/components/home/components/CTA';
import { Reveal } from '@/components/home/Reveal';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { SlackLogo } from '@/components/integrations/SlackLogo';
import { GitHubLogo } from '@/components/integrations/GitHubLogo';
import { GitLabLogo } from '@/components/integrations/GitLabLogo';
import { TeamsLogo } from '@/components/integrations/TeamsLogo';
import { DiscordLogo } from '@/components/integrations/DiscordLogo';
import { FrameworkLogo } from '@/components/projects/framework-logos';

/**
 * Public marketing page for the integrations surface (`/integrations`). The copy is
 * kept in step with what the product actually ships, the panels in
 * `components/integrations/` and the org Integrations list are the source of truth
 * for the wording here; only claim what those already do.
 */

type Integration = {
  logo: ReactNode;
  name: string;
  tagline: string;
  body: ReactNode;
  points: string[];
};

const DELIVERY: Integration[] = [
  {
    logo: <SlackLogo size={26} />,
    name: 'Slack',
    tagline: 'Every verdict in the channel your team already watches.',
    body: 'Connect a workspace once, pick a default channel, and Nijam posts a summary of each run: passing, flaky, or failing, with the counts, the branch, the commit, the author, and a link straight into the run.',
    points: [
      'Choose when it posts: every run, only failures, failures or flaky, or only regressions (the first failure after a passing run).',
      'Compact for status and counts, or full to list each failed and flaky test with its error.',
      "Block Kit or Classic layout, previewed live while you're configuring it.",
      'Per-project overrides: a different channel, a branch filter, or mute Slack entirely for one project.',
    ],
  },
  {
    logo: <GitHubLogo size={26} />,
    name: 'GitHub',
    tagline: 'The result on the pull request, before anyone asks.',
    body: 'Install the GitHub App for your organization and every run on a pull request posts a status check plus a results comment. The comment updates in place on each re-run instead of stacking up.',
    points: [
      'One status check per PR, so a red suite blocks the merge.',
      'A single results comment with the pass, fail, and flaky counts, rewritten on each run.',
      'Branch filters per project, so only the branches you care about report.',
    ],
  },
  {
    logo: <GitLabLogo size={26} />,
    name: 'GitLab',
    tagline: 'Commit statuses and merge-request notes.',
    body: 'The same workflow for GitLab: connect once at the organization level, and runs on a merge request post a commit status and a results note.',
    points: [
      'A commit status on the pipeline so the MR reflects the suite.',
      'A results note on the merge request with the run breakdown.',
      'The same per-project branch filters and mute switch as GitHub.',
    ],
  },
];

const REPORTERS = [
  {
    framework: 'playwright' as const,
    name: 'Playwright',
    pkg: '@nijam/pw-reporter',
    href: 'https://www.npmjs.com/package/@nijam/pw-reporter',
    body: 'Full fidelity: every screenshot, video, and trace.zip uploaded and opened from the test that produced it.',
  },
  {
    framework: 'pytest' as const,
    name: 'pytest',
    pkg: 'pytest-nijam',
    href: 'https://pypi.org/project/pytest-nijam/',
    body: 'A zero-dependency plugin that loads inside your pytest process and reports results, failures, and timings.',
  },
  {
    framework: 'vitest' as const,
    name: 'Vitest',
    pkg: '@nijam/vitest-reporter',
    href: 'https://www.npmjs.com/package/@nijam/vitest-reporter',
    body: 'Unit and component runs land in the same history as your end-to-end suite.',
  },
];

const COMING_SOON = [
  {
    logo: <TeamsLogo size={20} />,
    name: 'Microsoft Teams',
    body: 'Run summaries in Teams channels.',
  },
  {
    logo: <DiscordLogo size={20} />,
    name: 'Discord',
    body: 'Results in a Discord server channel.',
  },
  {
    logo: <HugeiconsIcon icon={WebhookIcon} size={20} className="text-muted-foreground" />,
    name: 'Webhooks',
    body: 'Run events as JSON, POSTed to any HTTPS endpoint.',
  },
];

function IntegrationCard({ i }: { i: Integration }) {
  return (
    <div className="h-full rounded-2xl bg-card p-7 ring-1 ring-foreground/5 transition-colors hover:ring-foreground/15 dark:ring-foreground/10 dark:hover:ring-foreground/25">
      <Flex align="center" gap={3}>
        <Flex inline align="center" justify="center" className="size-12 rounded-xl bg-muted">
          {i.logo}
        </Flex>
        <Text as="h3" className="text-xl font-semibold tracking-tight">
          {i.name}
        </Text>
      </Flex>
      <Text className="mt-5 text-base font-medium text-pretty">{i.tagline}</Text>
      <Text className="mt-2.5 text-base leading-relaxed text-pretty text-muted-foreground">
        {i.body}
      </Text>
      <Flex as="ul" direction="col" gap={2.5} className="mt-5">
        {i.points.map((p) => (
          <Flex as="li" key={p} align="start" gap={2.5}>
            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            <Text as="span" className="text-sm leading-relaxed text-pretty text-muted-foreground">
              {p}
            </Text>
          </Flex>
        ))}
      </Flex>
    </div>
  );
}

function SectionHeading({ heading, blurb }: { heading: string; blurb: string }) {
  return (
    <Reveal className="max-w-2xl">
      <Text as="h2" className="text-2xl font-bold tracking-tight sm:text-3xl">
        {heading}
      </Text>
      <Text className="mt-2.5 text-base text-pretty text-muted-foreground">{blurb}</Text>
    </Reveal>
  );
}

export function IntegrationsPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <Reveal className="mx-auto mb-20 max-w-2xl text-center">
          <Text as="h1" className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Nijam fits where your team already works.
          </Text>
          <Text className="mt-5 text-lg text-pretty text-muted-foreground">
            Your suite reports into Nijam, and Nijam reports back out: into Slack, onto the pull
            request, and into whatever AI agent you code with. Nobody has to open a dashboard to
            find out the build went red.
          </Text>
        </Reveal>

        <Flex direction="col" className="gap-24">
          <section id="delivery" className="scroll-mt-24">
            <SectionHeading
              heading="Slack, GitHub, and GitLab"
              blurb="Connect once for the whole organization, then tune it per project. Every integration is optional and every one can be muted for a project that shouldn't report."
            />
            <Reveal className="mt-8">
              <Grid cols={[1, 1, 3]} gap={5}>
                {DELIVERY.map((i) => (
                  <IntegrationCard key={i.name} i={i} />
                ))}
              </Grid>
            </Reveal>
          </section>

          <section id="agents" className="scroll-mt-24">
            <SectionHeading
              heading="An MCP server over your real test history"
              blurb="Point any MCP-capable client at your runs and let it answer from what actually happened, not from a guess about your codebase."
            />
            <Reveal className="mt-8">
              <div className="rounded-2xl bg-card p-7 ring-1 ring-foreground/5 dark:ring-foreground/10">
                <Text className="text-base leading-relaxed text-pretty text-muted-foreground">
                  Claude Code, Cursor, Codex, or anything else that speaks MCP can ask why a suite
                  is red, whether a test is flaky, when it started failing, and what the last run
                  did. Setup is a read-only key and one copy-paste command from the dashboard.
                </Text>
                <Grid cols={[1, 2, 4]} gap={4} className="mt-6">
                  {[
                    'Why is the suite red?',
                    'Is this test flaky?',
                    'When did it start failing?',
                    'What did the last run do?',
                  ].map((q) => (
                    <Flex
                      key={q}
                      align="center"
                      className="h-full rounded-xl bg-muted/50 px-4 py-3"
                    >
                      <Text as="span" className="text-sm text-pretty">
                        {q}
                      </Text>
                    </Flex>
                  ))}
                </Grid>
              </div>
            </Reveal>
          </section>

          <section id="reporters" className="scroll-mt-24">
            <SectionHeading
              heading="One reporter, any CI"
              blurb="Add the reporter for your framework, set your project id, and every run uploads itself. There is nothing to self-host and no CI plugin to maintain."
            />
            <Reveal className="mt-8">
              <Grid cols={[1, 1, 3]} gap={5}>
                {REPORTERS.map((r) => (
                  <div
                    key={r.name}
                    className="h-full rounded-2xl bg-card p-7 ring-1 ring-foreground/5 dark:ring-foreground/10"
                  >
                    <Flex align="center" gap={3}>
                      <Flex
                        inline
                        align="center"
                        justify="center"
                        className="size-11 rounded-xl bg-muted"
                      >
                        <FrameworkLogo framework={r.framework} size={22} />
                      </Flex>
                      <Text as="h3" className="text-lg font-semibold tracking-tight">
                        {r.name}
                      </Text>
                    </Flex>
                    <Text className="mt-5 text-base leading-relaxed text-pretty text-muted-foreground">
                      {r.body}
                    </Text>
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-block font-mono text-sm text-primary hover:underline"
                    >
                      {r.pkg}
                    </a>
                  </div>
                ))}
              </Grid>
            </Reveal>
            <Reveal className="mt-6">
              <Text className="text-sm text-muted-foreground">
                Runs upload over HTTPS from wherever your tests already run: GitHub Actions, GitLab
                CI, Jenkins, CircleCI, Azure Pipelines, or a laptop.
              </Text>
            </Reveal>
          </section>

          <section id="soon" className="scroll-mt-24">
            <SectionHeading
              heading="Coming next"
              blurb="Not shipped yet, listed here so you can tell what you would be signing up for today."
            />
            <Reveal className="mt-8">
              <Grid cols={[1, 3]} gap={5}>
                {COMING_SOON.map((c) => (
                  <Flex
                    key={c.name}
                    direction="col"
                    gap={3}
                    className="h-full rounded-2xl border border-dashed border-border p-6"
                  >
                    <Flex align="center" justify="between" gap={3}>
                      <Flex align="center" gap={2.5}>
                        <Flex
                          inline
                          align="center"
                          justify="center"
                          className="size-9 rounded-lg bg-muted"
                        >
                          {c.logo}
                        </Flex>
                        <Text as="h3" className="text-base font-semibold">
                          {c.name}
                        </Text>
                      </Flex>
                      <Badge variant="secondary">Coming soon</Badge>
                    </Flex>
                    <Text className="text-sm text-pretty text-muted-foreground">{c.body}</Text>
                  </Flex>
                ))}
              </Grid>
            </Reveal>
          </section>
        </Flex>
      </main>
      <CTA
        title="Connecting one takes about a minute."
        description="Slack, GitHub, and GitLab are all OAuth. Authorize once, choose a default channel or leave the defaults, and the next run reports itself."
      />
    </>
  );
}
