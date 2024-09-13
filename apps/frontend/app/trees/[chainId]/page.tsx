import { chainsList, CONFIG } from '@hatsprotocol/constants';
import { chain, get, pick, toNumber } from 'lodash';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { TreesList as TreesListCards } from 'organisms';
import { SearchParamsProps } from 'types';
import { LinkButton } from 'ui';

const NetworkFilter = dynamic(() =>
  import('molecules').then((mod) => mod.NetworkFilter),
);
const ShowTreesButton = dynamic(() =>
  import('molecules').then((mod) => mod.ShowTreesButton),
);

const TreesList = async ({ params }: TreeListProps) => {
  // TODO fetch initial trees list
  const chainId = toNumber(get(params, 'chainId'));

  return (
    <>
      <div className='py-20 lg:py-[100px] px-4 md:px-20 lg:px-[100px]'>
        <div className='flex justify-end items-center mb-3 gap-2'>
          <div className='flex gap-2'>
            <LinkButton href='/trees/new'>
              Create <span className='hidden md:inline'>a new </span>
              {CONFIG.tree}
            </LinkButton>

            <ShowTreesButton chainId={chainId} />

            <div>
              <NetworkFilter />
            </div>
          </div>
        </div>

        <TreesListCards params={params} />
      </div>

      <div className='fixed w-full h-full bg-blue-100 opacity-[0.7] z-[-5] mt-[40px] md:mt-[70px] top-0 left-0' />
    </>
  );
};

interface TreeListProps extends SearchParamsProps {
  params: { chainId: string };
}

export async function generateMetadata({
  params,
}: TreeListProps): Promise<Metadata> {
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
