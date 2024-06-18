'use client';

import {
  HStack,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { networkImages, orderedChains } from '@hatsprotocol/constants';
import _ from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaFilter } from 'react-icons/fa';
import { SupportedChains } from 'types';
import { chainsMap, getPathParams } from 'utils';

const NetworkFilter = () => {
  const pathname = usePathname();
  const { chainId } = getPathParams(pathname);

  return (
    <Menu isLazy>
      <MenuButton
        as={IconButton}
        aria-label='Filter networks'
        bg='gray.300'
        border='1px solid'
        borderColor='gray.500'
        p={2}
      >
        <HStack spacing={4}>
          <Image src={networkImages[chainId]} alt='chain' w={6} h={6} />
          <Icon as={FaFilter} />
        </HStack>
      </MenuButton>
      <MenuList>
        {_.map(orderedChains, (localChainId: number) => (
          <MenuItem
            as={Link}
            key={localChainId}
            href={`/trees/${localChainId}`}
            isDisabled={localChainId === chainId}
            color={localChainId === chainId ? 'blue' : 'black'}
            opacity='1 !important'
            bg={localChainId === chainId ? 'blackAlpha.100' : undefined}
            my={1}
            justifyContent='space-between'
            fontWeight={localChainId === chainId ? 600 : 'normal'}
          >
            <HStack spacing={1}>
              <Image
                loading='lazy'
                src={networkImages[localChainId as SupportedChains]}
                alt='chain'
                w={6}
                h={6}
                mr={4}
              />
              <Text>{chainsMap(localChainId)?.name}</Text>
            </HStack>
            <Text>{localChainId === chainId ? ' ✓' : ''}</Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default NetworkFilter;
