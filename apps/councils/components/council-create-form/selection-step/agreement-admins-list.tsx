'use client';

import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';

import { AdminCard } from './admin-card';

type AgreementAdminsListProps = {
  agreementAdmins: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
  canDelete?: boolean;
  showButtons?: boolean;
  onEdit?: (admin: CouncilMember) => void;
};

export function AgreementAdminsList({
  agreementAdmins,
  form,
  canEdit = true,
  canDelete = true,
  showButtons = true,
  onEdit,
}: AgreementAdminsListProps) {
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
