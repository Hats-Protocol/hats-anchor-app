'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { anchorHatUrl } from 'hats-utils';
import { HatIcon } from 'icons';
import Link from 'next/link';
import { SupportedChains } from 'types';
import { Button } from 'ui';
import { Hex } from 'viem';

// import { HatCreateCard } from './hat-create-card';

const InlineHatCard = ({
  hatId,
  hatName,
  chainId,
  hideHat,
}: {
  hatId: Hex;
  hatName?: string;
  chainId: SupportedChains;
  hideHat?: boolean;
}) => (
  <div className='relative flex gap-2'>
    {/* <Popover>
      <PopoverTrigger> */}
    <Link href={anchorHatUrl({ hatId, chainId })} target='blank' rel='noopener noreferrer'>
      <Button variant='link' className='font-inter text-sm text-black'>
        {hatName || hatIdDecimalToIp(hatIdHexToDecimal(hatId))}

        {hideHat ? null : <HatIcon className='ml-1 w-3' />}
      </Button>
    </Link>
    {/* </PopoverTrigger>

      <PopoverContent className='z-20 w-64'>
        
          <HatCreateCard id={hatId} chainId={chainId} />
      </PopoverContent>
    </Popover> */}
  </div>
);

export { InlineHatCard };
