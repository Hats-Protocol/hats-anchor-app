import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { SelectedHatContextProvider, TreeFormContextProvider } from 'contexts';
import { get, pick, toNumber } from 'lodash';
import { Metadata } from 'next';
import { HatDrawer } from 'pages';
import { SearchParamsProps } from 'types';
import { fetchHatDetailsMesh } from 'utils';

const HatDetails = () => (
  <TreeFormContextProvider>
    <SelectedHatContextProvider>
      <HatDrawer />
    </SelectedHatContextProvider>
  </TreeFormContextProvider>
);

interface MetadataProps extends SearchParamsProps {
  params: { chainId: string; treeId: string; hatId: string };
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  // read route params
  const { chainId, hatId } = pick(params, ['chainId', 'hatId']);
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

export default HatDetails;
