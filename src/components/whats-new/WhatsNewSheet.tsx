import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { formatDate } from '@/lib/format';
import {
  UPDATES,
  isRecentUpdate,
  updateShippedAt,
  type Update,
  type UpdateSection,
} from './updates';

/** The logo tile shared by the list rows and the detail header. */
function UpdateBadge({ update, size }: { update: Update; size: number }) {
  return (
    <Flex as="span" align="center" justify="center" className="size-9 shrink-0 rounded-lg bg-muted">
      {update.icon(size)}
    </Flex>
  );
}

/** Title, category and date, shown above both the summary and the write-up. */
function UpdateMeta({ update }: { update: Update }) {
  return (
    <Text variant="caption" color="muted">
      {update.tag} · {formatDate(updateShippedAt(update))}
    </Text>
  );
}

/** One row in the list: the logo tile, the title and meta, then the summary. */
function UpdateRow({
  update,
  isNew,
  onOpen,
}: {
  update: Update;
  isNew: boolean;
  onOpen: () => void;
}) {
  return (
    // A full-width row rather than a pill, so the Button's own layout/shape is overridden:
    // it stays the interactive element, the className makes it read as a list row.
    // `border-0` before `border-b` is load-bearing: the button base is
    // `border border-transparent`, and `border-border` merges over the color on ALL
    // four sides, so without zeroing the widths first the row draws a full box.
    <Button
      variant="ghost"
      onClick={onOpen}
      className="h-auto w-full items-start justify-start gap-3.5 rounded-none border-0 border-b border-border px-6 py-4 text-left font-normal whitespace-normal last:border-b-0"
    >
      <UpdateBadge update={update} size={20} />
      <Flex direction="col" gap={1} className="min-w-0 flex-1">
        <Flex align="center" gap={2} className="min-w-0">
          <Text as="span" weight="semibold" truncate className="min-w-0">
            {update.title}
          </Text>
          {isNew && <Badge className="shrink-0">New</Badge>}
        </Flex>
        <UpdateMeta update={update} />
        <Text variant="caption" color="muted" className="text-pretty">
          {update.summary}
        </Text>
      </Flex>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        size={16}
        className="mt-0.5 shrink-0 text-muted-foreground"
      />
    </Button>
  );
}

/** A section of the write-up: an optional heading, an optional paragraph, optional bullets. */
function Section({ section }: { section: UpdateSection }) {
  return (
    <Flex direction="col" gap={2}>
      {section.heading && (
        <Text as="h3" variant="h5">
          {section.heading}
        </Text>
      )}
      {section.body && (
        <Text color="muted" className="leading-relaxed text-pretty">
          {section.body}
        </Text>
      )}
      {section.bullets && (
        <Flex as="ul" direction="col" gap={1.5}>
          {section.bullets.map((bullet) => (
            <Flex as="li" key={bullet} align="start" gap={2.5}>
              <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
              <Text color="muted" className="leading-relaxed text-pretty">
                {bullet}
              </Text>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
}

/** The full write-up for one update, shown in place of the list inside the same sheet. */
function UpdateDetail({
  update,
  orgId,
  onBack,
  onNavigate,
}: {
  update: Update;
  orgId: string;
  onBack: () => void;
  onNavigate: () => void;
}) {
  return (
    <Flex direction="col" gap={5} className="px-6 pt-4 pb-8">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 self-start">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        All updates
      </Button>

      <Flex align="center" gap={3.5}>
        <UpdateBadge update={update} size={22} />
        <Flex direction="col" gap={1} className="min-w-0">
          <Text as="h2" variant="h3" className="text-pretty">
            {update.title}
          </Text>
          <UpdateMeta update={update} />
        </Flex>
      </Flex>

      {update.sections.map((section, i) => (
        <Section key={section.heading ?? `section-${i}`} section={section} />
      ))}

      {update.cta && (
        // `as never` because the path comes from the entry data, so it is a widened string
        // TanStack can't infer params from. Every update route is org-scoped.
        <Button asChild variant="outline" className="self-start" onClick={onNavigate}>
          <Link to={update.cta.to as never} params={{ orgId } as never}>
            {update.cta.label}
          </Link>
        </Button>
      )}
    </Flex>
  );
}

/**
 * The "What's new" panel: the shipped updates listed on the right edge, each opening its full
 * write-up in place with a way back to the list. The selection resets on close, so the sheet
 * always reopens on the list. Content is hard-coded in `updates.tsx`, nothing is fetched.
 */
export function WhatsNewSheet({
  open,
  onOpenChange,
  orgId,
  isSeen,
  onUpdateOpened,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  isSeen: (id: string) => boolean;
  onUpdateOpened: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = UPDATES.find((u) => u.id === selectedId);

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectedId(null);
    onOpenChange(next);
  };

  // Opening the write-up is what marks an update read, so the dot survives a user who
  // opens the panel, skims the summaries, and closes it again.
  const openUpdate = (id: string) => {
    onUpdateOpened(id);
    setSelectedId(id);
  };

  const renderBody = () => {
    if (selected) {
      return (
        <UpdateDetail
          update={selected}
          orgId={orgId}
          onBack={() => setSelectedId(null)}
          onNavigate={() => handleOpenChange(false)}
        />
      );
    }
    return (
      <Flex direction="col">
        {UPDATES.map((update) => (
          <UpdateRow
            key={update.id}
            update={update}
            isNew={isRecentUpdate(update) && !isSeen(update.id)}
            onOpen={() => openUpdate(update.id)}
          />
        ))}
      </Flex>
    );
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border">
          <SheetTitle className="pr-8">What&rsquo;s new</SheetTitle>
          <SheetDescription>The latest changes we have shipped to Nijam.</SheetDescription>
        </SheetHeader>
        <div className="scroll-area min-h-0 flex-1 overflow-y-auto">{renderBody()}</div>
      </SheetContent>
    </Sheet>
  );
}
