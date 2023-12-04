import { waitForTransaction } from '@wagmi/core';
import { Transaction } from 'hats-types';
import _ from 'lodash';
import dynamic from 'next/dynamic';
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

import Suspender from '../components/atoms/Suspender';
import useLocalStorage from '../hooks/useLocalStorage';
import useToast from '../hooks/useToast';
import { checkTransactionStatus } from '../lib/contract';

const Modal = dynamic(() => import('../components/atoms/Modal'), {
  loading: () => <Suspender />,
});
const TransactionHistory = dynamic(
  () => import('../components/TransactionHistory'),
  { loading: () => <Suspender /> },
);

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
    txChainId,
    fnName,
    toastData,
    redirect,
    clearModals,
    sendToast,
    onSuccess,
  }: {
    hash: Hex;
    txChainId?: number;
    fnName: string;
    toastData: object | undefined;
    redirect?: string | null;
    clearModals?: boolean;
    sendToast?: boolean;
    onSuccess?: (d?: TransactionReceipt) => void;
  }) => Promise<TransactionReceipt | undefined>;
  transactions: Transaction[];
  clearAllTransactions: () => void;
}

export const OverlayContext = createContext<IOverlayContext>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setModals: undefined,
  closeModals: undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handlePendingTx: undefined,
  commandPalette: false,
  setCommandPalette: () => {},
  transactions: [],
  clearAllTransactions: () => {},
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
    fnName,
    toastData,
    redirect = null,
    clearModals = true,
    sendToast = true,
    onSuccess,
  }: {
    hash: Hex;
    txChainId?: number | undefined;
    fnName: string;
    toastData: object | undefined;
    redirect?: string | null;
    clearModals?: boolean;
    sendToast?: boolean;
    onSuccess?: (data?: TransactionReceipt) => void;
  }): Promise<TransactionReceipt | undefined> => {
    addTransaction({
      hash,
      txChainId,
      timestamp: Date.now(),
      status: 'pending',
      fnName,
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

    updateTransactionStatus(hash, 'completed');

    if (onSuccess) {
      onSuccess(data);
    }

    if (clearModals) {
      setModals(defaults);
    }

    if (redirect) {
      router.push(redirect);
    }

    return Promise.resolve(data);
  };

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
  }, [chainId, transactions, setTransactions]);

  const returnValue = useMemo(
    () => ({
      modals,
      setModals: showModal,
      closeModals,
      commandPalette,
      setCommandPalette,
      handlePendingTx,
      transactions,
      clearAllTransactions,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modals, commandPalette, toast],
  );

  return (
    <OverlayContext.Provider value={returnValue}>
      {children}

      <Modal
        name='transactions'
        title='Transactions'
        size='xl'
        localOverlay={{
          modals,
          closeModals,
          commandPalette,
          setCommandPalette,
          transactions,
          clearAllTransactions,
        }}
      >
        <TransactionHistory />
      </Modal>
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => useContext(OverlayContext);
