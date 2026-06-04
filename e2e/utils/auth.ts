import { type Page } from '@playwright/test';

/**
 * Log in with an email + password. On success the app lands on the org picker
 * (`/orgs`), which this waits for before returning.
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/orgs');
}
