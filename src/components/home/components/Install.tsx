import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { SIGNUP_ROUTE } from '@/lib/routes';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CopyField } from '@/components/ui/copy-field';
import { CopyButton } from '@/components/ui/copy-button';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { useQuery } from '@tanstack/react-query';
import { meQueryOptions } from '@/lib/me-query';
import { Reveal } from '../Reveal';
import { DashboardLink } from './DashboardLink';
import { PlaywrightLogo, PytestLogo, VitestLogo } from './framework-logos';

type Reporter = {
  key: string;
  label: string;
  Logo: typeof PlaywrightLogo;
  install: string;
  file: string;
  snippet: string;
};

const REPORTERS: Reporter[] = [
  {
    key: 'playwright',
    label: 'Playwright',
    Logo: PlaywrightLogo,
    install: 'npm i -D @nijam/pw-reporter',
    file: 'playwright.config.ts',
    snippet: `import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['@nijam/pw-reporter'],
  ],
});`,
  },
  {
    key: 'pytest',
    label: 'pytest',
    Logo: PytestLogo,
    install: 'pip install pytest-nijam',
    file: 'pyproject.toml',
    snippet: `[tool.pytest.ini_options]
addopts = "--nijam"`,
  },
  {
    key: 'vitest',
    label: 'Vitest',
    Logo: VitestLogo,
    install: 'npm i -D @nijam/vitest-reporter',
    file: 'vitest.config.ts',
    snippet: `import { defineConfig } from 'vitest/config';
import { NijamReporter } from '@nijam/vitest-reporter';

export default defineConfig({
  test: {
    reporters: ['default', new NijamReporter()],
  },
});`,
  },
];

/** A captioned step block (label above its field / snippet). */
function Block({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <Text as="p" variant="caption" color="muted" className="mb-2.5">
        {label}
      </Text>
      {children}
    </div>
  );
}

/** Config snippet dressed as a mini editor: window chrome, filename, copy button. */
function CodeWindow({ file, code }: { file: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
      <Flex align="center" gap={2} className="border-b border-border bg-muted/50 px-3.5 py-2">
        <Flex gap={1.5}>
          <span aria-hidden className="size-2.5 rounded-full bg-destructive/65" />
          <span aria-hidden className="size-2.5 rounded-full bg-warning/65" />
          <span aria-hidden className="size-2.5 rounded-full bg-success/65" />
        </Flex>
        <Text as="span" className="ml-2 truncate font-mono text-xs text-muted-foreground">
          {file}
        </Text>
        <CopyButton
          value={code}
          variant="ghost"
          size="icon"
          iconSize={14}
          className="ml-auto size-7 shrink-0 text-muted-foreground"
        />
      </Flex>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground">
        {code}
      </pre>
    </div>
  );
}

const HELP_LINK = 'font-medium text-primary hover:underline';

/**
 * Auth-aware hint under the CI credentials. Guests are pointed at sign-up; signed-in
 * users are sent to the dashboard, where both the project ID and a new ingestion key live.
 * Reads the shared, cached `/me` query the home sections already issue, no extra request.
 */
function CredentialsHelp() {
  const user = useQuery(meQueryOptions()).data?.user;

  if (!user) {
    return (
      <Text as="p" variant="caption" color="muted" className="mt-2.5">
        <Link to={SIGNUP_ROUTE} className={HELP_LINK}>
          Sign up
        </Link>{' '}
        to get your project ID and an ingestion key.
      </Text>
    );
  }

  return (
    <Text as="p" variant="caption" color="muted" className="mt-2.5">
      <DashboardLink className={HELP_LINK}>Go to your dashboard</DashboardLink> to get your project
      ID and create a new ingestion key.
    </Text>
  );
}

/**
 * Install fold: three tabs (Playwright / pytest / Vitest), each laying the real
 * install command and CI env var beside the config snippet, so the "three lines"
 * read across one wide card. Sits on a muted band so it separates from the hero
 * and features sections above and below it.
 */
export function Install() {
  const [active, setActive] = useState<string>('playwright');

  return (
    <section id="install" className="scroll-mt-24 bg-muted/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <Flex direction="col" align="center" className="mx-auto max-w-2xl text-center">
            <Text as="h2" className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Add three lines. Keep your workflow.
            </Text>
            <Text className="mt-3.5 max-w-lg text-base text-muted-foreground">
              Install the reporter for the framework you already run, point it at your project, and
              Nijam reads every CI run from there. No new pipeline, no test changes.
            </Text>
          </Flex>

          <Tabs value={active} onValueChange={setActive} className="mt-10 items-center">
            <TabsList>
              {REPORTERS.map((r) => (
                <TabsTrigger key={r.key} value={r.key}>
                  <r.Logo className="size-4 shrink-0" />
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {REPORTERS.map((r) => (
              <TabsContent key={r.key} value={r.key} className="mx-auto mt-8 w-full max-w-4xl">
                <Grid
                  cols={[1, 1, 2]}
                  gap={6}
                  className="items-start rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
                >
                  <Flex direction="col" gap={6}>
                    <Block label="Install">
                      <CopyField value={r.install} />
                    </Block>

                    <Block
                      label={
                        <>
                          Set <span className="font-mono">NIJAM_PROJECT_ID</span> and{' '}
                          <span className="font-mono">NIJAM_API_KEY</span> in your CI environment
                        </>
                      }
                    >
                      <Flex direction="col" gap={2}>
                        <CopyField value="NIJAM_PROJECT_ID=prj_a8f2c7e1" />
                        <CopyField value="NIJAM_API_KEY=nij_sk_..." />
                      </Flex>
                      <CredentialsHelp />
                    </Block>
                  </Flex>

                  <Block
                    label={
                      <>
                        Add to <span className="font-mono">{r.file}</span>
                      </>
                    }
                  >
                    <CodeWindow file={r.file} code={r.snippet} />
                  </Block>
                </Grid>
              </TabsContent>
            ))}
          </Tabs>
        </Reveal>
      </div>
    </section>
  );
}
