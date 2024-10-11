'use client';

import { Button, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { useWaitForSubgraph } from 'hooks';
import { useState } from 'react';
import { invalidateAfterTransaction, wagmiConfig } from 'utils';
import { TransactionReceipt } from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';

interface TransactionButtonProps extends ChakraButtonProps {
  sendTx: () => Promise<`0x${string}`>;
  children: React.ReactNode;
  chainId: number | undefined;
  onReceipt: (receipt: TransactionReceipt) => void;
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
  const [isLoading, setIsLoading] = useState(false);

  const handleAsyncTx = async () => {
    if (!chainId) return;

    try {
      setIsLoading(true);
      const localHash = await sendTx();

      const result = await waitForTransactionReceipt(wagmiConfig, {
        hash: localHash,
      });

      handlePendingTx?.({ hash: localHash, txDescription });

      await waitForSubgraph(result);

      await invalidateAfterTransaction(chainId, localHash);

      onReceipt?.(result);

      setIsLoading(false);
    } catch (err) {
      // TODO catch decline

      // eslint-disable-next-line no-console
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <Button isLoading={isLoading} onClick={handleAsyncTx} {...props}>
      {children}
    </Button>
  );
};
