// Small formatting helpers. Uses Intl only (guard rail: no date-fns/moment).

const dateFmt = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/** "Mar 2, 2025" */
export function formatDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return dateFmt.format(d);
}

/** Compact relative time: "just now", "5h ago", "yesterday", "3d ago". */
export function timeAgo(input: string | Date): string {
  const ts = (typeof input === 'string' ? new Date(input) : input).getTime();
  const hours = Math.round((Date.now() - ts) / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

/** "1m 23s" / "45s" */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
}

/**
 * Reduce a repository URL to "org/repo" — strips scheme/host (https or git@),
 * a trailing `.git`, and trailing slashes. Empty string when not derivable.
 */
export function repoFromUrl(url: string | null | undefined): string {
  if (!url) return '';
  return url
    .trim()
    .replace(/^[a-z]+:\/\/(www\.)?[^/]+\//i, '')
    .replace(/^git@[^:]+:/i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '');
}

/**
 * Display form for a spec-file path. The reporter stores paths relative to the
 * Playwright rootDir, but older runs (and absolute-path setups) can hold a full
 * machine path like `/home/runner/_work/.../foo.spec.ts` — collapse those to the
 * basename. Relative paths are shown as-is (their directories are useful context).
 * Display-only: the stored `file` value is still what links/queries use.
 */
export function displayFile(file: string): string {
  if (file.startsWith('/') || /^[A-Za-z]:[\\/]/.test(file)) {
    const parts = file.split(/[\\/]/);
    return parts[parts.length - 1] || file;
  }
  return file;
}
