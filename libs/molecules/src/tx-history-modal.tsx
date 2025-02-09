'use client';

import { Modal } from 'contexts';
import { ScrollArea } from 'ui';

import { TransactionHistory } from './transaction-history';

const TxHistoryModal = () => {
  return (
    <Modal name='transactions' title='Transactions' size='xl'>
      <ScrollArea className='h-[600px]'>
        <TransactionHistory showClear />
      </ScrollArea>
    </Modal>
  );
};

export { TxHistoryModal };
