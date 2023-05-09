import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa';
import _ from 'lodash';
import { chainsList } from '../lib/web3';

const NetworkFilter = ({ onFilterChange, selectedNetwork }) => (
  <Menu>
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
        >
          {name}
          {selectedNetwork === id ? ' ✓' : ''}
        </MenuItem>
      ))}
    </MenuList>
  </Menu>
);

export default NetworkFilter;
