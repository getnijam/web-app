import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';

export const Route = createFileRoute('/_authed')({
  // Gate every nested route behind /v1/auth/me. Redirect to /login on 401.
  // The dashboard shell lives in the org layout (orgs.$orgId), not here, so the
  // org picker (/orgs) renders without it.
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(getMeOptions());
    } catch {
      throw redirect({ to: '/login' });
    }
  },
  component: () => <Outlet />,
});
