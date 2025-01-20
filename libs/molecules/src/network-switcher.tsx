'use client';

import { Button } from '@chakra-ui/react';
import { chainsList } from '@hatsprotocol/config';
import { useTreeForm } from 'contexts';
import { SupportedChains } from 'types';
import { useChainId, useSwitchChain } from 'wagmi';

const NetworkSwitcher = ({ chainId, colorScheme }: NetworkSwitcherProps) => {
  const currentChainId = useChainId();
  const { chainId: treeChain } = useTreeForm();
  const { switchChain } = useSwitchChain();

  const desiredChainId = chainId || treeChain;
  const desiredChainName = desiredChainId && chainsList[desiredChainId as SupportedChains]?.name;

  if (!desiredChainName || !switchChain || !desiredChainId || desiredChainId === currentChainId) return null;

  return (
    <Button
      variant='outlineMatch'
      colorScheme={colorScheme}
      isDisabled={!switchChain || !desiredChainId}
      onClick={() => switchChain?.({ chainId: desiredChainId })}
    >
      Switch to {desiredChainName}
    </Button>
  );
};

interface NetworkSwitcherProps {
  chainId?: SupportedChains;
  colorScheme?: string;
}

export { NetworkSwitcher };
