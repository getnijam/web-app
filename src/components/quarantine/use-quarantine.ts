import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addProjectQuarantineMutation,
  removeProjectQuarantineMutation,
} from '@/client/@tanstack/react-query.gen';
import { notify } from '@/lib/notify';
import { isApiError } from '@/lib/api-error';

const errMsg = (err: unknown, fallback = 'Something went wrong. Please try again.') =>
  isApiError(err) ? err.error.message : fallback;

/**
 * Quarantine / un-quarantine a test, with the cache invalidation every caller needs.
 *
 * Quarantining changes a run's verdict, so it is not enough to refresh the list the
 * button was clicked from: the run detail, the run list and the other test views all
 * carry the state too. Rather than enumerate query keys per caller, this invalidates
 * everything, which is correct and cheap at the rate a human clicks this.
 */
export function useQuarantine(projectId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries();

  const add = useMutation({
    ...addProjectQuarantineMutation(),
    onSuccess: (_data, vars) => {
      invalidate();
      notify.success('Test quarantined', {
        description: `Failures of ${vars.body?.title ?? 'this test'} will no longer block the build.`,
      });
    },
    onError: (err) => notify.error("Couldn't quarantine the test", { description: errMsg(err) }),
  });

  const remove = useMutation({
    ...removeProjectQuarantineMutation(),
    onSuccess: () => {
      invalidate();
      notify.success('Test taken out of quarantine', {
        description: 'Its failures will block the build again from the next run.',
      });
    },
    onError: (err) =>
      notify.error("Couldn't take the test out of quarantine", { description: errMsg(err) }),
  });

  return {
    quarantine: (test: { testId: string; title?: string; file?: string; reason?: string }) =>
      add.mutate({ path: { projectId }, body: test }),
    unquarantine: (testId: string) => remove.mutate({ path: { projectId, testId } }),
    isPending: add.isPending || remove.isPending,
  };
}
