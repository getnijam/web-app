import { createFileRoute, redirect } from '@tanstack/react-router';
import { setMyLastOrg } from '@/client';
import type { UserPublic } from '@/client';
import { getOrgOptions, getMeQueryKey } from '@/client/@tanstack/react-query.gen';
import { AppShell } from '@/components/shell/AppShell';

/**
 * Org workspace layout. Loads the org (membership-checked server-side) and
 * renders the dashboard shell; a non-member / missing org bounces to the picker.
 */
export const Route = createFileRoute('/_authed/orgs/$orgId')({
  loader: async ({ context, params }) => {
    const { queryClient } = context;
    try {
      await queryClient.ensureQueryData(getOrgOptions({ path: { orgId: params.orgId } }));
    } catch {
      throw redirect({ to: '/orgs' });
    }

    // Remember this as the user's last-opened org so the next sign-in lands here.
    // Deduped against the cached value and fired non-blocking (last-org is a
    // convenience — never delay the page or fail navigation on it); the /me cache is
    // updated on success so it won't re-fire while the user stays in this org.
    const me = queryClient.getQueryData<{ user: UserPublic }>(getMeQueryKey());
    if (me && me.user.lastOrgId !== params.orgId) {
      void setMyLastOrg({ body: { orgId: params.orgId } })
        .then((res) => {
          if (res.data) queryClient.setQueryData(getMeQueryKey(), res.data);
        })
        .catch(() => {});
    }
  },
  component: AppShell,
});
