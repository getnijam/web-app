import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { client } from '@/client/client.gen';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Flex } from '@/components/ui/flex';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { LoadingState } from '@/components/states/LoadingState';
import { FullPageError } from '@/components/states/FullPageError';
import { initSentry } from '@/lib/sentry';
import * as Sentry from '@sentry/react';
import { routeTree } from './routeTree.gen';
import './styles/globals.css';

// Wire up error monitoring before anything renders (no-op in dev / without a DSN).
initSentry();

// Point the generated client at the API and send the session cookie.
client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  // Covers the window after React mounts while the auth gate (/v1/auth/me) and
  // route loaders resolve — so a refresh shows a spinner, never a blank screen.
  defaultPendingComponent: () => (
    <Flex align="center" justify="center" className="min-h-screen bg-background">
      <LoadingState message={null} />
    </Flex>
  ),
  defaultPendingMs: 0,
  // Route render/loader crashes: report to Sentry + show a full-page error.
  defaultErrorComponent: ({ error, reset }) => (
    <FullPageError error={error} onReset={reset} capture />
  ),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

// Drop the static homepage SEO fallbacks from index.html (they exist for non-JS
// scrapers). The router's per-route <HeadContent /> now owns the document head, so
// removing these before mount prevents duplicate title/description/OG tags.
document.querySelectorAll('head [data-seo-default]').forEach((el) => el.remove());

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <Sentry.ErrorBoundary
            fallback={({ error, resetError }) => (
              <FullPageError error={error} onReset={resetError} />
            )}
          >
            <RouterProvider router={router} />
          </Sentry.ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
);
