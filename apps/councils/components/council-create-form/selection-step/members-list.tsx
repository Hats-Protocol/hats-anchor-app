'use client';

import { useOrganization } from 'hooks';
import { SquarePen, Trash2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { Button, MemberAvatar, Skeleton } from 'ui';
import { useAccount } from 'wagmi';

interface MembersListProps {
  members: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
  onEdit: (member: CouncilMember) => void;
  loading?: boolean;
}

interface MemberCardProps {
  member: CouncilMember;
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
  onEdit: (member: CouncilMember) => void;
}

interface AdminUser {
  id: string;
  name: string;
  address: string;
  email: string;
}

interface CouncilCreationForm {
  id: string;
  creator: string;
  chain: number;
  councilName: string;
  members: AdminUser[];
  admins: AdminUser[];
}

interface Council {
  id: string;
  chain: number;
  treeId: number;
  hsg: string;
  deployed: boolean;
  creationForm: CouncilCreationForm;
}

export function MembersList({ members, form, canEdit = true, onEdit, loading = false }: MembersListProps) {
  if (loading) {
    return (
      <div className='w-full space-y-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-10 w-10 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-24' />
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-10 w-20 rounded-full' />
              <Skeleton className='h-10 w-10 rounded-full' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='w-full space-y-4'>
      {members.map((member) => (
        <MemberCard key={member.address} member={member} form={form} canEdit={canEdit} onEdit={onEdit} />
      ))}
    </div>
  );
}

function MemberCard({ member, form, canEdit = true, onEdit }: MemberCardProps) {
  const { address: connectedAddress } = useAccount();
  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization } = useOrganization(orgName);

  // Check if the connected user is the creator of the form
  const isConnectedUserCreator = form.getValues('creator')?.toLowerCase() === connectedAddress?.toLowerCase();

  // Check if this member exists in either the organization's admins or members lists
  const isExistingMember =
    (organization?.councils?.[0]?.creationForm?.admins?.some(
      (m) => m.address.toLowerCase() === member.address.toLowerCase(),
    ) ||
      organization?.councils?.[0]?.creationForm?.members?.some(
        (m) => m.address.toLowerCase() === member.address.toLowerCase(),
      )) ??
    false;

  // During council creation (TODO: Double check all of these assumptions in QA):
  // - Only the creator of the form can edit newly added members
  // - Cannot edit members from existing lists
  const canEditMember = isConnectedUserCreator && !isExistingMember;

  // During council creation, we can delete any member
  // If this were editing an existing council, we'd check for admin status here

  const onRemove = () => {
    if (!canEdit) return;
    const currentMembers = form.getValues('members') || [];
    const updatedMembers = currentMembers.filter((m: CouncilMember) => m.id !== member.id);
    form.setValue('members', updatedMembers);
  };

  const handleEdit = () => {
    if (!canEdit || !canEditMember) return;
    onEdit(member);
  };

  // TODO: add back the AdminCard component -- need to ensure that it supports the flexible edit / delete permissions

  return (
    <div className='flex items-center justify-between'>
      <MemberAvatar member={member} stack={true} />

      {canEdit && (
        <div className='flex items-center gap-3'>
          <Button
            variant='outline-blue'
            className='rounded-full px-4 py-3 text-sm font-medium disabled:cursor-not-allowed'
            onClick={() => handleEdit()}
            disabled={!canEditMember}
          >
            <SquarePen className='h-4 w-4' />
            Edit
          </Button>

          <Button
            variant='outline-red'
            className='aspect-square h-10 w-10 rounded-full p-0 disabled:cursor-not-allowed'
            onClick={() => onRemove()}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
