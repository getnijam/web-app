import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { logout } from '@/client';
import { getMeQueryKey } from '@/client/@tanstack/react-query.gen';

/**
 * Sign the user out. **Resets** the `/me` query (not `invalidate` — an errored 401
 * refetch keeps the last successful user around; and not `remove` — that clears the
 * cache but doesn't notify *mounted* observers, so the public home nav would keep
 * showing the signed-in state). `reset` clears the cached user AND refetches any
 * active observer, so the home page (Nav/Hero/CTA) flips to its guest state in place,
 * while pages that route to `/login` afterwards still resolve as a guest. Pass
 * `onSuccess` to route away afterwards.
 */
export function useLogout({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout({ throwOnError: true }),
    onSuccess: () => {
      void queryClient.resetQueries({ queryKey: getMeQueryKey() });
      Sentry.setUser(null);
      onSuccess?.();
    },
  });
}
