import { Flex } from '@/components/ui/flex';

/** passed/failed/flaky counts as small tokened dots; failed/flaky hidden when zero. */
export function CountDots({
  passed,
  failed,
  flaky,
}: {
  passed: number;
  failed: number;
  flaky: number;
}) {
  return (
    <Flex align="center" gap={2.5} className="shrink-0 text-xs tabular-nums text-muted-foreground">
      <Flex align="center" gap={1}>
        <span className="size-1.75 rounded-full bg-success" />
        {passed}
      </Flex>
      {failed > 0 && (
        <Flex align="center" gap={1}>
          <span className="size-1.75 rounded-full bg-destructive" />
          {failed}
        </Flex>
      )}
      {flaky > 0 && (
        <Flex align="center" gap={1}>
          <span className="size-1.75 rounded-full bg-warning" />
          {flaky}
        </Flex>
      )}
    </Flex>
  );
}
