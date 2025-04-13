'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import type { CouncilFormData, CouncilMember } from 'types';

import { AdminCard } from './admin-card';

interface AdminsListProps {
  onEdit: (member: CouncilMember) => void;
}

export function AdminsList({ onEdit }: AdminsListProps) {
  const form = useFormContext<CouncilFormData>();
  const { fields } = useFieldArray({
    control: form.control,
    name: 'admins',
  });

  return (
    <div className='flex flex-col gap-4'>
      {fields.map((field, index) => (
        <AdminCard key={field.id} admin={field as CouncilMember} form={form} formField='admins' onEdit={onEdit} />
      ))}
    </div>
  );
}
