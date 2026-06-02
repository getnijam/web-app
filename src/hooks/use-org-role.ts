import { useQuery } from '@tanstack/react-query';
import { getOrgOptions } from '@/client/@tanstack/react-query.gen';

/**
 * The signed-in user's role in `orgId` ('admin' | 'member'), or undefined until
 * the org query resolves. The org layout (`orgs.$orgId.tsx`) prefetches `getOrg`,
 * so this is normally a cache read. Drives admin-only UI; the API enforces too.
 */
export function useOrgRole(orgId: string): 'admin' | 'member' | undefined {
  return useQuery(getOrgOptions({ path: { orgId } })).data?.role;
}

/** True only once the role is known to be 'admin' (false while loading). */
export function useIsOrgAdmin(orgId: string): boolean {
  return useOrgRole(orgId) === 'admin';
}
