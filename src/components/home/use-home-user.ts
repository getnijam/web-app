import { useQuery } from '@tanstack/react-query';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';

/**
 * The signed-in user on public pages, or `undefined` for guests. Reads the
 * session optimistically (a 401 just means "guest", so `retry: false`); the
 * query is cached, so multiple home sections share one request.
 */
export function useHomeUser() {
  const me = useQuery({ ...getMeOptions(), retry: false, staleTime: 5 * 60 * 1000 });
  return me.data?.user;
}
