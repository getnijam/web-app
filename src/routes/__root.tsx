import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { baseHead } from '@/lib/seo';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // Site-wide fallback head so no tab is ever titleless. Public routes override
  // with full seo() (OG/canonical); dashboard routes override with privateSeo()
  // (title + noindex). Keeping OG/canonical out of here means they only appear on
  // the public pages that actually set them.
  head: () => baseHead(),
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
