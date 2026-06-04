import { redirect } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';

/**
 * Validate a post-login redirect target. Allows only a **same-origin relative path**
 * (starts with `/`, not protocol-relative `//`) so a crafted `?nextUrl=` can't bounce
 * users to an external site. Returns undefined for anything unsafe/absent.
 */
export function safeNextPath(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return undefined;
  }
  return value;
}

/**
 * `beforeLoad` guard for the public auth pages (login / signup / verify / reset
 * etc.): send already-signed-in users straight to the dashboard — or to `nextUrl`
 * when they arrived with one. The inverse of the `_authed` guard. **Not** used on
 * `/invite` — signed-in users accept invites there.
 */
export async function redirectAuthedToDashboard(
  queryClient: QueryClient,
  nextUrl?: string,
): Promise<void> {
  try {
    await queryClient.ensureQueryData(getMeOptions());
  } catch {
    return; // a 401 means guest — let the auth page render
  }
  throw redirect({ to: safeNextPath(nextUrl) ?? '/orgs' });
}
