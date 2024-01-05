import { Hex, TransactionReceipt } from 'viem';

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
  hash: Hex;
  txChainId: number | undefined;
  fnName: string;
  toastData: ToastData | undefined;
  onSuccess?: (d?: TransactionReceipt) => void;
}) => Promise<TransactionReceipt>;
