import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '@/client';
import { getMeQueryKey } from '@/client/@tanstack/react-query.gen';

/**
 * Sign the user out. Clears the `/me` query from the cache (not just invalidate —
 * an errored refetch keeps the last user, which would make the `/login` guard
 * think we're still signed in). Pass `onSuccess` to route away afterwards.
 */
export function useLogout({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout({ throwOnError: true }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: getMeQueryKey() });
      onSuccess?.();
    },
  });
}
