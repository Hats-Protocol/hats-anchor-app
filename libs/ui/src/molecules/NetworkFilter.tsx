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
import { useRouter } from 'next/router';
import { FaFilter } from 'react-icons/fa';
import { SupportedChains } from 'types';
import { chainsMap } from 'utils';

const NetworkFilter = ({ selectedNetwork }: { selectedNetwork: number }) => {
  const router = useRouter();

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
          <Image
            src={networkImages[selectedNetwork as SupportedChains]}
            alt='chain'
            w={6}
            h={6}
          />
          <Icon as={FaFilter} />
        </HStack>
      </MenuButton>
      <MenuList>
        {_.map(orderedChains, (chainId: number) => (
          <MenuItem
            key={chainId}
            onClick={() => router.push(`/trees/${chainId}`)}
            isDisabled={selectedNetwork === chainId}
            color={selectedNetwork === chainId ? 'blue' : 'black'}
            opacity='1 !important'
            bg={selectedNetwork === chainId ? 'blackAlpha.100' : undefined}
            my={1}
            justifyContent='space-between'
            fontWeight={selectedNetwork === chainId ? 600 : 'normal'}
          >
            <HStack spacing={1}>
              <Image
                loading='lazy'
                src={networkImages[chainId as SupportedChains]}
                alt='chain'
                w={6}
                h={6}
                mr={4}
              />
              <Text>{chainsMap(chainId)?.name}</Text>
            </HStack>
            <Text>{selectedNetwork === chainId ? ' ✓' : ''}</Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default NetworkFilter;
