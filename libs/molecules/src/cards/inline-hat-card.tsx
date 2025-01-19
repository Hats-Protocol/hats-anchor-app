'use client';

import { Button, Icon, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger } from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { formHatUrl } from 'hats-utils';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { SupportedChains } from 'types';
import { Hex } from 'viem';

import { HatCreateCard } from './hat-create-card';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const InlineHatCard = ({ hatId, chainId }: { hatId: Hex; chainId: SupportedChains }) => (
  <div className='relative flex gap-2'>
    <Popover placement='left'>
      <PopoverTrigger>
        <Button variant='link' fontFamily='inter' fontSize='sm' color='black' rightIcon={<Icon as={HatIcon} />}>
          {hatIdDecimalToIp(hatIdHexToDecimal(hatId))}
        </Button>
      </PopoverTrigger>
      <PopoverContent zIndex='20' w='270px'>
        <PopoverArrow />
        <PopoverBody>
          <Link href={formHatUrl({ hatId, chainId })} target='blank' rel='noopener noreferrer'>
            <HatCreateCard id={hatId} chainId={chainId} />
          </Link>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  </div>
);

export { InlineHatCard };
