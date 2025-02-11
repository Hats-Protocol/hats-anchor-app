'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useWearerDetails } from 'hats-hooks';
import { useCouncilsList } from 'hooks';
import { isEmpty, map } from 'lodash';
import { HatDeco, Link, Skeleton } from 'ui';
import { chainIdToString } from 'utils';
import { getAddress, Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { CouncilHeaderCard } from './council-header';

const CouncilListPage = () => {
  const { address: userAddress } = useAccount();
  const { user } = usePrivy();
  const chainId = useChainId();

  // fetch user's hats
  const { data: wearerHats, isLoading: wearerHatsLoading } = useWearerDetails({
    wearerAddress: !!user ? (userAddress as Hex) : undefined,
    chainId, // TODO migrate to all chains
  });
  // fetch associated councils
  const { data: councils, isLoading: councilsLoading } = useCouncilsList({ hatIds: map(wearerHats, 'id'), chainId });

  if (!userAddress || wearerHatsLoading || councilsLoading) {
    return (
      <div className='mx-auto mt-20 flex max-w-[1000px] flex-col gap-4'>
        {map(Array(5), (_, index) => (
          <Skeleton key={index} className='bg-functional-link-primary/10 h-[125px] w-full' />
        ))}
      </div>
    );
  }

  if (isEmpty(councils) && !councilsLoading && !wearerHatsLoading) {
    return (
      <div className='mx-auto mt-20 flex max-w-[1000px] flex-col gap-4'>
        <div className='text-center text-2xl font-bold'>No councils found</div>
      </div>
    );
  }

  return (
    <div className='mx-auto mt-20 flex max-w-[1000px] flex-col gap-4'>
      {map(councils, (council) => (
        <Link
          href={`/councils/${chainIdToString(chainId)}:${getAddress(council.id)}/members`}
          className='hover:text-foreground/80 text-inherit hover:no-underline'
          key={council.id}
        >
          <CouncilHeaderCard key={council.id} chainId={chainId} address={getAddress(council.id)} withLinks={false} />
        </Link>
      ))}

      <HatDeco />
    </div>
  );
};

export { CouncilListPage };
