import { HugeiconsIcon } from '@hugeicons/react';
import { ICON_GLYPHS, isFrameworkIconKey, type IconKey } from '@/lib/project-glyph';
import { FrameworkGlyph } from '@/components/projects/framework-glyphs';

/**
 * Renders a project glyph by key, a monochrome framework brand mark for the
 * per-framework keys (playwright/pytest/vitest), otherwise the mapped Hugeicon.
 * Both inherit the surrounding text color, so they sit correctly on the colored
 * glyph tile and in the icon-grid buttons.
 */
export function ProjectGlyphIcon({
  iconKey,
  size,
  strokeWidth = 1.9,
  className,
}: {
  iconKey: IconKey;
  size: number;
  strokeWidth?: number;
  className?: string;
}) {
  if (isFrameworkIconKey(iconKey)) {
    return <FrameworkGlyph framework={iconKey} size={size} />;
  }
  return (
    <HugeiconsIcon
      icon={ICON_GLYPHS[iconKey]}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
