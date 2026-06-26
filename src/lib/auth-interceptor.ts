import type { AnyRouter } from '@tanstack/react-router';
import { client } from '@/client/client.gen';

// The `_authed` route roots. A runtime 401 only bounces to login when the user is
// actually inside the dashboard, so the guest `/me` probe on public pages and the
// login form's own 401 (wrong credentials) never trigger a redirect loop.
const AUTHED_PREFIXES = ['/orgs', '/profile'];

let redirecting = false;

/**
 * Send the user to `/login?nextUrl=<here>` whenever the API returns **401** while
 * they're inside the dashboard, e.g. their session expired mid-session. This is the
 * runtime counterpart to the `_authed` route gate (which only fires at navigation
 * time); together they cover both "load a page logged out" and "session dies while on
 * a page". Registered once, after the router exists, so it can navigate in-SPA.
 */
export function registerAuthInterceptor(router: AnyRouter): void {
  client.interceptors.response.use((response) => {
    if (response.status !== 401) return response;

    const { pathname, href } = router.state.location;
    const onAuthedRoute = AUTHED_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
    if (!onAuthedRoute || redirecting) return response;

    // `href` is a same-origin relative path (pathname + search), so it's a safe
    // `nextUrl` to return the user to once they sign back in.
    redirecting = true;
    void router.navigate({ to: '/login', search: { nextUrl: href } }).finally(() => {
      redirecting = false;
    });
    return response;
  });
}
