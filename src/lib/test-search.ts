import type { TestCaseSummary } from '@/client';

/**
 * Case-insensitive match of a test against a search term across its name, suite
 * path (the describe blocks), and spec file. `term` is expected pre-lowercased
 * and trimmed; an empty term matches everything.
 */
export function testMatchesQuery(test: TestCaseSummary, term: string): boolean {
  if (!term) return true;
  const haystack = `${test.title} ${test.titlePath.join(' ')} ${test.file}`.toLowerCase();
  return haystack.includes(term);
}
