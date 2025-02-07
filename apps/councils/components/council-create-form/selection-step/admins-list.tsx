'use client';

import { useOverlay } from 'contexts';
import { SquarePen, Trash2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { cn } from 'ui';
import { MemberAvatar } from 'ui';

import { AddAdminModal } from './add-admin-modal';

interface AdminsListProps {
  name: string;
  admins: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
}

export function AdminsList({ admins, form, canEdit = true }: AdminsListProps) {
  const { watch } = form;
  const creator = watch('creator');

  return (
    <div className='space-y-4'>
      {admins.map((admin) => {
        return (
          <AdminCard key={admin.id} admin={admin} form={form} canEdit={canEdit} isCreator={creator === admin.address} />
        );
      })}
    </div>
  );
}

function AdminCard({
  admin,
  form,
  canEdit = true,
  isCreator,
}: {
  admin: CouncilMember;
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
  isCreator?: boolean;
}) {
  const { setModals } = useOverlay();

  const handleEdit = () => {
    setModals?.({ [`addAdminModal-${admin.id}`]: true });
  };

  const handleRemove = () => {
    const currentAdmins = form.getValues('admins') || [];
    const updatedAdmins = currentAdmins.filter((a: CouncilMember) => a.id !== admin.id);
    form.setValue('admins', updatedAdmins);
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
            <button type='button' onClick={handleRemove} disabled={isCreator}>
              <Trash2 className={cn('text-destructive h-4 w-4', isCreator && 'cursor-not-allowed opacity-50')} />
            </button>
          </div>
        )}
      </div>

      <AddAdminModal form={form} editingAdmin={admin} canEdit={canEdit} />
    </>
  );
}
