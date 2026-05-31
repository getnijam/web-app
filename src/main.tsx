import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { client } from '@/client/client.gen';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { LoadingState } from '@/components/states/LoadingState';
import { routeTree } from './routeTree.gen';
import './styles/globals.css';

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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoadingState />
    </div>
  ),
  defaultPendingMs: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <RouterProvider router={router} />
        </TooltipProvider>
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
);
