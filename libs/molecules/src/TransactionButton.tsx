'use client';

import { Button, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { useWaitForSubgraph } from 'hooks';
import { useState } from 'react';
import { invalidateAfterTransaction, wagmiConfig } from 'utils';
import { waitForTransactionReceipt } from 'wagmi/actions';

interface TransactionButtonProps extends ChakraButtonProps {
  sendTx: () => Promise<`0x${string}`>;
  children: React.ReactNode;
  chainId: number | undefined;
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
  const [isLoading, setIsLoading] = useState(false);
  console.log({ isLoading });

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
      setIsLoading(false);
    } catch (err) {
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
