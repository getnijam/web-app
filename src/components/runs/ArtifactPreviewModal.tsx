import type { ArtifactSummary } from '@/client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';

/** Centered preview of a screenshot/video artifact (Esc/backdrop close via Dialog). */
export function ArtifactPreviewModal({
  artifact,
  onOpenChange,
}: {
  artifact: ArtifactSummary | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!artifact} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="font-mono text-sm font-normal text-muted-foreground">
          {artifact?.name ?? artifact?.kind}
        </DialogTitle>
        {artifact && (
          <AspectRatio ratio={16 / 10} className="overflow-hidden rounded-lg bg-muted">
            {artifact.kind === 'video' ? (
              <video
                src={artifact.url ?? undefined}
                controls
                autoPlay
                className="size-full object-contain"
              />
            ) : (
              <img src={artifact.url ?? undefined} alt="" className="size-full object-contain" />
            )}
          </AspectRatio>
        )}
      </DialogContent>
    </Dialog>
  );
}
