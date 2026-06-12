import type { DateRange } from 'react-day-picker';

/**
 * Shared from/to run-date filter for the test pages (explorer, flaky, failing).
 * The URL carries plain `YYYY-MM-DD` (local calendar days, shareable); the API
 * wants ISO instants, so we expand the range to the day's start/end below.
 */
export interface DateRangeSearch {
  from?: string;
  to?: string;
}

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** TanStack `validateSearch` for routes carrying a from/to day range. */
export function validateDateRangeSearch(search: Record<string, unknown>): DateRangeSearch {
  const from = typeof search.from === 'string' && YMD.test(search.from) ? search.from : undefined;
  const to = typeof search.to === 'string' && YMD.test(search.to) ? search.to : undefined;
  return { from, to };
}

/** Local `YYYY-MM-DD` for a Date. */
export function toYmd(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Parse `YYYY-MM-DD` into a local-midnight Date (undefined if missing/invalid). */
export function fromYmd(s: string | undefined): Date | undefined {
  if (!s || !YMD.test(s)) return undefined;
  const [y = 0, m = 1, d = 1] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** The calendar's selection (react-day-picker `DateRange`) for the URL search. */
export function searchToRange(search: DateRangeSearch): DateRange | undefined {
  const from = fromYmd(search.from);
  const to = fromYmd(search.to);
  if (!from && !to) return undefined;
  return { from, to };
}

/** A picked range → URL search (`from`/`to` as days; omitted when unset). */
export function rangeToSearch(range: DateRange | undefined): DateRangeSearch {
  return {
    from: range?.from ? toYmd(range.from) : undefined,
    to: range?.to ? toYmd(range.to) : undefined,
  };
}

/**
 * The API query instants for a day range: `from` at the start of its day, `to`
 * at the end of its day, so both endpoints are inclusive. Empty when unset.
 */
export function rangeToQuery(search: DateRangeSearch): { from?: string; to?: string } {
  const fromDay = fromYmd(search.from);
  const toDay = fromYmd(search.to);
  const query: { from?: string; to?: string } = {};
  if (fromDay) query.from = fromDay.toISOString();
  if (toDay) {
    const end = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate(), 23, 59, 59, 999);
    query.to = end.toISOString();
  }
  return query;
}
