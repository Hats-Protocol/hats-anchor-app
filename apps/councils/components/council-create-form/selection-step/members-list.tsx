'use client';

import Image from 'next/image';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FiX } from 'react-icons/fi';
import { formatAddress } from 'utils';
import { useEnsAvatar, useEnsName } from 'wagmi';

import { EditIcon } from '../../icons/edit-icon';
import { TrashIcon } from '../../icons/trash-icon';
import { AddMemberModal } from './add-member-modal';

interface CouncilMember {
  id: string;
  address: string;
  email: string;
  name?: string;
}

interface MembersListProps {
  members: CouncilMember[];
  form: UseFormReturn<any>;
}

export function MembersList({ members, form }: MembersListProps) {
  const [editingMember, setEditingMember] = useState<CouncilMember | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  // console.log('members in members list', members);

  const handleRemove = (memberId: string) => {
    // console.log('removing memberId', memberId);
    const currentMembers = form.getValues('members') || [];
    //console.log('currentMembers', currentMembers);
    const updatedMembers = currentMembers.filter(
      (member: CouncilMember) => member.id !== memberId,
    );
    //console.log('updatedMembers', updatedMembers);
    form.setValue('members', updatedMembers);
  };

  const handleEdit = (member: CouncilMember) => {
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
          />
        ))}
      </div>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        form={form}
        editingMember={editingMember}
      />
    </>
  );
}

function MemberCard({
  member,
  onRemove,
  onEdit,
}: {
  member: CouncilMember;
  onRemove: (id: string) => void;
  onEdit: () => void;
}) {
  const { data: ensName } = useEnsName({
    address: member.address as `0x${string}`,
    chainId: 1,
  });

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        {member.name && (
          <span className='text-sm font-medium text-gray-900'>
            {member.name}
          </span>
        )}
        <span className='text-sm text-gray-600'>
          {ensName || formatAddress(member.address)}
        </span>
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
        <button
          type='button'
          onClick={() => onRemove(member.id)}
          className='text-red-700 hover:text-red-800'
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
