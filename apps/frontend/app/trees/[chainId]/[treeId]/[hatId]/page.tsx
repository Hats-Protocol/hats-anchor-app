import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { SelectedHatContextProvider, TreeFormContextProvider } from 'contexts';
import { first, get, pick, split, toNumber } from 'lodash';
import { Metadata } from 'next';
import { HatDrawer } from 'pages';
import { SearchParamsProps } from 'types';
import { fetchHatsDetailsMesh } from 'utils';

const HatDetails = ({}: HatDetailsProps) => (
  <TreeFormContextProvider>
    <SelectedHatContextProvider>
      <HatDrawer />
    </SelectedHatContextProvider>
  </TreeFormContextProvider>
);

interface HatDetailsProps extends SearchParamsProps {
  params: { chainId: string; treeId: string; hatId: string };
}

export async function generateMetadata({
  params,
}: HatDetailsProps): Promise<Metadata> {
  // read route params
  const { chainId, hatId } = pick(params, ['chainId', 'hatId']);
  if (!chainId || !hatId || isNaN(toNumber(first(split(hatId, '.')))))
    return {};
  const hatIdHex = hatIdDecimalToHex(hatIdIpToDecimal(hatId));
  if (!hatIdHex) return {};

  // fetch data
  return fetchHatsDetailsMesh([hatIdHex], toNumber(chainId))
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
