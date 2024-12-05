'use client';

import { ChevronRightIcon } from '@chakra-ui/icons';
import { Button, Spinner } from '@chakra-ui/react';
import { useCouncilForm } from 'contexts';
import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';

import { AddMemberModal } from './add-member-modal';
import { MembersList } from './members-list';

export function SelectionMembersStep({ onNext }: { onNext: () => void }) {
  const { form, isLoading } = useCouncilForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const members = form.watch('members') || [];

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
            className='inline-flex items-center rounded-lg border border-blue-500 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50'
          >
            <FiUserPlus className='mr-2 h-4 w-4' />
            Add Council Member
          </button>
        </div>
      </div>

      <div className='flex justify-end'>
        <button
          type='submit'
          className='inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-100 disabled:opacity-50'
          disabled={!form.formState.isValid}
        >
          {members.length === 0
            ? 'Invite Council Members later'
            : 'Choose Council Management'}
          <ChevronRightIcon className='ml-1 h-4 w-4' />
        </button>
      </div>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
      />
    </form>
  );
}
