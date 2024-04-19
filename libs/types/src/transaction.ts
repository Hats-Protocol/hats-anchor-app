import { Hex, TransactionReceipt } from 'viem';

import { ToastProps } from './misc';

export type HandlePendingTx = ({
  hash,
  txChainId,
  txDescription,
  toastData,
  onSuccess,
}: {
  hash: Hex;
  txChainId: number | undefined;
  txDescription: string;
  toastData: ToastProps | undefined;
  onSuccess?: (d?: TransactionReceipt) => void;
}) => Promise<TransactionReceipt | undefined>;
