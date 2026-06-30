import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { client } from '@/client/client.gen';
import { logNetworkError } from '@/lib/network-logging';
import { Flex } from '@/components/ui/flex';
import { LoadingState } from '@/components/states/LoadingState';
import { FullPageError } from '@/components/states/FullPageError';
import { NotFound } from '@/components/states/NotFound';
import { routeTree } from './routeTree.gen';

// Point the generated client at the API and send the session cookie. Module scope so
// it's set on both the SSR pass and the client (harmless on the server, public routes
// never fetch there). VITE_API_URL is inlined at build time on both sides.
client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
});

/**
 * The router factory TanStack Start calls per request (server) and once (client).
 * Creating the QueryClient *inside* the factory keeps server requests isolated (no
 * cross-request cache leak); the same instance is handed to the route context and to
 * the QueryClientProvider in the root document so loaders and `useQuery` share it.
 */
export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
    // Log every non-2xx network call (and network failures) in one place; the generated
    // client uses throwOnError, so these caches' onError fires for exactly the non-2xx outcomes.
    queryCache: new QueryCache({
      onError: (error, query) => logNetworkError('query', error, query.queryKey),
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) =>
        logNetworkError('mutation', error, mutation.options.mutationKey),
    }),
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // Covers the window while the auth gate (/v1/auth/me) and route loaders resolve, so
    // a navigation shows a spinner, never a blank screen. `h-full` fills whatever it's
    // nested in (viewport on cold load, the shell's content area on a route change).
    defaultPendingComponent: () => (
      <Flex align="center" justify="center" className="h-full bg-background">
        <LoadingState message={null} />
      </Flex>
    ),
    defaultPendingMs: 0,
    // Route render/loader crashes: report to Sentry + show a full-page error.
    defaultErrorComponent: ({ error, reset }) => (
      <FullPageError error={error} onReset={reset} capture />
    ),
    // Unmatched URLs (and any thrown notFound()) render the 404 page.
    defaultNotFoundComponent: () => <NotFound />,
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
