'use client';

import { useOverlay } from 'contexts';
import { SquarePen, Trash2 } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilMember } from 'types';
import { cn } from 'ui';
import { MemberAvatar } from 'ui';

import { AddAdminModal } from './add-admin-modal';

interface AdminsListProps {
  name: string;
  admins: CouncilMember[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>; // CouncilFormData
  canEdit?: boolean;
  editingAdmin: CouncilMember | null;
  setEditingAdmin: Dispatch<SetStateAction<CouncilMember | null>>;
}

export function AdminsList({ admins, form, canEdit = true, editingAdmin, setEditingAdmin }: AdminsListProps) {
  const { setModals } = useOverlay();
  const { watch } = form;
  const creator = watch('creator');

  const handleRemove = (adminId: string) => {
    const currentAdmins = form.getValues('admins') || [];
    const updatedAdmins = currentAdmins.filter((admin: CouncilMember) => admin.id !== adminId);
    form.setValue('admins', updatedAdmins);
  };

  const handleEdit = (admin: CouncilMember) => {
    setEditingAdmin(admin);
    setModals?.({ addAdminModal: true });
  };

  return (
    <>
      <div className='space-y-4'>
        {admins.map((admin) => {
          const isCreator = creator === admin.address;
          return (
            <AdminCard
              key={admin.id}
              admin={admin}
              onRemove={handleRemove}
              onEdit={() => handleEdit(admin)}
              canEdit={canEdit}
              isCreator={isCreator}
            />
          );
        })}
      </div>

      <AddAdminModal form={form} editingAdmin={editingAdmin} setEditingAdmin={setEditingAdmin} canEdit={canEdit} />
    </>
  );
}

function AdminCard({
  admin,
  onRemove,
  onEdit,
  canEdit = true,
  isCreator,
}: {
  admin: CouncilMember;
  onRemove: (id: string) => void;
  onEdit: () => void;
  canEdit?: boolean;
  isCreator?: boolean;
}) {
  return (
    <div className='flex items-center justify-between'>
      <MemberAvatar member={admin} />

      {canEdit && (
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='text-functional-link-primary hover:text-functional-link-primary/70 flex items-center gap-1.5 text-sm font-medium'
            onClick={onEdit}
          >
            <SquarePen className='text-functional-link-primary h-4 w-4' />
            Edit
          </button>
          <button type='button' onClick={() => onRemove(admin.id)} disabled={isCreator}>
            <Trash2 className={cn('h-4 w-4 text-red-700', isCreator && 'cursor-not-allowed opacity-50')} />
          </button>
        </div>
      )}
    </div>
  );
}
