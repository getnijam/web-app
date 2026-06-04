import { Fragment, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SourceCodeIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Lightweight, zero-dep TS/JS highlighter: comments, strings, keywords, numbers.
// Per-line (no cross-line block comments) — good enough for a source preview.
const KEYWORDS = new Set([
  'const',
  'let',
  'var',
  'function',
  'async',
  'await',
  'return',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'import',
  'export',
  'from',
  'as',
  'default',
  'type',
  'interface',
  'class',
  'extends',
  'implements',
  'new',
  'typeof',
  'instanceof',
  'in',
  'of',
  'null',
  'undefined',
  'true',
  'false',
  'void',
  'this',
  'super',
  'yield',
  'enum',
  'namespace',
  'public',
  'private',
  'protected',
  'readonly',
  'static',
  'get',
  'set',
  'try',
  'catch',
  'finally',
  'throw',
]);

const TOKEN =
  /(\/\/.*$|\/\*.*?\*\/)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|([A-Za-z_$][\w$]*)|(\d[\d_.eExXbBoO]*)/g;

function renderLine(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line))) {
    if (m.index > last) nodes.push(line.slice(last, m.index));
    if (m[1])
      nodes.push(
        <span key={key++} className="text-muted-foreground italic">
          {m[1]}
        </span>,
      );
    else if (m[2])
      nodes.push(
        <span key={key++} className="text-success">
          {m[2]}
        </span>,
      );
    else if (m[3])
      nodes.push(
        KEYWORDS.has(m[3]) ? (
          <span key={key++} className="font-medium text-primary">
            {m[3]}
          </span>
        ) : (
          <Fragment key={key++}>{m[3]}</Fragment>
        ),
      );
    else if (m[4])
      nodes.push(
        <span key={key++} className="text-info">
          {m[4]}
        </span>,
      );
    last = TOKEN.lastIndex;
  }
  if (last < line.length) nodes.push(line.slice(last));
  return nodes;
}

/** Human language label from a spec-file extension (shown in the header). */
function langLabel(file: string): string {
  if (/\.tsx?$/.test(file)) return 'TypeScript';
  if (/\.(jsx?|mjs|cjs)$/.test(file)) return 'JavaScript';
  if (/\.py$/.test(file)) return 'Python';
  return 'Source';
}

/**
 * Source with a filename header, line-number gutter, and lightweight
 * highlighting; `highlightLine` is 1-based. `name` is the basename shown in the
 * header (the full path lives in the page sub-header).
 */
export function CodeBlock({
  code,
  name,
  highlightLine,
}: {
  code: string;
  name: string;
  highlightLine?: number | null;
}) {
  const lines = code.replace(/\n$/, '').split('\n');
  return (
    <Flex direction="col" className="overflow-hidden rounded-2xl border border-border bg-card">
      <Flex align="center" justify="between" gap={3} className="border-b border-border px-4 py-2.5">
        <Flex align="center" gap={2} className="min-w-0">
          <HugeiconsIcon
            icon={SourceCodeIcon}
            size={15}
            className="shrink-0 text-muted-foreground"
          />
          <Text as="span" truncate className="min-w-0 text-sm font-semibold">
            {name}
          </Text>
        </Flex>
        <Text as="span" className="shrink-0 text-xs text-muted-foreground">
          {langLabel(name)}
        </Text>
      </Flex>
      <div className="scroll-area max-h-144 overflow-auto">
        <pre className="py-2 font-mono text-xs leading-relaxed">
          {lines.map((line, i) => {
            const n = i + 1;
            return (
              <Flex key={i} className={cn(n === highlightLine && 'bg-warning/10')}>
                <span className="w-12 shrink-0 px-3 text-right text-muted-foreground/50 select-none">
                  {n}
                </span>
                <code className="flex-1 px-3 whitespace-pre">{renderLine(line)}</code>
              </Flex>
            );
          })}
        </pre>
      </div>
    </Flex>
  );
}
