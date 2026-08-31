/**
 * Reads real inbound email from Resend, so the signup spec can complete verification
 * the way a person does rather than by reaching into the database.
 *
 * It has to be real mail: `issueVerificationToken` stores only `hashToken(rawToken)`
 * and never persists the raw token, so there is nothing to read out of Postgres. The
 * token exists in exactly one place, the email.
 *
 * Setup, once:
 *   1. Add a RECEIVING subdomain in Resend (e.g. inbox.nijam.dev) and add its MX
 *      records. Keep it separate from the subdomain you send from.
 *   2. Resend accepts mail for ANY local part on that domain (catch-all), which is
 *      what lets every run use a fresh address with no per-test setup.
 *   3. Set NIJAM_E2E_INBOX_DOMAIN and NIJAM_E2E_RESEND_API_KEY.
 */

const API = 'https://api.resend.com/emails/receiving';

export const inboxDomain = process.env.NIJAM_E2E_INBOX_DOMAIN ?? '';
export const inboxKey = process.env.NIJAM_E2E_RESEND_API_KEY ?? '';

/** Whether the inbound-email specs can run at all. */
export const inboxConfigured = Boolean(inboxDomain && inboxKey);

/**
 * A fresh address per run. Unique local parts matter for more than tidiness: the list
 * endpoint has no recipient filter, so we page through recent mail and match on `to`
 * ourselves, and a shared address would make that ambiguous.
 */
export function uniqueTestEmail(prefix = 'e2e'): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${stamp}-${rand}@${inboxDomain}`;
}

interface ReceivedSummary {
  id: string;
  to: string[];
  subject: string;
  created_at: string;
}

interface ReceivedDetail {
  id: string;
  html: string | null;
  text: string | null;
}

async function resendGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${inboxKey}` },
  });
  if (!res.ok) {
    throw new Error(`Resend ${path} responded ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

/** The most recent message addressed to `address`, received at or after `since`. */
async function findMessage(address: string, since: number): Promise<ReceivedSummary | null> {
  const { data } = await resendGet<{ data: ReceivedSummary[] }>('?limit=100');
  const target = address.toLowerCase();
  const matches = (data ?? []).filter(
    (m) =>
      (m.to ?? []).some((t) => t.toLowerCase() === target) &&
      // Guard against a stale message from an earlier run reusing an address.
      new Date(m.created_at).getTime() >= since - 60_000,
  );
  if (matches.length === 0) return null;
  matches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return matches[0]!;
}

/**
 * Wait for the verification email and return its raw token.
 *
 * Returns the TOKEN, not the link, deliberately. The emailed URL is built from the
 * API's own `WEB_URL`, which is whatever that deployment is configured with and need
 * not match the base URL this test run is pointed at. Following it blindly would send
 * a local run to production, or the reverse. The caller rebuilds the URL against its
 * own baseURL instead.
 */
export async function waitForVerificationToken(
  address: string,
  opts: { timeoutMs?: number; pollMs?: number } = {},
): Promise<string> {
  const timeoutMs = opts.timeoutMs ?? 90_000;
  const pollMs = opts.pollMs ?? 2_000;
  const since = Date.now();
  const deadline = since + timeoutMs;

  while (Date.now() < deadline) {
    const summary = await findMessage(address, since);
    if (summary) {
      const detail = await resendGet<ReceivedDetail>(`/${summary.id}`);
      const body = `${detail.html ?? ''}\n${detail.text ?? ''}`;
      // The template renders the link twice (a button href and a pasteable copy), so
      // a single match is enough; both carry the same token.
      const match = body.match(/[?&]token=([A-Za-z0-9._~-]+)/);
      if (match?.[1]) return match[1];
      throw new Error(
        `Received "${summary.subject}" for ${address} but found no token in it. ` +
          `The verification email template may have changed.`,
      );
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }

  throw new Error(
    `No verification email for ${address} within ${timeoutMs / 1000}s. ` +
      `Check that the API this run points at has RESEND_API_KEY and EMAIL_FROM set: ` +
      `without them it never sends, and the signup itself still succeeds.`,
  );
}
