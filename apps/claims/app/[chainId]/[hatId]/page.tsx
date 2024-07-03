import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { EligibilityContextProvider } from 'contexts';
import { Claims } from 'pages';
import { SupportedChains } from 'types';
import { Hex } from 'viem';

const TreeDetails = ({ params: { hatId, chainId } }: TreeDetailsProps) => {
  // const treeId = hatIdToTreeId(hatIdIpToDecimal(hatId));
  const hexHatId = hatIdDecimalToHex(hatIdIpToDecimal(hatId));
  return (
    <EligibilityContextProvider hatId={hexHatId} chainId={chainId}>
      <Claims />
    </EligibilityContextProvider>
  );
};

export default TreeDetails;

interface TreeDetailsProps {
  params: {
    hatId: Hex;
    chainId: SupportedChains;
  };
}
