'use client';

import { Modal, useCouncilForm, useOverlay } from 'contexts';
import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CouncilMember } from 'types';
import type { CouncilFormData } from 'types';

import { AddMemberForm } from './add-member-form';

interface AddMemberModalProps {
  form: UseFormReturn<CouncilFormData>;
  editingMember?: CouncilMember | null;
  canEdit?: boolean;
}

// TODO migrate to unified user form

export function AddMemberModal({ form: parentForm, editingMember, canEdit = true }: AddMemberModalProps) {
  const { modals, setModals } = useOverlay();

  const handleClose = () => {
    setModals?.({});
  };

  useEffect(() => {
    if (modals?.addMemberModal) {
      // Reset form state when modal opens
    }
  }, [modals?.addMemberModal]);

  return (
    <Modal
      name={`addMemberModal${editingMember?.id ? `-${editingMember.id}` : ''}`}
      title={editingMember ? 'Edit Council Member' : 'Add Council Member'}
      onClose={handleClose}
      size='lg'
    >
      <div className='py-8'>
        <AddMemberForm parentForm={parentForm} editingMember={editingMember} onClose={handleClose} canEdit={canEdit} />
      </div>
    </Modal>
  );
}
