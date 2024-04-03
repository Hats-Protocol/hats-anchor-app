import { useLocalStorage, useToast } from 'hooks';
import _ from 'lodash';
import router from 'next/router';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppModals, OverlayContextProps, Transaction } from 'types';
import { checkTransactionStatus } from 'utils';
import { Hex, TransactionReceipt } from 'viem';
import { waitForTransaction } from 'wagmi/actions';

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
});

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
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    'transactions',
    [],
  );
  const [recentlyVisitedTrees, setRecentlyVisitedTrees] = useLocalStorage<
    { treeId: number; chainId: number }[] | undefined
  >('recently-visited-trees', undefined);

  const updateRecentlyVisitedTrees = useCallback(
    ({
      treeId: localTreeId,
      chainId: cId,
    }: {
      treeId: number;
      chainId: number;
    }) => {
      if (!localTreeId || !cId) return;
      const localRecentTrees = _.compact(
        _.concat([{ treeId: localTreeId, chainId: cId }], recentlyVisitedTrees),
      );

      const uniqueTrees = _.uniqWith(
        localRecentTrees,
        (treeA, treeB) =>
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

  const clearAllTransactions = useCallback(() => {
    setTransactions([]);
  }, [setTransactions]);

  /**
   * @param {hex} hash
   * @param {object} toastData
   * @param {string} toastData.title
   * @param {string} toastData.description
   * @param {string} onSuccess
   * @param {string} redirect
   * @param {boolean} clearModals
   * @param {boolean} sendToast
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
    toastData,
    redirect = null,
    clearModals = true,
    sendToast = true,
    onSuccess,
  }: {
    hash: Hex;
    txChainId?: number | undefined;
    txDescription: string;
    toastData: object | undefined;
    redirect?: string | null;
    clearModals?: boolean;
    sendToast?: boolean;
    onSuccess?: (data?: TransactionReceipt) => void;
  }): Promise<TransactionReceipt | undefined> => {
    if (hash && hash !== '0x') {
      addTransaction({
        hash,
        txChainId,
        timestamp: Date.now(),
        status: 'pending',
        txDescription,
      });
    }

    const data = await waitForTransaction({ hash });

    if (!data) {
      return Promise.resolve(undefined);
    }

    if (sendToast && toastData) {
      toast.success({
        title: _.get(toastData, 'title', 'Transaction successful'),
        description: _.get(toastData, 'description'),
      });
    }

    updateTransactionStatus(hash, 'completed');

    if (onSuccess) {
      onSuccess(data);
    }

    if (clearModals) {
      setModals(defaultModals);
    }

    if (redirect) {
      router.push(redirect);
    }

    return Promise.resolve(data);
  };

  // useEffect(() => {
  //   if (initialLoad && hatId && !isHatDrawerOpen) {
  //     onOpenHatDrawer?.(hatId);
  //     console.log('drawer should open');
  //     setInitialLoad(false);
  //   }
  // }, [hatId, onOpenHatDrawer, isHatDrawerOpen, initialLoad]);

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
  }, [transactions, setTransactions]);

  const returnValue = useMemo(
    () => ({
      modals,
      setModals: showModal,
      drawers,
      setDrawers,
      closeModals,
      commandPalette,
      setCommandPalette,
      handlePendingTx,
      transactions,
      clearAllTransactions,
      recentlyVisitedTrees,
      updateRecentlyVisitedTrees,
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
      // handlePendingTx,
      transactions,
      clearAllTransactions,
      recentlyVisitedTrees,
      updateRecentlyVisitedTrees,
    ],
  );

  return (
    <OverlayContext.Provider value={returnValue}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => useContext(OverlayContext);
