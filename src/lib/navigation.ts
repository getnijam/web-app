/**
 * The single place that performs imperative browser navigation.
 *
 * Rule (see web-app/CLAUDE.md): prefer a declarative anchor, `<a href target="_blank"
 * rel="noopener noreferrer">` (or `<Link>` for internal routes), whenever the URL is
 * known at render. Use these helpers ONLY when the URL is computed on click (a mutation
 * result, or a URL minted asynchronously after the click). All are SSR-guarded so they
 * are inert on the server.
 */

/**
 * Full-page navigation to an external or computed URL, e.g. an OAuth install / Polar
 * checkout / SSO redirect whose URL the API returns on click.
 */
export function openExternal(url: string): void {
  if (typeof window === 'undefined') return;
  window.location.assign(url);
}

/**
 * Open a blank tab synchronously within a click gesture (so the popup blocker allows
 * it), returning its handle. The caller sets `win.location.href` once an async URL
 * resolves, or `win.close()` on failure. Used by the trace viewer: open the tab now,
 * fill its URL after minting the short-lived signed URL. No `noopener` here, that would
 * make `window.open` return null and we need the handle.
 */
export function openBlankTab(): Window | null {
  if (typeof window === 'undefined') return null;
  return window.open('', '_blank');
}

/**
 * Open a known URL in a new tab imperatively. Prefer a declarative
 * `<a href target="_blank" rel="noopener noreferrer">`; use this only when an anchor
 * genuinely can't be rendered (e.g. inside a non-anchor menu item handler).
 */
export function openInNewTab(url: string): void {
  if (typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}
