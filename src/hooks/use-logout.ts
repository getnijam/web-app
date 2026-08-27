import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { logout } from '@/client';
import { getMeQueryKey } from '@/client/@tanstack/react-query.gen';
import { meQueryOptions } from '@/lib/me-query';
import { useStopImpersonation } from '@/hooks/use-impersonation';
import { track, resetAnalyticsUser } from '@/lib/betterstack';

/**
 * Sign the user out. **Resets** the `/me` query (not `invalidate`, an errored 401
 * refetch keeps the last successful user around; and not `remove`, that clears the
 * cache but doesn't notify *mounted* observers, so the public home nav would keep
 * showing the signed-in state). `reset` clears the cached user AND refetches any
 * active observer, so the home page (Nav/Hero/CTA) flips to its guest state in place,
 * while pages that route to `/login` afterwards still resolve as a guest. Pass
 * `onSuccess` to route away afterwards.
 *
 * **While impersonating, this stops the impersonation instead of signing out.** The
 * session belongs to the customer, not the operator, so destroying it would sign the
 * customer out of their own account and strand the operator logged out entirely. The
 * intent behind "sign out" here is always "stop being this person", so it returns the
 * operator to their own account, exactly like the impersonation bar's Stop button.
 */
export function useLogout({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
  const impersonating = Boolean(useQuery(meQueryOptions()).data?.impersonation);
  const stopImpersonation = useStopImpersonation();

  const signOut = useMutation({
    mutationFn: () => logout({ throwOnError: true }),
    onSuccess: () => {
      track('logged_out');
      void queryClient.resetQueries({ queryKey: getMeQueryKey() });
      Sentry.setUser(null);
      resetAnalyticsUser();
      onSuccess?.();
    },
  });

  // The two paths take different mutation variables, so expose the small surface every
  // caller actually uses instead of a union of two mutation objects.
  return {
    mutate: () => (impersonating ? stopImpersonation.mutate({}) : signOut.mutate()),
    isPending: impersonating ? stopImpersonation.isPending : signOut.isPending,
  };
}
