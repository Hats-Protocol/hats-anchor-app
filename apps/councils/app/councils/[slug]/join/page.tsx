import { ModuleChainClaim } from 'modules-ui';
import { parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

const JoinCouncil = async ({
  params: { slug },
}: {
  params: { slug: string };
}) => {
  const { chainId, address } = parseCouncilSlug(slug);

  return (
    <ModuleChainClaim chainId={chainId || undefined} address={address as Hex} />
  );
};

export default JoinCouncil;
