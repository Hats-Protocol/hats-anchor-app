import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { EligibilityContextProvider } from 'contexts';
import { toNumber } from 'lodash';
import { Claims } from 'pages';
import { SupportedChains } from 'types';
import { Hex } from 'viem';

const TreeDetails = ({ params: { hatId, chainId } }: TreeDetailsProps) => {
  const hexHatId = hatIdDecimalToHex(hatIdIpToDecimal(hatId));

  // TODO handle unexpected chainIds that won't produce valid numbers

  return (
    <EligibilityContextProvider
      hatId={hexHatId}
      chainId={toNumber(chainId) as SupportedChains}
    >
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
