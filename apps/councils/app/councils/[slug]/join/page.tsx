import { parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

import { ModuleChainClaim } from '../../../../components/module-chain-claim';

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
