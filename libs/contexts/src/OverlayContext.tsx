'use client';

import { useLocalStorage, useToast } from 'hooks';
import _ from 'lodash';
import router from 'next/router';
import posthog from 'posthog-js';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AppModals,
  HandlePendingTxProps,
  OverlayContextProps,
  Transaction,
} from 'types';
import {
  checkTransactionStatus,
  invalidateAfterTransaction,
  viemPublicClient,
} from 'utils';
import { Hex, TransactionReceipt } from 'viem';

const defaultModals: AppModals = {
  createTree: false,
  newWearer: false,
  editModule: false,
  createHat: false,
  hatDetails: false,
  hatImage: false,
  hatSupply: false,
  account: false,
};

const defaultDrawers: AppModals = {
  eligibility: false,
  toggle: false,
  tree: false,
  hat: false,
};

const MAX_TREES = 3;

export const OverlayContext = createContext<OverlayContextProps>({
  setModals: undefined,
  closeModals: undefined,
  drawers: undefined,
  setDrawers: undefined,
  handlePendingTx: undefined,
  commandPalette: false,
  setCommandPalette: () => {},
  transactions: [],
  clearAllTransactions: () => {},
  recentlyVisitedTrees: undefined,
  updateRecentlyVisitedTrees: () => {},
  txPending: false,
});

interface SavedTree {
  treeId: number;
  chainId: number;
}

