'use client';

import { useOverlay } from 'contexts';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';

import { AdminCard } from './admin-card';

type ComplianceListProps = {
  complianceAdmins: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
  canDelete?: boolean;
  showButtons?: boolean;
  onEdit?: (admin: CouncilMember) => void;
};

export function ComplianceList({
  complianceAdmins,
  form,
  canEdit = true,
  canDelete = true,
  showButtons = true,
  onEdit,
}: ComplianceListProps) {
  return (
    <div className='space-y-4'>
      {complianceAdmins.map((admin) => (
        <AdminCard
          key={admin.id}
          admin={admin}
          form={form}
          formField='complianceAdmins'
          canEdit={canEdit}
          canDelete={canDelete}
          showButtons={showButtons}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
