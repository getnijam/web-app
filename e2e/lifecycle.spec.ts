import { test } from '@playwright/test';
import { login } from './utils/auth';
import { createOrg, deleteOrg } from './utils/org';
import { createProject, deleteProject } from './utils/project';
import { createIngestKey, deleteSecretKey } from './utils/keys';

const EMAIL = process.env.NIJAM_E2E_EMAIL ?? '';
const PASSWORD = process.env.NIJAM_E2E_PASSWORD ?? '';

test.describe('Org & project lifecycle', () => {
  test('create org → create project → delete project → delete org', async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD, 'Set NIJAM_E2E_EMAIL and NIJAM_E2E_PASSWORD to run.');

    // Unique, timestamped names so reruns never collide and cleanup is unambiguous.
    const stamp = Date.now().toString(36);
    const org = `E2E Org ${stamp}`;
    const project = `e2e-project-${stamp}`;

    await login(page, EMAIL, PASSWORD);
    await createOrg(page, { org });
    await createProject(page, { org, project });
    await deleteProject(page, { org, project });
    // The org can only be deleted once it has no projects — hence after deleteProject.
    await deleteOrg(page, { org });
  });
});

test.describe('Secret key lifecycle', () => {
  test('create org → create ingestion key → delete key → delete org', async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD, 'Set NIJAM_E2E_EMAIL and NIJAM_E2E_PASSWORD to run.');

    const stamp = Date.now().toString(36);
    const org = `E2E Keys ${stamp}`;
    const key = `e2e-key-${stamp}`;

    await login(page, EMAIL, PASSWORD);
    await createOrg(page, { org });
    await createIngestKey(page, { org, key });
    await deleteSecretKey(page, { org, key });
    // Org has no projects (only the now-revoked key), so it can be deleted.
    await deleteOrg(page, { org });
  });
});
