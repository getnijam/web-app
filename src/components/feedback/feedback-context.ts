import { getStrictContext } from '@/lib/get-strict-context';

export interface FeedbackContextValue {
  /** Capture the viewport, then open the dialog. Safe to call from any host. */
  start: () => void;
  /** True while the capture runs, which is what puts the trigger in its busy state. */
  capturing: boolean;
}

// Split out of FeedbackProvider so that file exports only components (fast refresh).
export const [FeedbackContextProvider, useFeedback] =
  getStrictContext<FeedbackContextValue>('<FeedbackProvider>');
