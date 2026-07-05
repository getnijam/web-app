/**
 * The Allure Report brand mark (the six-petal gradient flower), inlined from
 * allurereport.org as an SVG, a competitor logo, which is the sanctioned exception
 * to the Hugeicons-only / theme-token rules (the gradient colors are intrinsic to
 * the mark, like an embedded image). Gradient ids are namespaced (`al-*`) so several
 * instances on one page can't clash. Decorative, so aria-hidden and always paired
 * with a visible "Allure Report" label. `className` controls size only.
 */
export function AllureGlyph({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" aria-hidden className={className}>
      <g clipPath="url(#al-a)">
        <path
          fill="url(#al-b)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.23 4.66a3.6 3.6 0 0 1 5.1.04A16.08 16.08 0 0 1 31.97 16a3.6 3.6 0 1 1-7.2 0c0-2.4-.98-4.61-2.58-6.24a3.6 3.6 0 0 1 .03-5.1Z"
        />
        <path
          fill="url(#al-c)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.4 3.6A3.6 3.6 0 0 1 16 0c4.4 0 8.4 1.8 11.29 4.66a3.6 3.6 0 0 1-5.06 5.13A8.87 8.87 0 0 0 16 7.2a3.6 3.6 0 0 1-3.6-3.6Z"
        />
        <path
          fill="url(#al-d)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 16A16 16 0 0 1 16 0a3.6 3.6 0 0 1 0 7.2 8.8 8.8 0 0 0-6.21 15.04 3.6 3.6 0 0 1-5.13 5.06A16.08 16.08 0 0 1 0 16Z"
        />
        <path
          fill="url(#al-e)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.66 22.24a3.6 3.6 0 0 1 5.1-.03 8.87 8.87 0 0 0 6.23 2.59 3.6 3.6 0 0 1 0 7.2c-4.4 0-8.4-1.8-11.3-4.66a3.6 3.6 0 0 1-.03-5.1Z"
        />
        <path
          fill="url(#al-f)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M28.38 12.4a3.6 3.6 0 0 1 3.6 3.6A16 16 0 0 1 16 32a3.6 3.6 0 0 1 0-7.2 8.8 8.8 0 0 0 8.8-8.8 3.6 3.6 0 0 1 3.6-3.6Z"
        />
        <path
          fill="url(#al-g)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M28.38 12.4a3.6 3.6 0 0 1 3.6 3.6v12.4a3.6 3.6 0 1 1-7.2 0V16a3.6 3.6 0 0 1 3.6-3.6Z"
        />
        <g clipPath="url(#al-h)">
          <path
            fill="url(#al-i)"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M22.23 4.66a3.6 3.6 0 0 1 5.1.04A16.08 16.08 0 0 1 31.97 16a3.6 3.6 0 1 1-7.2 0c0-2.4-.98-4.61-2.58-6.24a3.6 3.6 0 0 1 .03-5.1Z"
          />
        </g>
      </g>
      <defs>
        <linearGradient id="al-b" x1="26.4" x2="28.8" y1="9.6" y2="15.01" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7E22CE" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="al-c" x1="26.8" x2="17.8" y1="9.4" y2="3.61" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="al-d" x1="3.6" x2="5.4" y1="14.01" y2="24.81" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22C55E" />
          <stop offset="1" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id="al-e" x1="4.8" x2="14.4" y1="22.21" y2="29.21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#94A3B8" />
          <stop offset=".96" stopColor="#64748B" />
          <stop offset="1" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="al-f" x1="28.4" x2="22.19" y1="22.18" y2="28.4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D97706" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
        <linearGradient id="al-g" x1="29.2" x2="30.63" y1="54.43" y2="54.28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
        <linearGradient id="al-i" x1="26.4" x2="28.8" y1="9.6" y2="15.01" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7E22CE" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <clipPath id="al-a">
          <path fill="#fff" d="M0 0h32v32H0z" />
        </clipPath>
        <clipPath id="al-h">
          <path fill="#fff" d="M24.8 12H32v8h-7.2z" />
        </clipPath>
      </defs>
    </svg>
  );
}
