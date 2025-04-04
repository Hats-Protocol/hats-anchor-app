'use client';

import { Modal, ModalDescription, ModalTitle, useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { ModuleDetails, SupportedChains } from 'types';
import { VisuallyHidden } from 'ui';
import { Hex } from 'viem';

import { AllowlistClaims } from '../allowlist-claims';

// quick solution to handle mobile implementation in Pro and Claims apps

const AllowlistModal = ({
  eligibilityHatId,
  moduleInfo,
  chainId,
}: {
  eligibilityHatId: Hex | undefined;
  moduleInfo: ModuleDetails;
  chainId: SupportedChains;
}) => {
  const { setModals } = useOverlay();

  const { data: hat, details } = useHatDetails({
    hatId: eligibilityHatId,
    chainId,
  });

  const hatName = details?.name || hat?.details;
  const heading = `Allowlist for ${hatName}`;

  const handleClose = () => {
    setModals?.({});
  };

  return (
    <Modal name={`${moduleInfo.instanceAddress}-allowlist`} onClose={handleClose}>
      <VisuallyHidden>
        <ModalTitle>{heading}</ModalTitle>
        <ModalDescription>{heading}</ModalDescription>
      </VisuallyHidden>
      <div className='max-h-[70vh] overflow-y-scroll pt-4'>
        <AllowlistClaims activeModule={moduleInfo} labeledModules={undefined} showOnMobile />
      </div>
    </Modal>
  );
};

export { AllowlistModal };
