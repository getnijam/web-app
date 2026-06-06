import { test, expect } from '@playwright/test';
import { login } from './utils/auth';
import { createOrg, deleteOrg } from './utils/org';
import { createProject, deleteProject } from './utils/project';
import { openOrgProjects } from './utils/nav';

const EMAIL = process.env.NIJAM_E2E_EMAIL ?? '';
const PASSWORD = process.env.NIJAM_E2E_PASSWORD ?? '';

// This spec is meant to FAIL — it exists to produce a Playwright trace/screenshot
// (e.g. for dogfooding the Nijam reporter). The global config only traces on retry,
// so force trace capture on failure for just this file.
test.use({ trace: 'retain-on-failure' });

test.describe('Org delete blocked by an existing project (deliberate failure)', () => {
  // Tracked across the test + cleanup so the intended failure doesn't leave orphans.
  let createdOrg: string | null = null;
  let createdProject: string | null = null;

  test('create org → create project → delete org without deleting the project (fails on purpose)', async ({
    page,
  }) => {
    test.skip(!EMAIL || !PASSWORD, 'Set NIJAM_E2E_EMAIL and NIJAM_E2E_PASSWORD to run.');

    // Unique, timestamped names so reruns never collide.
    const stamp = Date.now().toString(36);
    const org = `E2E Fail Org ${stamp}`;
    const project = `e2e-fail-project-${stamp}`;

    await login(page, EMAIL, PASSWORD);
    await createOrg(page, { org });
    createdOrg = org;
    await createProject(page, { org, project });
    createdProject = project;

    // Deliberately skip deleting the project, then try to delete the org. The API
    // rejects this with 409 ORG_HAS_PROJECTS, so the dialog stays put and we never
    // reach the org picker (`/orgs`) — the assertion below fails on purpose.
    const orgId = await openOrgProjects(page, org);
    await page.goto(`/orgs/${orgId}/settings`);
    await page.getByTestId('delete-org-trigger').click();
    await page.getByTestId('delete-org-input').fill(org);
    await page.getByTestId('delete-org-confirm').click();

    await expect(
      page,
      'org deletion should land on /orgs, but the org still has a project so it is rejected (409) — failing on purpose to capture a trace',
    ).toHaveURL(/\/orgs\/?(?:\?.*)?$/, { timeout: 10_000 });
  });

  // Best-effort cleanup: delete the leftover project then the org. Wrapped so a
  // cleanup hiccup never masks the test's own (intended) failure.
  test.afterEach(async ({ page }) => {
    if (!createdOrg) return;
    try {
      if (createdProject) await deleteProject(page, { org: createdOrg, project: createdProject });
      await deleteOrg(page, { org: createdOrg });
    } catch {
      // ignore — this run was meant to fail; cleanup is a courtesy, not a requirement
    }
    createdOrg = null;
    createdProject = null;
  });
});
