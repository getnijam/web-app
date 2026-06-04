import { type Page } from '@playwright/test';

/**
 * Internal navigation helpers shared by the action utils — not actions themselves.
 */

/** Pull the org id out of an `/orgs/<id>/…` URL. */
export function orgIdFromUrl(url: string): string {
  const match = url.match(/\/orgs\/([^/?#]+)/);
  if (!match) throw new Error(`No orgId found in URL: ${url}`);
  return match[1]!;
}

/**
 * From the org picker, open an org by name and land on its project list.
 * Returns the org id (read back from the resulting URL).
 *
 * Org rows link to `/orgs/<id>/projects` (exact suffix), which also disambiguates
 * them from project cards (`/orgs/<id>/projects/<id>/runs`).
 */
export async function openOrgProjects(page: Page, org: string): Promise<string> {
  await page.goto('/orgs');
  await page.locator('a[href$="/projects"]').filter({ hasText: org }).first().click();
  await page.waitForURL('**/projects');
  return orgIdFromUrl(page.url());
}
