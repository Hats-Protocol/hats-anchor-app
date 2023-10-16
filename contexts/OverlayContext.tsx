import { waitForTransaction } from '@wagmi/core';
import _ from 'lodash';
import { useRouter } from 'next/router';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Hex, TransactionReceipt } from 'viem';
import { useChainId } from 'wagmi';

import useLocalStorage from '@/hooks/useLocalStorage';
import useToast from '@/hooks/useToast';
import { checkTransactionStatus } from '@/lib/contract';
import { Transaction } from '@/types';

const defaults = {
  createTree: false,
  newWearer: false,
  editModule: false,
  createHat: false,
  hatDetails: false,
  hatImage: false,
  hatSupply: false,
};

export interface IOverlayContext {
  modals?: { [key: string]: boolean };
  setModals?: (m: object) => void;
  closeModals?: () => void;
  commandPalette: boolean;
  setCommandPalette: Dispatch<SetStateAction<boolean>>;
  handlePendingTx?: ({
    hash,
    toastData,
    redirect = null,
    clearModals = true,
    sendToast = true,
    onSuccess,
  }: {
    hash: Hex;
    toastData: object | undefined;
    redirect?: string | null;
    clearModals?: boolean;
    sendToast?: boolean;
    onSuccess?: (d?: TransactionReceipt) => void;
  }) => Promise<TransactionReceipt | undefined>;
  // transactions
  transactions: Transaction[];
}

export const OverlayContext = createContext<IOverlayContext>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setModals: undefined,
  closeModals: undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handlePendingTx: undefined,
  commandPalette: false,
  setCommandPalette: () => {},
  // transactions
  transactions: [],
});

export const OverlayContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [modals, setModals] = useState(defaults);
  const [commandPalette, setCommandPalette] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const chainId = useChainId();

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    'transactions',
    [],
  );

  const showModal = (m: object) => {
    // This allows to show only one modal at a time.
    // In addition, this reset any true value for other modals.
    setModals({ ...defaults, ...m });
  };

  const closeModals = () => {
    setModals(defaults);
  };

  const addTransaction = useCallback(
    (transaction: Transaction) => {
      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);
    },
    [transactions, setTransactions],
  );

  const clearTransaction = useCallback(
    (hash: Hex) => {
      const updatedTransactions = transactions.filter((tx) => tx.hash !== hash);
      setTransactions(updatedTransactions);
    },
    [transactions, setTransactions],
  );

  /**
   * @param {string} hash
   * @param {object} toastData
   * @param {string} toastData.title
   * @param {string} toastData.description
   * @param {string} redirect
   * @param {boolean} clearModals
   * @param {boolean} sendToast
   * @returns {Promise<void>}
   * @example
   * handlePendingTx({
   *  hash: '0x123',
   *  toastData: {
   *    title: 'Transaction successful',
   *    description: 'Your hat was created successfully',
   *  },
   * });
   * */
  const handlePendingTx = async ({
    hash,
    toastData,
    redirect = null,
    clearModals = true,
    sendToast = true,
    onSuccess,
  }: {
    hash: Hex;
    toastData: object | undefined;
    redirect?: string | null;
    clearModals?: boolean;
    sendToast?: boolean;
    onSuccess?: (data?: TransactionReceipt) => void;
  }): Promise<TransactionReceipt | undefined> => {
    addTransaction({
      hash,
      timestamp: Date.now(),
      status: 'pending',
    });

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

    if (onSuccess) {
      onSuccess(data);
    }

    if (clearModals) {
      setModals(defaults);
    }

    clearTransaction(hash);

    if (redirect) {
      router.push(redirect);
    }

    return Promise.resolve(data);
  };

  useEffect(() => {
    const checkAndClearTransactions = async () => {
      const confirmedTransactions = await checkTransactionStatus(
        transactions,
        chainId, // maybe need to check all chains
      );

      _.forEach(transactions, (tx) => {
        const confirmedTx = _.find(confirmedTransactions, { hash: tx.hash });
        if (confirmedTx && tx.status !== 'completed') {
          clearTransaction(tx.hash as Hex); // directly clear the transaction
        }
      });
    };

    checkAndClearTransactions();
  }, [chainId, transactions, setTransactions, clearTransaction]);

  const returnValue = useMemo(
    () => ({
      modals,
      setModals: showModal,
      closeModals,
      commandPalette,
      setCommandPalette,
      handlePendingTx,
      transactions,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modals, commandPalette, toast],
  );

  return (
    <OverlayContext.Provider value={returnValue}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => useContext(OverlayContext);
