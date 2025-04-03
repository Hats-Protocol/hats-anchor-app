'use client';

import { useCouncilForm, useOverlay } from 'contexts';
import { FiUserPlus } from 'react-icons/fi';
import { StepProps } from 'types';
import { Button, Skeleton } from 'ui';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AddAdminModal } from './add-admin-modal';
import { AdminsList } from './admins-list';

export function SelectionManagementStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();
  const { setModals } = useOverlay();
  const admins = form.watch('admins') || [];
  const requirements = form.watch('requirements');

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'management', requirements);

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
    <>
      <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(onNext)}>
        <h1 className='text-2xl font-bold'>Council Managers</h1>

        <div className='space-y-8'>
          <div className='space-y-2'>
            <h2 className='font-bold'>Who can edit the council?</h2>
            <p className='text-sm'>Council Members can add and remove council members and edit all Council settings.</p>
          </div>

          {admins.length > 0 && (
            <div>
              <AdminsList name='admins' admins={admins} form={form} canEdit={canEdit} />
            </div>
          )}

          <div className='flex items-center justify-between'>
            <Button
              variant='outline-blue'
              rounded='full'
              onClick={() => setModals?.({ addAdminModal: true })}
              disabled={!canEdit}
              type='button'
            >
              <FiUserPlus className='mr-2 h-4 w-4' />
              Add Council Manager
            </Button>
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton disabled={!form.formState.isValid || !canEdit}>
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>

      <AddAdminModal form={form} canEdit={canEdit} />
    </>
  );
}
