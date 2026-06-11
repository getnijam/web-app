import type { CSSProperties } from 'react';
import { Outlet } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { UsageLimitBanner } from '@/components/billing/UsageLimitBanner';

/** Sidebar fixed at the design's 264px (default shadcn width is 16rem/256px). */
const SHELL_STYLE = { '--sidebar-width': '16.5rem' } as CSSProperties;

/**
 * Collapse/expand handle pinned to the sidebar's right edge. It lives at the
 * shell level — *outside* the sidebar's own transform — so it stays reachable
 * even when the offcanvas sidebar slides fully off-screen: on the nav edge when
 * open (chevron points left → collapse) and at the screen's left edge when
 * collapsed (chevron points right → expand). Desktop only; mobile uses the top
 * bar's trigger (the sidebar is a sheet there).
 */
function SidebarEdgeToggle() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  if (isMobile) return null;
  const collapsed = state === 'collapsed';
  return (
    <Button
      variant="round"
      size="icon-xs"
      onClick={toggleSidebar}
      aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
      title={collapsed ? 'Open sidebar' : 'Close sidebar'}
      style={{
        // Open: straddle the sidebar's right edge so the handle sits half inside the
        // nav. This reads correctly only because the fill + border are solid/opaque
        // (see className) — they look identical over the sidebar and the content, so
        // the two halves match. Collapsed: fully on the content at the left edge.
        // left: collapsed ? '0.5rem' : 'var(--sidebar-width)',
        left: collapsed ? '0.25rem' : 'var(--sidebar-width)',
        transform: collapsed ? 'translateY(-50%)' : 'translate(-50%, -50%)',
      }}
      className="absolute top-1/2 z-30 duration-200 ease-linear bg-sidebar border-border hover:bg-sidebar-accent dark:border-[#222424]"
    >
      <HugeiconsIcon icon={collapsed ? ChevronRightIcon : ChevronLeftIcon} className="size-3.5" />
    </Button>
  );
}

/**
 * The authenticated dashboard shell: shadcn's collapsible `Sidebar` beside a
 * column with a sticky top bar above a scrolling content area. Rendered by the
 * `_authed` layout, so the auth gate runs before it mounts. The provider is
 * pinned to the viewport height so the content area scrolls internally.
 */
export function AppShell() {
  return (
    <SidebarProvider style={SHELL_STYLE} className="relative h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <TopBar />
        <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-7 pt-7 pb-12">
          <Outlet />
        </div>
        <UsageLimitBanner />
      </SidebarInset>
      <SidebarEdgeToggle />
    </SidebarProvider>
  );
}
