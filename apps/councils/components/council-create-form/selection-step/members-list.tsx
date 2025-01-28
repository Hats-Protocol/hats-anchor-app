'use client';

import { useOverlay } from 'contexts';
import { SquarePen, Trash2 } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MemberAvatar } from 'ui';
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
  editingMember?: CouncilMember | null;
  setEditingMember: Dispatch<SetStateAction<CouncilMember | null>>;
}

export function MembersList({ members, form, editingMember, setEditingMember, canEdit = true }: MembersListProps) {
  const { setModals } = useOverlay();

  const handleRemove = (memberId: string) => {
    if (!canEdit) return;
    const currentMembers = form.getValues('members') || [];
    const updatedMembers = currentMembers.filter((member: CouncilMember) => member.id !== memberId);
    form.setValue('members', updatedMembers);
  };

  const handleEdit = (member: CouncilMember) => {
    if (!canEdit) return;
    setEditingMember(member);
    setModals?.({ addMemberModal: true });
  };

  return (
    <>
      <div className='w-full space-y-4'>
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

      <AddMemberModal form={form} editingMember={editingMember} setEditingMember={setEditingMember} canEdit={canEdit} />
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
  return (
    <div className='flex items-center justify-between'>
      <MemberAvatar member={member} />

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

          <button
            type='button'
            onClick={() => onRemove(member.id)}
            className='text-destructive hover:text-destructive/70'
          >
            <Trash2 className='text-destructive h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  );
}
