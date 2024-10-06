'use client';

import { Button, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { useOverlay } from 'contexts';
import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';

interface TransactionButtonProps extends ChakraButtonProps {
  sendTx: () => Promise<`0x${string}`>;
  children: React.ReactNode;
  onReceipt: (receipt: { [x: string]: any }) => void;
  txDescription: string;
}

export const TransactionButton = ({
  sendTx,
  children,
  onReceipt,
  txDescription,
  ...props
}: TransactionButtonProps) => {
  const [hash, setHash] = useState<`0x${string}`>();
  const { handlePendingTx } = useOverlay();
  // TODO also pass the hash to overlay context

  const { data: receipt } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  useEffect(() => {
    if (receipt?.blockNumber) {
      onReceipt(receipt);
      setHash(undefined);
    }
  }, [receipt?.blockNumber, onReceipt, receipt]);

  return (
    <Button
      isLoading={!!hash}
      onClick={async () => {
        const localHash = await sendTx();
        setHash(localHash);
        handlePendingTx?.({ hash: localHash, txDescription });
      }}
      {...props}
    >
      {children}
    </Button>
  );
};
