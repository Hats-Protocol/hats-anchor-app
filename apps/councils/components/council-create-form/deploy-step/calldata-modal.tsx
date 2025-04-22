import { Modal } from 'contexts';

const CalldataModal = () => {
  return (
    <Modal name='calldata' title='Deploying via Smart Contract' size='xl'>
      <div>
        <h2>Calldata</h2>
        <p>This is the calldata for the council deployment</p>
      </div>
    </Modal>
  );
};

export default CalldataModal;
