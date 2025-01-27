'use client';

import { useCouncilForm, useOverlay } from 'contexts';
import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { CouncilMember, StepProps } from 'types';
import { Skeleton } from 'ui';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AddMemberModal } from './add-member-modal';
import { MembersList } from './members-list';

export function SelectionMembersStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit, toggleOptionalStep } = useCouncilForm();
  const { setModals } = useOverlay();
  const [editingMember, setEditingMember] = useState<CouncilMember | null>(null);
  const requirements = form.watch('requirements');
  const members = form.watch('members') || [];

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'members', requirements);

  if (isLoading) {
    return <Skeleton className='h-100 w-100' />;
  }

  return (
    <>
      <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(onNext)}>
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
              <MembersList
                members={members}
                form={form}
                canEdit={canEdit}
                editingMember={editingMember}
                setEditingMember={setEditingMember}
              />
            </div>
          )}

          <div className='flex items-center justify-between'>
            <button
              type='button'
              onClick={() => setModals?.({ addMemberModal: true })}
              disabled={!canEdit}
              className={`border-functional-link-primary text-functional-link-primary inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium ${
                !canEdit ? 'cursor-not-allowed opacity-50' : 'hover:bg-functional-link-primary/10'
              }`}
            >
              <FiUserPlus className='mr-2 h-4 w-4' />
              Add Council Member
            </button>
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton disabled={!form.formState.isValid || !canEdit} onClick={() => toggleOptionalStep('members')}>
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>

      <AddMemberModal form={form} editingMember={editingMember} setEditingMember={setEditingMember} canEdit={canEdit} />
    </>
  );
}
