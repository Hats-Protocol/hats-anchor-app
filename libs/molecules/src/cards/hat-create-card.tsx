'use client';

import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails, useHatDetailsField } from 'hats-hooks';
import { WearerIcon } from 'icons';
import { toNumber } from 'lodash';
import { SupportedChains } from 'types';
import { LazyImage, Skeleton } from 'ui';
import { ipfsUrl } from 'utils';
import { Hex } from 'viem';

const HatCreateCard = ({ id, chainId }: { id: Hex; chainId: SupportedChains }) => {
  const { data } = useHatDetails({
    chainId,
    hatId: id,
  });

  const { data: detailsField } = useHatDetailsField(data?.details);

  if (!data || !detailsField) return null;

  const { name } = detailsField.data;

  const { imageUri, currentSupply, maxSupply } = data;
  const imageUrl = ipfsUrl(imageUri?.slice(7));

  if (!name || !maxSupply || !currentSupply) {
    return <Skeleton className='w-250px h-250px' />;
  }

  return (
    <div className='border-1 rounded-4px flex flex-col items-center justify-center border-solid border-gray-400 bg-white shadow-sm'>
      <div className='relative flex w-full items-center'>
        <div className='w-70px h-70px border-1 rounded-4px absolute left-[-1px] top-[-1px] border-solid border-gray-400'>
          <LazyImage alt='Hat' src={imageUri !== '' && imageUrl !== '#' ? imageUrl : '/icon.jpeg'} />
        </div>

        <div className='w-70% ml-30% relative flex h-full flex-col'>
          <div className='absolute mt-1 flex flex-col overflow-hidden'>
            <p className='text-xs'>{hatIdDecimalToIp(BigInt(id))}</p>
            <h3 className='text-xl font-medium'>{name}</h3>
          </div>
        </div>

        <HatFooter wearers={currentSupply} total={maxSupply} />
      </div>
    </div>
  );
};

const HatFooter = ({ wearers, total }: { wearers: string | undefined; total: string | undefined }) => {
  return (
    <div className='border-bottom-radius-4 mt-60px w-100% h-36px border-top-1 flex items-center justify-between border-solid border-gray-400 bg-white'>
      <div className='flex items-center gap-1'>
        <WearerIcon className='h-4 text-black/70' />

        <span className='w-115px overflow-hidden text-sm font-medium opacity-80'>
          {toNumber(wearers) > 0 ? `${wearers} Wallets` : `${wearers} Wallet`}
        </span>
      </div>

      <span className='inline-block min-w-[62px] text-right opacity-60'>{`out of ${total}`}</span>
    </div>
  );
};

export { HatCreateCard };
