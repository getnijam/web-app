import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';
import { Card } from '@/components/ui/card';
import { Flex } from '@/components/ui/flex';
import { LoadingState } from '@/components/states/LoadingState';
import { ProfileSection } from '@/components/account/ProfileSection';
import { OrganizationsSection } from '@/components/account/OrganizationsSection';
import { PendingInvitations } from '@/components/orgs/PendingInvitations';

export const Route = createFileRoute('/_authed/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  const me = useQuery({ ...getMeOptions(), retry: false });
  const user = me.data?.user;
  if (!user) return <LoadingState />;

  return (
    <Flex direction="col" gap={6}>
      <Card className="p-6">
        <ProfileSection user={user} />
      </Card>
      <PendingInvitations />
      <Card className="p-6">
        <OrganizationsSection />
      </Card>
    </Flex>
  );
}
