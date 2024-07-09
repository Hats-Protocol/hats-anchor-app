'use client';

import { Modal } from 'contexts';
import { TransactionHistory } from 'molecules';

const TxHistoryModal = () => {
  return (
    <Modal name='transactions' title='Transactions' size='xl'>
      <TransactionHistory showClear />
    </Modal>
  );
};

export default TxHistoryModal;
