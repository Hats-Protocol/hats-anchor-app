'use client';

import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { Skeleton } from 'ui';

import { AdminCard } from './admin-card';

// TODO should be able to use this for all admin list forms

type AgreementAdminsListProps = {
  agreementAdmins: CouncilMember[];
  form: UseFormReturn<Partial<CouncilFormData>>;
  canEdit?: boolean;
  canDelete?: boolean;
  showButtons?: boolean;
  onEdit?: (admin: CouncilMember) => void;
  loading?: boolean;
};

export function AgreementAdminsList({
  agreementAdmins,
  form,
  canEdit = true,
  canDelete = true,
  showButtons = true,
  onEdit,
  loading = false,
}: AgreementAdminsListProps) {
  if (loading) {
    return (
      <div className='space-y-4'>
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
    <div className='space-y-4'>
      {agreementAdmins.map((admin) => (
        <AdminCard
          key={admin.id}
          admin={admin}
          form={form}
          formField='agreementAdmins'
          canEdit={canEdit}
          canDelete={canDelete}
          showButtons={showButtons}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
