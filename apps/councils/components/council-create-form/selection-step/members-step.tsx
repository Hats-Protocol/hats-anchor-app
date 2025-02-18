'use client';

import { useCouncilForm, useOverlay } from 'contexts';
import { useCouncilDeployFlag } from 'hooks';
import { FiUserPlus } from 'react-icons/fi';
import { StepProps } from 'types';
import { Button, Skeleton } from 'ui';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AddMemberModal } from './add-member-modal';
import { MembersList } from './members-list';

export function SelectionMembersStep({ onNext, draftId }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();
  const { setModals } = useOverlay();
  const requirements = form.watch('requirements');
  const members = form.watch('members') || [];

  useCouncilDeployFlag(draftId);

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'members', requirements);

  if (isLoading) {
    return <Skeleton className='h-100 w-100' />;
  }

  return (
    <>
      <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(onNext)}>
        <h1 className='text-2xl font-bold'>Council Members</h1>

        <div className='space-y-8'>
          <div>
            <h2 className='font-semibold'>
              Initial Council Members
              <span className='ml-2 text-sm text-gray-500'>Optional</span>
            </h2>
          </div>

          {members.length > 0 && (
            <div>
              <MembersList members={members} form={form} canEdit={canEdit} />
            </div>
          )}

          <div className='flex items-center justify-between'>
            <Button
              variant='outline-blue'
              rounded='full'
              onClick={() => setModals?.({ addMemberModal: true })}
              disabled={!canEdit}
              type='button'
            >
              <FiUserPlus className='mr-2 h-4 w-4' />
              Add Council Member
            </Button>
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton disabled={!form.formState.isValid || !canEdit}>
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>

      <AddMemberModal form={form} canEdit={canEdit} />
    </>
  );
}
