import { HugeiconsIcon } from '@hugeicons/react';
import { Building03Icon } from '@hugeicons/core-free-icons';
import type { SecretKeySummary } from '@/client';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { glyphFor } from '@/lib/project-glyph';

/** Small project glyph tile (icon over the project's fill color). */
export function ProjectGlyphMini({
  project,
}: {
  project: { id: string; name: string; icon: string | null; color: string | null };
}) {
  const glyph = glyphFor(project);
  return (
    <Flex
      align="center"
      justify="center"
      className="size-5 shrink-0 rounded text-primary-foreground"
      style={{ background: glyph.background }}
    >
      <HugeiconsIcon icon={glyph.icon} size={12} strokeWidth={2} />
    </Flex>
  );
}

/**
 * The scope chip for a secret key. `org` → primary-tinted "Organization"; a
 * project-scoped key shows the target project's glyph + name, or "Project
 * removed" once that project is deleted (scope stays 'project').
 */
export function ScopeTag({
  scope,
  project,
}: {
  scope: SecretKeySummary['scope'];
  project: SecretKeySummary['project'];
}) {
  if (scope === 'org') {
    return (
      <Flex
        align="center"
        gap={1.5}
        className="shrink-0 rounded-full bg-primary/12 px-2.5 py-1 text-primary"
      >
        <HugeiconsIcon icon={Building03Icon} size={13} strokeWidth={1.9} />
        <Text as="span" className="text-xs font-medium">
          Organization
        </Text>
      </Flex>
    );
  }

  if (!project) {
    return (
      <Flex
        align="center"
        className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-muted-foreground"
      >
        <Text as="span" className="text-xs font-medium">
          Project removed
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      align="center"
      gap={1.5}
      className="min-w-0 shrink-0 rounded-full bg-secondary py-1 pr-2.5 pl-1.5 text-secondary-foreground"
    >
      <ProjectGlyphMini project={project} />
      <Text as="span" truncate className="max-w-44 text-xs font-medium">
        {project.name}
      </Text>
    </Flex>
  );
}
