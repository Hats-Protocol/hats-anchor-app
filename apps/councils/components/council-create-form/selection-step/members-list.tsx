'use client';

import { useOverlay } from 'contexts';
import { SquarePen, Trash2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData } from 'types';
import { MemberAvatar } from 'ui';

import { AddMemberModal } from './add-member-modal';

interface CouncilMember {
  id: string;
  address: string;
  email: string;
  name?: string;
}

interface MembersListProps {
  members: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
}

interface MemberCardProps {
  member: CouncilMember;
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
}

export function MembersList({ members, form, canEdit = true }: MembersListProps) {
  return (
    <div className='w-full space-y-4'>
      {members.map((member) => (
        <MemberCard key={member.address} member={member} form={form} canEdit={canEdit} />
      ))}
    </div>
  );
}

function MemberCard({ member, form, canEdit = true }: MemberCardProps) {
  const { setModals } = useOverlay();

  const onRemove = () => {
    if (!canEdit) return;
    const currentMembers = form.getValues('members') || [];
    const updatedMembers = currentMembers.filter((m: CouncilMember) => m.id !== member.id);
    form.setValue('members', updatedMembers);
  };

  const handleEdit = () => {
    if (!canEdit) return;
    setModals?.({ [`addMemberModal-${member.address}`]: true });
  };

  return (
    <>
      <div className='flex items-center justify-between'>
        <MemberAvatar member={member} />

        {canEdit && (
          <div className='flex items-center gap-3'>
            <button
              type='button'
              className='text-functional-link-primary hover:text-functional-link-primary/70 flex items-center gap-1.5 text-sm font-medium'
              onClick={() => handleEdit()}
            >
              <SquarePen className='h-4 w-4' />
              Edit
            </button>

            <button type='button' onClick={() => onRemove()} className='text-destructive hover:text-destructive/70'>
              <Trash2 className='h-4 w-4' />
            </button>
          </div>
        )}
      </div>

      <AddMemberModal form={form} editingMember={member} canEdit={canEdit} />
    </>
  );
}
