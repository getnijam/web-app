import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';

const COPIED_MS = 1500;

/**
 * Copies `value` to the clipboard and briefly swaps the icon to a checkmark.
 * Stops the click from bubbling/navigating, so it can sit inside a clickable
 * card or link. Pass `label` for a text+icon button; omit it for icon-only.
 */
export function CopyButton({
  value,
  label,
  copiedLabel = 'Copied',
  variant = 'outline',
  size,
  iconSize = 15,
  className,
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  iconSize?: number;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_MS);
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size ?? (label === undefined ? 'icon' : 'default')}
      onClick={copy}
      aria-label={label === undefined ? 'Copy to clipboard' : undefined}
      className={className}
    >
      <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={iconSize} />
      {label !== undefined && (copied ? copiedLabel : label)}
    </Button>
  );
}
