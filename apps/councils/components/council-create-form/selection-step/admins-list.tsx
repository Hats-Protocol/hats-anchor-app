'use client';

import { useOverlay } from 'contexts';
import { SquarePen, Trash2 } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilMember } from 'types';
import { formatAddress } from 'utils';
import { useEnsName } from 'wagmi';

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
        {admins.map((admin) => (
          <AdminCard
            key={admin.id}
            admin={admin}
            onRemove={handleRemove}
            onEdit={() => handleEdit(admin)}
            canEdit={canEdit}
          />
        ))}
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
}: {
  admin: CouncilMember;
  onRemove: (id: string) => void;
  onEdit: () => void;
  canEdit?: boolean;
}) {
  const { data: ensName } = useEnsName({
    address: admin.address as `0x${string}`,
    chainId: 1,
  });

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        {admin.name && <span className='text-sm font-medium text-gray-900'>{admin.name}</span>}
        <span className='text-sm text-gray-600'>{ensName || formatAddress(admin.address)}</span>
      </div>
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
          <button type='button' onClick={() => onRemove(admin.id)}>
            <Trash2 className='h-4 w-4 text-red-700' />
          </button>
        </div>
      )}
    </div>
  );
}
