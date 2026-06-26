import { HugeiconsIcon } from '@hugeicons/react';
import { GithubIcon } from '@hugeicons/core-free-icons';

/** The GitHub mark (monochrome, inherits text color). Decorative, sized via `size`. */
export function GitHubLogo({ size = 20 }: { size?: number }) {
  return <HugeiconsIcon icon={GithubIcon} size={size} className="text-foreground" />;
}
