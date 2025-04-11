'use client';

import { useCouncilForm } from 'contexts';
import { useCouncilDeployFlag, useOrganization } from 'hooks';
import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { CouncilMember, StepProps } from 'types';
import { Button, Skeleton } from 'ui';
import { isAddress } from 'viem';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { MembersList } from './members-list';
import { UnifiedUserForm } from './unified-user-form';

export function SelectionMembersStep({ onNext, draftId }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<CouncilMember | null>(null);
  const requirements = form.watch('requirements');
  const members = form.watch('members') || [];
  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization } = useOrganization(orgName);

  useCouncilDeployFlag(draftId);

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'members', requirements);

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
      <h1 className='text-2xl font-bold'>Council Members</h1>

      <div className='space-y-8'>
        <div className='space-y-2'>
          <h2 className='font-bold'>Initial Council Members</h2>
          <p className='text-sm'>Add the initial members of your council. You can add or remove members later.</p>
        </div>

        {members.length > 0 && (
          <div className='space-y-6'>
            {members.map((member) => (
              <div key={member.address}>
                <MembersList
                  members={[member]}
                  form={form}
                  canEdit={canEdit}
                  onEdit={(member) => {
                    setEditingMember(member);
                    setShowAddForm(false);
                  }}
                />
                {editingMember?.address === member.address && (
                  <div className='-mx-16 mt-4 border-b border-gray-200'>
                    <UnifiedUserForm
                      parentForm={form}
                      editingUser={editingMember}
                      userType='member'
                      onClose={() => {
                        setShowAddForm(false);
                        setEditingMember(null);
                      }}
                      canEdit={canEdit}
                      className='bg-white px-16 py-6'
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!showAddForm && !editingMember && (
          <div className='flex items-center justify-between'>
            <Button
              variant='outline-blue'
              rounded='full'
              onClick={() => {
                setEditingMember(null);
                setShowAddForm(true);
              }}
              disabled={!canEdit}
              type='button'
            >
              <FiUserPlus className='mr-2 h-4 w-4' />
              Add Council Member
            </Button>
          </div>
        )}

        {showAddForm && !editingMember && (
          <div className='-mx-16 border-b border-gray-200'>
            <UnifiedUserForm
              parentForm={form}
              editingUser={null}
              userType='member'
              onClose={() => {
                setShowAddForm(false);
                setEditingMember(null);
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
