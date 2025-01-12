'use client';

import { Spinner } from '@chakra-ui/react';
import { useCouncilForm } from 'contexts';
import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { StepProps } from 'types';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AddAdminModal } from './add-admin-modal';
import { AdminsList } from './admins-list';

export function SelectionManagementStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const admins = form.watch('admins') || [];
  const requirements = form.watch('requirements');

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'management', requirements);

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Spinner size='xl' color='blue.500' />
      </div>
    );
  }

  return (
    <form className='mx-auto flex w-[600px] flex-col space-y-8 p-8' onSubmit={form.handleSubmit(onNext)}>
      <h1 className='text-2xl font-bold'>Council Management</h1>

      <div className='space-y-8 bg-white'>
        <div>
          <h2 className='font-bold'>Who can edit the council?</h2>
          <p className='text-gray-600'>Council Admins can add and remove council members and edit the Safe.</p>
        </div>

        {admins.length > 0 && (
          <div>
            <AdminsList name='admins' admins={admins} form={form} canEdit={canEdit} />
          </div>
        )}

        <div className='flex items-center justify-between'>
          <button
            type='button'
            onClick={() => setIsModalOpen(true)}
            disabled={!canEdit}
            className={`inline-flex items-center rounded-full border border-sky-500 px-4 py-2 text-sm font-medium text-sky-500 ${
              !canEdit ? 'cursor-not-allowed opacity-50' : 'hover:bg-sky-50'
            }`}
          >
            <FiUserPlus className='mr-2 h-4 w-4' />
            Add Admin
          </button>
        </div>
      </div>

      <div className='flex justify-end py-6'>
        <NextStepButton disabled={!form.formState.isValid || !canEdit}>
          {getNextStepButtonText(nextStep)}
        </NextStepButton>
      </div>

      <AddAdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} form={form} canEdit={canEdit} />
    </form>
  );
}
