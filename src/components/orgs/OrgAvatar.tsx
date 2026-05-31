import { Flex } from '@/components/ui/flex';
import { cn } from '@/lib/utils';
import { initialsFrom } from '@/components/shell/use-shell-nav';

export interface OrgGlyph {
  id: string;
  name: string;
  hasLogo: boolean;
  logoUpdatedAt: string | null;
}

const SIZES = {
  sm: 'size-6.5 text-xs rounded-md',
  md: 'size-9.5 text-sm rounded-lg',
  lg: 'size-12 text-base rounded-xl',
} as const;

/** The org's R2 logo if set, otherwise its initials on the brand gradient. */
export function OrgAvatar({
  org,
  size = 'md',
  className,
}: {
  org: OrgGlyph;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const src = org.hasLogo
    ? `${import.meta.env.VITE_API_URL}/v1/orgs/${org.id}/logo?v=${org.logoUpdatedAt ?? ''}`
    : null;

  return (
    <Flex
      align="center"
      justify="center"
      className={cn(
        'shrink-0 overflow-hidden font-semibold',
        SIZES[size],
        src ? 'bg-muted' : 'bg-brand text-primary-foreground',
        className,
      )}
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : initialsFrom(org.name)}
    </Flex>
  );
}
