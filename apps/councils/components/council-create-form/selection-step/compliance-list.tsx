'use client';

import type { CouncilFormData } from 'contexts';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { formatAddress } from 'utils';
import { useEnsName } from 'wagmi';

import { EditIcon } from '../../icons/edit-icon';
import { TrashIcon } from '../../icons/trash-icon';
import { AddComplianceModal } from './add-compliance-modal';

interface CouncilMember {
  id: string;
  address: string;
  email: string;
  name?: string;
}

interface ComplianceListProps {
  complianceAdmins: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
}

export function ComplianceList({ complianceAdmins, form }: ComplianceListProps) {
  const [editingAdmin, setEditingAdmin] = useState<CouncilMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemove = (adminId: string) => {
    const currentAdmins = form.getValues('complianceAdmins') || [];
    const updatedAdmins = currentAdmins.filter((admin: CouncilMember) => admin.id !== adminId);
    form.setValue('complianceAdmins', updatedAdmins);
  };

  const handleEdit = (admin: CouncilMember) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingAdmin(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className='space-y-4'>
        {complianceAdmins.map((admin) => (
          <ComplianceCard key={admin.id} admin={admin} onRemove={handleRemove} onEdit={() => handleEdit(admin)} />
        ))}
      </div>

      <AddComplianceModal isOpen={isModalOpen} onClose={handleModalClose} form={form} editingAdmin={editingAdmin} />
    </>
  );
}

function ComplianceCard({
  admin,
  onRemove,
  onEdit,
}: {
  admin: CouncilMember;
  onRemove: (id: string) => void;
  onEdit: () => void;
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
      <div className='flex items-center gap-3'>
        <button
          type='button'
          className='flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800'
          onClick={onEdit}
        >
          <EditIcon />
          Edit
        </button>
        <button type='button' onClick={() => onRemove(admin.id)} className='text-red-700 hover:text-red-800'>
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
