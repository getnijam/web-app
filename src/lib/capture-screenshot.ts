import { domToCanvas } from 'modern-screenshot';
import { FEEDBACK_MASK_ATTR, FEEDBACK_UI_ATTR } from '@/lib/feedback-attrs';

/**
 * Viewport screenshots for the feedback dialog.
 *
 * Rasterizing is done by `modern-screenshot`, which paints through an SVG
 * `<foreignObject>` and therefore lets the *browser* do the rendering. That matters
 * here specifically: our entire palette is `oklch()`, and html2canvas-style libraries
 * parse CSS themselves and choke on modern color functions. It also renders our
 * recharts SVG for free, and the app has no iframes or canvases for it to miss.
 */

export { FEEDBACK_MASK_ATTR, FEEDBACK_UI_ATTR } from '@/lib/feedback-attrs';

// Matches the API's 2 MB decoded ceiling with room to spare, so a screenshot is never
// the reason a submission is rejected.
const MAX_BASE64_CHARS = 2_400_000;
// Tried in order until the encoded image fits the budget. The last pair also shrinks
// the canvas, which is what actually saves a very large or very dense viewport.
const ENCODE_STEPS: { quality: number; scale: number }[] = [
  { quality: 0.85, scale: 1 },
  { quality: 0.6, scale: 1 },
  { quality: 0.5, scale: 0.75 },
  { quality: 0.4, scale: 0.5 },
];

// A capture that takes longer than this is not worth making someone wait for; the
// dialog opens without an image instead.
const CAPTURE_TIMEOUT_MS = 4000;

export interface Screenshot {
  /** `data:image/webp;base64,...`, for the thumbnail. */
  dataUrl: string;
  /** The same bytes without the data-URL prefix, which is what the API takes. */
  base64: string;
}

function bullets(length: number): string {
  return '•'.repeat(Math.min(Math.max(length, 4), 48));
}

/**
 * Redact one masked node. Inputs carry their value as a property that XML
 * serialization would drop, so those are written back as an attribute; everything else
 * is replaced wholesale, which also wipes child elements (that is what redacts the
 * TOTP QR code, whose secret is in the drawing rather than in any text).
 */
function maskNode(el: Element): void {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const masked = bullets(el.value.length);
    el.value = masked;
    el.setAttribute('value', masked);
    return;
  }
  el.textContent = bullets((el.textContent ?? '').trim().length);
}

/**
 * Redact secret-bearing nodes in the clone before it is painted. Ingestion keys, read
 * keys and anything else behind a `CopyField` are on screen in cleartext, and a silent
 * screenshot would carry them straight into our Slack.
 */
function redactClone(cloned: Node): void {
  if (!(cloned instanceof Element)) return;
  if (cloned.hasAttribute(FEEDBACK_MASK_ATTR)) maskNode(cloned);
  for (const el of cloned.querySelectorAll(`[${FEEDBACK_MASK_ATTR}]`)) maskNode(el);
}

/** Drop the feedback trigger, its tooltip, and the dialog itself from the capture. */
function excludeFeedbackUi(node: Node): boolean {
  if (!(node instanceof Element)) return true;
  return !node.hasAttribute(FEEDBACK_UI_ATTR);
}

/** Encode down until the payload fits, trading quality then size, in that order. */
function encodeUnderBudget(canvas: HTMLCanvasElement): Screenshot | null {
  for (const step of ENCODE_STEPS) {
    const source = step.scale === 1 ? canvas : downscale(canvas, step.scale);
    if (!source) continue;
    const dataUrl = source.toDataURL('image/webp', step.quality);
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    if (base64.length <= MAX_BASE64_CHARS) return { dataUrl, base64 };
  }
  return null;
}

function downscale(canvas: HTMLCanvasElement, scale: number): HTMLCanvasElement | null {
  const target = document.createElement('canvas');
  target.width = Math.round(canvas.width * scale);
  target.height = Math.round(canvas.height * scale);
  const ctx = target.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(canvas, 0, 0, target.width, target.height);
  return target;
}

/**
 * Capture what the reporter is looking at, right now.
 *
 * Called before the feedback dialog opens, so the dialog is never in its own
 * screenshot. Any open sheet or dialog IS in it: those are portaled to the body and
 * are exactly the context worth keeping.
 *
 * Never throws. A failed or slow capture resolves to null and the dialog opens without
 * an image, because a screenshot is not worth blocking a bug report on.
 */
export async function captureViewport(): Promise<Screenshot | null> {
  if (typeof window === 'undefined') return null;

  try {
    const canvas = await Promise.race([
      domToCanvas(document.body, {
        width: window.innerWidth,
        height: window.innerHeight,
        // 1, not devicePixelRatio: this is triage context, not an asset, and a 2x
        // canvas costs encode time and payload for detail nobody reads.
        scale: 1,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        // The dashboard shell scrolls inside a child, but marketing pages and mobile
        // scroll the document, so the viewport crop has to follow the page offset too.
        style: {
          transform: `translate(${-window.scrollX}px, ${-window.scrollY}px)`,
          transformOrigin: 'top left',
        },
        filter: excludeFeedbackUi,
        onCloneNode: redactClone,
        // Without this a scrolled table rasterizes from its top rather than from what
        // is actually on screen, which is the whole point of the capture.
        features: { restoreScrollPosition: true },
        timeout: CAPTURE_TIMEOUT_MS,
      }),
      new Promise<null>((resolve) => window.setTimeout(() => resolve(null), CAPTURE_TIMEOUT_MS)),
    ]);

    if (!canvas) return null;
    return encodeUnderBudget(canvas);
  } catch {
    // Deliberately swallowed: every failure mode here (a tainted canvas, an asset that
    // would not inline, a browser that dislikes foreignObject) has the same answer,
    // which is to send the feedback without a screenshot.
    return null;
  }
}
