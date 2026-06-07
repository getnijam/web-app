import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config. Runs against the **deployed app** by default (https://www.nijam.dev),
 * so the specs can be run locally straight against prod. Override the target with
 * `NIJAM_E2E_BASE_URL` (e.g. http://localhost:5173 for a local dev server).
 *
 * Login credentials come from `NIJAM_E2E_EMAIL` / `NIJAM_E2E_PASSWORD` — the
 * lifecycle spec skips itself when they're unset, so a bare `npm run test:e2e`
 * never fails.
 *
 * Optionally push these runs to a Nijam project (dogfooding) by setting, **at run
 * time**, all of:
 *   NIJAM_API_KEY      — a secret key for the target project
 *   NIJAM_PROJECT_ID   — the project's id (from the dashboard)
 *   NIJAM_API_URL      — optional; defaults to https://api.nijam.dev
 * When the key + project id are present, `@nijam/pw-reporter` is added and uploads
 * the run; otherwise only the console reporter runs.
 *
 * First run: `npx playwright install chromium` to fetch the browser.
 */

// Auto-load web-app/.env (NIJAM_* + NIJAM_E2E_* values) so a bare `npm run test:e2e`
// just works. Optional: with no .env — or an emptied/commented one — the run falls
// back to whatever is already in the environment. Comment out NIJAM_API_KEY in .env
// to skip the Nijam upload.
try {
  process.loadEnvFile();
} catch {
  // no .env file present — proceed with the existing environment
}

// Reporter entry: [name] or [name, options] — mirrors Playwright's ReporterDescription
// (kept local so we don't depend on the type's export name).
type ReporterEntry = readonly [string] | readonly [string, Record<string, unknown>];

const reporter: ReporterEntry[] = [['list']];

if (process.env.NIJAM_API_KEY && process.env.NIJAM_PROJECT_ID) {
  reporter.push([
    '@nijam/pw-reporter',
    {
      apiKey: process.env.NIJAM_API_KEY,
      projectId: process.env.NIJAM_PROJECT_ID,
    },
  ]);
}

// In CI, also emit the HTML report so the workflow can upload it as an artifact.
if (process.env.CI) {
  reporter.push(['html', { open: 'never' }]);
}

export default defineConfig({
  testDir: './e2e',
  // The lifecycle spec is a single ordered chain (create → delete), so no parallelism.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter,
  use: {
    baseURL: process.env.NIJAM_E2E_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
