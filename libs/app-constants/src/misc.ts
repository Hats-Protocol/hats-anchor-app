import { Transaction } from 'hats-types';
import { Dispatch, SetStateAction } from 'react';
import { Hex, TransactionReceipt } from 'viem';

export const ZERO_ID: Hex =
  '0x0000000000000000000000000000000000000000000000000000000000000000';
export const FALLBACK_ADDRESS: Hex =
  '0x0000000000000000000000000000000000004a75';

export interface OverlayContextProps {
  modals?: { [key: string]: boolean };
  setModals?: (m: object) => void;
  closeModals?: () => void;
  commandPalette: boolean;
  setCommandPalette: Dispatch<SetStateAction<boolean>>;
  handlePendingTx?: ({
    hash,
    txChainId,
    txDescription,
    toastData,
    redirect,
    clearModals,
    sendToast,
    onSuccess,
  }: {
    hash: Hex;
    txChainId?: number;
    txDescription: string;
    toastData: object | undefined;
    redirect?: string | null;
    clearModals?: boolean;
    sendToast?: boolean;
    onSuccess?: (d?: TransactionReceipt) => void;
  }) => Promise<TransactionReceipt | undefined>;
  transactions: Transaction[];
  clearAllTransactions: () => void;
}
