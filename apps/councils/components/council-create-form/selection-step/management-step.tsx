'use client';

import { useCouncilForm } from 'contexts';
import { useOrganization } from 'hooks';
import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { CouncilMember, StepProps } from 'types';
import { Button, Skeleton } from 'ui';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AddAdminForm } from './add-admin-form';
import { AdminsList } from './admins-list';

export function SelectionManagementStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<CouncilMember | null>(null);

  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization } = useOrganization(orgName);

  const admins = form.watch('admins') || [];
  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'management', form.watch('requirements'));

  if (isLoading) {
    return (
      <div className='mx-auto flex w-full flex-col space-y-6'>
        <Skeleton className='h-8 w-48' />

        <div className='space-y-8'>
          <div className='space-y-2'>
            <Skeleton className='h-6 w-56' />
            <Skeleton className='h-5 w-96' />
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-4 w-4' />
                <Skeleton className='h-5 w-32' />
              </div>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-4 w-8' />
                <Skeleton className='h-4 w-4' />
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <Skeleton className='h-10 w-48' />
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <Skeleton className='h-10 w-32' />
        </div>
      </div>
    );
  }

  return (
    <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(onNext)}>
      <h1 className='text-2xl font-bold'>Council Managers</h1>

      <div className='space-y-8'>
        <div className='space-y-2'>
          <h2 className='font-bold'>Who can edit the council?</h2>
          <p className='text-sm'>Council Members can add and remove council members and edit all Council settings.</p>
        </div>

        {admins.length > 0 && (
          <div>
            <AdminsList
              name='admins'
              admins={admins}
              form={form}
              canEdit={canEdit}
              onEdit={(admin: CouncilMember) => {
                setEditingAdmin(admin);
                setShowAddForm(true);
              }}
            />
          </div>
        )}

        {!showAddForm ? (
          <div className='flex items-center justify-between'>
            <Button
              variant='outline-blue'
              rounded='full'
              onClick={() => {
                setEditingAdmin(null);
                setShowAddForm(true);
              }}
              disabled={!canEdit}
              type='button'
            >
              <FiUserPlus className='mr-2 h-4 w-4' />
              Add Council Manager
            </Button>
          </div>
        ) : (
          <div className='-mx-16 border-b border-gray-200'>
            <AddAdminForm
              parentForm={form}
              editingAdmin={editingAdmin}
              onClose={() => {
                setShowAddForm(false);
                setEditingAdmin(null);
              }}
              canEdit={canEdit}
              className='bg-white px-16 py-6'
            />
          </div>
        )}
      </div>

      <div className='flex justify-end py-6'>
        <NextStepButton disabled={!form.formState.isValid || !canEdit}>
          {getNextStepButtonText(nextStep)}
        </NextStepButton>
      </div>
    </form>
  );
}
