import { TreasuryContextProvider } from 'contexts';
import { toNumber } from 'lodash';
import { SupportedChains } from 'types';
import { HatDeco } from 'ui';
import { Hex } from 'viem';

import { SafeList, TreeOverview } from '../../../components';

const TreeDetails = ({ params: { treeId, chainId } }: TreeDetailsProps) => {
  // const hexHatId = hatIdDecimalToHex(hatIdIpToDecimal(hatId));

  // TODO handle unexpected chainIds that won't produce valid numbers

  return (
    <TreasuryContextProvider treeId={toNumber(treeId)} chainId={toNumber(chainId) as SupportedChains}>
      <div className='flex flex-col gap-6 pt-20'>
        <TreeOverview />

        {/* <StreamsOverview /> */}

        <SafeList />

        <HatDeco />
      </div>
    </TreasuryContextProvider>
  );
};

export default TreeDetails;

interface TreeDetailsProps {
  params: {
    treeId: Hex;
    chainId: SupportedChains;
  };
}
