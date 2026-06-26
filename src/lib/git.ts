import type { IconSvgElement } from '@hugeicons/react';
import { GithubIcon, GitlabIcon, ServerStack01Icon } from '@hugeicons/core-free-icons';

type RunGit = {
  repository: string | null;
  branch: string | null;
  ciProvider: string | null;
  ciRunUrl: string | null;
};

const PROVIDER_ICON: Record<string, IconSvgElement> = {
  github: GithubIcon,
  gitlab: GitlabIcon,
};

/** Provider logo (GitHub/GitLab); a generic CI icon for everything else. */
export function gitProviderIcon(provider: string | null): IconSvgElement {
  return (provider && PROVIDER_ICON[provider]) || ServerStack01Icon;
}

// Per-provider branch path + cloud host (host is overridden by the CI run URL's
// origin when present, so self-hosted GitHub/GitLab resolve correctly).
const BRANCH_PATH: Record<string, string> = { github: 'tree', gitlab: '-/tree', bitbucket: 'src' };
const DEFAULT_HOST: Record<string, string> = {
  github: 'https://github.com',
  gitlab: 'https://gitlab.com',
  bitbucket: 'https://bitbucket.org',
};

function originFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

// Per-provider blob path + line anchor (so View-source jumps to the test).
const BLOB_PATH: Record<string, string> = { github: 'blob', gitlab: '-/blob', bitbucket: 'src' };
const LINE_ANCHOR: Record<string, (n: number) => string> = {
  github: (n) => `#L${n}`,
  gitlab: (n) => `#L${n}`,
  bitbucket: (n) => `#lines-${n}`,
};

/**
 * Web URL for a spec file at a run's commit (View source ↗), optionally anchored
 * to a line. Needs a repository, commit, and provider; null otherwise.
 */
export function gitFileUrl(
  ref: {
    repository: string | null;
    commitSha: string | null;
    ciProvider: string | null;
    ciRunUrl: string | null;
  },
  file: string,
  line?: number | null,
): string | null {
  const { repository, commitSha, ciProvider } = ref;
  if (!repository || !commitSha || !ciProvider || !file) return null;
  // Only a repo-relative path yields a valid blob URL. Older runs stored an
  // absolute machine path (e.g. /home/runner/work/…) when the reporter couldn't
  // make it rootDir-relative, that produces …/blob/<sha>//home/… which 404s.
  // Skip the link rather than send the user to a dead page.
  if (file.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(file) || file.startsWith('..')) return null;
  const blob = BLOB_PATH[ciProvider];
  const host = originFromUrl(ref.ciRunUrl) ?? DEFAULT_HOST[ciProvider];
  if (!blob || !host) return null;
  const repo = repository.replace(/^\/+|\/+$/g, '');
  const path = file.split('/').map(encodeURIComponent).join('/');
  const anchor = line && LINE_ANCHOR[ciProvider] ? LINE_ANCHOR[ciProvider]!(line) : '';
  return `${host}/${repo}/${blob}/${commitSha}/${path}${anchor}`;
}

/** Web URL for a run's branch on its provider, or null if it can't be built. */
export function gitBranchUrl(run: RunGit): string | null {
  const { repository, branch, ciProvider } = run;
  if (!repository || !branch || !ciProvider) return null;
  const path = BRANCH_PATH[ciProvider];
  const host = originFromUrl(run.ciRunUrl) ?? DEFAULT_HOST[ciProvider];
  if (!path || !host) return null;
  const repo = repository.replace(/^\/+|\/+$/g, '');
  // Keep slashes in branch names (e.g. feature/x) but encode each segment.
  const ref = branch.split('/').map(encodeURIComponent).join('/');
  return `${host}/${repo}/${path}/${ref}`;
}
