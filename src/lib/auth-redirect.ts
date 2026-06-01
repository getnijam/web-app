import { redirect } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';

/**
 * `beforeLoad` guard for the public auth pages (login / signup / verify / reset
 * etc.): send already-signed-in users straight to the dashboard. The inverse of
 * the `_authed` guard. **Not** used on `/invite` — signed-in users accept invites
 * there.
 */
export async function redirectAuthedToDashboard(queryClient: QueryClient): Promise<void> {
  try {
    await queryClient.ensureQueryData(getMeOptions());
  } catch {
    return; // a 401 means guest — let the auth page render
  }
  throw redirect({ to: '/orgs' });
}
