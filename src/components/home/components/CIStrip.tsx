import { HugeiconsIcon } from '@hugeicons/react';
import { GithubIcon, GitlabIcon, MicrosoftIcon, PipelineIcon } from '@hugeicons/core-free-icons';
import { Flex } from '@/components/ui/flex';
import { Text } from '@/components/ui/text';

// Brand icons where Hugeicons has them; a generic pipeline glyph otherwise
// (Hugeicons has no Jenkins/CircleCI logo).
const PROVIDERS = [
  { name: 'GitHub Actions', icon: GithubIcon },
  { name: 'Jenkins', icon: PipelineIcon },
  { name: 'GitLab CI', icon: GitlabIcon },
  { name: 'CircleCI', icon: PipelineIcon },
  { name: 'Azure Pipelines', icon: MicrosoftIcon },
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
            <HugeiconsIcon icon={p.icon} size={18} />
            {p.name}
          </Flex>
        ))}
      </Flex>
    </div>
  );
}
