import { Flex } from '@/components/ui/flex';
import { cn } from '@/lib/utils';
import { initialsFrom } from '@/components/shell/use-shell-nav';

const SIZES = {
  sm: 'size-7 text-xs rounded-lg',
  md: 'size-9.5 text-sm rounded-lg',
  lg: 'size-16 text-lg rounded-2xl',
} as const;

/**
 * A person's uploaded avatar (R2, served publicly) when `hasAvatar`, else their
 * initials on the brand-tinted gradient. Pass only name/email for an initials-only
 * avatar (e.g. git authors who aren't Nijam users).
 */
export function UserAvatar({
  name,
  email,
  userId,
  hasAvatar,
  avatarUpdatedAt,
  size = 'md',
  className,
}: {
  name?: string | null;
  email: string;
  userId?: string;
  hasAvatar?: boolean;
  avatarUpdatedAt?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const src =
    hasAvatar && userId
      ? `${import.meta.env.VITE_API_URL}/v1/users/${userId}/avatar?v=${avatarUpdatedAt ?? ''}`
      : null;

  return (
    <Flex
      align="center"
      justify="center"
      className={cn(
        'shrink-0 overflow-hidden font-semibold',
        SIZES[size],
        src ? 'bg-muted' : 'bg-avatar text-primary-foreground',
        className,
      )}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initialsFrom(name?.trim() || email)
      )}
    </Flex>
  );
}
