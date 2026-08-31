import { expect, type Page } from '@playwright/test';

/**
 * Where login can land. A first-time account (no `lastOrgId`) gets the org picker at
 * `/orgs`; a returning one is sent straight into its last org at
 * `/orgs/<id>/projects`. Matches both, and nothing else.
 */
const LANDING_URL = /\/orgs(\/|$|\?)/;

/**
 * Log in with an email + password. The form is identity-first: enter the email and
 * Continue, then the password field appears (it's skipped entirely for SSO domains).
 *
 * On success the app lands **either** on the org picker (`/orgs`) or straight in the
 * account's last-opened org (`/orgs/<id>/projects`), decided by `users.last_org_id`
 * in `login.tsx`. Waiting on `/orgs` alone made this helper self-poisoning: the very
 * first run left a `lastOrgId` behind, so every run after it timed out waiting for a
 * picker the app had already skipped.
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await submitLogin(page, email, password);
  await page.waitForURL(LANDING_URL);
}

/**
 * Walk the login form and submit, without asserting what happens next. Split out of
 * `login` so the rejected path can reuse it: the identity-first sequence is the same
 * either way, and only the expected outcome differs.
 */
export async function submitLogin(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-continue').click();
  // The password step only renders after the email step resolves (SSO discovery),
  // so fill() auto-waits for it to appear.
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
}

/**
 * Submit a login that should NOT succeed, and assert it was refused.
 *
 * Also asserts the message does not name the reason. The API answers an unknown email
 * and a wrong password identically (INVALID_CREDENTIALS) so the form cannot be used to
 * discover whether an address has an account; a copy change that started distinguishing
 * them would quietly undo that, and this is where it gets caught.
 */
export async function expectLoginRejected(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await submitLogin(page, email, password);
  await expect(page.getByText(/invalid|incorrect|check your details/i)).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText(/no account|not found|does not exist|unregistered/i)).toBeHidden();
  await expect(page).toHaveURL(/\/login/);
}
