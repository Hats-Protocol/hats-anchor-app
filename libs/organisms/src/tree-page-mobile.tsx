'use client';

import { DEFAULT_HAT } from '@hatsprotocol/constants';
import { useTreeForm } from 'contexts';
import { prepareMobileTreeHats } from 'hats-utils';
import { useMediaStyles } from 'hooks';
import { first, get, isBoolean, map, maxBy, size } from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { BsArrowRight } from 'react-icons/bs';
import { HatWithDepth } from 'types';
import { Button, HatDeco, Link, ScrollArea, Skeleton } from 'ui';

const MobileHatCard = dynamic(() => import('molecules').then((mod) => mod.MobileHatCard));
const VerticalDividers = dynamic(() => import('molecules').then((mod) => mod.VerticalDividers));

const DEFAULT_LOADING_CARDS = 8;

// TODO fix exists lookup
const TreePageMobile = ({ exists = true }: { exists: boolean }) => {
  const { chainId, treeId, treeToDisplay, isLoading: treeIsLoading } = useTreeForm();
  const router = useRouter();
  const params = useSearchParams();
  const { isMobile } = useMediaStyles();
  const hatParam = params.get('hatId');
  if (hatParam && typeof window !== 'undefined' && isBoolean(isMobile) && isMobile) {
    router.push(`/trees/${chainId}/${treeId}/${hatParam}`);
  }

  const sortedTree = treeIsLoading
    ? map(
        Array(DEFAULT_LOADING_CARDS).fill(DEFAULT_HAT),
        // HatWithDepth
        (h: any, i: number) => ({ ...h, id: i }),
      )
    : prepareMobileTreeHats(treeToDisplay);
  if (!chainId) return null;

  const maxDepth = maxBy(sortedTree, 'depth')?.depth || 0;

  if (!exists) {
    return (
      <div className='flex w-full flex-grow items-center justify-center bg-white'>
        <div className='flex flex-col items-center gap-8'>
          <h2 className='text-md'>Tree not found!</h2>

          <img src='/tree-not-found.svg' alt='No hats found' className='h-[600px]' />

          <Link href='/' passHref>
            <Button variant='outline'>
              <span aria-label='Ball cap' role='img'>
                🧢
              </span>{' '}
              Head home
              <BsArrowRight className='ml-1 size-4' />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!treeIsLoading && size(sortedTree) === 1) {
    return (
      <div className='flex h-full w-full flex-col pt-16'>
        <div className='z-sticky box-shadow-[0px 2px 4px 0px rgba(0,0,0,0.75)] px-2 pb-2'>
          <MobileHatCard hat={first(sortedTree)} maxDepth={maxDepth} />
        </div>

        <div className='flex w-full flex-grow items-center justify-center bg-white'>
          <div className='max-w-60% flex flex-col items-center gap-6'>
            <h2 className='text-lg'>
              No hats found
              <span aria-label='Top hat' role='img'>
                🎩
              </span>
            </h2>
            <p className='text-center'>Get started creating hats for your tree on a desktop.</p>
          </div>
        </div>
      </div>
    );
  }

  // ~isLoading
  if (!get(first(sortedTree), 'id')) {
    return (
      <div className='flex h-full w-full flex-col pt-16'>
        <div className='bg-slate-50 px-2 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.75)]'>
          <Skeleton className='h-[72px] rounded-lg' />
        </div>

        <div className='relative flex flex-grow flex-col overflow-y-auto bg-white'>
          {(size(sortedTree) > 1 || !sortedTree) && <VerticalDividers count={maxDepth + 2} />}
          <div className='mt-[80px] h-[7] w-full max-w-full gap-2 px-2 py-2'>
            {map(sortedTree.slice(1), (hat: HatWithDepth) => (
              <Skeleton className='flex h-72 w-full justify-end rounded-lg' key={hat.id} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full w-full flex-col pt-16'>
      <div className='mb-2 bg-slate-50 px-2 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.75)]'>
        <MobileHatCard hat={first(sortedTree)} maxDepth={maxDepth} key={get(first(sortedTree), 'id')} />
      </div>

      <div className='relative flex flex-grow flex-col overflow-y-auto bg-white'>
        {(size(sortedTree) > 1 || !sortedTree) && <VerticalDividers count={maxDepth + 2} />}

        <ScrollArea>
          <div className='flex h-[calc(100vh-130px)] w-full max-w-full flex-col items-end gap-2 px-2 pb-2 pt-2'>
            {map(sortedTree.slice(1), (hat: HatWithDepth) => (
              <MobileHatCard hat={hat} maxDepth={maxDepth} key={hat.id} />
            ))}

            <HatDeco height={250} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export { TreePageMobile };
