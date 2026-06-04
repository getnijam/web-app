import { type Page, expect } from '@playwright/test';
import { openOrgProjects } from './nav';

/**
 * Create an organization by name. Opens the "New organization" dialog from the org
 * picker, submits, and waits until the app navigates into the new org's project list.
 */
export async function createOrg(page: Page, { org }: { org: string }): Promise<void> {
  await page.goto('/orgs');
  await page.getByTestId('create-org-trigger').click();
  await page.getByTestId('create-org-name').fill(org);
  await page.getByTestId('create-org-submit').click();
  // Creating an org navigates straight into it (its project list).
  await page.waitForURL('**/projects');
  await expect(page.getByTestId('create-project-trigger')).toBeVisible();
}

/**
 * Delete an organization by name. Opens the org's settings, types the org name to
 * confirm, and waits for the return to the org picker. The org must have no projects
 * (delete those first).
 */
export async function deleteOrg(page: Page, { org }: { org: string }): Promise<void> {
  const orgId = await openOrgProjects(page, org);
  await page.goto(`/orgs/${orgId}/settings`);
  await page.getByTestId('delete-org-trigger').click();
  await page.getByTestId('delete-org-input').fill(org);
  await page.getByTestId('delete-org-confirm').click();
  await page.waitForURL('**/orgs');
}
