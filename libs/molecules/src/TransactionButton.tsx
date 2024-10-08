'use client';

import { Button, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { useWaitForSubgraph } from 'hooks';
import { hash, invalidateAfterTransaction, wagmiConfig } from 'utils';
import { waitForTransactionReceipt } from 'wagmi/actions';

interface TransactionButtonProps extends ChakraButtonProps {
  sendTx: () => Promise<`0x${string}`>;
  children: React.ReactNode;
  chainId: number;
  onReceipt: (receipt: { [x: string]: any }) => void;
  txDescription: string;
}

export const TransactionButton = ({
  sendTx,
  children,
  onReceipt,
  txDescription,
  chainId,
  ...props
}: TransactionButtonProps) => {
  const { handlePendingTx } = useOverlay();
  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const handleAsyncTx = async () => {
    const localHash = await sendTx();

    const result = await waitForTransactionReceipt(wagmiConfig, {
      hash: localHash,
    });

    await waitForSubgraph(result);

    await invalidateAfterTransaction(chainId, localHash);

    handlePendingTx?.({ hash: localHash, txDescription });
  };

  return (
    <Button isLoading={!!hash} onClick={handleAsyncTx} {...props}>
      {children}
    </Button>
  );
};
