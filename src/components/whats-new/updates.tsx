import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CloudServerIcon } from '@hugeicons/core-free-icons';
import { GitHubLogo } from '@/components/integrations/GitHubLogo';
import { GitLabLogo } from '@/components/integrations/GitLabLogo';
import {
  ORG_INTEGRATIONS_GITHUB_ROUTE,
  ORG_INTEGRATIONS_GITLAB_ROUTE,
  ORG_SETTINGS_BYOC_ROUTE,
} from '@/lib/routes';

/**
 * One section of an update's full write-up. Every field is optional so a section can be a
 * lead paragraph, a titled block, a bullet list, or any combination, without the renderer
 * needing to branch on a section "kind".
 */
export interface UpdateSection {
  heading?: string;
  body?: string;
  bullets?: string[];
}

export interface Update {
  id: string;
  title: string;
  /** Plain calendar day (yyyy-mm-dd) the update shipped. Drives the order and the shown date. */
  date: string;
  /** Short category chip, e.g. "Integration". */
  tag: string;
  /** The one-liner shown in the list; the sections carry the full explanation. */
  summary: string;
  /** Rendered at the size the surface asks for (list badge vs detail header). */
  icon: (size: number) => ReactNode;
  sections: UpdateSection[];
  /** Where the update lives in the app. Always an org-scoped route; the sheet fills in orgId. */
  cta?: { label: string; to: string };
}

/**
 * The changelog, newest first. Hard-coded on purpose for now: there are a handful of entries,
 * they change on release cadence (not at runtime), and shipping them as data keeps the sheet
 * dumb. When this outgrows a file, swap this module for a query, the `Update` shape is the
 * contract the sheet renders and nothing else reads it.
 *
 * Dates are the released-on days; update them alongside the entry.
 */
/** How long a shipped update keeps its "New" treatment, opened or not. */
const NEW_FOR_DAYS = 30;

/**
 * Entries carry plain calendar days. Parsing "2026-08-26" on its own is treated as UTC
 * midnight, which lands on the previous day west of UTC, so anchor them at midday.
 */
export function updateShippedAt(update: Update): Date {
  return new Date(`${update.date}T12:00:00Z`);
}

/**
 * Whether an update is still recent enough to be flagged as new. Paired with the seen
 * state by the callers, so an update that was never opened stops shouting once it has
 * stopped being news, rather than pulsing at the user forever.
 */
export function isRecentUpdate(update: Update): boolean {
  const age = Date.now() - updateShippedAt(update).getTime();
  return age <= NEW_FOR_DAYS * 24 * 60 * 60 * 1000;
}

export const UPDATES: Update[] = [
  {
    id: 'gitlab-integration',
    title: 'GitLab integration',
    date: '2026-08-26',
    tag: 'Integration',
    summary: 'Commit statuses and merge request notes for every run.',
    icon: (size) => <GitLabLogo size={size} />,
    sections: [
      {
        body: 'Nijam now reports into GitLab the way it already reports into GitHub. Connect your organization once, link each Nijam project to its GitLab project, and every run that belongs to a merge request writes its result back where the change is being reviewed.',
      },
      {
        heading: 'What you get',
        bullets: [
          'A commit status on the pipeline commit, so a failing suite is visible on the merge request without opening Nijam.',
          'A merge request note carrying the run summary, updated in place on every rerun instead of piling up new notes.',
          'Statuses and notes are independent toggles, so you can post one, both, or neither.',
        ],
      },
      {
        heading: 'Getting started',
        body: 'Sign in with GitLab from Integrations, then link each Nijam project to its GitLab project in its own integration settings. Nijam posts as the GitLab user that connected it, so it needs access to the projects your pipelines run for.',
      },
      {
        heading: 'Good to know',
        bullets: [
          'GitLab has no scope for statuses and notes alone, so it asks for api access. Connecting as a service account keeps that grant narrow.',
          'Nijam only ever writes commit statuses and merge request notes.',
          'gitlab.com today. Self-managed instances are a later addition.',
        ],
      },
    ],
    cta: { label: 'Set up GitLab', to: ORG_INTEGRATIONS_GITLAB_ROUTE },
  },
  {
    id: 'byoc',
    title: 'Bring your own cloud',
    date: '2026-07-15',
    tag: 'Platform',
    summary: 'Keep runs, traces, and artifacts in infrastructure you own.',
    icon: (size) => (
      <HugeiconsIcon
        icon={CloudServerIcon}
        size={size}
        strokeWidth={1.8}
        className="text-success"
      />
    ),
    sections: [
      {
        body: 'Bring your own cloud points Nijam at infrastructure you control. Run and project data is written to your Postgres, and traces, screenshots, and videos go to your own bucket. Nijam keeps the product and the reporting; the data stays in your account.',
      },
      {
        heading: 'What you get',
        bullets: [
          'Your own Postgres. Give us a connection string and run and project data lives in your database.',
          'Your own storage. Traces, screenshots, and videos go to your S3, Google Cloud Storage, or Azure bucket.',
          'Flat pricing. Enabling it waives metered usage, since the storage cost is already yours.',
          'A header indicator, so everyone in the organization can see their runs are on your infrastructure.',
        ],
      },
      {
        heading: 'Good to know',
        body: 'Bring your own cloud is a Pro feature, and it has to be set up on a fresh organization. Moving an organization that already has projects is not supported yet. The database and storage move together: both are on, or neither.',
      },
    ],
    cta: { label: 'Open BYOC settings', to: ORG_SETTINGS_BYOC_ROUTE },
  },
  {
    id: 'github-integration',
    title: 'GitHub integration',
    date: '2026-06-10',
    tag: 'Integration',
    summary: 'A status check and a results comment on every pull request.',
    icon: (size) => <GitHubLogo size={size} />,
    sections: [
      {
        body: 'Install the Nijam GitHub App on the repositories your pipelines run for, and every run that belongs to a pull request reports back on the pull request itself.',
      },
      {
        heading: 'What you get',
        bullets: [
          'A pull request status check that fails when the suite fails, so a broken run blocks the merge the way the rest of your CI does.',
          'A results comment with the run summary, edited in place on every rerun.',
          'Both are independent toggles, and the app only ever sees the repositories you pick.',
        ],
      },
      {
        heading: 'Getting started',
        body: 'Install the app from Integrations, then link each Nijam project to its repository in its own integration settings.',
      },
    ],
    cta: { label: 'Set up GitHub', to: ORG_INTEGRATIONS_GITHUB_ROUTE },
  },
];
