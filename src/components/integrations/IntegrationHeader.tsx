import type { ReactNode } from 'react';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

/**
 * Header for an integration detail page: the provider's mark in the same muted
 * badge the integrations list uses, then the title + blurb, with an optional
 * action slot (Edit/Save) on the trailing edge.
 *
 * Pinned to the top of the shell's scroll area so the page you're on and its
 * Save button stay reachable while the settings below scroll. It is opaque and
 * carries a bottom rule so the content passing under it reads as passing under
 * a header, not bleeding through it.
 *
 * `-top-7` (not `top-0`) because a sticky element's pin threshold is the
 * scrollport inset by the scroll container's padding, and AppShell pads its
 * scroll area by `p-7`. At `top-0` the header parks 28px down and the content
 * scrolling through that strip stays visible above it; the negative offset
 * cancels the padding so it lands flush. Retune with AppShell's padding.
 * Anything else that sticks on these pages has to clear it, see the preview
 * panel in SlackDetail.
 */
export function IntegrationHeader({
  logo,
  title,
  description,
  action,
}: {
  logo: ReactNode;
  title: string;
  description: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Flex
      align="center"
      justify="between"
      gap={4}
      className="sticky -top-7 z-20 flex-wrap border-b border-border bg-background py-4"
    >
      <Flex align="center" gap={3.5}>
        <Flex
          as="span"
          align="center"
          justify="center"
          className="size-11 shrink-0 rounded-xl bg-muted"
        >
          {logo}
        </Flex>
        <Flex direction="col" gap={1}>
          <Text variant="h1">{title}</Text>
          <Text color="muted">{description}</Text>
        </Flex>
      </Flex>
      {action}
    </Flex>
  );
}
