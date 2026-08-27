import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import * as Sentry from '@sentry/react';
import {
  startImpersonationMutation,
  stopImpersonationMutation,
} from '@/client/@tanstack/react-query.gen';
import { identify } from '@/lib/betterstack';
import { ORGS_ROUTE } from '@/lib/routes';
import { notify } from '@/lib/notify';
import type { UserPublic } from '@/client';

/**
 * Both impersonation mutations change WHO the session belongs to, which makes the
 * entire query cache stale in a way `invalidateQueries` can't express: the cached orgs,
 * projects and runs belong to the previous identity, and the current URL almost
 * certainly points at an org the new identity can't see.
 *
 * So on either transition we `clear()` the whole cache and route to `/orgs`, which then
 * forwards on via the new user's `lastOrgId`, exactly the post-login landing behaviour.
 */
function useIdentitySwap(label: (user: UserPublic) => string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return async function swap(user: UserPublic) {
    // Cancel first: an in-flight request issued under the OLD cookie would otherwise
    // resolve after the swap and repopulate the cache with the previous identity.
    await queryClient.cancelQueries();
    // `reset`, NOT `clear`. Both drop the cached data, but `clear` (like `remove`)
    // does not notify **mounted** observers, so every component holding a query stays
    // frozen on the old identity: the session was the impersonated user server-side
    // while `ImpersonationBar` still saw `impersonation: null` and rendered nothing.
    // `reset` clears AND refetches active observers, so the whole tree re-renders
    // against the new identity. Same reasoning as `useLogout`.
    await queryClient.resetQueries();
    Sentry.setUser({ id: user.id, email: user.email });
    identify({ id: user.id, email: user.email });
    await navigate({ to: ORGS_ROUTE, replace: true });
    notify.success(label(user));
  };
}

/** Start impersonating a user by id. Internal users only; the API enforces that. */
export function useStartImpersonation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const swap = useIdentitySwap((user) => `You are now signed in as ${user.email}`);
  return useMutation({
    ...startImpersonationMutation(),
    onSuccess: async (data) => {
      onSuccess?.();
      await swap(data.user);
    },
  });
}

/** End the current impersonation session and return to your own account. */
export function useStopImpersonation() {
  const swap = useIdentitySwap((user) => `Signed back in as ${user.email}`);
  return useMutation({
    ...stopImpersonationMutation(),
    onSuccess: (data) => swap(data.user),
  });
}
