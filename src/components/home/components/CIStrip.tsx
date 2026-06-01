import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { GithubIcon, GitlabIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';
import { JenkinsLogo, CircleCiLogo, AzureLogo } from './ci-logos';

// GitHub/GitLab from Hugeicons; the rest are inline brand SVGs (ci-logos) — all
// tint to the surrounding `text-muted-foreground`, so the strip is one color.
const PROVIDERS: { name: string; logo: ReactNode }[] = [
  { name: 'GitHub Actions', logo: <HugeiconsIcon icon={GithubIcon} size={18} /> },
  { name: 'Jenkins', logo: <JenkinsLogo className="size-4.5" /> },
  { name: 'GitLab CI', logo: <HugeiconsIcon icon={GitlabIcon} size={18} /> },
  { name: 'CircleCI', logo: <CircleCiLogo className="size-4.5" /> },
  { name: 'Azure Pipelines', logo: <AzureLogo className="size-4.5" /> },
];

export function CIStrip() {
  return (
    <div className="pt-12">
      <Text align="center" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Ingests results from your CI
      </Text>
      <Flex align="center" justify="center" wrap gap={8} className="mt-5">
        {PROVIDERS.map((p) => (
          <Flex
            align="center"
            gap={2}
            key={p.name}
            className="text-base font-semibold text-muted-foreground"
          >
            {p.logo}
            {p.name}
          </Flex>
        ))}
      </Flex>
    </div>
  );
}
