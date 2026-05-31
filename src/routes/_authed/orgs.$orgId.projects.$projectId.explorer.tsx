import { createFileRoute } from '@tanstack/react-router';
import { PlaceholderPage } from '@/components/states/PlaceholderPage';

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/explorer')({
  component: () => (
    <PlaceholderPage
      title="Test explorer"
      description="Browse every test case across your spec files, with source and run history."
    />
  ),
});
