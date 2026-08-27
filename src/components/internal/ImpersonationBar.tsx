import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { IncognitoIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { meQueryOptions } from '@/lib/me-query';
import { LOGIN_ROUTE } from '@/lib/routes';
import { useStopImpersonation } from '@/hooks/use-impersonation';
import { cn } from '@/lib/utils';

/**
 * The dock's own classes. See the `dock-parked` / `dock-open` utilities in globals.css
 * for why they live on a padded box rather than on the pill itself.
 *
 * `focus-within` reveals it as well as `hover`: parked, the Stop button is only a few
 * pixels tall, so keyboard users need tabbing to it to bring the dock down too.
 * `motion-reduce` keeps both positions but drops the slide.
 */
const DOCK =
  'dock-parked hover:dock-open focus-within:dock-open transition-transform duration-200 ease-out motion-reduce:transition-none';

/** Under this many seconds the countdown turns destructive to signal it is nearly up. */
const URGENT_SECONDS = 60;

/**
 * Hand back to the real account with a few seconds to spare, rather than at 0.
 *
 * Waiting for zero means racing the server: the session is already gone by the time
 * the request lands, `stop` returns 401, and the operator is left staring at a dead
 * banner. Stopping early lets the call succeed, so an impersonation that is simply
 * left running ends by returning you to your own account instead of logging you out.
 * Still well inside the 15-minute cap, which the server enforces regardless.
 */
const AUTO_STOP_AT_SECONDS = 5;

/**
 * Seconds remaining, ticking once a second.
 *
 * The server sends a **duration** (`expiresInSeconds`), not a timestamp, so we anchor a
 * local deadline from it and count down against the wall clock. It re-anchors whenever
 * `/me` reports a new value, which is what makes a reload show the true time left
 * rather than restarting at 15:00. Hand-written rather than vendored from usehooks.io:
 * the catalogue's countdowns start from a fixed number on mount, and this one has to
 * re-derive itself from the server every time the session is re-read.
 */
function useSecondsLeft(expiresInSeconds: number | undefined): number | null {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(expiresInSeconds ?? null);
  const [anchor, setAnchor] = useState(expiresInSeconds);

  // Re-seed from the server value the moment it changes, using React's documented
  // "adjust state during render" pattern. Doing this in an effect instead would set
  // state synchronously in the effect body, which cascades an extra render (and the
  // lint rule that forbids it is right). Rendering the exact server value first also
  // means the timer is correct on the very first paint after a reload, rather than
  // showing a placeholder for a second.
  if (expiresInSeconds !== anchor) {
    setAnchor(expiresInSeconds);
    setSecondsLeft(expiresInSeconds ?? null);
  }

  useEffect(() => {
    if (expiresInSeconds === undefined) return;
    // Date.now() inside the effect, never during render, so SSR stays deterministic.
    const deadline = Date.now() + expiresInSeconds * 1000;
    const id = setInterval(
      () => setSecondsLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000))),
      1000,
    );
    return () => clearInterval(id);
  }, [expiresInSeconds]);

  return secondsLeft;
}

/** `m:ss`, zero-padded so the width never jitters as the digits change. */
function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * The "you are signed in as someone else" banner, mounted by the `_authed` layout so it
 * is present on every signed-in page (including `/orgs` and `/profile`, which render
 * outside the org shell). Renders nothing unless an impersonation is active.
 *
 * This is the safety net for the whole feature. Forgetting you are someone else is the
 * standard failure mode of impersonation tooling, so the banner is permanent for as
 * long as the session lasts and always one gesture from the exit. Starting an
 * impersonation lives in the account menu instead, it is a rare action and does not
 * need to sit on screen.
 *
 * It **docks** like the macOS Dock rather than sitting in the way: it occupies the top
 * bar's centre, right where the breadcrumb runs, so it parks off the top edge and
 * slides down when the cursor reaches the edge. At rest the breadcrumb is fully
 * readable and a warning-coloured sliver still signals that something is off.
 */
export function ImpersonationBar() {
  const { data: me } = useQuery(meQueryOptions());
  const stop = useStopImpersonation();
  const secondsLeft = useSecondsLeft(me?.impersonation?.expiresInSeconds);
  const navigate = useNavigate();
  // Guarded so the once-a-second tick can't fire the mutation repeatedly.
  const autoStopped = useRef(false);

  useEffect(() => {
    if (secondsLeft === null || secondsLeft > AUTO_STOP_AT_SECONDS) return;
    if (autoStopped.current) return;
    autoStopped.current = true;
    stop.mutate(
      {},
      {
        // Only reachable if the session died first anyway (a backgrounded tab whose
        // timer never ran, a suspended laptop). There is nothing to return to, so send
        // them to sign in rather than leaving a banner for a session that is gone.
        onError: () => void navigate({ to: LOGIN_ROUTE }),
      },
    );
  }, [secondsLeft, stop, navigate]);

  if (!me?.user || !me.impersonation) return null;

  const urgent = secondsLeft !== null && secondsLeft <= URGENT_SECONDS;

  return (
    // The wrapper is pointer-events-none so its box never swallows a breadcrumb click;
    // the padded dock box takes pointer events back. `pt-3` is the transparent strip
    // that keeps the cursor inside the hover target once the dock slides open, which
    // is what stops it flickering between the two states.
    <div className="pointer-events-none fixed top-0 left-1/2 z-50 flex -translate-x-1/2 justify-center">
      <div className={cn('pointer-events-auto pt-3', DOCK)}>
        <Flex
          align="center"
          gap={3}
          data-testid="impersonation-banner"
          className="rounded-full border border-warning/40 bg-warning/10 py-1.5 pr-1.5 pl-4 shadow-sm backdrop-blur-sm"
        >
          <HugeiconsIcon
            icon={IncognitoIcon}
            size={16}
            strokeWidth={1.9}
            className="shrink-0 text-warning"
          />
          <Text as="span" className="text-sm font-medium text-nowrap text-foreground">
            Viewing as <span className="font-semibold">{me.user.email}</span>
          </Text>
          {secondsLeft !== null && (
            <Text
              as="span"
              data-testid="impersonation-countdown"
              title="Time left before this impersonation session expires"
              className={cn(
                'shrink-0 font-mono text-sm tabular-nums',
                urgent ? 'font-semibold text-destructive' : 'text-muted-foreground',
              )}
            >
              {formatCountdown(secondsLeft)}
            </Text>
          )}
          <Button
            size="sm"
            variant="outline"
            data-testid="impersonation-stop"
            loading={stop.isPending}
            onClick={() => stop.mutate({})}
          >
            Stop
          </Button>
        </Flex>
      </div>
    </div>
  );
}
