import { createFileRoute } from '@tanstack/react-router';
import { FeaturesPage } from '@/components/features-page/FeaturesPage';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/_marketing/features')({
  head: () =>
    seo({
      title: 'Features',
      description:
        'Every answer your CI never gives you. Flakiness ranking, failure analysis, traces and artifacts, Slack and GitHub integrations, and platform features for Playwright, pytest, and Vitest.',
      path: '/features',
    }),
  component: FeaturesPage,
});
