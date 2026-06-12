import { useParams, useRouterState } from '@tanstack/react-router';

/** Sub-route keys, shared by the sidebar (active item) and top bar (breadcrumb). */
export type SubRoute =
  | 'home'
  | 'org'
  | 'users'
  | 'keys'
  | 'billing'
  | 'integrations'
  | 'runs'
  | 'explorer'
  | 'flaky'
  | 'failing'
  | 'psettings';

/** Human labels per sub-route. */
export const ROUTE_TITLES: Record<SubRoute, string> = {
  home: 'Projects',
  org: 'Organization settings',
  users: 'Users',
  keys: 'Secret keys',
  billing: 'Billing',
  integrations: 'Integrations',
  runs: 'Runs',
  explorer: 'Test explorer',
  flaky: 'Flaky tests',
  failing: 'Failing tests',
  psettings: 'Settings',
};

const PROJECT_SUB: Record<string, SubRoute> = {
  runs: 'runs',
  explorer: 'explorer',
  flaky: 'flaky',
  failing: 'failing',
  settings: 'psettings',
};

const ORG_SUB: Record<string, SubRoute> = {
  settings: 'org',
  users: 'users',
  keys: 'keys',
  billing: 'billing',
  integrations: 'integrations',
};

export interface ShellNav {
  /** The current org id from the route. */
  orgId: string;
  inProject: boolean;
  projectId?: string;
  /** The active sub-route within the current context. */
  active: SubRoute;
}

/**
 * Derives the shell's navigation context from the org-scoped router. Paths look
 * like `/orgs/<orgId>/<projects|settings|users>[/<projectId>/<sub>]`.
 */
export function useShellNav(): ShellNav {
  const params = useParams({ strict: false }) as { orgId?: string; projectId?: string };
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split('/').filter(Boolean); // ['orgs', orgId, …]
  const orgId = params.orgId ?? '';

  if (params.projectId) {
    // The section is the segment right after the projectId (runs | explorer |
    // flaky | settings) — not the last segment, so deep routes like
    // `/explorer/<testId>` or `/runs/<runId>/file` keep the right nav active.
    const idx = segments.indexOf(params.projectId);
    const section = idx >= 0 ? segments[idx + 1] : undefined;
    return {
      orgId,
      inProject: true,
      projectId: params.projectId,
      active: PROJECT_SUB[section ?? ''] ?? 'runs',
    };
  }

  const seg = segments[2]; // after orgs/<orgId>
  const active: SubRoute = ORG_SUB[seg ?? ''] ?? 'home';
  return { orgId, inProject: false, active };
}

/** Two-letter initials from a name (or email local-part fallback). */
export function initialsFrom(nameOrEmail: string): string {
  const base = (nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail) || nameOrEmail;
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const letters =
    parts.length >= 2 ? `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}` : base.slice(0, 2);
  return letters.toUpperCase() || '?';
}
