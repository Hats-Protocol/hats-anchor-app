import { Dispatch, SetStateAction } from 'react';
import { Hex } from 'viem';

import { Transaction } from './misc';
import { HandlePendingTx } from './transaction';

export interface Banner {
  icon?: string; // TODO icon currently unused, set based on variant
  message: string;
  variant?: 'info' | 'error';
  error?: Error;
}

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
  transactions: boolean;
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
  setCommandPalette: (val: boolean) => void;
  handlePendingTx?: HandlePendingTx;
  transactions: Transaction[];
  clearAllTransactions: () => void;
  recentlyVisitedTrees: TreeRecord[] | undefined;
  updateRecentlyVisitedTrees: (tree: TreeRecord) => void;
  txPending: boolean;
  banner: Banner | null;
  setBanner: Dispatch<SetStateAction<Banner | null>>;
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
  transactions: Transaction[];
}
