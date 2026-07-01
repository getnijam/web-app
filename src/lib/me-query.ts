import { queryOptions } from '@tanstack/react-query';
import { getMe } from '@/client';
import { getMeQueryKey } from '@/client/@tanstack/react-query.gen';
import { isApiError } from '@/lib/api-error';
import type { GetMeResponse } from '@/client';

// The API's 401 codes for an absent / expired session, both mean "guest" here.
const GUEST_CODES = new Set(['UNAUTHORIZED', 'SESSION_EXPIRED']);

/**
 * The shared `/me` query, but a logged-out **401 resolves to `null` (guest) data**
 * instead of throwing. This is the single source of truth for "who is the signed-in
 * user" across public and dashboard code, and it keeps the **same queryKey** as the
 * generated `getMe` so login's `invalidateQueries` and logout's `resetQueries` still
 * drive it.
 *
 * Why guest-as-data matters: a query with an *error and no data* is refetched on every
 * mount (react-query always fetches when it has never had data, `refetchOnMount: false`
 * only skips refetching *stale data*). That made the home nav re-probe `/me` and flash
 * its auth skeleton every time a section remounted, e.g. switching the Install
 * framework tabs. Caching the guest state as `null` data keeps the query in `success`,
 * so `staleTime` applies and it fetches once per visit. Non-401 failures still throw.
 *
 * Callers that gate on auth check `me?.user` (null / undefined = guest), never a throw.
 */
export function meQueryOptions() {
  return queryOptions({
    queryKey: getMeQueryKey(),
    queryFn: async ({ signal }): Promise<GetMeResponse | null> => {
      const { data, error } = await getMe({ signal, throwOnError: false });
      if (data) return data;
      // Logged out: resolve to null (guest) data instead of erroring.
      if (isApiError(error) && GUEST_CODES.has(error.error.code)) return null;
      throw error ?? new Error('Failed to load session');
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
