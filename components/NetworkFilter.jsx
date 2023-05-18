import {
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa';
import _ from 'lodash';
import { chainsList, networkImages } from '@/lib/web3';

const NetworkFilter = ({ onFilterChange, selectedNetwork }) => (
  <Menu>
    <Image src={networkImages[selectedNetwork]} alt='chain' w={6} h={6} />
    <MenuButton
      as={IconButton}
      icon={<FaFilter />}
      aria-label='Filter networks'
      variant='outline'
    />
    <MenuList>
      {_.map(chainsList, ({ id, name }) => (
        <MenuItem
          key={id}
          onClick={() => onFilterChange(id)}
          isDisabled={selectedNetwork === id}
          color={selectedNetwork === id ? 'blue' : 'black'}
          opacity='1 !important'
          my={1}
        >
          <Image src={networkImages[id]} alt='chain' w={6} h={6} mr={4} />
          {name}
          {selectedNetwork === id ? ' ✓' : ''}
        </MenuItem>
      ))}
    </MenuList>
  </Menu>
);

export default NetworkFilter;
