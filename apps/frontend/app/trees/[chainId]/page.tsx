import { chainsList, CONFIG } from '@hatsprotocol/config';
import { get, pick, toNumber } from 'lodash';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { TreesList as TreesListCards } from 'organisms';
import { SearchParamsProps } from 'types';
import { LinkButton } from 'ui';

const NetworkFilter = dynamic(() => import('molecules').then((mod) => mod.NetworkFilter));
const ShowTreesButton = dynamic(() => import('molecules').then((mod) => mod.ShowTreesButton));

const TreesList = async ({ params }: TreeListProps) => {
  // TODO fetch initial trees list
  const chainId = toNumber(get(params, 'chainId'));

  return (
    <>
      <div className='px-4 py-20 md:px-20 lg:px-[100px] lg:py-[100px]'>
        <div className='mb-3 flex items-center justify-end gap-2'>
          <div className='flex gap-2'>
            <LinkButton href='/trees/new'>
              Create <span className='hidden md:inline'>a new </span>
              {CONFIG.TERMS.tree}
            </LinkButton>

            <ShowTreesButton chainId={chainId} />

            <div>
              <NetworkFilter />
            </div>
          </div>
        </div>

        <TreesListCards params={params} />
      </div>

      <div className='fixed left-0 top-0 z-[-5] mt-[40px] h-full w-full bg-blue-100 opacity-[0.7] md:mt-[70px]' />
    </>
  );
};

interface TreeListProps extends SearchParamsProps {
  params: { chainId: string };
}

export async function generateMetadata({ params }: TreeListProps): Promise<Metadata> {
  // read route params
  const { chainId } = pick(params, ['chainId']);

  const chainIdNumber = toNumber(chainId);
  if (isNaN(chainIdNumber)) return {};
  const chain = chainsList[chainIdNumber as keyof typeof chainsList];

  return {
    title: chain ? `${chain.name} Trees` : 'Trees',
  };
}

export default TreesList;
