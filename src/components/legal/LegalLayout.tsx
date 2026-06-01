import type { ReactNode } from 'react';
import { Nav } from '@/components/home/components/Nav';
import { Footer } from '@/components/home/components/Footer';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

/** Legal pages reuse the home chrome (Nav + Footer) with a readable prose column. */
export function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
        <Text as="h1" className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {title}
        </Text>
        <Text as="p" className="mt-2 text-sm text-muted-foreground">
          Last updated {updated}
        </Text>
        <Text as="p" className="mt-6 leading-relaxed text-muted-foreground text-pretty">
          {intro}
        </Text>

        <Flex direction="col" gap={8} className="mt-10">
          {children}
        </Flex>
      </main>
      <Footer />
    </div>
  );
}

/** A titled section of a legal document. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <Text as="h2" className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </Text>
      <Flex direction="col" gap={3} className="mt-3">
        {children}
      </Flex>
    </section>
  );
}

/** A body paragraph. */
export function P({ children }: { children: ReactNode }) {
  return (
    <Text as="p" className="text-sm leading-relaxed text-muted-foreground text-pretty">
      {children}
    </Text>
  );
}

/** A bulleted list. */
export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-muted-foreground/50">
      {items.map((item, i) => (
        <Text as="li" key={i} className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {item}
        </Text>
      ))}
    </ul>
  );
}
