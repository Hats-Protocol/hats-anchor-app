'use client';

import {
  Button,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import dynamic from 'next/dynamic';
import { SupportedChains } from 'types';
import { Hex } from 'viem';

import HatCreateCard from './HatCreateCard';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const InlineHatCard = ({
  hatId,
  chainId,
}: {
  hatId: Hex;
  chainId: SupportedChains;
}) => (
  <div className='flex gap-2 relative'>
    <Popover placement='left'>
      <PopoverTrigger>
        <Button
          size='xs'
          variant='ghost'
          py={0}
          rightIcon={<Icon as={HatIcon} />}
        >
          {hatIdDecimalToIp(hatIdHexToDecimal(hatId))}
        </Button>
      </PopoverTrigger>
      <PopoverContent zIndex='20' w='270px'>
        <PopoverArrow />
        <PopoverBody>
          <HatCreateCard id={hatId} chainId={chainId} />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  </div>
);

export default InlineHatCard;
