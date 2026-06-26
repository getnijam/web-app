/** The test framework a project reports from. Picked once at creation, then locked. */
export type TestFramework = 'playwright' | 'pytest' | 'vitest';

export const FRAMEWORK_OPTIONS: ReadonlyArray<{
  value: TestFramework;
  label: string;
  description: string;
}> = [
  { value: 'playwright', label: 'Playwright', description: 'JS/TS end-to-end tests, with traces.' },
  { value: 'pytest', label: 'pytest', description: 'Python tests, error logs, no traces.' },
  { value: 'vitest', label: 'Vitest', description: 'JS/TS unit tests, error logs, no traces.' },
];

/** Display name for a stored framework value (null = legacy project → Playwright). */
export const FRAMEWORK_LABELS: Record<TestFramework, string> = {
  playwright: 'Playwright',
  pytest: 'pytest',
  vitest: 'Vitest',
};
