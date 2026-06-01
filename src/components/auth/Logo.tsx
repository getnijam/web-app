import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

/**
 * Nijam brand: a gradient mark tile + wordmark (matches the design sidebar).
 * The portion from the first "." onward is muted (e.g. "Nijam" bold + ".dev").
 */
export function Logo({ className, label = 'Nijam.dev' }: { className?: string; label?: string }) {
  const dot = label.indexOf('.');
  const head = dot >= 0 ? label.slice(0, dot) : label;
  const tail = dot >= 0 ? label.slice(dot) : '';

  return (
    <Flex as="span" inline align="center" gap={2.5} className={className}>
      <Flex
        as="span"
        inline
        align="center"
        justify="center"
        className="size-7.5 shrink-0 rounded-mark bg-brand text-primary-foreground shadow-sm"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6.5 12.5l3.2 3.2 7.8-7.8"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Flex>
      <Text as="span" className="text-base font-semibold tracking-tight">
        {head}
        {tail && <span className="font-medium text-muted-foreground">{tail}</span>}
      </Text>
    </Flex>
  );
}
