import { createFileRoute } from '@tanstack/react-router';
import { IntegrationsPage } from '@/components/integrations-page/IntegrationsPage';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_marketing/integrations')({
  head: () =>
    seo({
      title: 'Integrations',
      description:
        'Nijam reports where your team already works: run summaries in Slack, a status check and results comment on GitHub pull requests, commit statuses and notes on GitLab merge requests, and an MCP server your AI agent can query. Reporters for Playwright, pytest, and Vitest on any CI.',
      path: '/integrations',
    }),
  component: IntegrationsPage,
});
