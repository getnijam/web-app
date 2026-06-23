import type { DateRange } from 'react-day-picker';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterCombobox, type ComboboxOption } from '@/components/ui/combobox';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { DateRangeFilter } from '@/components/explorer/DateRangeFilter';
import type { RunFiltersResponse } from '@/client';
import { STATUS_OPTIONS, type RunStatusFilter } from './status-filter';

export type { RunStatusFilter } from './status-filter';

/** Mirrors the API's `UNSET_ENV` sentinel — selects runs with no environment. */
const UNSET_ENV = '(unset)';

export interface RunFilterValues {
  status: RunStatusFilter;
  branch?: string;
  user?: string;
  environment?: string;
}

/** Status segmented control + branch/user/date filters + a live "N of M" count. */
export function RunFilters({
  values,
  options,
  total,
  projectTotal,
  onChange,
  dateRange,
  onDateRangeChange,
}: {
  values: RunFilterValues;
  options: RunFiltersResponse;
  total: number;
  projectTotal: number;
  onChange: (patch: Partial<RunFilterValues>) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}) {
  const branchOptions: ComboboxOption[] = options.branches.map((b) => ({
    value: b,
    label: b,
    className: 'font-mono',
  }));
  const userOptions: ComboboxOption[] = options.users.map((u) => ({
    value: u.email,
    label: u.name?.trim() || u.email,
  }));
  const envOptions: ComboboxOption[] = [
    ...options.environments.map((e) => ({ value: e, label: e })),
    ...(options.hasUnset
      ? [{ value: UNSET_ENV, label: 'Unset', className: 'text-muted-foreground' }]
      : []),
  ];

  return (
    <Flex align="center" gap={3} wrap>
      <Tabs
        value={values.status}
        onValueChange={(v) => onChange({ status: (v || 'all') as RunStatusFilter })}
      >
        <TabsList>
          {STATUS_OPTIONS.map((o) => (
            <TabsTrigger key={o.value} value={o.value}>
              {o.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <FilterCombobox
        value={values.branch}
        onChange={(v) => onChange({ branch: v })}
        options={branchOptions}
        placeholder="All branches"
        emptyText="No branches"
        width="w-44"
      />

      <FilterCombobox
        value={values.user}
        onChange={(v) => onChange({ user: v })}
        options={userOptions}
        placeholder="All users"
        emptyText="No users"
        width="w-48"
      />

      {options.environments.length > 0 && (
        <FilterCombobox
          value={values.environment}
          onChange={(v) => onChange({ environment: v })}
          options={envOptions}
          placeholder="All environments"
          emptyText="No environments"
          width="w-44"
        />
      )}

      <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />

      <Text as="span" className="ml-auto text-sm text-muted-foreground tabular-nums">
        {total} of {projectTotal} runs
      </Text>
    </Flex>
  );
}
