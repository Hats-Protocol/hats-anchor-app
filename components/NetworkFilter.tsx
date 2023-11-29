import {
  HStack,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { FaFilter } from 'react-icons/fa';

import { chainsList, networkImages, SupportedChains } from '@/lib/chains';

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
        {_.map(chainsList, ({ id, name }) => (
          <MenuItem
            key={id}
            onClick={() => router.push(`/trees/${id}`)}
            isDisabled={selectedNetwork === id}
            color={selectedNetwork === id ? 'blue' : 'black'}
            opacity='1 !important'
            my={1}
          >
            <Image
              loading='lazy'
              src={networkImages[id as SupportedChains]}
              alt='chain'
              w={6}
              h={6}
              mr={4}
            />
            {name}
            {selectedNetwork === id ? ' ✓' : ''}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default NetworkFilter;
