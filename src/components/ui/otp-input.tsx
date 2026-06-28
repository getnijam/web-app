'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { cn } from '@/lib/utils';

// Adapted from smoothui's animated OTP input (built on `input-otp`), re-skinned to
// our tokens: the field colors/radius mirror our `Input`, the separator is a token
// bar (not a lucide icon), and `ring-3` replaces the arbitrary ring width. Slots
// fade + stagger in, the typed digit flips in, and a filled slot scales up slightly.
const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;
const STAGGER_DELAY = 0.05;

type OTPSlotState = { char: string | null; hasFakeCaret: boolean; isActive: boolean };

function OtpSlot({ index }: { index: number }) {
  const context = React.useContext(OTPInputContext);
  const slot = (context?.slots[index] ?? {}) as Partial<OTPSlotState>;
  const { char, hasFakeCaret, isActive } = slot;
  const isFilled = Boolean(char);
  const reduce = useReducedMotion();

  return (
    <motion.div
      data-active={isActive}
      data-slot="otp-slot"
      initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.8, y: 10 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: isFilled ? 1.05 : 1 }}
      transition={
        reduce
          ? { duration: 0 }
          : {
              duration: 0.2,
              delay: index * STAGGER_DELAY,
              ease: EASE_OUT_QUINT,
              scale: { duration: 0.15, ease: EASE_OUT_QUINT },
            }
      }
      whileHover={reduce ? {} : { scale: 1.02, transition: { duration: 0.15 } }}
      whileTap={reduce ? {} : { scale: 0.98, transition: { duration: 0.1 } }}
      className="relative flex size-11 items-center justify-center rounded-xl border border-input bg-input/50 text-lg font-medium transition-[color,box-shadow] outline-none aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/30 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20"
    >
      <AnimatePresence mode="wait">
        {char && (
          <motion.span
            key={char}
            initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.5, rotateY: -90 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotateY: 0 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.5, rotateY: 90 }}
            transition={reduce ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT_QUINT }}
          >
            {char}
          </motion.span>
        )}
      </AnimatePresence>

      {hasFakeCaret && !reduce && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            className="h-5 w-px bg-foreground"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: [0.645, 0.045, 0.355, 1] }}
          />
        </div>
      )}
    </motion.div>
  );
}

function OtpGroup({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="flex items-center gap-2"
      data-slot="otp-group"
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.3, ease: EASE_OUT_QUINT }}
    >
      {children}
    </motion.div>
  );
}

function OtpSeparator() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      data-slot="otp-separator"
      initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={reduce ? { duration: 0 } : { duration: 0.3, delay: 0.15, ease: EASE_OUT_QUINT }}
    >
      <div className="h-0.5 w-2 rounded-full bg-muted-foreground/40" />
    </motion.div>
  );
}

type OtpInputProps = Pick<
  React.ComponentProps<typeof OTPInput>,
  'value' | 'onComplete' | 'autoFocus' | 'disabled' | 'id' | 'aria-label' | 'aria-invalid'
> & {
  onChange?: (value: string) => void;
  /** Total digits (default 6). Must be even, the slots split into two groups. */
  maxLength?: number;
  className?: string;
};

/**
 * Six-digit animated OTP field for numeric one-time codes. Strips non-digits, splits
 * the slots into two groups around a separator, and reports `onChange`/`onComplete`.
 */
export function OtpInput({ className, maxLength = 6, onChange, ...props }: OtpInputProps) {
  const half = Math.ceil(maxLength / 2);
  return (
    <OTPInput
      maxLength={maxLength}
      onChange={(v) => onChange?.(v.replace(/\D/g, ''))}
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="one-time-code"
      data-slot="otp-input"
      className={cn('disabled:cursor-not-allowed', className)}
      containerClassName="flex items-center gap-2 has-disabled:opacity-50"
      {...props}
    >
      <OtpGroup>
        {Array.from({ length: half }, (_, i) => (
          <OtpSlot key={i} index={i} />
        ))}
      </OtpGroup>
      <OtpSeparator />
      <OtpGroup>
        {Array.from({ length: maxLength - half }, (_, i) => (
          <OtpSlot key={half + i} index={half + i} />
        ))}
      </OtpGroup>
    </OTPInput>
  );
}
