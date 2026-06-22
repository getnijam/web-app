import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getMeOptions } from '@/client/@tanstack/react-query.gen';

type Props = Pick<ComponentPropsWithoutRef<'a'>, 'className' | 'onClick'> & {
  children: ReactNode;
};

/**
 * "Go to dashboard" link that lands the user where they actually want to be: their
 * last-opened org (`/orgs/$orgId/projects`) when known, else the org picker (`/orgs`),
 * and `/login` for guests. forwardRef + prop spread so it drops into `<Button asChild>`
 * (Radix Slot passes className/ref through) or stands alone as a plain link.
 *
 * Reads `/me` from the shared, cached query the home sections already issue — no extra
 * request.
 */
export const DashboardLink = forwardRef<HTMLAnchorElement, Props>(function DashboardLink(
  props,
  ref,
) {
  const user = useQuery({ ...getMeOptions(), retry: false, staleTime: 5 * 60 * 1000 }).data?.user;

  if (user?.lastOrgId) {
    return (
      <Link ref={ref} to="/orgs/$orgId/projects" params={{ orgId: user.lastOrgId }} {...props} />
    );
  }
  if (user) {
    return <Link ref={ref} to="/orgs" {...props} />;
  }
  return <Link ref={ref} to="/login" {...props} />;
});
