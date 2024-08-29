import { Button, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';

export const TransactionButton = ({ sendTx, children, onReceipt }) => {
  const [hash, setHash] = useState<`0x${string}`>();

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

  if (hash) {
    return (
      <Button disabled>
        <div className='flex gap-2'>
          <Spinner /> {children}
        </div>
      </Button>
    );
  }
  return (
    <Button
      onClick={async () => {
        setHash(await sendTx());
      }}
    >
      {children}
    </Button>
  );
};
