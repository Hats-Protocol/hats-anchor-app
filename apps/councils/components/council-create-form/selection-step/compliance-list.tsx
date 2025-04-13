'use client';

import { useOverlay } from 'contexts';
import { SquarePen, Trash2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { MemberAvatar } from 'ui';

import { AddComplianceModal } from './add-compliance-modal';

type ComplianceListProps = {
  complianceAdmins: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
  canDelete?: boolean;
  showButtons?: boolean;
  onEdit?: (admin: CouncilMember) => void;
};

export function ComplianceList({
  complianceAdmins,
  form,
  canEdit = true,
  canDelete = true,
  showButtons = true,
  onEdit,
}: ComplianceListProps) {
  return (
    <div className='space-y-4'>
      {complianceAdmins.map((admin) => (
        <ComplianceCard
          key={admin.id}
          admin={admin}
          canEdit={canEdit}
          canDelete={canDelete}
          showButtons={showButtons}
          form={form}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

function ComplianceCard({
  admin,
  canEdit = true,
  canDelete = true,
  showButtons = true,
  form,
  onEdit,
}: {
  admin: CouncilMember;
  canEdit?: boolean;
  canDelete?: boolean;
  showButtons?: boolean;
  form: UseFormReturn<CouncilFormData>;
  onEdit?: (admin: CouncilMember) => void;
}) {
  const { setModals } = useOverlay();
  const handleEdit = () => {
    onEdit?.(admin);
  };

  const handleRemove = () => {
    const currentAdmins = form.getValues('complianceAdmins') || [];
    const updatedAdmins = currentAdmins.filter((a: CouncilMember) => a.id !== admin.id);
    form.setValue('complianceAdmins', updatedAdmins);
  };

  return (
    <div className='flex items-center justify-between'>
      <MemberAvatar member={admin} />

      {showButtons && (
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='text-functional-link-primary hover:text-functional-link-primary/70 flex items-center gap-1.5 text-sm font-medium disabled:opacity-50'
            onClick={handleEdit}
            disabled={!canEdit}
          >
            <SquarePen className='h-4 w-4' />
            Edit
          </button>

          <button
            type='button'
            onClick={handleRemove}
            disabled={!canDelete}
            className='text-destructive hover:text-destructive/70 disabled:opacity-50'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  );
}
