import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { FileZipIcon, ArrowUpRight01Icon, PlayIcon } from '@hugeicons/core-free-icons';
import type { ArtifactSummary } from '@/client';
import { getArtifactUrlOptions } from '@/client/@tanstack/react-query.gen';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { isApiError } from '@/lib/api-error';
import { notify } from '@/lib/notify';
import { openBlankTab, openInNewTab } from '@/lib/navigation';

const TRACE_VIEWER = 'https://trace.playwright.dev/';

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Trace (→ Playwright trace viewer) + screenshot/video thumbnails for one attempt. */
export function ArtifactsRow({
  artifacts,
  onPreview,
}: {
  artifacts: ArtifactSummary[];
  onPreview: (artifact: ArtifactSummary) => void;
}) {
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (artifacts.length === 0) return null;
  const traces = artifacts.filter((a) => a.kind === 'trace');
  const screenshots = artifacts.filter((a) => a.kind === 'screenshot');
  const videos = artifacts.filter((a) => a.kind === 'video');

  // Open a blank tab synchronously (within the click gesture, so it isn't blocked),
  // mint a fresh 15-min signed URL, then load it in the Playwright trace viewer.
  async function openTrace(attachmentId: string) {
    const win = openBlankTab();
    setLoadingId(attachmentId);
    try {
      const { url } = await queryClient.fetchQuery(
        getArtifactUrlOptions({ path: { attachmentId } }),
      );
      const viewer = `${TRACE_VIEWER}?trace=${encodeURIComponent(url)}`;
      if (win) win.location.href = viewer;
      else openInNewTab(viewer);
    } catch (err) {
      win?.close();
      notify.error("Couldn't open trace", {
        description: isApiError(err)
          ? err.error.message
          : 'Something went wrong. Please try again.',
      });
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <Flex direction="col" gap={2}>
      <Text as="span" className="text-xs font-medium text-muted-foreground">
        Artifacts
      </Text>
      <Flex gap={2.5} wrap align="center">
        {traces.map((t) => (
          <Button
            variant="ghost"
            size="sm"
            key={t.id}
            type="button"
            disabled={loadingId === t.id}
            onClick={() => openTrace(t.id)}
            className="h-auto gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs hover:bg-accent disabled:opacity-60"
          >
            <HugeiconsIcon icon={FileZipIcon} size={15} className="text-muted-foreground" />
            <span className="font-mono">View trace</span>
            <span className="text-muted-foreground tabular-nums">{formatBytes(t.sizeBytes)}</span>
            {loadingId === t.id ? (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            ) : (
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={14}
                className="text-muted-foreground"
              />
            )}
          </Button>
        ))}

        {screenshots.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-label="Preview screenshot"
            onClick={() => onPreview(s)}
            className="size-16 overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-primary/45"
          >
            <img src={s.url ?? undefined} alt="" className="size-full object-cover" />
          </button>
        ))}

        {videos.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-label="Preview video"
            onClick={() => onPreview(v)}
            className="relative size-16 overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-primary/45"
          >
            <video
              src={v.url ?? undefined}
              muted
              preload="metadata"
              className="size-full object-cover"
            />
            <Flex align="center" justify="center" className="absolute inset-0">
              <Flex
                align="center"
                justify="center"
                className="size-7 rounded-full bg-background/85 text-foreground shadow-sm"
              >
                <HugeiconsIcon icon={PlayIcon} size={15} />
              </Flex>
            </Flex>
          </button>
        ))}
      </Flex>
    </Flex>
  );
}
