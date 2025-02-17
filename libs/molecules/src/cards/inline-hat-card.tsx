'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { formHatUrl } from 'hats-utils';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { SupportedChains } from 'types';
import { Button, Popover, PopoverContent, PopoverTrigger } from 'ui';
import { Hex } from 'viem';

import { HatCreateCard } from './hat-create-card';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const InlineHatCard = ({ hatId, chainId }: { hatId: Hex; chainId: SupportedChains }) => (
  <div className='relative flex gap-2'>
    {/* <Popover>
      <PopoverTrigger> */}
    <Link href={formHatUrl({ hatId, chainId })} target='blank' rel='noopener noreferrer'>
      <Button variant='link' className='font-inter text-sm text-black'>
        {hatIdDecimalToIp(hatIdHexToDecimal(hatId))}

        <HatIcon className='ml-1 w-3' />
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
