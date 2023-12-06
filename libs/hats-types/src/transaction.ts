import { TransactionReceipt } from 'viem';

interface ToastData {
  title: string;
  description?: string;
}

export type HandlePendingTx = ({
  hash,
  txChainId,
  fnName,
  toastData,
  onSuccess,
}: {
  hash: string;
  txChainId: number | undefined;
  fnName: string;
  toastData: ToastData | undefined;
  onSuccess?: (d?: TransactionReceipt) => void;
}) => Promise<void>;
