import { type Page, type Locator, expect } from '@playwright/test';
import { openOrgProjects } from './nav';

/** The project's card link in the list, matched by its visible name. */
function projectCard(page: Page, project: string): Locator {
  return page.locator('a[href*="/projects/"]').filter({ hasText: project }).first();
}

/**
 * Create a project (by name) inside an org (by name). Navigates into the org, opens
 * the "New project" dialog, submits, and waits for the new project's card to appear.
 */
export async function createProject(
  page: Page,
  { org, project }: { org: string; project: string },
): Promise<void> {
  await openOrgProjects(page, org);
  await page.getByTestId('create-project-trigger').click();
  await page.getByTestId('create-project-name').fill(project);
  await page.getByTestId('create-project-submit').click();
  await expect(projectCard(page, project)).toBeVisible();
}

/**
 * Delete a project (by name) inside an org (by name). Opens the project, jumps to its
 * settings, types the project name to confirm, and waits for the return to the list.
 */
export async function deleteProject(
  page: Page,
  { org, project }: { org: string; project: string },
): Promise<void> {
  await openOrgProjects(page, org);
  await projectCard(page, project).click();
  await page.waitForURL(/\/orgs\/[^/]+\/projects\/[^/]+\/runs/);
  // The project's settings share the project route — swap `/runs` for `/settings`.
  await page.goto(page.url().replace(/\/runs.*$/, '/settings'));
  await page.getByTestId('delete-project-trigger').click();
  await page.getByTestId('delete-project-input').fill(project);
  await page.getByTestId('delete-project-confirm').click();
  await page.waitForURL('**/projects');
}