export const OverlayContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // HOOKS
  const toast = useToast();

  // LOCAL STATE
  const [modals, setModals] = useState<Partial<AppModals>>(defaultModals);
  const [drawers, setDrawers] = useState<Partial<AppModals>>(defaultDrawers);
  const [commandPalette, setCommandPalette] = useState(false);
  // TODO don't need to have these hooked probably, use getter/setters individually when needed
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    'transactions',
    [],
  );

  // TODO move to command palette
  const [recentlyVisitedTrees, setRecentlyVisitedTrees] = useLocalStorage<
    { treeId: number; chainId: number }[] | undefined
  >('recently-visited-trees', undefined);

  const updateRecentlyVisitedTrees = useCallback(
    ({ treeId: localTreeId, chainId: cId }: SavedTree) => {
      if (!localTreeId || !cId) return;
      const localRecentTrees = _.compact(
        _.concat([{ treeId: localTreeId, chainId: cId }], recentlyVisitedTrees),
      );

      const uniqueTrees = _.uniqWith(
        localRecentTrees,
        (treeA: SavedTree, treeB: SavedTree) =>
          treeA.treeId === treeB.treeId && treeA.chainId === treeB.chainId,
      );

      if (!_.isEqual(uniqueTrees, recentlyVisitedTrees)) {
        const updatedRecentTrees = _.slice(uniqueTrees, 0, MAX_TREES);
        setRecentlyVisitedTrees(updatedRecentTrees);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recentlyVisitedTrees],
  );

  const showModal = (m: Partial<AppModals>) => {
    // This allows to show only one modal at a time.
    // In addition, this reset any true value for other modals.
    setModals({ ...defaultModals, ...m } as Partial<AppModals>);
  };

  const closeModals = () => {
    setModals(defaultModals);
  };

  const addTransaction = useCallback(
    (transaction: Transaction) => {
      const updatedTransactions = [transaction, ...transactions];

      setTransactions(updatedTransactions);
    },
    [transactions, setTransactions],
  );

  const updateTransactionStatus = (hash: Hex, status: string) => {
    if (!hash) return;

    setTransactions((prevTransactions) => {
      if (!prevTransactions.length) return prevTransactions;

      const updatedTransactions = prevTransactions.map((tx) =>
        tx.hash === hash ? { ...tx, status } : tx,
      );

      return updatedTransactions;
    });
  };

  const trackOpenCommandPalette = useCallback(() => {
    posthog.capture('Toggled Command Palette', { is_open: commandPalette });
    setCommandPalette(!commandPalette);
  }, [commandPalette]);

  const clearAllTransactions = useCallback(() => {
    setTransactions([]);
  }, [setTransactions]);

  // TODO consider removing `sendToast` here as it's giving confusing results. Consumer should handle in `onSuccess`
  /**
   * @param {hex} hash
   * @param {number} txChainId
   * @param {string} txDescription
   * @param {string} successToastData Toast props
   * @param {string} redirect URL to redirect the user to after the transaction is successful
   * @param {boolean} clearModals defaults to true
   * @param {boolean} sendToast defaults to true, override to false if you want to handle the toast in the onSuccess callback
   * @param {string} onSuccess after the tx is successful, subgraph is synced and mesh is invalidated
   * @returns {Promise<void>}
   * @example
   * handlePendingTx({
   *  hash: '0x123',
   *  toastData: {
   *   title: 'Transaction successful',
   *   description: 'Your hat was created successfully',
   *  },
   * });
   * */
  const handlePendingTx = async ({
    hash,
    txChainId,
    txDescription,
    // toasts
    waitForSubgraphToastData,
    successToastData,
    // tx handling
    waitForSubgraph,
    onSuccess,
    // after success
    redirect = null,
    clearModals = true,
    sendToast = true,
  }: HandlePendingTxProps): Promise<TransactionReceipt | undefined> => {
    if (!hash || !txChainId) {
      return Promise.resolve(undefined);
    }

    if (hash && hash !== '0x') {
      addTransaction({
        hash,
        txChainId,
        timestamp: Date.now(),
        status: 'pending',
        txDescription,
      });
    }

    const txReceipt = await viemPublicClient(
      txChainId || 1,
    ).waitForTransactionReceipt({
      hash,
    });

    toast.info({
      title: 'Transaction accepted',
      description: 'Waiting for the updated state to be indexed...',
      ...waitForSubgraphToastData,
    });

    if (!txReceipt) {
      return Promise.resolve(undefined);
    }

    updateTransactionStatus(hash, 'completed');

    await waitForSubgraph?.(txReceipt);
    await invalidateAfterTransaction(txChainId, hash);

    if (sendToast && successToastData) {
      // this toast is specifically the one that shows when the transaction is successful
      // we still need to wait for the subgraph to show true "success"
      toast[(successToastData.status as keyof typeof toast) || 'info']({
        ...successToastData,
        title: _.get(successToastData, 'title', 'Transaction successful'),
      });
    }

    onSuccess?.(txReceipt);

    if (clearModals) {
      setModals(defaultModals);
    }

    if (redirect) {
      router.push(redirect);
    }

    return Promise.resolve(txReceipt);
  };

  const txPending = useMemo(() => {
    const multicallTx = _.filter(
      transactions,
      (tx) =>
        tx.txDescription?.includes('Updated') ||
        tx.txDescription?.includes('Created'),
    );
    return !_.isEmpty(_.filter(multicallTx, { status: 'pending' }));
  }, [transactions]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (transactions.length === 0) {
        clearInterval(interval);
        return;
      }

      const confirmedTransactions = await checkTransactionStatus(transactions);

      _.forEach(transactions, (tx: Transaction) => {
        const confirmedTx = _.find(confirmedTransactions, { hash: tx.hash });

        if (confirmedTx && tx.status !== 'completed') {
          updateTransactionStatus(tx.hash as Hex, 'completed');
        }
      });
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, setTransactions]);

  const returnValue = useMemo(
    () => ({
      modals,
      setModals: showModal,
      drawers,
      setDrawers,
      closeModals,
      commandPalette,
      setCommandPalette: trackOpenCommandPalette,
      handlePendingTx,
      transactions,
      clearAllTransactions,
      recentlyVisitedTrees,
      updateRecentlyVisitedTrees,
      txPending,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      modals,
      // showModal,
      drawers,
      setDrawers,
      // closeModals,
      commandPalette,
      setCommandPalette,
      trackOpenCommandPalette,
      // handlePendingTx,
      transactions,
      clearAllTransactions,
      recentlyVisitedTrees,
      updateRecentlyVisitedTrees,
      txPending,
    ],
  );

  return (
    <OverlayContext.Provider value={returnValue}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => useContext(OverlayContext);
