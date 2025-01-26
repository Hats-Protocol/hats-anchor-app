'use client';

import { chainsList } from '@hatsprotocol/config';
import { useTreeForm } from 'contexts';
import { SupportedChains } from 'types';
import { Button, type ButtonProps } from 'ui';
import { useChainId, useSwitchChain } from 'wagmi';

const NetworkSwitcher = ({ chainId, ...props }: NetworkSwitcherProps) => {
  const currentChainId = useChainId();
  const { chainId: treeChain } = useTreeForm();
  const { switchChain } = useSwitchChain();

  const desiredChainId = chainId || treeChain;
  const desiredChainName = desiredChainId && chainsList[desiredChainId as SupportedChains]?.name;

  if (!desiredChainName || !switchChain || !desiredChainId || desiredChainId === currentChainId) return null;

  return (
    <Button
      variant='outline-blue'
      disabled={!switchChain || !desiredChainId}
      onClick={() => switchChain?.({ chainId: desiredChainId })}
      {...props}
    >
      Switch to {desiredChainName}
    </Button>
  );
};

interface NetworkSwitcherProps extends ButtonProps {
  chainId?: SupportedChains;
}

export { NetworkSwitcher };
