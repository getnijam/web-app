import { test, expect } from '@playwright/test';

// Demo suite for exercising the "re-run only failed" flow end to end (Playwright).
// Pure assertions (no page/baseURL needed) so the failure is fast and deterministic.
// The passing test proves the suite has green tests too, so a re-run genuinely runs
// a SUBSET (just the failing one). `nijam-pw fetch-failed` returns the failing test's
// `file:line`, and CI re-runs only it as a clubbed second attempt.
// Delete this file once you've verified the flow.
test.describe('retry demo', () => {
  test('passes', async () => {
    expect(1 + 1).toBe(2);
  });

  test('fails on purpose (for the re-run-only-failed demo)', async () => {
    expect(1 + 1, 'intentional failure to exercise the re-run-only-failed flow').toBe(3);
  });
});
