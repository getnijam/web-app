import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Lightweight, zero-dep TS/JS highlighter: comments, strings, keywords, numbers.
// Per-line (no cross-line block comments) — good enough for a source preview.
const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'import', 'export', 'from', 'as', 'default', 'type',
  'interface', 'class', 'extends', 'implements', 'new', 'typeof', 'instanceof', 'in', 'of', 'null',
  'undefined', 'true', 'false', 'void', 'this', 'super', 'yield', 'enum', 'namespace', 'public',
  'private', 'protected', 'readonly', 'static', 'get', 'set', 'try', 'catch', 'finally', 'throw',
]);

const TOKEN = /(\/\/.*$|\/\*.*?\*\/)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|([A-Za-z_$][\w$]*)|(\d[\d_.eExXbBoO]*)/g;

function renderLine(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line))) {
    if (m.index > last) nodes.push(line.slice(last, m.index));
    if (m[1]) nodes.push(<span key={key++} className="text-muted-foreground italic">{m[1]}</span>);
    else if (m[2]) nodes.push(<span key={key++} className="text-success">{m[2]}</span>);
    else if (m[3])
      nodes.push(
        KEYWORDS.has(m[3]) ? (
          <span key={key++} className="font-medium text-primary">{m[3]}</span>
        ) : (
          <Fragment key={key++}>{m[3]}</Fragment>
        ),
      );
    else if (m[4]) nodes.push(<span key={key++} className="text-info">{m[4]}</span>);
    last = TOKEN.lastIndex;
  }
  if (last < line.length) nodes.push(line.slice(last));
  return nodes;
}

/** Source with line numbers + lightweight highlighting; `highlightLine` is 1-based. */
export function CodeBlock({ code, highlightLine }: { code: string; highlightLine?: number | null }) {
  const lines = code.replace(/\n$/, '').split('\n');
  return (
    <div className="scroll-area max-h-144 overflow-auto rounded-2xl border border-border bg-card">
      <pre className="py-2 font-mono text-xs leading-relaxed">
        {lines.map((line, i) => {
          const n = i + 1;
          return (
            <div key={i} className={cn('flex', n === highlightLine && 'bg-warning/10')}>
              <span className="w-12 shrink-0 px-3 text-right text-muted-foreground/50 select-none">
                {n}
              </span>
              <code className="flex-1 px-3 whitespace-pre">{renderLine(line)}</code>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
