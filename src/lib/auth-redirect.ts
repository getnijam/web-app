import { redirect } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { meQueryOptions } from '@/lib/me-query';

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
 * etc.): send already-signed-in users straight to the dashboard, or to `nextUrl`
 * when they arrived with one. The inverse of the `_authed` guard. **Not** used on
 * `/invite`, signed-in users accept invites there.
 */
export async function redirectAuthedToDashboard(
  queryClient: QueryClient,
  nextUrl?: string,
): Promise<void> {
  let me;
  try {
    me = await queryClient.ensureQueryData(meQueryOptions());
  } catch {
    return; // a network/unexpected error, let the auth page render
  }
  if (!me?.user) return; // guest (401 resolves to null), let the auth page render
  const next = safeNextPath(nextUrl);
  if (next) throw redirect({ to: next });
  // Land returning users straight on the org they last opened; first-timers (or anyone
  // whose last org is gone) get the picker, the org layout also bounces back to it.
  if (me.user.lastOrgId) {
    throw redirect({ to: '/orgs/$orgId/projects', params: { orgId: me.user.lastOrgId } });
  }
  throw redirect({ to: '/orgs' });
}
