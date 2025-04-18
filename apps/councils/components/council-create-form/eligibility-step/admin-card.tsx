'use client';

import { SquarePen, Trash2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { Button, MemberAvatar } from 'ui';

interface AdminCardProps {
  admin: CouncilMember;
  form: UseFormReturn<CouncilFormData>;
  formField: 'admins' | 'agreementAdmins' | 'complianceAdmins' | 'members';
  canEdit?: boolean;
  canDelete?: boolean;
  showButtons?: boolean;
  onEdit?: (admin: CouncilMember) => void;
}

export function AdminCard({
  admin,
  form,
  formField,
  canEdit = true,
  canDelete = true,
  showButtons = true,
  onEdit,
}: AdminCardProps) {
  const handleEdit = () => {
    if (!canEdit) return;
    onEdit?.(admin);
  };

  const handleRemove = () => {
    if (!canDelete) return;
    const currentAdmins = form.getValues(formField) || [];
    const updatedAdmins = currentAdmins.filter((a: CouncilMember) => a.id !== admin.id);
    form.setValue(formField, updatedAdmins);
  };

  return (
    <div className='flex items-center justify-between'>
      <MemberAvatar member={admin} stack={true} />

      {showButtons && (
        <div className='flex items-center gap-3'>
          {canEdit && (
            <Button
              variant='outline-blue'
              className='rounded-full px-4 py-3 text-sm font-medium disabled:cursor-not-allowed'
              onClick={handleEdit}
            >
              <SquarePen className='h-4 w-4' />
              Edit
            </Button>
          )}

          {canDelete && (
            <Button
              variant='outline-red'
              onClick={handleRemove}
              className='aspect-square h-10 w-10 rounded-full p-0 disabled:cursor-not-allowed'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
