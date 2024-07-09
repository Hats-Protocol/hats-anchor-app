import { CONFIG } from '@hatsprotocol/constants';
import { NetworkFilter } from 'molecules';
import { TreesList as TreesListCards } from 'organisms';
import { LinkButton } from 'ui';

const TreesList = async ({ params }: { params: { chainId: string } }) => {
  // TODO fetch initial trees list
  // console.log(chainId);
  return (
    <>
      <div className='py-4 lg:py-[100px] px-4 md:px-20 lg:px-[100px]'>
        <div className='flex justify-end items-center mb-3 gap-2'>
          <div className='flex gap-2'>
            <LinkButton href='/trees/new'>
              Create a new {CONFIG.tree}
            </LinkButton>

            <NetworkFilter />
          </div>
        </div>

        <TreesListCards params={params} initialTrees={[]} />
      </div>

      <div className='fixed w-full h-full bg-blue-100 opacity-[0.7] z-[-5] mt-[70px] top-0 left-0' />
    </>
  );
};

export default TreesList;
