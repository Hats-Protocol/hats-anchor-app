import { Hex, TransactionReceipt } from 'viem';

interface ToastData {
  title: string;
  description?: string;
}

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
  toastData: ToastData | undefined;
  onSuccess?: (d?: TransactionReceipt) => void;
}) => Promise<TransactionReceipt>;
