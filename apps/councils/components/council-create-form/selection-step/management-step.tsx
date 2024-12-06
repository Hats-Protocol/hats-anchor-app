'use client';

import { ChevronRightIcon } from '@chakra-ui/icons';
import { Spinner } from '@chakra-ui/react';
import { useCouncilForm } from 'contexts';
import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';

import { AddAdminModal } from './add-admin-modal';
import { AdminsList } from './admins-list';

export function SelectionManagementStep({ onNext }: { onNext: () => void }) {
  const { form, isLoading } = useCouncilForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const admins = form.watch('admins') || [];

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
      <h1 className='text-2xl font-bold'>Council Management</h1>

      <div className='space-y-8 bg-white'>
        <div>
          <h2 className='font-semibold'>Who can edit the council?</h2>
          <p className='text-sm text-gray-600'>
            Council Admins can add and remove council members and edit the Safe.
          </p>
        </div>

        {admins.length > 0 && (
          <div>
            <AdminsList admins={admins} form={form} />
          </div>
        )}

        <div className='flex items-center justify-between'>
          <button
            type='button'
            onClick={() => setIsModalOpen(true)}
            className='inline-flex items-center rounded-lg border border-blue-500 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50'
          >
            <FiUserPlus className='mr-2 h-4 w-4' />
            Add Admin
          </button>
        </div>
      </div>

      <div className='flex justify-end'>
        <button
          type='submit'
          className='inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-100 disabled:opacity-50'
          disabled={!form.formState.isValid}
        >
          Configure Agreement
          <ChevronRightIcon className='ml-1 h-4 w-4' />
        </button>
      </div>

      <AddAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
      />
    </form>
  );
}
