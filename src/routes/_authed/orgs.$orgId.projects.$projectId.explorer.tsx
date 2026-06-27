import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';
import type { TestCaseSummary } from '@/client';
import { listProjectTestsOptions } from '@/client/@tanstack/react-query.gen';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { TestRow } from '@/components/explorer/TestRow';
import { FileGroup } from '@/components/explorer/FileGroup';
import { HoverHighlight } from '@/components/ui/hover-highlight';
import { privateSeo } from '@/lib/seo';

interface ExplorerSearch {
  /** Grouping is ON by default; only `?group=false` (flat list) is persisted, so the
   *  param is optional and Links to the route don't need to pass it. */
  group?: false;
}

export const Route = createFileRoute('/_authed/orgs/$orgId/projects/$projectId/explorer')({
  validateSearch: (search: Record<string, unknown>): ExplorerSearch =>
    search.group === false || search.group === 'false' ? { group: false } : {},
  head: () => privateSeo('Test explorer'),
  component: ExplorerPage,
});

/** Group tests by file → [file, tests] pairs sorted by file path. */
function groupTestsByFile(tests: TestCaseSummary[]): Array<[string, TestCaseSummary[]]> {
  const map = new Map<string, TestCaseSummary[]>();
  for (const t of tests) {
    const arr = map.get(t.file);
    if (arr) arr.push(t);
    else map.set(t.file, [t]);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function ExplorerPage() {
  const { orgId, projectId } = Route.useParams();
  // Grouping is on unless the URL explicitly opts out (?group=false).
  const grouped = Route.useSearch().group !== false;
  const navigate = useNavigate({ from: Route.fullPath });
  const q = useQuery(listProjectTestsOptions({ path: { projectId } }));
  const [query, setQuery] = useState('');

  const tests = q.data?.tests ?? [];
  const specFileCount = q.data?.specFileCount ?? 0;
  const term = query.trim().toLowerCase();
  const filtered = term
    ? tests.filter(
        (t) => t.title.toLowerCase().includes(term) || t.file.toLowerCase().includes(term),
      )
    : tests;

  // The search is client-side, so it stays available during the first load (the
  // list shows a skeleton below); it's only hidden once we know the project has
  // no tests at all.
  const showSearch = !q.error && (q.isLoading || tests.length > 0);

  const renderList = () => {
    if (q.isLoading) return <ExplorerSkeleton />;
    if (q.error) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
    if (tests.length === 0)
      return (
        <EmptyState
          title="No test cases yet"
          description="Run your suite and your tests will show up here."
        />
      );
    if (filtered.length === 0)
      return <EmptyState title="No matches" description="No test matches your search." />;
    if (grouped) {
      // While a search is active, start groups expanded so matches are visible. The
      // `term ? 1 : 0` key remounts groups only when crossing the empty boundary, not
      // on every keystroke, so user-toggled groups aren't reset mid-search.
      return (
        <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
          <HoverHighlight inset={4} highlightClassName="rounded-lg bg-accent">
            {groupTestsByFile(filtered).map(([file, fileTests]) => (
              <FileGroup
                key={`${file}:${term ? 1 : 0}`}
                file={file}
                tests={fileTests}
                orgId={orgId}
                projectId={projectId}
                defaultOpen={term.length > 0}
              />
            ))}
          </HoverHighlight>
        </Flex>
      );
    }
    return (
      <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
        <HoverHighlight inset={4} highlightClassName="rounded-lg bg-accent">
          {filtered.map((t) => (
            <TestRow key={t.testId} test={t} orgId={orgId} projectId={projectId} />
          ))}
        </HoverHighlight>
      </Flex>
    );
  };

  return (
    <Flex direction="col" gap={6} className="mx-auto w-full max-w-5xl">
      <Flex direction="col" gap={1}>
        <Text variant="h1">Test explorer</Text>
        <Text color="muted">
          {tests.length} {tests.length === 1 ? 'test case' : 'test cases'} across {specFileCount}{' '}
          {specFileCount === 1 ? 'spec file' : 'spec files'}
        </Text>
      </Flex>

      <Flex direction="col" gap={4}>
        {showSearch && (
          <Flex align="center" gap={3} wrap>
            <Input
              placeholder="Find a test…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-0 flex-1"
              startIcon={<HugeiconsIcon icon={Search01Icon} size={16} />}
              clearable
              onClear={() => setQuery('')}
            />
            <Flex align="center" gap={2} className="shrink-0">
              <Switch
                id="group-by-file"
                checked={grouped}
                onCheckedChange={(v) =>
                  // On = default (drop the param); off = persist ?group=false.
                  navigate({ search: (prev) => ({ ...prev, group: v ? undefined : false }) })
                }
              />
              <Label htmlFor="group-by-file" className="text-sm text-muted-foreground">
                Group by file
              </Label>
            </Flex>
          </Flex>
        )}
        {renderList()}
      </Flex>
    </Flex>
  );
}

function ExplorerSkeleton() {
  return (
    <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
      {Array.from({ length: 8 }).map((_, i) => (
        <Flex
          key={i}
          align="center"
          gap={3}
          className="border-b border-border px-4 py-3 last:border-b-0"
        >
          <Skeleton className="size-5 rounded-full" />
          <Flex direction="col" gap={1.5} className="min-w-0 flex-1">
            <Skeleton className="h-4 w-64 rounded-md" />
            <Skeleton className="h-3 w-40 rounded-md" />
          </Flex>
          <Skeleton className="h-3 w-10 rounded-md" />
        </Flex>
      ))}
    </Flex>
  );
}
