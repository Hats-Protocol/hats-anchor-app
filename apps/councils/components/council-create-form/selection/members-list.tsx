'use client';

import { FiX } from 'react-icons/fi';
import { UseFormReturn } from 'react-hook-form';
import { formatAddress } from 'utils';
import { useEnsAvatar, useEnsName } from 'wagmi';
import Image from 'next/image';
import { useState } from 'react';
import { AddMemberModal } from './add-member-modal';

interface CouncilMember {
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

  const handleRemove = (addressToRemove: string) => {
    const updatedMembers = members.filter(
      (member) => member.address !== addressToRemove,
    );
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
  onRemove: (address: string) => void;
  onEdit: () => void;
}) {
  const { data: ensName } = useEnsName({
    address: member.address as `0x${string}`,
    chainId: 1,
  });

  const { data: avatarUrl } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: 1,
  });

  return (
    <div className='flex items-center justify-between rounded-xl'>
      <div className='flex items-center gap-2'>
        <span className='font-medium'>{member.name}</span>
        {avatarUrl && (
          <div className='h-5 w-5 overflow-hidden rounded'>
            <Image
              src={avatarUrl}
              alt='ENS Avatar'
              width={20}
              height={20}
              className='h-full w-full object-cover'
              onError={(e) => {
                (e.target as HTMLElement).parentElement!.style.display = 'none';
              }}
            />
          </div>
        )}
        <span className='text-pink-500'>
          {ensName || formatAddress(member.address)}
        </span>
      </div>
      <div className='flex items-center gap-4'>
        <button
          type='button'
          className='text-sm font-medium text-blue-500 hover:text-blue-600'
          onClick={onEdit}
        >
          Edit
        </button>
        <button
          type='button'
          onClick={() => onRemove(member.address)}
          className='text-sm font-medium text-red-500 hover:text-red-600'
        >
          Delete
        </button>
      </div>
    </div>
  );
}
