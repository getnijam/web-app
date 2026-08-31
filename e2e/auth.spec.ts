import { test, expect, type Page } from '@playwright/test';
import { login } from './utils/auth';
import { inboxConfigured, uniqueTestEmail, waitForVerificationToken } from './utils/inbox';

const PASSWORD = 'e2e-Passw0rd!verify';

/**
 * Signup and sign-in, verified through real inbound email.
 *
 * The email round trip is not gratuitous. `issueVerificationToken` persists only
 * `hashToken(rawToken)`, so the raw token exists nowhere but the message itself; there
 * is no database shortcut to take. See e2e/utils/inbox.ts for the Resend setup.
 *
 * Each test creates its own account and deletes it at the end, so runs leave nothing
 * behind and never collide.
 */

/** Delete the signed-in account, so a run leaves no user behind even if it failed. */
async function deleteAccount(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/profile/danger');
  await page.getByRole('button', { name: 'Delete my account' }).click();
  await page.locator('#delete-confirm').fill(email);
  await page.locator('#delete-password').fill(password);
  await page.getByRole('button', { name: 'Delete account', exact: true }).click();
  await page.waitForURL(/\/(login|)$/, { timeout: 15_000 });
}

test.describe('Signup', () => {
  test.skip(
    !inboxConfigured,
    'Set NIJAM_E2E_INBOX_DOMAIN and NIJAM_E2E_RESEND_API_KEY to run the inbound-email specs.',
  );

  test('sign up, verify by email, land signed in', async ({ page }) => {
    const email = uniqueTestEmail();

    await page.goto('/signup');
    await page.getByTestId('signup-name').fill('E2E Signup');
    await page.getByTestId('signup-email').fill(email);
    await page.getByTestId('signup-password').fill(PASSWORD);
    await page.getByTestId('signup-submit').click();

    // Signup succeeds whether or not the mail actually goes out, so this assertion is
    // not evidence the email was sent. The wait below is.
    await expect(page.getByText('Check your inbox')).toBeVisible({ timeout: 15_000 });

    // Rebuild the URL against THIS run's base URL rather than following the emailed
    // link, which carries the API's own WEB_URL and may point somewhere else entirely.
    const token = await waitForVerificationToken(email);
    await page.goto(`/verify?token=${token}`);
    await expect(page.getByText('Email verified')).toBeVisible({ timeout: 15_000 });

    // Verified accounts are signed in and land on the org picker.
    await page.waitForURL(/\/orgs(\/|$|\?)/, { timeout: 15_000 });

    await deleteAccount(page, email, PASSWORD);
  });

  test('a used verification link cannot be replayed', async ({ page }) => {
    const email = uniqueTestEmail();

    await page.goto('/signup');
    await page.getByTestId('signup-name').fill('E2E Replay');
    await page.getByTestId('signup-email').fill(email);
    await page.getByTestId('signup-password').fill(PASSWORD);
    await page.getByTestId('signup-submit').click();

    const token = await waitForVerificationToken(email);
    await page.goto(`/verify?token=${token}`);
    await expect(page.getByText('Email verified')).toBeVisible({ timeout: 15_000 });

    // Tokens are single-use. A second visit must not silently succeed, which is the
    // failure mode that would matter if the token ever leaked from an inbox.
    await page.goto(`/verify?token=${token}`);
    await expect(page.getByText('Email verified')).toBeHidden();
    await expect(page.getByText(/invalid link|link expired/i)).toBeVisible({ timeout: 15_000 });

    await login(page, email, PASSWORD);
    await deleteAccount(page, email, PASSWORD);
  });
});

test.describe('Sign in', () => {
  test.skip(
    !inboxConfigured,
    'Set NIJAM_E2E_INBOX_DOMAIN and NIJAM_E2E_RESEND_API_KEY to run the inbound-email specs.',
  );

  test('wrong password is refused, right password signs in and persists', async ({ page }) => {
    const email = uniqueTestEmail();

    // A verified account of our own, so this spec never depends on a shared fixture
    // user whose password someone might rotate.
    await page.goto('/signup');
    await page.getByTestId('signup-name').fill('E2E Signin');
    await page.getByTestId('signup-email').fill(email);
    await page.getByTestId('signup-password').fill(PASSWORD);
    await page.getByTestId('signup-submit').click();
    const token = await waitForVerificationToken(email);
    await page.goto(`/verify?token=${token}`);
    await expect(page.getByText('Email verified')).toBeVisible({ timeout: 15_000 });

    // Drop the session rather than driving the UI: `AccountMenu` only renders in the
    // marketing nav and the settings layout, not on /orgs where verification lands, so
    // a sign-out click here would be looking for a button that is not on the page. This
    // also exercises the _authed gate, which should bounce a session-less visit.
    await page.context().clearCookies();
    await page.goto('/orgs');
    await page.waitForURL(/\/login/, { timeout: 15_000 });

    // Identity-first: the password field only appears after the email step resolves.
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-continue').click();
    await page.getByTestId('login-password').fill('definitely-not-the-password');
    await page.getByTestId('login-submit').click();

    // The message must not reveal whether the account exists.
    await expect(page.getByText(/invalid|incorrect|check your details/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/login/);

    await page.getByTestId('login-password').fill(PASSWORD);
    await page.getByTestId('login-submit').click();
    await page.waitForURL(/\/orgs(\/|$|\?)/, { timeout: 15_000 });

    // The session must survive a reload, not just the redirect after login.
    await page.reload();
    await expect(page).toHaveURL(/\/orgs(\/|$|\?)/);

    await deleteAccount(page, email, PASSWORD);
  });
});
