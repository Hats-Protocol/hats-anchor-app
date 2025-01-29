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
  const { form, isLoading, stepValidation, canEdit, toggleOptionalStep } = useCouncilForm();
  const { setModals } = useOverlay();
  const admins = form.watch('admins') || [];
  const requirements = form.watch('requirements');

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'management', requirements);

  if (isLoading) {
    return <Skeleton className='h-full w-full' />;
  }

  return (
    <>
      <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(onNext)}>
        <h1 className='text-2xl font-bold'>Council Managers</h1>

        <div className='space-y-8'>
          <div className='space-y-2'>
            <h2 className='font-bold'>Who can edit the council?</h2>
            <p className='text-sm'>Council Admins can add and remove council members and edit the Safe.</p>
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
              Add Admin
            </Button>
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton
            disabled={!form.formState.isValid || !canEdit}
            onClick={() => toggleOptionalStep('management')}
          >
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>

      <AddAdminModal form={form} canEdit={canEdit} />
    </>
  );
}
