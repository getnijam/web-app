import { test, expect, type Page } from '@playwright/test';
import { expectLoginRejected, login } from './utils/auth';
import { inboxConfigured, uniqueTestEmail, waitForVerificationToken } from './utils/inbox';

const PASSWORD = 'e2e-Passw0rd!verify';
const FIXTURE_EMAIL = process.env.NIJAM_E2E_EMAIL ?? '';

// Real email delivery dominates the wall clock here: `waitForVerificationToken` alone
// allows 90s, and the sign-in spec pays that plus two login attempts and cleanup. The
// 30s default cannot cover it, and the failure it produces is a bare "Test timeout"
// that says nothing about email.
test.describe.configure({ timeout: 180_000 });

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

/**
 * Submit the signup form and confirm it was accepted.
 *
 * The rate limiter is the reason this is a helper. It is in-memory and per IP, so a few
 * consecutive runs against the same API exhaust it, and the form then simply stays put.
 * Asserting "Check your inbox" alone reports that as `element(s) not found`, which sends
 * you looking at selectors instead of at a 429. Race the two outcomes and name the real
 * one.
 */
async function submitSignup(page: Page, name: string, email: string): Promise<void> {
  await page.goto('/signup');
  await page.getByTestId('signup-name').fill(name);
  await page.getByTestId('signup-email').fill(email);
  await page.getByTestId('signup-password').fill(PASSWORD);
  await page.getByTestId('signup-submit').click();

  const accepted = page.getByText('Check your inbox');
  const rejected = page.getByText(/too many attempts/i);
  await expect(accepted.or(rejected)).toBeVisible({ timeout: 15_000 });
  if (await rejected.isVisible()) {
    throw new Error(
      'Signup was rate limited (429). The API limiter is in-memory and per IP: restart ' +
        'the API to clear it, or wait a few minutes between runs.',
    );
  }
}

/** Set by each test right after signup, so cleanup runs even when the test fails. */
let created: { email: string; password: string } | null = null;

/**
 * Cleanup has to be an afterEach, not a final line in each test. The first failure most
 * people will hit is a send-only Resend key, which throws on the first inbox poll, after
 * signup has already created the account. A trailing cleanup call never runs in that
 * path, so every failed attempt would leave an orphan behind.
 */
test.afterEach(async ({ page }) => {
  if (!created) return;
  const { email, password } = created;
  created = null;
  try {
    // Verifying does not sign you in, and a failed test may have left no session, so
    // /profile/danger is not reliably reachable. Sign in only when we actually get
    // bounced, rather than paying for a login after every test.
    await page.goto('/profile/danger');
    if (/\/login/.test(page.url())) await login(page, email, password);
    await deleteAccount(page, email, password);
  } catch {
    // An account that never got verified cannot sign in, so it cannot be deleted this
    // way. Say which one, rather than failing the run a second time over cleanup.
    console.warn(`[cleanup] left ${email} behind, delete it by hand`);
  }
});

/** Delete the signed-in account. */
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
    'Set RESEND_INBOX_DOMAIN and RESEND_API_KEY to run the inbound-email specs.',
  );

  test('sign up, verify by email, replay the link, land signed in', async ({ page }) => {
    const email = uniqueTestEmail();

    await submitSignup(page, 'E2E Signup', email);
    created = { email, password: PASSWORD };

    // Reaching this point is not evidence the email was sent, only that signup was
    // accepted. The wait below is what proves delivery.

    // Rebuild the URL against THIS run's base URL rather than following the emailed
    // link, which carries the API's own WEB_URL and may point somewhere else entirely.
    const token = await waitForVerificationToken(email);
    await page.goto(`/verify?token=${token}`);
    await expect(page.getByText('Email verified')).toBeVisible({ timeout: 15_000 });

    // Visiting the same link again must still read as verified. `verify.tsx` catches
    // VERIFICATION_TOKEN_USED and shows success on the reasoning that a second visit is
    // almost always a double click, and erroring at someone for succeeding is hostile.
    // The token is still single-use server-side; this asserts the UI's deliberate
    // softening of it, so a change that starts erroring on a double click gets caught.
    // Folded in here rather than given its own test: a separate test would mean a
    // separate signup, and signupLimit is 5/hour per IP, which two runs would exceed.
    await page.goto(`/verify?token=${token}`);
    await expect(page.getByText('Email verified')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/invalid link|link expired/i)).toBeHidden();

    // Verifying does not create a session; it hands you to sign-in. Follow that through
    // so the test proves the account is actually usable, not merely marked verified.
    await page.getByRole('link', { name: 'Continue to sign in' }).click();
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await login(page, email, PASSWORD);
    await page.waitForURL(/\/orgs(\/|$|\?)/, { timeout: 15_000 });

    // The session must survive a reload, not just the redirect straight after login.
    await page.reload();
    await expect(page).toHaveURL(/\/orgs(\/|$|\?)/);
  });
});

test.describe('Sign in', () => {
  // Deliberately uses the existing fixture account rather than creating one. A wrong
  // password needs *an* account, not a fresh one, and `signupLimit` is 5/hour per IP:
  // every signup this suite spends is one a re-run cannot. The positive path (right
  // password, session persists) is covered by the signup journey above, on an account
  // that test already had to create.
  test.skip(!FIXTURE_EMAIL, 'Set NIJAM_E2E_EMAIL to run.');

  test('a wrong password is refused without revealing the account exists', async ({ page }) => {
    await expectLoginRejected(page, FIXTURE_EMAIL, 'definitely-not-the-password');
  });
});
