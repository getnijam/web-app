// Per-page SEO head for public pages. This app is a client-rendered SPA, so the
// tags are applied client-side via TanStack Router's route `head` option +
// `<HeadContent />` (see __root.tsx). `index.html` carries static homepage
// defaults for non-JS scrapers; `main.tsx` strips those on boot so the router is
// the single source of truth in the browser (avoids duplicate tags — HeadContent
// only dedupes among route-provided meta, not against static index.html tags).

const SITE_URL = 'https://www.nijam.dev';
const SITE_NAME = 'Nijam';
const OG_IMAGE = `${SITE_URL}/og.png`;

export const DEFAULT_TITLE = 'Nijam — Playwright test analytics & flakiness dashboard';
export const DEFAULT_DESCRIPTION =
  'The missing dashboard for your Playwright suite — run history, flakiness scoring, and failure traces from every CI run. Think Sentry, for Playwright.';

interface SeoInput {
  /** Page-specific title; rendered as "<title> · Nijam". Omit for the site default. */
  title?: string;
  description?: string;
  /** Path of the canonical URL, e.g. "/login". Defaults to "" (home). */
  path?: string;
  /** Keep this page out of search results (auth/utility pages). */
  noindex?: boolean;
}

/** Build the `head` ({ meta, links }) for a public route. */
export function seo({ title, description, path = '', noindex = false }: SeoInput = {}) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${path}`;

  const meta = [
    { title: fullTitle },
    { name: 'description', content: desc },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: desc },
    { property: 'og:url', content: url },
    { property: 'og:image', content: OG_IMAGE },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: desc },
    { name: 'twitter:image', content: OG_IMAGE },
    ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
  ];

  return { meta, links: [{ rel: 'canonical', href: url }] };
}

/**
 * Minimal head for private (dashboard) pages: a page title + `noindex`. No OG or
 * canonical — these pages are never indexed or shared, and a canonical on a
 * noindexed page sends mixed signals to crawlers.
 */
export function privateSeo(title: string) {
  return {
    meta: [{ title: `${title} · ${SITE_NAME}` }, { name: 'robots', content: 'noindex, nofollow' }],
  };
}

/** Site-wide fallback head (root route): a default indexable title + description. */
export function baseHead() {
  return {
    meta: [{ title: DEFAULT_TITLE }, { name: 'description', content: DEFAULT_DESCRIPTION }],
  };
}
