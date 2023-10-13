import _ from 'lodash';
import { useEffect } from 'react';
import { Hex } from 'viem';

import { useTreeForm } from '@/contexts/TreeFormContext';
import { checkTransactionStatus } from '@/lib/contract';
import { Transaction } from '@/types';

import useLocalStorage from './useLocalStorage';

const useTransactions = () => {
  const { chainId } = useTreeForm();

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    'transactions',
    [],
  );

  const addTransaction = (transaction: Transaction) => {
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
  };

  const updateTransaction = (hash: Hex, newStatus: string) => {
    const updatedTransactions = _.map(transactions, (tx) => {
      if (tx.hash === hash) {
        return {
          ...tx,
          status: newStatus,
        };
      }
      return tx;
    });
    setTransactions(updatedTransactions);
  };

  const clearCompletedTransactions = () => {
    const filteredTransactions = _.filter(transactions, { status: 'pending' });
    setTransactions(filteredTransactions);
  };

  useEffect(() => {
    const checkAndClearTransactions = async () => {
      const confirmedTransactions = await checkTransactionStatus(
        transactions,
        chainId,
      );
      let hasStatusChanged = false;

      const updatedTransactions = _.map(transactions, (tx) => {
        const confirmedTx = _.find(confirmedTransactions, { hash: tx.hash });
        if (confirmedTx && tx.status !== 'completed') {
          hasStatusChanged = true;
          return {
            ...tx,
            status: 'completed',
          };
        }
        return tx;
      });

      if (hasStatusChanged) {
        const remainingTransactions = updatedTransactions.filter(
          (tx) => tx.status !== 'completed',
        );
        setTransactions(remainingTransactions);
      }
    };

    checkAndClearTransactions();
  }, [chainId, transactions, setTransactions]);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    clearCompletedTransactions,
  };
};

export default useTransactions;
