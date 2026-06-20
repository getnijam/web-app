import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';
import { LoadingState } from '@/components/states/LoadingState';
import { DeleteAccountSection } from '@/components/account/DeleteAccountSection';

export const Route = createFileRoute('/_authed/profile/danger')({
  component: DangerPage,
});

function DangerPage() {
  const me = useQuery({ ...getMeOptions(), retry: false });
  const user = me.data?.user;
  if (!user) return <LoadingState />;

  return <DeleteAccountSection user={user} />;
}
