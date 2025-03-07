import { chainsList, CONFIG } from '@hatsprotocol/config';
import { capitalize, toNumber } from 'lodash';
import { NetworkFilter, ShowTreesButton } from 'molecules';
import { Metadata } from 'next';
import { TreesList as TreesListCards } from 'organisms';
// import { SearchParamsProps } from 'types';
import { LinkButton } from 'ui';

const TreesList = async ({ params }: TreeListProps) => {
  // TODO fetch initial trees list
  const { chainId: initialChainId } = await params;
  const chainId = toNumber(initialChainId);
  // TODO handle bad chainId

  return (
    <>
      <div className='px-4 py-20 md:px-20 lg:px-[100px] lg:py-[100px]'>
        <div className='mx-auto mb-3 flex max-w-[1200px] items-center justify-end gap-2'>
          <div className='flex gap-2'>
            <LinkButton href='/trees/new'>
              Create <span className='hidden md:inline'>a new </span>
              {capitalize(CONFIG.TERMS.tree)}
            </LinkButton>

            <ShowTreesButton chainId={chainId} />

            <div>
              <NetworkFilter />
            </div>
          </div>
        </div>

        <TreesListCards chainId={chainId} />
      </div>

      <div className='fixed left-0 top-0 z-[-5] mt-[40px] h-full w-full bg-blue-100 opacity-[0.7] md:mt-[70px]' />
    </>
  );
};

interface TreeListProps {
  // extends SearchParamsProps {
  params: Promise<{ chainId: string }>;
}

export async function generateMetadata({ params }: TreeListProps): Promise<Metadata> {
  // read route params
  const { chainId } = await params;

  const chainIdNumber = toNumber(chainId);
  if (isNaN(chainIdNumber)) return {};
  const chain = chainsList[chainIdNumber as keyof typeof chainsList];

  return {
    title: chain ? `${chain.name} Trees` : 'Trees',
  };
}

export default TreesList;
