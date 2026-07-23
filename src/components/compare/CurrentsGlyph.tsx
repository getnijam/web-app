/**
 * The Currents brand mark (the tilted orbit ring + center dot), inlined as an SVG, a
 * competitor logo, which is the sanctioned exception to the Hugeicons-only rule. Uses
 * `fill: currentColor` so it takes the surrounding text color (e.g. `text-currents`).
 * Decorative, so aria-hidden and always paired with a visible "Currents" label.
 */
export function CurrentsGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" fill="currentColor" aria-hidden className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.02054 15.0003C-3.25928 29.34 1.66061 47.6996 16.0003 55.9795C30.34 64.2593 48.6996 59.3394 56.9795 44.9997C65.2593 30.66 60.3394 12.3004 45.9997 4.02054C31.66 -4.25929 13.3004 0.660612 5.02054 15.0003ZM12.1004 19.0802C18.1003 8.64044 31.48 5.10052 41.9198 11.1004C52.3595 17.1003 55.8995 30.48 49.8996 40.9198C43.8997 51.3596 30.52 54.8995 20.0802 48.8996C9.64045 42.8997 6.10052 29.52 12.1004 19.0802Z"
      />
      <path d="M31 45C22.826 45 16.1997 38.2843 16.1997 30C16.1997 21.7157 22.826 15 31 15C39.1739 15 45.8002 21.7157 45.8002 30C45.8002 38.2843 39.1739 45 31 45Z" />
    </svg>
  );
}
