import type { ReactNode } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'muted';

const TONE: Record<Tone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
  info: 'text-info',
  primary: 'text-primary',
  muted: 'text-muted-foreground',
};

/**
 * A status chip with a leading tinted icon, so on/off and state values read at a glance.
 * The caller resolves the icon/label/tone for each state (it stays a one-line ternary at
 * the call site); this just renders the consistent badge. Used for SSO connection state,
 * 2FA, password, and similar binary statuses.
 */
export function StatusBadge({
  icon,
  label,
  tone = 'muted',
  variant = 'secondary',
  className,
}: {
  icon: IconSvgElement;
  label: ReactNode;
  tone?: Tone;
  variant?: React.ComponentProps<typeof Badge>['variant'];
  className?: string;
}) {
  return (
    <Badge variant={variant} className={cn('gap-1', className)}>
      <HugeiconsIcon icon={icon} size={13} className={TONE[tone]} />
      {label}
    </Badge>
  );
}
