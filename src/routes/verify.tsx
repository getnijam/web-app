import { useEffect, useRef, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { z } from 'zod';
import { verifyEmail, resendVerification } from '@/client';
import { AuthLayout, AuthHeading } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { isApiError } from '@/lib/api-error';
import { redirectAuthedToDashboard } from '@/lib/auth-redirect';

const VerifySearch = z.object({ token: z.string().optional() });

export const Route = createFileRoute('/verify')({
  beforeLoad: ({ context }) => redirectAuthedToDashboard(context.queryClient),
  validateSearch: VerifySearch,
  component: VerifyPage,
});

type Status = 'verifying' | 'success' | 'expired' | 'invalid';

const ICON_WRAP = 'h-11 w-11 rounded-full';

function VerifyPage() {
  const { token } = Route.useSearch();
  // Derive the initial status from the token so we don't setState during the
  // effect (a missing token is known synchronously on first render).
  const [status, setStatus] = useState<Status>(() => (token ? 'verifying' : 'invalid'));
  const [resendEmail, setResendEmail] = useState('');
  const [resent, setResent] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard StrictMode double-invoke
    ran.current = true;

    if (!token) return;

    verifyEmail({ body: { token }, throwOnError: true })
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        const code = isApiError(err) ? err.error.code : undefined;
        // A used link almost always means the user clicked twice — treat as success.
        if (code === 'VERIFICATION_TOKEN_USED') setStatus('success');
        else if (code === 'VERIFICATION_TOKEN_EXPIRED') setStatus('expired');
        else setStatus('invalid');
      });
  }, [token]);

  return (
    <AuthLayout>
      <Flex direction="col" gap={6}>
        {status === 'verifying' && (
          <>
            <Flex
              align="center"
              justify="center"
              className={`${ICON_WRAP} bg-muted text-muted-foreground`}
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </Flex>
            <AuthHeading
              title="Verifying your email…"
              description="This will only take a moment."
            />
          </>
        )}

        {status === 'success' && (
          <>
            <Flex
              align="center"
              justify="center"
              className={`${ICON_WRAP} bg-primary/10 text-primary`}
            >
              <CheckCircle2 className="h-5 w-5" />
            </Flex>
            <AuthHeading
              title="Email verified"
              description="Your account is ready. You can sign in now."
            />
            <Button asChild size="lg" className="w-full">
              <Link to="/login">Continue to sign in</Link>
            </Button>
          </>
        )}

        {status === 'expired' && (
          <>
            <Flex
              align="center"
              justify="center"
              className={`${ICON_WRAP} bg-warning/10 text-warning`}
            >
              <Clock className="h-5 w-5" />
            </Flex>
            <AuthHeading
              title="Link expired"
              description="This verification link has expired. Enter your email to get a new one."
            />
            {resent ? (
              <Text color="muted">
                If an account exists for that email, a new link is on its way.
              </Text>
            ) : (
              <Flex direction="col" gap={3}>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                />
                <Button
                  size="lg"
                  className="w-full"
                  disabled={!resendEmail}
                  onClick={() => {
                    void resendVerification({ body: { email: resendEmail } });
                    setResent(true);
                  }}
                >
                  Request a new link
                </Button>
              </Flex>
            )}
          </>
        )}

        {status === 'invalid' && (
          <>
            <Flex
              align="center"
              justify="center"
              className={`${ICON_WRAP} bg-destructive/10 text-destructive`}
            >
              <XCircle className="h-5 w-5" />
            </Flex>
            <AuthHeading
              title="Invalid link"
              description="This verification link is invalid. Please sign up again to get a fresh one."
            />
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/signup">Back to sign up</Link>
            </Button>
          </>
        )}
      </Flex>
    </AuthLayout>
  );
}
