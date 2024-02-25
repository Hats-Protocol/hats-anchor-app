import { Dispatch, SetStateAction } from 'react';
import { Hex } from 'viem';

import { Transaction } from './misc';
import { HandlePendingTx } from './transaction';

export interface AppModals {
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
  account: boolean;
}

export type TreeRecord = { treeId: number; chainId: number };
export type HatRecord = { hatId: Hex; chainId: number };

export interface OverlayContextProps {
  modals?: Partial<AppModals>;
  setModals?: (m: Partial<AppModals>) => void;
  closeModals?: () => void;
  drawers?: Partial<AppModals>;
  setDrawers?: Dispatch<SetStateAction<Partial<AppModals>>>;
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
  setModals?: (m: Partial<ClaimsModals>) => void;
  closeModals?: () => void;
  commandPalette: boolean;
  setCommandPalette: Dispatch<SetStateAction<boolean>>;
  handlePendingTx?: HandlePendingTx;
  recentlyVisitedHats: HatRecord[] | undefined;
  updateRecentlyVisitedHats: (hat: HatRecord) => void;
}
