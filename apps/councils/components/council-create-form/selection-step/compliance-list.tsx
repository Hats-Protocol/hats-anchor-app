'use client';

import { useOverlay } from 'contexts';
import { SquarePen, Trash2 } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { MemberAvatar } from 'ui';

import { AddComplianceModal } from './add-compliance-modal';

interface ComplianceListProps {
  complianceAdmins: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
  editingAdmin: CouncilMember | null;
  setEditingAdmin: Dispatch<SetStateAction<CouncilMember | null>>;
}

export function ComplianceList({
  complianceAdmins,
  form,
  canEdit = true,
  editingAdmin,
  setEditingAdmin,
}: ComplianceListProps) {
  const { setModals } = useOverlay();

  const handleRemove = (adminId: string) => {
    const currentAdmins = form.getValues('complianceAdmins') || [];
    const updatedAdmins = currentAdmins.filter((admin: CouncilMember) => admin.id !== adminId);
    form.setValue('complianceAdmins', updatedAdmins);
  };

  const handleEdit = (admin: CouncilMember) => {
    setEditingAdmin(admin);
    setModals?.({ addComplianceModal: true });
  };

  return (
    <>
      <div className='space-y-4'>
        {complianceAdmins.map((admin) => (
          <ComplianceCard
            key={admin.id}
            admin={admin}
            onRemove={handleRemove}
            onEdit={() => handleEdit(admin)}
            canEdit={canEdit}
          />
        ))}
      </div>

      <AddComplianceModal form={form} editingAdmin={editingAdmin} setEditingAdmin={setEditingAdmin} canEdit={canEdit} />
    </>
  );
}

function ComplianceCard({
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
            className='flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700'
            onClick={onEdit}
          >
            <SquarePen className='h-4 w-4 text-sky-600' />
            Edit
          </button>

          <button type='button' onClick={() => onRemove(admin.id)} className='text-red-700 hover:text-red-800'>
            <Trash2 className='h-4 w-4 text-red-700' />
          </button>
        </div>
      )}
    </div>
  );
}
