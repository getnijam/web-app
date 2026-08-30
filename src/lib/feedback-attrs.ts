/**
 * Marker attributes for the feedback screenshot, in their own module so a component
 * can opt into masking without pulling the rasterizer into its bundle.
 */

/** Exclude a node, and its children, from the capture entirely: the feedback UI itself. */
export const FEEDBACK_UI_ATTR = 'data-feedback-ui';

/**
 * Redact a node's contents before it is rasterized. Put this on anything that renders
 * a live secret: an API key, a TOTP seed, recovery codes. The capture is silent, so a
 * missing mark here is a credential in our Slack.
 */
export const FEEDBACK_MASK_ATTR = 'data-feedback-mask';
