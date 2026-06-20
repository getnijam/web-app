import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { privateSeo } from '@/lib/seo';

export const Route = createFileRoute('/_authed/profile')({
  head: () => privateSeo('Account settings'),
  component: () => (
    <SettingsLayout>
      <Outlet />
    </SettingsLayout>
  ),
});
