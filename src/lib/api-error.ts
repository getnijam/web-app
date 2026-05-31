/** The standard error envelope returned by the Nijam API. */
export type ApiError = {
  error: {
    code: string;
    message: string;
    field?: string;
    details?: unknown;
  };
};

/** Narrow an unknown thrown value to the API error envelope. */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiError).error?.message === 'string'
  );
}

/** Pull a safe, displayable message out of any thrown value. */
export function errorMessage(value: unknown): string {
  if (isApiError(value)) return value.error.message;
  if (value instanceof Error) return value.message;
  return 'Something went wrong. Please try again.';
}
