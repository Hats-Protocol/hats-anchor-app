import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import React from 'react';
import { useSwitchNetwork } from 'wagmi';

interface NetworkSwitcherProps {
  currentNetworkId?: number;
}

const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({
  currentNetworkId,
}) => {
  const { chains, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();

  return (
    <Menu>
      <MenuButton as={Button} variant='outline'>
        Network
      </MenuButton>
      <MenuList>
        {chains.map((x) => (
          <MenuItem
            isDisabled={!switchNetwork || x.id === currentNetworkId}
            key={x.id}
            onClick={() => switchNetwork?.(x.id)}
          >
            {x.name}
            {isLoading && pendingChainId === x.id && ' (switching)'}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default NetworkSwitcher;
