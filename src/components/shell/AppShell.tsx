import type { CSSProperties } from 'react';
import { Outlet } from '@tanstack/react-router';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';

/** Sidebar fixed at the design's 264px (default shadcn width is 16rem/256px). */
const SHELL_STYLE = { '--sidebar-width': '16.5rem' } as CSSProperties;

/**
 * The authenticated dashboard shell: shadcn's collapsible `Sidebar` beside a
 * column with a sticky top bar above a scrolling content area. Rendered by the
 * `_authed` layout, so the auth gate runs before it mounts. The provider is
 * pinned to the viewport height so the content area scrolls internally.
 */
export function AppShell() {
  return (
    <SidebarProvider style={SHELL_STYLE} className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <TopBar />
        <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-7 pt-7 pb-12">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
