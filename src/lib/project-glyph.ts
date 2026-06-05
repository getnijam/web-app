import type { IconSvgElement } from '@hugeicons/react';
import {
  DashboardBrowsingIcon,
  BrowserIcon,
  CustomerServiceIcon,
  MoneyBag02Icon,
  TestTube03Icon,
  StudentsIcon,
  Airplane01Icon,
  MobileProtectionIcon,
  GameboyIcon,
  Blockchain03Icon,
  WebDesign01Icon,
  Database01Icon,
} from '@hugeicons/core-free-icons';

/** Glyph keys — must match the API's `ICON_KEYS` / `COLOR_KEYS` enums. */
export const ICON_KEYS = [
  'dashboard',
  'browser',
  'support',
  'finance',
  'testing',
  'education',
  'travel',
  'mobile',
  'gaming',
  'blockchain',
  'design',
  'database',
] as const;
export const COLOR_KEYS = [
  'emerald',
  'indigo',
  'amber',
  'sky',
  'pink',
  'teal',
  'rose',
  'violet',
  'orange',
] as const;
export type IconKey = (typeof ICON_KEYS)[number];
export type ColorKey = (typeof COLOR_KEYS)[number];

export const ICON_GLYPHS: Record<IconKey, IconSvgElement> = {
  dashboard: DashboardBrowsingIcon,
  browser: BrowserIcon,
  support: CustomerServiceIcon,
  finance: MoneyBag02Icon,
  testing: TestTube03Icon,
  education: StudentsIcon,
  travel: Airplane01Icon,
  mobile: MobileProtectionIcon,
  gaming: GameboyIcon,
  blockchain: Blockchain03Icon,
  design: WebDesign01Icon,
  database: Database01Icon,
};

/** Shown for projects with no icon set, or an icon key we no longer recognize. */
const FALLBACK_ICON: IconSvgElement = WebDesign01Icon;

/** The design's nine glyph fill colors — defined as theme tokens in globals.css. */
export const COLOR_BACKGROUNDS: Record<ColorKey, string> = {
  emerald: 'var(--glyph-emerald)',
  indigo: 'var(--glyph-indigo)',
  amber: 'var(--glyph-amber)',
  sky: 'var(--glyph-sky)',
  pink: 'var(--glyph-pink)',
  teal: 'var(--glyph-teal)',
  rose: 'var(--glyph-rose)',
  violet: 'var(--glyph-violet)',
  orange: 'var(--glyph-orange)',
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
  /** The project's icon — its chosen glyph, or the fallback when none is set. */
  icon: IconSvgElement;
  /** A flat fill color for the glyph tile background. */
  background: string;
}

/**
 * Resolve a project's glyph: its chosen icon/color, falling back to a default
 * icon and a deterministic color derived from the id when none was set.
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
    icon: isIconKey(project.icon) ? ICON_GLYPHS[project.icon] : FALLBACK_ICON,
    background: COLOR_BACKGROUNDS[colorKey],
  };
}
