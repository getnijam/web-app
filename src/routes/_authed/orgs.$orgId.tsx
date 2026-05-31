import { createFileRoute, redirect } from '@tanstack/react-router';
import { getOrgOptions } from '@/client/@tanstack/react-query.gen';
import { AppShell } from '@/components/shell/AppShell';

/**
 * Org workspace layout. Loads the org (membership-checked server-side) and
 * renders the dashboard shell; a non-member / missing org bounces to the picker.
 */
export const Route = createFileRoute('/_authed/orgs/$orgId')({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(getOrgOptions({ path: { orgId: params.orgId } }));
    } catch {
      throw redirect({ to: '/orgs' });
    }
  },
  component: AppShell,
});
