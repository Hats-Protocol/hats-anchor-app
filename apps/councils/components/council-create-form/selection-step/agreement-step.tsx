'use client';

import '@uiw/react-md-editor/markdown-editor.css';

import { Spinner } from '@chakra-ui/react';
import { useCouncilForm } from 'contexts';
import { RadioBox } from 'forms';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { formatAddress } from 'utils';
import { useEnsName } from 'wagmi';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';

// Dynamically import the editor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

// Custom styles to match the design
const editorStyles = {
  '--color-canvas-default': '#ffffff',
  '--color-border-default': '#E2E8F0',
  '--color-fg-default': '#1A202C',
  '--color-canvas-subtle': '#F7FAFC',
  '--color-neutral-muted': '#EDF2F7',
  '--md-toolbar-height': '40px',
  '--md-toolbar-color': '#4A5568',
  '--md-toolbar-background': '#F7FAFC',
  '--md-toolbar-border': '#E2E8F0',
} as React.CSSProperties;

// Add new component for agreement admins list
import { AddAgreementAdminModal } from './add-agreement-admin-modal';
import { AgreementAdminsList } from './agreement-admins-list';

interface CouncilMember {
  id: string;
  address: string;
  email: string;
  name?: string;
}

export function SelectionAgreementStep({ onNext }: { onNext: () => void }) {
  const { form, isLoading, stepValidation } = useCouncilForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const requirements = form.watch('requirements');
  const agreement = form.watch('agreement');
  const agreementAdmins = form.watch('agreementAdmins') || [];
  const createAgreementAdminRole = form.watch('createAgreementAdminRole');
  const admins = form.watch('admins') || [];

  const nextStep = findNextInvalidStep(
    stepValidation,
    'selection',
    'agreement',
    requirements,
  );

  function AdminDisplay({ admin }: { admin: CouncilMember }) {
    const { data: ensName } = useEnsName({
      address: admin.address as `0x${string}`,
      chainId: 1,
    });

    return (
      <div key={admin.id} className='text-sm text-gray-600'>
        {admin.name && (
          <span className='font-medium text-gray-900'>{admin.name} </span>
        )}
        <span className='text-gray-500'>
          {ensName || formatAddress(admin.address)}
        </span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Spinner size='xl' color='blue.500' />
      </div>
    );
  }

  return (
    <form
      className='mx-auto flex w-[600px] flex-col space-y-6 p-8'
      onSubmit={form.handleSubmit(onNext)}
    >
      <div className='flex items-center gap-2'>
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M8 12.5L10.5 15L16 9M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z'
            stroke='#2B6CB0'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
        <h1 className='text-2xl font-bold'>Sign Agreement</h1>
      </div>

      <div className='space-y-4'>
        <div>
          <h2 className='font-medium'>Agreement text</h2>
          <p className='text-sm text-gray-600'>
            Add an agreement that Council Members sign and abide by to be on the
            council.
          </p>
        </div>

        <div
          className='rounded-lg border border-gray-200 [&_.w-md-editor-input]:bg-white [&_.w-md-editor-toolbar]:rounded-t-lg [&_.w-md-editor-toolbar]:border-b [&_.w-md-editor-toolbar]:border-gray-200 [&_.w-md-editor-toolbar]:bg-gray-50 [&_.w-md-editor]:rounded-lg [&_.w-md-editor]:bg-white'
          style={editorStyles}
          data-color-mode='light'
        >
          <MDEditor
            value={agreement}
            onChange={(value) => form.setValue('agreement', value || '')}
            preview='edit'
            height={400}
            className='!border-0'
            textareaProps={{
              placeholder:
                'Write or paste your agreement text below in a markdown format, use the preview buttons in the toolbar.',
            }}
            hideToolbar={false}
            toolbarHeight={40}
          />
        </div>
      </div>

      <div className='space-y-8 bg-white'>
        <div>
          <h2 className='font-semibold'>Who manages the agreement?</h2>
        </div>

        <RadioBox
          name='createAgreementAdminRole'
          localForm={form}
          options={[
            {
              value: 'false',
              label: 'Council Managers',
            },
            {
              value: 'true',
              label: "New 'Agreement Manager' Role",
            },
          ]}
        />

        {createAgreementAdminRole === 'false' && admins.length > 0 && (
          <div>
            <h3 className='mb-2 font-medium'>
              Council Managers can edit the Agreement
            </h3>
            <p className='text-sm text-gray-600'>
              Council Managers can update the agreement text and verify that
              Council Members have signed it.
            </p>
            <div className='mt-4 space-y-2'>
              {admins.map((admin) => (
                <AdminDisplay key={admin.id} admin={admin} />
              ))}
            </div>
          </div>
        )}

        {createAgreementAdminRole === 'true' && (
          <>
            <div>
              <h3 className='mb-2 font-medium'>Agreement Managers</h3>
              <p className='text-sm text-gray-600'>
                Agreement Managers can update the agreement text and verify that
                Council Members have signed it.
              </p>
            </div>

            {agreementAdmins.length > 0 && (
              <div>
                <AgreementAdminsList
                  agreementAdmins={agreementAdmins}
                  form={form}
                />
              </div>
            )}

            <div className='flex items-center justify-between'>
              <button
                type='button'
                onClick={() => setIsModalOpen(true)}
                className='inline-flex items-center rounded-lg border border-blue-500 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50'
              >
                <FiUserPlus className='mr-2 h-4 w-4' />
                Add Agreement Manager
              </button>
            </div>
          </>
        )}
      </div>

      <div className='flex justify-end py-6'>
        <NextStepButton
          disabled={
            !agreement ||
            agreement.trim().length === 0 ||
            (createAgreementAdminRole === 'true' &&
              agreementAdmins.length === 0)
          }
        >
          {getNextStepButtonText(nextStep)}
        </NextStepButton>
      </div>

      <AddAgreementAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
      />
    </form>
  );
}
