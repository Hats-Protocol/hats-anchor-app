'use client';

import { Button } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import _ from 'lodash';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';

import { ChakraNextLink } from '../atoms';

const WearerButton = () => {
  const pathname = usePathname();
  const { address } = useAccount();

  if (!address) return null;

  return (
    <ChakraNextLink href={`/${CONFIG.wearers}/${address}`}>
      <Button
        h='80px'
        minW='125px'
        variant='ghost'
        borderRadius={0}
        fontSize='lg'
        _active={{ borderBottom: '2px solid', bg: 'gray.100' }}
        isActive={_.includes(_.toLower(pathname), _.toLower(address))}
      >
        {`My ${_.capitalize(CONFIG.hats)}`}
      </Button>
    </ChakraNextLink>
  );
};

export default WearerButton;
