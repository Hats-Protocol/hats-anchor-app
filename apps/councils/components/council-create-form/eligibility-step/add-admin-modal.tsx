'use client';

import { Modal, useOverlay } from 'contexts';
import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CouncilMember } from 'types';
import type { CouncilFormData } from 'types';

import { AddAdminForm } from './add-admin-form';

interface AddAdminModalProps {
  form: UseFormReturn<CouncilFormData>;
  editingAdmin?: CouncilMember | null;
  canEdit?: boolean;
}

// TODO migrate to unified user form

export function AddAdminModal({ form: parentForm, editingAdmin, canEdit = true }: AddAdminModalProps) {
  const { modals, setModals } = useOverlay();

  const handleClose = () => {
    setModals?.({});
  };

  useEffect(() => {
    if (modals?.addAdminModal) {
      // Reset form state when modal opens
    }
  }, [modals?.addAdminModal]);

  return (
    <Modal
      name={`addAdminModal${editingAdmin?.id ? `-${editingAdmin.id}` : ''}`}
      title={editingAdmin ? 'Edit Organization Manager' : 'Add Organization Manager'}
      onClose={handleClose}
      size='lg'
    >
      <div className='py-8'>
        <AddAdminForm parentForm={parentForm} editingAdmin={editingAdmin} onClose={handleClose} canEdit={canEdit} />
      </div>
    </Modal>
  );
}
