import { HugeiconsIcon } from '@hugeicons/react';
import { Flex } from '@/components/ui/flex';
import { cn } from '@/lib/utils';
import {
  ICON_KEYS,
  COLOR_KEYS,
  ICON_GLYPHS,
  COLOR_GRADIENTS,
  type IconKey,
  type ColorKey,
} from '@/lib/project-glyph';

/** Project glyph picker: live preview tile + 8-icon grid + 6 color swatches. */
export function GlyphPicker({
  icon,
  color,
  onIconChange,
  onColorChange,
  ringOffsetClass = 'ring-offset-popover',
}: {
  icon: IconKey;
  color: ColorKey;
  onIconChange: (icon: IconKey) => void;
  onColorChange: (color: ColorKey) => void;
  /** Match the surface behind the selected color swatch's ring (popover vs card). */
  ringOffsetClass?: string;
}) {
  return (
    <Flex align="center" className="gap-3.5">
      <Flex
        align="center"
        justify="center"
        className="size-14.5 shrink-0 rounded-xl text-primary-foreground shadow-inner"
        style={{ background: COLOR_GRADIENTS[color] }}
      >
        <HugeiconsIcon icon={ICON_GLYPHS[icon]} size={22} strokeWidth={1.9} />
      </Flex>
      <Flex direction="col" gap={2} className="min-w-0 flex-1">
        <Flex wrap gap={1.5}>
          {ICON_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              aria-label={key}
              aria-pressed={icon === key}
              onClick={() => onIconChange(key)}
              className={cn(
                'grid size-7.5 place-items-center rounded-md border transition-colors',
                icon === key
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <HugeiconsIcon icon={ICON_GLYPHS[key]} size={18} strokeWidth={1.8} />
            </button>
          ))}
        </Flex>
        {/* ml-1 offsets the selected swatch's ring so its left edge lines up with
            the icon grid above (the ring-offset overflows ~4px). */}
        <Flex gap={2} className="ml-1">
          {COLOR_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              aria-label={key}
              aria-pressed={color === key}
              onClick={() => onColorChange(key)}
              className={cn(
                'size-5 shrink-0 rounded-full transition-shadow',
                color === key && cn('ring-2 ring-foreground ring-offset-2', ringOffsetClass),
              )}
              style={{ background: COLOR_GRADIENTS[key] }}
            />
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}
