import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import type { RunFiltersResponse } from '@/client';

export type RunStatusFilter = 'all' | 'passed' | 'failed' | 'flaky';

const STATUS_OPTIONS: { value: RunStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'flaky', label: 'Flaky' },
];

const ALL = '__all__';

export interface RunFilterValues {
  status: RunStatusFilter;
  branch?: string;
  user?: string;
}

/** Status segmented control + branch/user selects + a live "N of M" count. */
export function RunFilters({
  values,
  options,
  total,
  projectTotal,
  onChange,
}: {
  values: RunFilterValues;
  options: RunFiltersResponse;
  total: number;
  projectTotal: number;
  onChange: (patch: Partial<RunFilterValues>) => void;
}) {
  return (
    <Flex align="center" gap={3} wrap>
      <Tabs
        value={values.status}
        onValueChange={(v) => onChange({ status: (v || 'all') as RunStatusFilter })}
      >
        <TabsList className="rounded-lg">
          {STATUS_OPTIONS.map((o) => (
            <TabsTrigger
              key={o.value}
              value={o.value}
              className="rounded-md px-3 data-[state=active]:font-semibold data-[state=active]:shadow-sm"
            >
              {o.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Select
        value={values.branch ?? ALL}
        onValueChange={(v) => onChange({ branch: v === ALL ? undefined : v })}
      >
        <SelectTrigger size="sm" className="w-44">
          <SelectValue placeholder="All branches" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All branches</SelectItem>
          {options.branches.map((b) => (
            <SelectItem key={b} value={b} className="font-mono">
              {b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={values.user ?? ALL}
        onValueChange={(v) => onChange({ user: v === ALL ? undefined : v })}
      >
        <SelectTrigger size="sm" className="w-48">
          <SelectValue placeholder="All users" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All users</SelectItem>
          {options.users.map((u) => (
            <SelectItem key={u.email} value={u.email}>
              {u.name?.trim() || u.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Text as="span" className="ml-auto text-sm text-muted-foreground tabular-nums">
        {total} of {projectTotal} runs
      </Text>
    </Flex>
  );
}
