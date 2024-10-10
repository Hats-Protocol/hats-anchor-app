import { Hex, TransactionReceipt } from 'viem';

import { ToastProps } from './toast';

export type HandlePendingTxProps = {
  hash: Hex;
  txChainId?: number | undefined;
  txDescription: string;
  waitForSubgraphToastData?: ToastProps;
  successToastData?: ToastProps | undefined;
  redirect?: string | null;
  clearModals?: boolean;
  sendToast?: boolean;
  waitForSubgraph?: (data?: TransactionReceipt) => Promise<unknown>;
  onSuccess?: (data?: TransactionReceipt) => void;
};

export type HandlePendingTx = (
  props: HandlePendingTxProps,
) => Promise<TransactionReceipt | undefined>;
