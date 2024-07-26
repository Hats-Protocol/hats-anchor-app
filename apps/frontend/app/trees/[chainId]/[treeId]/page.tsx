import { hatIdDecimalToHex, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { TreeFormContextProvider } from 'contexts';
import { get, pick, toNumber } from 'lodash';
import { Metadata } from 'next';
import { TreePage, TreePageMobile } from 'pages';
import { SearchParamsProps } from 'types';
import { fetchHatDetailsMesh } from 'utils';

const TreeDetails = ({ params }: TreeDetailsProps) => {
  return (
    <TreeFormContextProvider>
      <div className='hidden md:block'>
        <TreePage params={params} />
      </div>
      <div className='md:hidden'>
        <TreePageMobile exists />
      </div>
    </TreeFormContextProvider>
  );
};

interface TreeDetailsProps extends SearchParamsProps {
  params: { chainId: string; treeId: string };
}

export async function generateMetadata({
  params,
}: TreeDetailsProps): Promise<Metadata> {
  // read route params
  const { chainId, treeId } = pick(params, ['chainId', 'treeId']);
  const treeIdNum = toNumber(treeId);
  if (!chainId || !treeId || isNaN(treeIdNum)) return {};
  const hatId = hatIdDecimalToHex(treeIdToTopHatId(treeIdNum));

  // fetch data
  return fetchHatDetailsMesh(hatId, toNumber(chainId))
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
