import { type Page, expect } from '@playwright/test';
import { openOrgProjects } from './nav';

/** A key's "Revoke <name>" icon button in the list, matched by its accessible name. */
function revokeButton(page: Page, key: string) {
  return page.getByRole('button', { name: `Revoke ${key}` });
}

/**
 * Create an **org-scoped ingestion key** (by name) in an org (by name). Opens the
 * org's Secret keys page (which lands on the Ingestion tab), submits the create
 * dialog with the default Organization scope, dismisses the one-time token reveal,
 * and waits for the new key's row to appear.
 */
export async function createIngestKey(
  page: Page,
  { org, key }: { org: string; key: string },
): Promise<void> {
  const orgId = await openOrgProjects(page, org);
  await page.goto(`/orgs/${orgId}/keys`); // redirects to /keys/ingestion
  await page.getByTestId('create-key-trigger').click();
  await page.getByTestId('create-key-name').fill(key);
  // Scope defaults to "Organization" — no project needed.
  await page.getByTestId('create-key-submit').click();
  // The reveal step shows the token once; dismiss it.
  await page.getByTestId('create-key-done').click();
  await expect(revokeButton(page, key)).toBeVisible();
}

/**
 * Revoke (delete) a secret key (by name) in an org (by name). Opens the key's
 * confirm dialog, confirms, and waits for the row to disappear.
 */
export async function deleteSecretKey(
  page: Page,
  { org, key }: { org: string; key: string },
): Promise<void> {
  const orgId = await openOrgProjects(page, org);
  await page.goto(`/orgs/${orgId}/keys/ingestion`);
  const revoke = revokeButton(page, key);
  await revoke.click();
  await page.getByTestId('revoke-key-confirm').click();
  await expect(revoke).toBeHidden();
}
