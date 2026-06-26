import { useEffect } from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';
import { identify } from '@/lib/betterstack';
import { DashboardNotFound } from '@/components/states/DashboardNotFound';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed')({
  // Every dashboard page is noindex + gets a baseline title. Leaf routes override
  // the title; this guarantees none are titleless or indexable even if one is missed.
  head: () => privateSeo('Dashboard'),
  // Gate every nested route behind /v1/auth/me. Redirect to /login on 401, keeping
  // the intended URL as `?nextUrl=` so login can send them straight back to it.
  // The dashboard shell lives in the org layout (orgs.$orgId), not here, so the
  // org picker (/orgs) renders without it.
  beforeLoad: async ({ context, location }) => {
    try {
      await context.queryClient.ensureQueryData(getMeOptions());
    } catch {
      throw redirect({ to: '/login', search: { nextUrl: location.href } });
    }
  },
  // Dashboard-scoped 404: unmatched authed routes render the in-app 404 instead of
  // bubbling to the public marketing 404 (Nav + Footer). Org-scoped 404s use the org
  // layout's own notFoundComponent so the shell (sidebar/topbar) stays.
  notFoundComponent: DashboardNotFound,
  component: AuthedLayout,
});

function AuthedLayout() {
  // getMe is already in cache (beforeLoad ensured it), tag Sentry events with the
  // signed-in user so dashboard errors carry who hit them. Cleared on logout.
  const user = useQuery({ ...getMeOptions(), retry: false }).data?.user;
  useEffect(() => {
    Sentry.setUser(user ? { id: user.id, email: user.email } : null);
    if (user) identify({ id: user.id, email: user.email });
  }, [user]);
  return <Outlet />;
}
