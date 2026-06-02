import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { seo } from '@/lib/seo';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // Site-wide default head (title/description/OG). Public routes override per page;
  // this keeps every tab — including the auth-gated dashboard — from going titleless.
  head: () => seo(),
  component: RootDocument,
});

function RootDocument() {
  return (
    <>
      {/* React 19 hoists these route-managed <title>/<meta>/<link> tags into <head>. */}
      <HeadContent />
      <Outlet />
    </>
  );
}
