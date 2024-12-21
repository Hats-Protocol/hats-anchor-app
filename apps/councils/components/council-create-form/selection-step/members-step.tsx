'use client';

import { Spinner } from '@chakra-ui/react';
import { useCouncilForm } from 'contexts';
import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AddMemberModal } from './add-member-modal';
import { MembersList } from './members-list';

export function SelectionMembersStep({ onNext }: { onNext: () => void }) {
  const { form, isLoading, stepValidation } = useCouncilForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const requirements = form.watch('requirements');
  const members = form.watch('members') || [];

  const nextStep = findNextInvalidStep(
    stepValidation,
    'selection',
    'members',
    requirements,
  );

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Spinner size='xl' color='blue.500' />
      </div>
    );
  }

  return (
    <form
      className='mx-auto flex w-[600px] flex-col space-y-8 p-8'
      onSubmit={form.handleSubmit(onNext)}
    >
      <h1 className='text-2xl font-bold'>Council Members</h1>

      <div className='space-y-8 bg-white'>
        <div>
          <h2 className='font-semibold'>
            Initial Council Members
            <span className='ml-2 text-sm text-gray-500'>Optional</span>
          </h2>
        </div>

        {members.length > 0 && (
          <div>
            <MembersList members={members} form={form} />
          </div>
        )}

        <div className='flex items-center justify-between'>
          <button
            type='button'
            onClick={() => setIsModalOpen(true)}
            className='inline-flex items-center rounded-full border border-blue-500 px-4 py-2 text-sm font-medium text-blue-500'
          >
            <FiUserPlus className='mr-2 h-4 w-4' />
            Add Council Member
          </button>
        </div>
      </div>

      <div className='flex justify-end py-6'>
        <NextStepButton disabled={!form.formState.isValid}>
          {getNextStepButtonText(nextStep)}
        </NextStepButton>
      </div>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
      />
    </form>
  );
}
