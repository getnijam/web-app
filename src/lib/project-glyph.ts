import type { IconSvgElement } from '@hugeicons/react';
import {
  Layers01Icon,
  TestTube01Icon,
  GitBranchIcon,
  SourceCodeIcon,
  Book02Icon,
  WorkflowSquare01Icon,
  PulseIcon,
  Home01Icon,
} from '@hugeicons/core-free-icons';

/** Glyph keys — must match the API's `ICON_KEYS` / `COLOR_KEYS` enums. */
export const ICON_KEYS = [
  'layers',
  'flask',
  'git',
  'code',
  'docs',
  'flow',
  'pulse',
  'home',
] as const;
export const COLOR_KEYS = ['emerald', 'indigo', 'amber', 'sky', 'pink', 'teal'] as const;
export type IconKey = (typeof ICON_KEYS)[number];
export type ColorKey = (typeof COLOR_KEYS)[number];

export const ICON_GLYPHS: Record<IconKey, IconSvgElement> = {
  layers: Layers01Icon,
  flask: TestTube01Icon,
  git: GitBranchIcon,
  code: SourceCodeIcon,
  docs: Book02Icon,
  flow: WorkflowSquare01Icon,
  pulse: PulseIcon,
  home: Home01Icon,
};

/** The design's six glyph gradients — defined as theme tokens in globals.css. */
export const COLOR_GRADIENTS: Record<ColorKey, string> = {
  emerald: 'var(--glyph-emerald)',
  indigo: 'var(--glyph-indigo)',
  amber: 'var(--glyph-amber)',
  sky: 'var(--glyph-sky)',
  pink: 'var(--glyph-pink)',
  teal: 'var(--glyph-teal)',
};

function isIconKey(v: string | null): v is IconKey {
  return v !== null && (ICON_KEYS as readonly string[]).includes(v);
}
function isColorKey(v: string | null): v is ColorKey {
  return v !== null && (COLOR_KEYS as readonly string[]).includes(v);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export interface Glyph {
  /** The chosen icon, or null to render initials instead. */
  icon: IconSvgElement | null;
  /** A CSS `linear-gradient(...)` for the glyph tile background. */
  gradient: string;
}

/**
 * Resolve a project's glyph: its chosen icon/color, or a deterministic
 * gradient derived from the id when none was set (older projects).
 */
export function glyphFor(project: {
  id: string;
  icon: string | null;
  color: string | null;
}): Glyph {
  const colorKey: ColorKey = isColorKey(project.color)
    ? project.color
    : COLOR_KEYS[hash(project.id) % COLOR_KEYS.length]!;
  return {
    icon: isIconKey(project.icon) ? ICON_GLYPHS[project.icon] : null,
    gradient: COLOR_GRADIENTS[colorKey],
  };
}
