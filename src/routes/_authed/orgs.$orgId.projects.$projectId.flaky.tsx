import { createFileRoute } from '@tanstack/react-router';
import { PlaceholderPage } from '@/components/states/PlaceholderPage';

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/flaky')({
  component: () => (
    <PlaceholderPage
      title="Flaky tests"
      description="Tests with inconsistent results across recent runs."
    />
  ),
});
