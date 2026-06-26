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

const dateTimeFmt = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/** "May 30, 9:48 PM", date + time, for run-history rows. */
export function formatDateTime(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return dateTimeFmt.format(d);
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
 * Reduce a repository URL to "org/repo", strips scheme/host (https or git@),
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
 * machine path like `/home/runner/_work/.../foo.spec.ts`, collapse those to the
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

/**
 * Whether an email is git's auto-generated placeholder (e.g.
 * `user@Akhils-MacBook-Pro-2.local`) rather than a real address, produced when
 * `git config user.email` isn't set to a real value at commit time.
 */
export function isPlaceholderEmail(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at < 1) return true;
  const domain = email.slice(at + 1).toLowerCase();
  if (!domain.includes('.') || domain === 'localhost' || domain.includes('(none)')) return true;
  return /\.(local|lan|localdomain|internal|home|invalid)$/.test(domain);
}

/**
 * Human label for a commit author: the email when it's real, otherwise the name,
 * otherwise the email's local-part, so we never surface git's
 * `user@hostname.local` placeholder verbatim.
 */
export function displayAuthor(email: string | null, name: string | null): string {
  if (email && !isPlaceholderEmail(email)) return email;
  if (name && name.trim()) return name.trim();
  if (email) return email.split('@')[0] || email;
  return 'unknown';
}
