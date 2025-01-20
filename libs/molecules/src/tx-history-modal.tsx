'use client';

import { Modal } from 'contexts';

import { TransactionHistory } from './transaction-history';

const TxHistoryModal = () => {
  return (
    <Modal name='transactions' title='Transactions' size='xl'>
      <TransactionHistory showClear />
    </Modal>
  );
};

export { TxHistoryModal };
