import { Modal, ModalDescription, ModalHeader } from 'contexts';
import { ModuleDetails } from 'types';
import { VisuallyHidden } from 'ui';

import { Erc20Claims } from './erc20-claims';

const Erc20Modal = ({ moduleDetails }: { moduleDetails: ModuleDetails | undefined }) => {
  if (!moduleDetails) return null;

  return (
    <Modal name={`${moduleDetails?.instanceAddress}-erc20`}>
      <VisuallyHidden>
        <ModalHeader>ERC20 Eligibility</ModalHeader>
        <ModalDescription>
          This ERC20 Eligibility module is part of the eligibility criteria of the associated role.
        </ModalDescription>
      </VisuallyHidden>

      <div className='pt-4'>
        <Erc20Claims activeModule={moduleDetails} labeledModules={undefined} />
      </div>
    </Modal>
  );
};

export default Erc20Modal;
