import type { BillingResponse } from '@/client';

/** Format a whole count with thousands separators (1000 → "1,000"). */
export function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

/** Format a cents amount as USD, dropping ".00" for round dollars (1000 → "$10"). */
export function formatCents(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/** Clamp a used/limit pair to a 0–100 percentage (limit 0 ⇒ 100%). */
export function usagePercent(used: number, limit: number): number {
  if (limit <= 0) return used > 0 ? 100 : 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function isPro(billing: Pick<BillingResponse, 'plan'>): boolean {
  return billing.plan === 'pro';
}

/** Format an ISO reset timestamp as its UTC calendar date, e.g. "Jul 15, 2026". */
export function formatResetDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}
