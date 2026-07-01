import { useQuery } from '@tanstack/react-query';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';

/**
 * The signed-in user for public / marketing pages, read optimistically: a 401 just
 * means "guest". One shared, cached request across every marketing section (Nav,
 * Hero, Install, CTA, ...):
 *  - `retry: false`, a 401 is the expected guest answer, not worth retrying (retries
 *    would keep the query `pending`, spinning the nav skeleton for the backoff window).
 *  - `refetchOnMount: false`, re-mounting a section must not re-fire /me. Switching the
 *    Install framework tabs remounts the snippet (which reads /me), and without this
 *    every tab click refetched /me and flashed the nav auth skeleton.
 *  - `staleTime`, a visit shares one answer.
 * Login / logout invalidate the query, so state still updates when it actually changes.
 */
export function useSessionUser() {
  return useQuery({
    ...getMeOptions(),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
}
