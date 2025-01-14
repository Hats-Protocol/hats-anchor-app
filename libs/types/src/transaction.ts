import { Hex, TransactionReceipt } from 'viem';

import { ToastProps } from './toast';

export type AsyncTxHandler = ((data?: TransactionReceipt | undefined) => Promise<unknown>) | undefined;
export type SyncTxHandler = ((data?: TransactionReceipt | undefined) => void) | undefined;

export type HandlePendingTxProps = {
  hash: Hex;
  txChainId: number | undefined;
  txDescription: string;
  // toast data
  waitForSubgraphToastData?: ToastProps;
  successToastData?: ToastProps | undefined;
  // tx handling
  waitForSubgraph: AsyncTxHandler;
  onSuccess: SyncTxHandler;
  // optional, after success
  redirect?: string | null;
  clearModals?: boolean;
  sendSuccessToast?: boolean;
};

export type HandlePendingTx = (props: HandlePendingTxProps) => Promise<TransactionReceipt | undefined>;
