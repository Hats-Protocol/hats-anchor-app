'use client';

import { useOverlay } from 'contexts';
import { SquarePen, Trash2 } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { MemberAvatar } from 'ui';

import { AddAgreementAdminModal } from './add-agreement-admin-modal';

interface AgreementAdminsListProps {
  agreementAdmins: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
  editingAdmin: CouncilMember | null;
  setEditingAdmin: Dispatch<SetStateAction<CouncilMember | null>>;
}

export function AgreementAdminsList({
  agreementAdmins,
  form,
  canEdit = true,
  editingAdmin,
  setEditingAdmin,
}: AgreementAdminsListProps) {
  const { setModals } = useOverlay();

  const handleRemove = (adminId: string) => {
    if (!canEdit) return;
    const currentAdmins = form.getValues('agreementAdmins') || [];
    const updatedAdmins = currentAdmins.filter((admin: CouncilMember) => admin.id !== adminId);
    form.setValue('agreementAdmins', updatedAdmins);
  };

  const handleEdit = (admin: CouncilMember) => {
    if (!canEdit) return;
    setEditingAdmin(admin);
    setModals?.({ addAgreementAdminModal: true });
  };

  return (
    <>
      <div className='space-y-4'>
        {agreementAdmins.map((admin) => (
          <AgreementAdminCard
            key={admin.id}
            admin={admin}
            onRemove={handleRemove}
            onEdit={() => handleEdit(admin)}
            canEdit={canEdit}
          />
        ))}
      </div>

      <AddAgreementAdminModal
        form={form}
        editingAdmin={editingAdmin}
        setEditingAdmin={setEditingAdmin}
        canEdit={canEdit}
      />
    </>
  );
}

function AgreementAdminCard({
  admin,
  onRemove,
  onEdit,
  canEdit = true,
}: {
  admin: CouncilMember;
  onRemove: (id: string) => void;
  onEdit: () => void;
  canEdit?: boolean;
}) {
  return (
    <div className='flex items-center justify-between'>
      <MemberAvatar member={admin} />

      {canEdit && (
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800'
            onClick={onEdit}
          >
            <SquarePen />
            Edit
          </button>

          <button type='button' onClick={() => onRemove(admin.id)} className='text-red-700 hover:text-red-800'>
            <Trash2 />
          </button>
        </div>
      )}
    </div>
  );
}
