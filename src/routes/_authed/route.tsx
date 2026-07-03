import { useEffect } from 'react';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { LOGIN_ROUTE } from '@/lib/routes';
import { useQuery } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { meQueryOptions } from '@/lib/me-query';
import { identify } from '@/lib/betterstack';
import { DashboardNotFound } from '@/components/states/DashboardNotFound';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed')({
  // The dashboard stays client-rendered: it's cookie-authed and API-heavy, so SSR
  // would mean forwarding the session cookie to the API on every loader. ssr:false
  // keeps the whole subtree client-only, beforeLoad (getMe) runs in the browser with
  // the cookie, exactly as before. Public/marketing routes still SSR for SEO.
  ssr: false,
  // Every dashboard page is noindex + gets a baseline title. Leaf routes override
  // the title; this guarantees none are titleless or indexable even if one is missed.
  head: () => privateSeo('Dashboard'),
  // Gate every nested route behind /v1/auth/me. Redirect to /login on 401, keeping
  // the intended URL as `?nextUrl=` so login can send them straight back to it.
  // The dashboard shell lives in the org layout (orgs.$orgId), not here, so the
  // org picker (/orgs) renders without it.
  beforeLoad: async ({ context, location }) => {
    let me;
    try {
      me = await context.queryClient.ensureQueryData(meQueryOptions());
    } catch {
      throw redirect({ to: LOGIN_ROUTE, search: { nextUrl: location.href } });
    }
    // A 401 resolves to null (guest), not a throw, so gate on the user's presence.
    if (!me?.user) throw redirect({ to: LOGIN_ROUTE, search: { nextUrl: location.href } });
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
  const user = useQuery(meQueryOptions()).data?.user;
  useEffect(() => {
    Sentry.setUser(user ? { id: user.id, email: user.email } : null);
    if (user) identify({ id: user.id, email: user.email });
  }, [user]);
  return <Outlet />;
}
