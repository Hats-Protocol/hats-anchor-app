'use client';

import { useOverlay } from 'contexts';
import { SquarePen, Trash2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';
import { MemberAvatar } from 'ui';

import { AddAgreementAdminModal } from './add-agreement-admin-modal';

interface AgreementAdminsListProps {
  agreementAdmins: CouncilMember[];
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
}

export function AgreementAdminsList({ agreementAdmins, form, canEdit = true }: AgreementAdminsListProps) {
  return (
    <div className='space-y-4'>
      {agreementAdmins.map((admin) => (
        <AgreementAdminCard key={admin.id} admin={admin} form={form} canEdit={canEdit} />
      ))}
    </div>
  );
}

function AgreementAdminCard({
  admin,
  form,
  canEdit = true,
}: {
  admin: CouncilMember;
  form: UseFormReturn<CouncilFormData>;
  canEdit?: boolean;
}) {
  const { setModals } = useOverlay();
  const { getValues } = form;

  const handleEdit = () => {
    if (!canEdit) return;

    setModals?.({ [`addAgreementAdminModal-${admin.id}`]: true });
  };

  const handleRemove = () => {
    if (!canEdit) return;
    const currentAdmins = getValues('agreementAdmins') || [];
    const updatedAdmins = currentAdmins.filter((a: CouncilMember) => a.id !== admin.id);
    form.setValue('agreementAdmins', updatedAdmins);
  };

  return (
    <>
      <div className='flex items-center justify-between'>
        <MemberAvatar member={admin} />

        {canEdit && (
          <div className='flex items-center gap-3'>
            <button
              type='button'
              className='text-functional-link-primary hover:text-functional-link-primary/70 flex items-center gap-1.5 text-sm font-medium'
              onClick={handleEdit}
            >
              <SquarePen className='h-4 w-4' />
              Edit
            </button>

            <button type='button' onClick={handleRemove} className='text-destructive hover:text-destructive/70'>
              <Trash2 className='h-4 w-4' />
            </button>
          </div>
        )}
      </div>

      <AddAgreementAdminModal form={form} editingAdmin={admin} canEdit={canEdit} />
    </>
  );
}
