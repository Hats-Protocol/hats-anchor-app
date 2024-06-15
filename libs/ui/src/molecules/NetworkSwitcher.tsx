'use client';

import { Button } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { SupportedChains } from 'types';
import { chainsList } from 'utils';
import { useSwitchChain } from 'wagmi';

const NetworkSwitcher = ({ chainId, colorScheme }: NetworkSwitcherProps) => {
  const { chainId: treeChain } = useTreeForm();
  const { switchChain } = useSwitchChain();

  const desiredChainId = chainId || treeChain;
  const desiredChainName =
    desiredChainId && chainsList[desiredChainId as SupportedChains]?.name;

  if (!desiredChainName || !switchChain || !desiredChainId) return null;

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

export default NetworkSwitcher;

interface NetworkSwitcherProps {
  chainId?: SupportedChains;
  colorScheme?: string;
}
