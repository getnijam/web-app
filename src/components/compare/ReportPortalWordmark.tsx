import { cn } from '@/lib/utils';

/**
 * The official ReportPortal wordmark (cyan hexagon mark + "reportportal"), served
 * as a static asset. It already contains the brand name, so it replaces the
 * glyph+label pair. The wordmark's text is dark grey, which would disappear on our
 * dark theme, so in dark mode we flatten it to a monochrome white lockup. Caller
 * sets the height (e.g. `h-5`); width stays auto to keep the aspect ratio.
 */
export function ReportPortalWordmark({ className }: { className?: string }) {
  return (
    <img
      src="/compare/reportportal.svg"
      alt="ReportPortal"
      className={cn('w-auto shrink-0 select-none dark:brightness-0 dark:invert', className)}
    />
  );
}
