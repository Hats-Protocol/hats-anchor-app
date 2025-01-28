'use client';

import { useOverlay } from 'contexts';
import { useWaitForSubgraph } from 'hooks';
import { useState } from 'react';
import { SyncTxHandler } from 'types';
import { Button, type ButtonProps } from 'ui';
import { TransactionReceipt } from 'viem';

interface TransactionButtonProps extends ButtonProps {
  sendTx: () => Promise<`0x${string}`>;
  children: React.ReactNode;
  chainId: number | undefined;
  afterSuccess: SyncTxHandler;
  txDescription: string;
}

const TransactionButton = ({
  sendTx,
  children,
  afterSuccess,
  txDescription,
  chainId,
  ...props
}: TransactionButtonProps) => {
  const { handlePendingTx } = useOverlay();
  const waitForSubgraph = useWaitForSubgraph({ chainId });
  const [isLoading, setIsLoading] = useState(false);

  const onSuccess = (data: TransactionReceipt | undefined) => {
    afterSuccess?.(data);

    setIsLoading(false);
  };

  const handleAsyncTx = async () => {
    if (!chainId) return;

    setIsLoading(true);
    return sendTx()
      .then((hash) => {
        handlePendingTx?.({
          hash,
          txChainId: chainId,
          txDescription,
          waitForSubgraph,
          onSuccess,
        });
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  return (
    <Button disabled={isLoading} onClick={handleAsyncTx} {...props}>
      {isLoading ? 'Submitting...' : children}
    </Button>
  );
};

export { TransactionButton };
