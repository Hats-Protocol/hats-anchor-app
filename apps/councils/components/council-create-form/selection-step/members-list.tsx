'use client';

import { SquarePen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { formatAddress } from 'utils';
import { useEnsName } from 'wagmi';

import { AddMemberModal } from './add-member-modal';

interface CouncilMember {
  id: string;
  address: string;
  email: string;
  name?: string;
}

interface MembersListProps {
  members: CouncilMember[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  canEdit?: boolean;
}

export function MembersList({ members, form, canEdit = true }: MembersListProps) {
  const [editingMember, setEditingMember] = useState<CouncilMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemove = (memberId: string) => {
    if (!canEdit) return;
    const currentMembers = form.getValues('members') || [];
    const updatedMembers = currentMembers.filter((member: CouncilMember) => member.id !== memberId);
    form.setValue('members', updatedMembers);
  };

  const handleEdit = (member: CouncilMember) => {
    if (!canEdit) return;
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingMember(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className='space-y-4'>
        {members.map((member) => (
          <MemberCard
            key={member.address}
            member={member}
            onRemove={handleRemove}
            onEdit={() => handleEdit(member)}
            canEdit={canEdit}
          />
        ))}
      </div>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        form={form}
        editingMember={editingMember}
        canEdit={canEdit}
      />
    </>
  );
}

function MemberCard({
  member,
  onRemove,
  onEdit,
  canEdit = true,
}: {
  member: CouncilMember;
  onRemove: (id: string) => void;
  onEdit: () => void;
  canEdit?: boolean;
}) {
  const { data: ensName } = useEnsName({
    address: member.address as `0x${string}`,
    chainId: 1,
  });

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        {member.name && <span className='text-sm font-medium text-gray-900'>{member.name}</span>}
        <span className='text-sm text-gray-600'>{ensName || formatAddress(member.address)}</span>
      </div>

      {canEdit && (
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700'
            onClick={onEdit}
          >
            <SquarePen className='h-4 w-4' />
            Edit
          </button>

          <button type='button' onClick={() => onRemove(member.id)} className='text-red-700 hover:text-red-800'>
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  );
}
