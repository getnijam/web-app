import { useEffect } from 'react';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from '@tanstack/react-router';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { FullPageError } from '@/components/states/FullPageError';
import { RouteProgress } from '@/components/shell/RouteProgress';
import { useDeploymentUpdateNotice } from '@/hooks/use-deployment-update';
import { registerAuthInterceptor } from '@/lib/auth-interceptor';
import { baseHead } from '@/lib/seo';
import appCss from '@/styles/globals.css?url';

export interface RouterContext {
  queryClient: QueryClient;
}

// Applies the saved theme before first paint to avoid a light->dark flash, mirrors
// src/components/theme/ThemeProvider.tsx (key + resolution). Injected into the SSR'd
// <head> as a raw script so it runs before hydration; it is inert text on the server.
const THEME_NO_FLASH = `(function () {
  try {
    var t = localStorage.getItem('nijam-theme');
    var dark = t === 'dark' || ((!t || t === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();`;

export const Route = createRootRouteWithContext<RouterContext>()({
  // Site-wide fallback head so no tab is ever titleless. Public routes override with
  // full seo() (OG/canonical); dashboard routes override with privateSeo() (noindex).
  // Charset/viewport/icon + the app stylesheet are declared here so SSR emits them.
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...baseHead().meta,
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  // Watch for a newer deployment and raise a Reload toast (no-op in dev).
  useDeploymentUpdateNotice();
  // Bounce to /login on any runtime 401 inside the dashboard. Idempotent, so the
  // StrictMode double-invoke and any re-render are safe.
  useEffect(() => registerAuthInterceptor(router), [router]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_NO_FLASH }} />
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={200}>
              <Sentry.ErrorBoundary
                fallback={({ error, resetError }) => (
                  <FullPageError error={error} onReset={resetError} />
                )}
              >
                <Outlet />
              </Sentry.ErrorBoundary>
            </TooltipProvider>
          </QueryClientProvider>
          <Toaster />
        </ThemeProvider>
        <RouteProgress />
        <Scripts />
      </body>
    </html>
  );
}
