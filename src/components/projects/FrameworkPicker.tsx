import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FRAMEWORK_OPTIONS, type TestFramework } from '@/lib/test-framework';
import { FrameworkLogo } from '@/components/projects/framework-logos';

/**
 * Framework chooser for the new-project form: a 2-up grid of cards, each just a 48px
 * brand logo + the framework name. The chosen framework is immutable after creation
 * (the API omits it from updates), so this only appears at creation time — the settings
 * page shows it read-only.
 */
export function FrameworkPicker({
  value,
  onChange,
}: {
  value: TestFramework;
  onChange: (value: TestFramework) => void;
}) {
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as TestFramework)}>
      <Grid cols={2} gap={3}>
        {FRAMEWORK_OPTIONS.map((opt) => (
          <Label
            key={opt.value}
            htmlFor={`fw-${opt.value}`}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
              value === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted',
            )}
          >
            <RadioGroupItem id={`fw-${opt.value}`} value={opt.value} />
            <FrameworkLogo framework={opt.value} size={48} />
            <Text as="span" weight="medium">
              {opt.label}
            </Text>
          </Label>
        ))}
      </Grid>
    </RadioGroup>
  );
}
