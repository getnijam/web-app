import { cn } from '@/lib/utils';

/**
 * The official TestDino wordmark (the dino mark + "TestDino"), served as a static
 * asset. It already contains the brand name, so it replaces the glyph+label pair.
 * The default lockup is black artwork, inverted to white on our dark theme; pass
 * `tone="light"` for the white artwork used on the brand-colored mock header, which
 * is the same in both themes. Caller sets the height (e.g. `h-5`); width stays auto
 * to keep the aspect ratio.
 */
export function TestDinoWordmark({
  className,
  tone = 'auto',
}: {
  className?: string;
  /** 'auto' follows the theme; 'light' is the fixed white lockup for dark surfaces. */
  tone?: 'auto' | 'light';
}) {
  return (
    <img
      src={tone === 'light' ? '/compare/testdino-white.svg' : '/compare/testdino.svg'}
      alt="TestDino"
      className={cn('w-auto shrink-0 select-none', tone === 'auto' && 'dark:invert', className)}
    />
  );
}
