import * as React from 'react';

/** Theme preference. `system` follows the OS `prefers-color-scheme`. */
export type Theme = 'light' | 'dark' | 'system';
/** The concrete mode actually applied to the document. */
export type ResolvedTheme = 'light' | 'dark';

/**
 * localStorage key for the theme preference. The same key is read by the
 * inline no-flash script in `index.html`, keep them in sync.
 *
 * NOTE: localStorage is otherwise banned in this app (see web-app/CLAUDE.md);
 * it is permitted *only* for this preference, per explicit user approval.
 */
const STORAGE_KEY = 'nijam-theme';

const THEMES: readonly Theme[] = ['light', 'dark', 'system'] as const;

function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    // Storage unavailable (private mode, blocked), fall back to system.
  }
  return 'system';
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolve(theme: Theme): ResolvedTheme {
  if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return theme;
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(readStoredTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>(() => resolve(theme));

  // Apply the resolved mode to <html> whenever the preference changes, and keep
  // it in sync with the OS while in `system` mode.
  React.useEffect(() => {
    const apply = () => {
      const next = resolve(theme);
      document.documentElement.classList.toggle('dark', next === 'dark');
      setResolvedTheme(next);
    };
    apply();

    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persistence is best-effort; the in-memory choice still applies.
    }
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a <ThemeProvider>');
  return ctx;
}

export { THEMES };
