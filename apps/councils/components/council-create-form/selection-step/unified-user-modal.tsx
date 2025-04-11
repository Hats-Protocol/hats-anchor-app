'use client';

import { Modal, useOverlay } from 'contexts';
import { UseFormReturn } from 'react-hook-form';
import { CouncilFormData, CouncilMember } from 'types';

import { UnifiedUserForm } from './unified-user-form';

interface UnifiedUserModalProps {
  form: UseFormReturn<CouncilFormData>;
  editingUser?: CouncilMember | null;
  userType: 'member' | 'admin' | 'agreementAdmin';
  canEdit?: boolean;
  modalName?: string;
}

export function UnifiedUserModal({
  form,
  editingUser,
  userType,
  canEdit = true,
  modalName = 'addUserModal',
}: UnifiedUserModalProps) {
  const { setModals } = useOverlay();

  const handleClose = () => {
    setModals?.({});
  };

  const title = editingUser
    ? `Edit ${userType === 'agreementAdmin' ? 'Agreement Manager' : userType === 'admin' ? 'Council Manager' : 'Council Member'}`
    : `Add ${userType === 'agreementAdmin' ? 'Agreement Manager' : userType === 'admin' ? 'Council Manager' : 'Council Member'}`;

  return (
    <Modal name={modalName} title={title} onClose={handleClose} size='lg'>
      <div className='py-8'>
        <UnifiedUserForm
          parentForm={form}
          editingUser={editingUser}
          userType={userType}
          onClose={handleClose}
          canEdit={canEdit}
          hideAddressButtons={userType === 'agreementAdmin'}
        />
      </div>
    </Modal>
  );
}
