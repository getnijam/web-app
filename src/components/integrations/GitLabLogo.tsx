/**
 * The GitLab mark (official tanuki, brand colors). Decorative, sized via the `size` prop.
 *
 * The viewBox is cropped to the path's measured bounding box (x 3, y 5, 42 x 38 in the
 * source's 48 x 48 box) for the same reason as the GitHub mark: the source padding
 * rendered it ~15.8px at `size={18}`. Kept square, and the y origin centres the wider-
 * than-tall tanuki, so it reads at the same size as the marks beside it.
 */
export function GitLabLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="3 3 42 42" aria-hidden="true">
      <path d="M24 43L16 20 32 20z" fill="#E53935" />
      <path d="M24 43L42 20 32 20z" fill="#FF7043" />
      <path d="M37 5L42 20 32 20z" fill="#E53935" />
      <path d="M24 43L42 20 45 28z" fill="#FFA726" />
      <path d="M24 43L6 20 16 20z" fill="#FF7043" />
      <path d="M11 5L6 20 16 20z" fill="#E53935" />
      <path d="M24 43L6 20 3 28z" fill="#FFA726" />
    </svg>
  );
}
