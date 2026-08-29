import { HugeiconsIcon } from '@hugeicons/react';
import { GitlabIcon } from '@hugeicons/core-free-icons';

/** The GitLab mark (monochrome, inherits text color). Decorative, sized via `size`. */
export function GitLabLogo({ size = 20 }: { size?: number }) {
  return <HugeiconsIcon icon={GitlabIcon} size={size} className="text-foreground" />;
}
