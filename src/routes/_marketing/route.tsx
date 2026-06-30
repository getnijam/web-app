import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Nav } from '@/components/home/components/Nav';
import { Footer } from '@/components/home/components/Footer';

/**
 * Pathless layout for the public marketing pages (/, /features, /pricing, the
 * legal pages, support, security). It owns the shared chrome, the page shell, the
 * Nav, and the Footer, so they persist across navigations between these routes.
 * Keeping the Nav mounted is what lets its active-route pill animate between links
 * instead of remounting on every page. Each page renders only its own content via
 * <Outlet />. The dashboard (_authed) and auth pages live outside this layout, so
 * they never get the marketing chrome.
 */
export const Route = createFileRoute('/_marketing')({
  component: MarketingLayout,
});

function MarketingLayout() {
  return (
    // A full-height flex column so the content area (flex-1) always fills the
    // viewport between the Nav and Footer. That keeps the Footer pinned to the
    // bottom while a route's bundle loads (no jump to the top) and gives the
    // router's pending spinner (h-full) a height to center itself in. The content
    // wrapper stays a plain block (only a flex *item*, not a flex container) so
    // pages render in normal flow, the hero's negative margin included.
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Nav />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
