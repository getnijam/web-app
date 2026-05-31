import { createFileRoute, redirect } from '@tanstack/react-router';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';

export const Route = createFileRoute('/')({
  // Send signed-in users to their dashboard, everyone else to login.
  beforeLoad: async ({ context }) => {
    let authed = false;
    try {
      await context.queryClient.ensureQueryData(getMeOptions());
      authed = true;
    } catch {
      // Not signed in — fall through with `authed` still false.
    }
    throw redirect({ to: authed ? '/orgs' : '/login' });
  },
});
