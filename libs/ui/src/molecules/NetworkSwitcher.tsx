import { Button } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { SupportedChains } from 'types';
import { chainsList } from 'utils';
import { useNetwork, useSwitchNetwork } from 'wagmi';

const NetworkSwitcher = ({ chainId, colorScheme }: NetworkSwitcherProps) => {
  const { chainId: treeChain } = useTreeForm();
  const { chain } = useNetwork();
  const { isLoading, switchNetwork } = useSwitchNetwork();

  const desiredChainId = chainId || treeChain;
  const desiredChainName =
    chain?.id === desiredChainId
      ? chain?.name
      : desiredChainId && chainsList[desiredChainId as SupportedChains]?.name;

  if (!desiredChainName || !switchNetwork || desiredChainId === chain?.id)
    return null;

  return (
    <Button
      variant='outlineMatch'
      colorScheme={colorScheme}
      isDisabled={!switchNetwork || chain?.id === desiredChainId}
      onClick={() => switchNetwork?.(desiredChainId)}
      isLoading={isLoading && chain?.id !== desiredChainId}
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
