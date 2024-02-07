import { Dispatch, SetStateAction } from 'react';
import { Hex } from 'viem';

import { Transaction } from './misc';
import { HandlePendingTx } from './transaction';

interface AppModals {
  [key: string]: boolean;
}

export interface ClaimsModals {
  newWearer: boolean;
  editModule: boolean;
  createHat: boolean;
  hatDetails: boolean;
  hatImage: boolean;
  hatSupply: boolean;
  'functionCall-module': boolean;
}

export type TreeRecord = { treeId: number; chainId: number };
export type HatRecord = { hatId: Hex; chainId: number };

export interface OverlayContextProps {
  modals?: Partial<AppModals>;
  setModals?: Dispatch<SetStateAction<Partial<AppModals>>>;
  closeModals?: () => void;
  commandPalette: boolean;
  setCommandPalette: Dispatch<SetStateAction<boolean>>;
  handlePendingTx?: HandlePendingTx;
  transactions: Transaction[];
  clearAllTransactions: () => void;
  recentlyVisitedTrees: TreeRecord[] | undefined;
  updateRecentlyVisitedTrees: (tree: TreeRecord) => void;
}

export interface StandaloneOverlayContextProps {
  modals?: Partial<ClaimsModals>;
  setModals?: Dispatch<SetStateAction<Partial<ClaimsModals>>>;
  closeModals?: () => void;
  commandPalette: boolean;
  setCommandPalette: Dispatch<SetStateAction<boolean>>;
  handlePendingTx?: HandlePendingTx;
  recentlyVisitedHats: HatRecord[] | undefined;
  updateRecentlyVisitedHats: (hat: HatRecord) => void;
}
