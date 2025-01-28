'use client';

import { useCouncilDetails } from 'hooks';
import { pick } from 'lodash';
import { Hex } from 'viem';

import { SafeAssets } from './safe-list/safe-assets';

const SafeAssetsPage = ({ chainId, hsg }: { chainId: number; hsg: Hex }) => {
  const { data } = useCouncilDetails({ chainId, address: hsg });
  const { safe: safeAddress } = pick(data, ['safe']);

  return (
    <div>
      <SafeAssets
        chainId={chainId}
        // TODO fix type
        safeAddress={safeAddress as unknown as Hex}
      />
    </div>
  );
};

export { SafeAssetsPage };
