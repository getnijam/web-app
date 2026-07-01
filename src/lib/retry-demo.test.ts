import { describe, it, expect } from 'vitest';

// Demo suite for exercising the "re-run only failed" flow end to end (Vitest).
// The passing test proves the suite has green tests too, so a re-run genuinely runs
// a SUBSET (just the failing one). `nijam-vitest fetch-failed` returns the failing
// test, and CI re-runs only it as a clubbed second attempt.
// Delete this file once you've verified the flow.
describe('retry demo', () => {
  it('passes', () => {
    expect(1 + 1).toBe(2);
  });

  it('fails on purpose (for the re-run-only-failed demo)', () => {
    expect(1 + 1).toBe(3);
  });
});
