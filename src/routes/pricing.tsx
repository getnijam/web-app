import { createFileRoute } from '@tanstack/react-router';
import { Nav } from '@/components/home/components/Nav';
import { Footer } from '@/components/home/components/Footer';
import { CTA } from '@/components/home/components/CTA';
import { Reveal } from '@/components/home/Reveal';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { PricingPlans } from '@/components/pricing/PricingPlans';
import { EstimateCalculator } from '@/components/pricing/EstimateCalculator';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/pricing')({
  head: () =>
    seo({
      title: 'Pricing',
      description:
        'Simple, volume-based pricing for Nijam — start free, then $20/month on Pro with unlimited members. Estimate your monthly bill by team size.',
      path: '/pricing',
    }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
            Pricing
          </Text>
          <Text as="h1" className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Start free. Upgrade when your suite grows.
          </Text>
          <Text className="mt-3.5 text-lg text-pretty text-muted-foreground">
            One simple plan when you outgrow the free tier — no per-seat pricing, no surprises.
            You&rsquo;re only charged for the test volume you actually report.
          </Text>
        </Reveal>

        <PricingPlans />

        <Text
          align="center"
          className="mx-auto mt-8 max-w-xl text-xs text-pretty text-muted-foreground"
        >
          Prices shown in USD and billed monthly. At checkout you&rsquo;re charged in your local
          currency with taxes handled for you. One test result = one reported test attempt (retries
          and shards count).
        </Text>

        <Flex direction="col" className="mt-16 md:mt-20">
          <Reveal className="mx-auto mb-8 max-w-2xl text-center">
            <Text className="text-xs font-semibold tracking-wide text-primary uppercase">
              Estimate
            </Text>
            <Text
              as="h2"
              className="mt-3 text-2xl font-bold tracking-tight text-balance sm:text-3xl"
            >
              Estimate your monthly bill
            </Text>
            <Text className="mt-3 text-base text-pretty text-muted-foreground">
              Drag the slider to set your monthly test volume and enter your team size. Up to 2
              members and 1,000 test results stays free; beyond that, Pro is $20/mo plus $0.002 per
              extra test result.
            </Text>
          </Reveal>

          <Reveal>
            <EstimateCalculator />
          </Reveal>
        </Flex>
      </main>
      <CTA
        title="Start free. Pay only when you grow."
        description="Connect your CI in minutes and only pay for the test volume you actually report — no per-seat pricing, ever."
      />
      <Footer />
    </div>
  );
}
