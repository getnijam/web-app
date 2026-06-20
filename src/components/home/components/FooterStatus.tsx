import { useQuery } from '@tanstack/react-query';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Native replacement for Better Stack's badge <iframe>: polls the status page's
// public JSON API and renders our own pill so it matches the footer's theme. This
// fetches Better Stack (not the Nijam API), so the generated-client convention
// doesn't apply — a direct fetch is the only option, and the endpoint sends
// `access-control-allow-origin: *`, so the cross-origin browser call is allowed.
const STATUS_PAGE_URL = 'https://status.nijam.dev';

type AggregateState = 'operational' | 'degraded' | 'downtime' | 'maintenance';

const STATUS_META: Record<AggregateState, { label: string; color: string }> = {
  operational: { label: 'All systems operational', color: 'bg-success' },
  degraded: { label: 'Degraded performance', color: 'bg-warning' },
  downtime: { label: 'Active outage', color: 'bg-destructive' },
  maintenance: { label: 'Under maintenance', color: 'bg-info' },
};

function isAggregateState(value: unknown): value is AggregateState {
  return (
    value === 'operational' ||
    value === 'degraded' ||
    value === 'downtime' ||
    value === 'maintenance'
  );
}

async function fetchAggregateState(): Promise<AggregateState> {
  const res = await fetch(`${STATUS_PAGE_URL}/index.json`, {
    headers: { accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Status page responded ${res.status}`);
  const json = (await res.json()) as { data?: { attributes?: { aggregate_state?: unknown } } };
  const state = json.data?.attributes?.aggregate_state;
  if (!isAggregateState(state)) throw new Error('Unexpected aggregate_state');
  return state;
}

/** Live system-status pill in the footer, sourced from the Better Stack status page. */
export function FooterStatus() {
  const { data, isPending } = useQuery({
    queryKey: ['betterstack-status'],
    queryFn: fetchAggregateState,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    retry: 1,
  });

  const meta = data ? STATUS_META[data] : null;
  // Loading / error / unexpected → a neutral, non-alarming pill that still links out
  // (never flash a red dot just because the fetch is in flight or failed).
  const label = meta?.label ?? (isPending ? 'Checking status…' : 'System status');
  const color = meta?.color ?? 'bg-muted-foreground';

  return (
    <a
      href={STATUS_PAGE_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="View Nijam status page"
      className="group mt-4 flex w-fit items-center gap-2 py-1"
    >
      {/* Pulsating indicator: a solid dot under an expanding, fading halo (animate-ping). */}
      <span className="relative flex size-2 shrink-0" aria-hidden="true">
        <span
          className={cn(
            'absolute inline-flex size-full animate-ping rounded-full opacity-75',
            color,
          )}
        />
        <span className={cn('relative inline-flex size-2 rounded-full', color)} />
      </span>
      <Text
        as="span"
        className="text-sm text-background/80 transition-colors group-hover:text-background"
      >
        {label}
      </Text>
    </a>
  );
}
