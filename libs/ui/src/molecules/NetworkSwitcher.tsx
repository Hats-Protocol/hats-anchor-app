import { Button } from '@chakra-ui/react';
import { chainsList } from 'app-utils';
import { useTreeForm } from 'contexts';
import { SupportedChains } from 'hats-types';
import React from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';

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
