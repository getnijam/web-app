import { describe, it, expect } from 'vitest';
import { FRAMEWORK_OPTIONS, FRAMEWORK_LABELS, type TestFramework } from './test-framework';

describe('framework metadata', () => {
  it('labels every supported framework', () => {
    expect(FRAMEWORK_LABELS).toEqual({
      playwright: 'Playwright',
      pytest: 'pytest',
      vitest: 'Vitest',
    });
  });

  it('exposes one option per labelled framework, in order', () => {
    expect(FRAMEWORK_OPTIONS.map((o) => o.value)).toEqual(['playwright', 'pytest', 'vitest']);
  });

  it('gives every option a non-empty label + description', () => {
    for (const opt of FRAMEWORK_OPTIONS) {
      expect(opt.label).toBe(FRAMEWORK_LABELS[opt.value]);
      expect(opt.description.length).toBeGreaterThan(0);
    }
  });

  it('keeps options and labels in sync (no orphans either way)', () => {
    const optionValues = new Set<TestFramework>(FRAMEWORK_OPTIONS.map((o) => o.value));
    const labelValues = new Set(Object.keys(FRAMEWORK_LABELS) as TestFramework[]);
    expect(optionValues).toEqual(labelValues);
  });
});
