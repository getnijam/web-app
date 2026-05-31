import {
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  AlertCircleIcon,
  MinusSignCircleIcon,
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';

export interface StatusMeta {
  icon: IconSvgElement;
  color: string; // text token
  label: string;
}

/** Test-level status (passed | failed | flaky | skipped) → icon + token + label. */
export const TEST_STATUS: Record<string, StatusMeta> = {
  passed: { icon: CheckmarkCircle02Icon, color: 'text-success', label: 'Passed' },
  failed: { icon: CancelCircleIcon, color: 'text-destructive', label: 'Failed' },
  flaky: { icon: AlertCircleIcon, color: 'text-warning', label: 'Flaky' },
  skipped: { icon: MinusSignCircleIcon, color: 'text-muted-foreground', label: 'Skipped' },
};

/** Attempt-level status maps Playwright terminal states onto the same palette. */
export function attemptStatusMeta(status: string): StatusMeta {
  if (status === 'passed') return TEST_STATUS.passed!;
  if (status === 'skipped') return TEST_STATUS.skipped!;
  // failed | timedOut | interrupted
  const label = status === 'timedOut' ? 'Timed out' : status === 'interrupted' ? 'Interrupted' : 'Failed';
  return { icon: CancelCircleIcon, color: 'text-destructive', label };
}

export function testStatusMeta(status: string): StatusMeta {
  return TEST_STATUS[status] ?? TEST_STATUS.skipped!;
}
