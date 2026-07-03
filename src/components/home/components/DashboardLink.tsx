import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { LOGIN_ROUTE, ORGS_ROUTE, ORG_PROJECTS_ROUTE } from '@/lib/routes';
import { useQuery } from '@tanstack/react-query';
import { meQueryOptions } from '@/lib/me-query';

type Props = Pick<ComponentPropsWithoutRef<'a'>, 'className' | 'onClick'> & {
  children: ReactNode;
};

/**
 * "Go to dashboard" link that lands the user where they actually want to be: their
 * last-opened org (`/orgs/$orgId/projects`) when known, else the org picker (`/orgs`),
 * and `/login` for guests. forwardRef + prop spread so it drops into `<Button asChild>`
 * (Radix Slot passes className/ref through) or stands alone as a plain link.
 *
 * Reads `/me` from the shared, cached query the home sections already issue, no extra
 * request.
 */
export const DashboardLink = forwardRef<HTMLAnchorElement, Props>(
  function DashboardLink(props, ref) {
    const user = useQuery(meQueryOptions()).data?.user;

    if (user?.lastOrgId) {
      return (
        <Link ref={ref} to={ORG_PROJECTS_ROUTE} params={{ orgId: user.lastOrgId }} {...props} />
      );
    }
    if (user) {
      return <Link ref={ref} to={ORGS_ROUTE} {...props} />;
    }
    return <Link ref={ref} to={LOGIN_ROUTE} {...props} />;
  },
);
