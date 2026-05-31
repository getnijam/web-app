import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // Build output + generated code (Hey API client, TanStack route tree) are never
  // hand-edited, so they're never linted. `node_modules` is ignored by default.
  globalIgnores(['dist', 'src/client/**', 'src/routeTree.gen.ts']),

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      // Let intentionally-unused identifiers opt out with a leading underscore
      // (e.g. `catch (_err)`, `({ ignored: _ })`).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },

  // Node-context config files (Vite, Hey API codegen) use Node globals like `process`.
  {
    files: ['*.config.{ts,js}', 'vite.config.ts'],
    languageOptions: { globals: globals.node },
  },

  // `react-refresh/only-export-components` assumes plain component modules. These
  // areas legitimately co-export non-components — shadcn primitives ship their
  // `cva` variants, route files export `Route`, the theme provider exports its
  // hook, and `lib` holds cross-cutting helpers — so the Fast Refresh check is
  // turned off for them. It stays on for feature components, where a stray
  // non-component export usually is a mistake.
  {
    files: [
      'src/components/ui/**/*.{ts,tsx}',
      'src/components/theme/**/*.{ts,tsx}',
      'src/routes/**/*.{ts,tsx}',
      'src/lib/**/*.{ts,tsx}',
    ],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  // Disable ESLint rules that overlap with Prettier formatting.
  eslintConfigPrettier,

  // Re-enable semicolon enforcement as an error. Prettier already inserts
  // semicolons on format, but this makes a missing one fail `lint` too (and CI),
  // not just `format:check`. Must come AFTER eslint-config-prettier, which turns
  // every `semi` rule off.
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { '@stylistic': stylistic },
    rules: { '@stylistic/semi': ['error', 'always'] },
  },
]);
