import { type Page } from '@playwright/test';

/**
 * Log in with an email + password. The form is identity-first: enter the email and
 * Continue, then the password field appears (it's skipped entirely for SSO domains).
 * On success the app lands on the org picker (`/orgs`), which this waits for.
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-continue').click();
  // The password step only renders after the email step resolves (SSO discovery),
  // so fill() auto-waits for it to appear.
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/orgs');
}
