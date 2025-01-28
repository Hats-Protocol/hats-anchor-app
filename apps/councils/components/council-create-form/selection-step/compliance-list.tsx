'use client';

import { useOverlay } from 'contexts';
import { SquarePen, Trash2 } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { MemberAvatar } from 'ui';

import { AddComplianceModal } from './add-compliance-modal';

type ComplianceListProps = {
  complianceAdmins: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
  // editingAdmin: CouncilMember | null;
  // setEditingAdmin: Dispatch<SetStateAction<CouncilMember | null>>;
};

export function ComplianceList({ complianceAdmins, form, canEdit = true }: ComplianceListProps) {
  const handleRemove = (adminId: string) => {
    const currentAdmins = form.getValues('complianceAdmins') || [];
    const updatedAdmins = currentAdmins.filter((admin: CouncilMember) => admin.id !== adminId);
    form.setValue('complianceAdmins', updatedAdmins);
  };

  return (
    <>
      <div className='space-y-4'>
        {complianceAdmins.map((admin) => (
          <ComplianceCard key={admin.id} admin={admin} onRemove={handleRemove} canEdit={canEdit} form={form} />
        ))}
      </div>
    </>
  );
}

function ComplianceCard({
  admin,
  onRemove,
  canEdit = true,
  form,
}: {
  admin: CouncilMember;
  onRemove: (id: string) => void;
  canEdit?: boolean;
  form: UseFormReturn<CouncilFormData>;
}) {
  const { setModals } = useOverlay();
  const handleEdit = () => {
    setModals?.({ [`addComplianceModal-${admin.id}`]: true });
  };

  return (
    <>
      <div className='flex items-center justify-between'>
        <MemberAvatar member={admin} />

        {canEdit && (
          <div className='flex items-center gap-3'>
            <button
              type='button'
              className='text-functional-link-primary hover:text-functional-link-primary/70 flex items-center gap-1.5 text-sm font-medium'
              onClick={handleEdit}
            >
              <SquarePen className='text-functional-link-primary h-4 w-4' />
              Edit
            </button>

            <button
              type='button'
              onClick={() => onRemove(admin.id)}
              className='text-destructive hover:text-destructive/70'
            >
              <Trash2 className='text-destructive h-4 w-4' />
            </button>
          </div>
        )}
      </div>
      <AddComplianceModal form={form} editingAdmin={admin} canEdit={canEdit} />
    </>
  );
}
