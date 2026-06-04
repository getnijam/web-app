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
  pill: string; // tinted bg + text tokens for a status badge
}

/** Test-level status (passed | failed | flaky | skipped) → icon + token + label. */
export const TEST_STATUS: Record<string, StatusMeta> = {
  passed: {
    icon: CheckmarkCircle02Icon,
    color: 'text-success',
    label: 'Passed',
    pill: 'bg-success/15 text-success',
  },
  failed: {
    icon: CancelCircleIcon,
    color: 'text-destructive',
    label: 'Failed',
    pill: 'bg-destructive/15 text-destructive',
  },
  flaky: {
    icon: AlertCircleIcon,
    color: 'text-warning',
    label: 'Flaky',
    pill: 'bg-warning/15 text-warning',
  },
  skipped: {
    icon: MinusSignCircleIcon,
    color: 'text-muted-foreground',
    label: 'Skipped',
    pill: 'bg-muted-foreground/10 text-muted-foreground',
  },
};

/** Non-"Failed" labels for the terminal failure states. */
const FAILURE_LABELS: Record<string, string> = {
  timedOut: 'Timed out',
  interrupted: 'Interrupted',
};

/** Attempt-level status maps Playwright terminal states onto the same palette. */
export function attemptStatusMeta(status: string): StatusMeta {
  if (status === 'passed') return TEST_STATUS.passed!;
  if (status === 'skipped') return TEST_STATUS.skipped!;
  // failed | timedOut | interrupted
  const label = FAILURE_LABELS[status] ?? 'Failed';
  return {
    icon: CancelCircleIcon,
    color: 'text-destructive',
    label,
    pill: 'bg-destructive/15 text-destructive',
  };
}

export function testStatusMeta(status: string): StatusMeta {
  return TEST_STATUS[status] ?? TEST_STATUS.skipped!;
}
