import { Link } from '@tanstack/react-router';
import { RUNS_ROUTE } from '@/lib/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { GitBranchIcon, Layers01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import type { ProjectSummary } from '@/client';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { glyphFor } from '@/lib/project-glyph';
import { ProjectGlyphIcon } from '@/components/projects/ProjectGlyphIcon';
import { timeAgo, formatDate } from '@/lib/format';
import { RunChart } from './RunChart';
import { StatusPill } from './StatusPill';

export function ProjectCard({ project, orgId }: { project: ProjectSummary; orgId: string }) {
  const glyph = glyphFor(project);
  const stats = project.stats;
  const hasRuns = stats !== null && project.chartRuns.length > 0;
  // Repo comes from the latest run (the reporter sends it), not project config.
  const repo = stats?.repository ?? null;
  const fallbackLabel = hasRuns ? 'no repository info' : 'no runs yet';

  return (
    <Flex
      as={Link}
      to={RUNS_ROUTE}
      params={{ orgId, projectId: project.id } as never}
      direction="col"
      gap={3.5}
      className="group rounded-2xl border border-border bg-card p-4.5 transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-lg"
    >
      {/* header */}
      <Flex align="start" gap={3}>
        <Flex
          align="center"
          justify="center"
          className="size-9.5 shrink-0 rounded-lg text-primary-foreground"
          style={{ background: glyph.background }}
        >
          <ProjectGlyphIcon iconKey={glyph.iconKey} size={18} strokeWidth={1.9} />
        </Flex>
        <Flex direction="col" className="min-w-0 flex-1">
          <Text as="span" truncate className="text-base font-semibold tracking-tight">
            {project.name}
          </Text>
          {repo ? (
            <Flex
              align="center"
              gap={1}
              className="mt-0.5 min-w-0 font-mono text-xs text-muted-foreground"
            >
              <HugeiconsIcon icon={GitBranchIcon} size={13} className="shrink-0" />
              <span className="truncate">{repo}</span>
            </Flex>
          ) : (
            <Text as="span" className="mt-0.5 font-mono text-xs text-muted-foreground italic">
              {fallbackLabel}
            </Text>
          )}
        </Flex>
        <StatusPill status={hasRuns && stats ? stats.status : 'new'} />
      </Flex>

      {/* description */}
      <Text className="line-clamp-2 min-h-9.5 text-sm leading-relaxed text-muted-foreground">
        {project.description || 'No description provided.'}
      </Text>

      {/* chart or empty-runs panel */}
      {hasRuns && stats ? (
        <Flex direction="col" gap={2}>
          <Flex align="baseline" justify="between">
            <Text as="span" className="text-xs font-semibold text-muted-foreground">
              Last {project.chartRuns.length} runs
            </Text>
            <Text as="span" className="font-mono text-xs text-muted-foreground">
              {stats.passRate}% pass
            </Text>
          </Flex>
          <RunChart runs={project.chartRuns} height={78} />
        </Flex>
      ) : (
        <Flex
          align="center"
          gap={2}
          className="h-19.5 rounded-lg border border-dashed border-border bg-muted/35 px-3.5 text-xs text-muted-foreground"
        >
          <HugeiconsIcon icon={Clock01Icon} size={16} className="shrink-0" />
          Waiting for the first run{stats?.ciProvider ? ` from ${stats.ciProvider}` : ''}
        </Flex>
      )}

      {/* full-bleed divider */}
      <div className="-mx-4.5 h-px bg-border" />

      {/* footer */}
      <Flex align="center" className="gap-3.5 text-xs text-muted-foreground">
        {hasRuns && stats ? (
          <>
            <Flex align="center" gap={1.5}>
              <HugeiconsIcon icon={Layers01Icon} size={14} className="shrink-0" />
              <b className="font-semibold text-foreground tabular-nums">{stats.testsCount}</b> tests
            </Flex>
            <Flex align="center" gap={1.5}>
              <HugeiconsIcon icon={Clock01Icon} size={14} className="shrink-0" />
              {timeAgo(stats.lastRunAt)}
            </Flex>
          </>
        ) : (
          <>
            <Flex align="center" gap={1.5}>
              <HugeiconsIcon icon={Layers01Icon} size={14} className="shrink-0" />
              <b className="font-semibold text-foreground">-</b> tests
            </Flex>
            <Flex align="center" gap={1.5}>
              <HugeiconsIcon icon={Clock01Icon} size={14} className="shrink-0" />
              never run
            </Flex>
          </>
        )}
        <span className="ml-auto text-xs">{formatDate(project.createdAt)}</span>
      </Flex>
    </Flex>
  );
}
