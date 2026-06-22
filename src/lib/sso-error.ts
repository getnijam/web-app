// Maps an `?ssoError=<reason>` query param (set by the API's SSO callback when it
// bounces back to /login) to user-facing copy. Mirrors lib/oauth-error.ts.

const SSO_ERROR_MESSAGES: Record<string, string> = {
  no_connection: "We couldn't find single sign-on for that email domain. Use your email and password, or check with your admin.",
  sso_unavailable: 'Single sign-on isn’t available for your organization right now. Please contact your admin.',
  unavailable: 'Single sign-on isn’t available right now. Please try again later.',
  denied: 'Sign-in was cancelled.',
  not_provisioned: "Your account hasn't been set up for this organization yet. Ask your admin for an invite.",
  domain_not_allowed: 'Your email domain isn’t allowed for this organization’s single sign-on.',
  no_email: 'Your identity provider didn’t share an email address, so we couldn’t sign you in.',
  invalid: 'That sign-in link expired or was invalid. Please try again.',
  failed: 'We couldn’t sign you in with single sign-on. Please try again.',
};

/** Map an `?ssoError=` reason to user-facing copy, or null when absent. */
export function ssoErrorMessage(reason: string | undefined): string | null {
  if (!reason) return null;
  return SSO_ERROR_MESSAGES[reason] ?? SSO_ERROR_MESSAGES.failed!;
}
