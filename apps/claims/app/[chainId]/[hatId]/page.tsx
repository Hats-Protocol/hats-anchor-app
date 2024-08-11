import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { EligibilityContextProvider } from 'contexts';
import { first, get, pick, split, toNumber } from 'lodash';
import { Metadata } from 'next';
import { Claims } from 'pages';
import { SupportedChains } from 'types';
import { fetchHatDetailsMesh } from 'utils';
import { Hex } from 'viem';

const TreeDetails = ({ params: { hatId, chainId } }: TreeDetailsProps) => {
  if (!hatId) return null;
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

interface TreeDetailsProps {
  params: {
    hatId: Hex;
    chainId: SupportedChains;
  };
}

export async function generateMetadata({
  params,
}: TreeDetailsProps): Promise<Metadata> {
  // read route params
  const { hatId, chainId } = pick(params, ['hatId', 'chainId']);
  // hatId is in IP format
  if (!chainId || !hatId || isNaN(toNumber(first(split(hatId, '.'))))) {
    return {};
  }
  const hatIdHex = hatIdDecimalToHex(hatIdIpToDecimal(hatId));

  // fetch data
  return fetchHatDetailsMesh(hatIdHex, toNumber(chainId))
    .then((hat) => {
      const detailsMetadata = get(hat, 'detailsMetadata');
      const detailsObject = detailsMetadata
        ? get(JSON.parse(detailsMetadata), 'data')
        : {};

      return {
        title: get(detailsObject, 'name'),
        description: get(detailsObject, 'description'),
      };
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return {};
    });
}

export default TreeDetails;
