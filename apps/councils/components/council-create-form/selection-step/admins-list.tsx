'use client';

import { useOrganization } from 'hooks';
import { SquarePen, Trash2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { cn } from 'ui';
import { MemberAvatar } from 'ui';
import { logger } from 'utils';
import { useAccount } from 'wagmi';

export interface AdminsListProps {
  name: string;
  admins: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
  onEdit: (admin: CouncilMember) => void;
}

export function AdminsList({ name, admins, form, canEdit = true, onEdit }: AdminsListProps) {
  const { watch } = form;
  const creator = watch('creator');

  return (
    <div className='space-y-4'>
      {admins.map((admin) => (
        <AdminCard
          key={admin.id}
          admin={admin}
          form={form}
          canEdit={canEdit}
          isCreator={creator === admin.address}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

interface AdminCardProps {
  admin: CouncilMember;
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
  isCreator?: boolean;
  onEdit: (admin: CouncilMember) => void;
}

function AdminCard({ admin, form, canEdit = true, isCreator, onEdit }: AdminCardProps) {
  const { address: connectedAddress } = useAccount();
  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization } = useOrganization(orgName);

  // Check if the connected user is in the existing admin list
  const isConnectedUserExistingAdmin =
    organization?.councils?.[0]?.creationForm?.admins?.some(
      (m) => m.address.toLowerCase() === connectedAddress?.toLowerCase(),
    ) ?? false;

  // Check if the connected user is the creator of the form
  const isConnectedUserCreator = form.getValues('creator')?.toLowerCase() === connectedAddress?.toLowerCase();

  // Check if this admin exists in either the organization's admins or members lists
  const isFromExistingLists =
    (organization?.councils?.[0]?.creationForm?.admins?.some(
      (m) => m.address.toLowerCase() === admin.address.toLowerCase(),
    ) ||
      organization?.councils?.[0]?.creationForm?.members?.some(
        (m) => m.address.toLowerCase() === admin.address.toLowerCase(),
      )) ??
    false;

  // During council creation:
  // - Only the creator of the form can edit newly added admins
  // - Cannot edit admins from existing lists
  const canEditAdmin = isConnectedUserCreator && !isFromExistingLists;

  // During council creation, we can delete any admin except the creator
  const canDeleteAdmin = !isCreator;

  logger.info('admin permissions check', {
    isConnectedUserExistingAdmin,
    isConnectedUserCreator,
    isFromExistingLists,
    canEditAdmin,
    canDeleteAdmin,
    adminAddress: admin.address,
    connectedAddress,
    creator: form.getValues('creator'),
    organizationAdmins: organization?.councils?.[0]?.creationForm?.admins,
    organizationMembers: organization?.councils?.[0]?.creationForm?.members,
  });

  const onRemove = () => {
    if (!canEdit || !canDeleteAdmin) return;
    const currentAdmins = form.getValues('admins') || [];
    const updatedAdmins = currentAdmins.filter((a: CouncilMember) => a.id !== admin.id);
    form.setValue('admins', updatedAdmins);
  };

  const handleEdit = () => {
    if (!canEdit || !canEditAdmin) return;
    onEdit(admin);
  };

  return (
    <div className='flex items-center justify-between'>
      <MemberAvatar member={admin} />

      {canEdit && (
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='text-functional-link-primary hover:text-functional-link-primary/70 disabled:hover:text-functional-link-primary flex items-center gap-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => handleEdit()}
            disabled={!canEditAdmin}
          >
            <SquarePen className='h-4 w-4' />
            Edit
          </button>
          <button
            type='button'
            onClick={() => onRemove()}
            className='text-destructive hover:text-destructive/70 disabled:hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50'
            disabled={!canDeleteAdmin}
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  );
}
