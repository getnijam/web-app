import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Text } from '@/components/ui/text';
import { Logo } from './Logo';
import { AuthBrandPanel } from './AuthBrandPanel';
import { ThemeSegmentedControl } from '@/components/theme/ThemeSegmentedControl';

/** Split-screen shell for the auth pages: form on the left, brand panel on the right. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Grid cols={[1, 1, 1, 2]} className="min-h-svh">
      <Flex direction="col" className="px-6 py-10 sm:px-10">
        <Flex align="center" justify="between" gap={4}>
          <Flex
            as={Link}
            to="/"
            aria-label="Nijam.dev home"
            inline
            className="w-fit rounded-md transition-opacity hover:opacity-80"
          >
            <Logo />
          </Flex>
          <ThemeSegmentedControl />
        </Flex>
        <Flex
          as="main"
          direction="col"
          justify="center"
          className="mx-auto w-full max-w-88 flex-1 py-10"
        >
          {children}
        </Flex>
        <Text variant="caption" color="muted">
          © Nijam — test analytics for Playwright, pytest &amp; Vitest
        </Text>
      </Flex>
      <AuthBrandPanel />
    </Grid>
  );
}

/** Standard heading block used at the top of each auth form. */
export function AuthHeading({ title, description }: { title: string; description: ReactNode }) {
  return (
    <Flex direction="col" gap={1.5}>
      <Text as="h1">{title}</Text>
      <Text color="muted">{description}</Text>
    </Flex>
  );
}

/** Inline field-level validation message. */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text variant="caption" color="danger">
      {message}
    </Text>
  );
}
