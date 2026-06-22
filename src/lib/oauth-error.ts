// Maps an `?oauthError=<reason>` query param (set by the API's OAuth callback when
// it bounces back to /login) to user-facing copy.

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  denied: 'Sign-in was cancelled.',
  unverified_email:
    "Your email isn't verified with that provider. Verify it there, then try again.",
  sso_enforced:
    'Your organization requires single sign-on. Enter your work email above to continue with SSO.',
  in_use: 'That account is already linked to a different Nijam user.',
  email_mismatch:
    'That account uses a different email than your Nijam account. Connect one that uses the same email.',
  invalid: 'That sign-in link expired or was invalid. Please try again.',
  unavailable: 'Social sign-in isn’t available right now. Please use your email and password.',
  failed: 'We couldn’t sign you in. Please try again.',
};

/** Map an `?oauthError=` reason to user-facing copy, or null when absent. */
export function oauthErrorMessage(reason: string | undefined): string | null {
  if (!reason) return null;
  return OAUTH_ERROR_MESSAGES[reason] ?? OAUTH_ERROR_MESSAGES.failed!;
}
