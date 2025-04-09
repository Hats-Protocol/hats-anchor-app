'use client';

import type { Organization } from 'hooks';
import { useOrganization } from 'hooks';
import { SquarePen, Trash2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { MemberAvatar } from 'ui';
import { logger } from 'utils';
import { useAccount } from 'wagmi';

interface MembersListProps {
  members: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
  onEdit: (member: CouncilMember) => void;
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

export function MembersList({ members, form, canEdit = true, onEdit }: MembersListProps) {
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

  // Check if:
  // 1. The connected user is in the organization's admins list from the API
  // 2. OR if this is a new organization (no data yet)
  // 3. OR if the user is editing members they just added in this form session
  const isAdmin =
    organization?.councils?.[0]?.creationForm?.admins?.some(
      (admin) => admin.address.toLowerCase() === connectedAddress?.toLowerCase(),
    ) ?? true; // Default to true if no organization data yet (new org creation)

  logger.info('isAdmin check', {
    isAdmin,
    organizationAdmins: organization?.councils?.[0]?.creationForm?.admins,
    connectedAddress,
    isNewOrg: !organization,
  });

  const onRemove = () => {
    if (!canEdit || !isAdmin) return;
    const currentMembers = form.getValues('members') || [];
    const updatedMembers = currentMembers.filter((m: CouncilMember) => m.id !== member.id);
    form.setValue('members', updatedMembers);
  };

  const handleEdit = () => {
    if (!canEdit || !isAdmin) return;
    onEdit(member);
  };

  return (
    <div className='flex items-center justify-between'>
      <MemberAvatar member={member} />

      {canEdit && (
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='text-functional-link-primary hover:text-functional-link-primary/70 disabled:hover:text-functional-link-primary flex items-center gap-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => handleEdit()}
            disabled={!isAdmin}
          >
            <SquarePen className='h-4 w-4' />
            Edit
          </button>

          <button
            type='button'
            onClick={() => onRemove()}
            className='text-destructive hover:text-destructive/70 disabled:hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50'
            disabled={!isAdmin}
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  );
}
