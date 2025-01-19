'use client';

import { Modal } from 'contexts';

import TransactionHistory from './TransactionHistory';

const TxHistoryModal = () => {
  return (
    <Modal name='transactions' title='Transactions' size='xl'>
      <TransactionHistory showClear />
    </Modal>
  );
};

export default TxHistoryModal;
