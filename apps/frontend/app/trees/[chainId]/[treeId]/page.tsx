import { hatIdDecimalToHex, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { TreeFormContextProvider } from 'contexts';
import { first, get, pick, toNumber } from 'lodash';
import { Metadata } from 'next';
import { TreePage, TreePageMobile } from 'pages';
import { SearchParamsProps } from 'types';
import { fetchHatsDetailsMesh } from 'utils';

const TreeDetails = ({ params }: TreeDetailsProps) => {
  const { chainId, treeId } = params;
  const treeIdNum = toNumber(treeId);
  if (!chainId || !treeId || isNaN(treeIdNum)) return null;
  // console.log(chainId, treeId);

  // const hat = getHat()

  return (
    <TreeFormContextProvider>
      <div className='hidden md:block'>
        <TreePage params={params} />
        <div className='fixed left-0 top-0 z-[-1] h-full w-full bg-[url("/bg-topography.svg")]' />
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

export async function generateMetadata({ params }: TreeDetailsProps): Promise<Metadata> {
  // read route params
  const { chainId, treeId } = pick(params, ['chainId', 'treeId']);
  const treeIdNum = toNumber(treeId);
  if (!chainId || !treeId || isNaN(treeIdNum)) return {};
  const hatId = hatIdDecimalToHex(treeIdToTopHatId(treeIdNum));

  // fetch data
  return fetchHatsDetailsMesh([hatId], toNumber(chainId))
    .then((hats) => {
      const hat = first(hats);
      const detailsMetadata = get(hat, 'detailsMetadata');
      const detailsObject = detailsMetadata ? get(JSON.parse(detailsMetadata), 'data') : {};

      const title = get(detailsObject, 'name');
      let includeTitle = {};
      if (title) includeTitle = { title };

      const description = get(detailsObject, 'description');
      let includeDescription = {};
      if (description) includeDescription = { description };

      return {
        ...includeTitle,
        ...includeDescription,
      };
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
      return {};
    });
}

export default TreeDetails;
