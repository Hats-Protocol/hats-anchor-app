import { Button } from '@chakra-ui/react';
import React from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { chainsList, SupportedChains } from '@/lib/chains';

const NetworkSwitcher: React.FC = () => {
  const { chainId } = useTreeForm();
  const { chain } = useNetwork();
  const { isLoading, switchNetwork } = useSwitchNetwork();

  const desiredChainName =
    chain?.id === chainId
      ? chain?.name
      : chainId && chainsList[chainId as SupportedChains]?.name;

  if (!desiredChainName || !switchNetwork || chainId === chain?.id) return null;

  return (
    <Button
      variant='outline'
      isDisabled={!switchNetwork || chain?.id === chainId}
      onClick={() => switchNetwork?.(chainId)}
      isLoading={isLoading && chain?.id !== chainId}
    >
      Switch to {desiredChainName}
    </Button>
  );
};

export default NetworkSwitcher;
