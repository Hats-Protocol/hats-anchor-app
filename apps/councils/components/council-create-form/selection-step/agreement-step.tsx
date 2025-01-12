'use client';

import '@uiw/react-md-editor/markdown-editor.css';

import { Spinner } from '@chakra-ui/react';
import { useCouncilForm } from 'contexts';
import { MarkdownEditor, RadioBox } from 'forms';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { CouncilMember, StepProps } from 'types';
import { formatAddress } from 'utils';
import { useEnsName } from 'wagmi';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AddAgreementAdminModal } from './add-agreement-admin-modal';
import { AgreementAdminsList } from './agreement-admins-list';

function AdminDisplay({ admin }: { admin: CouncilMember }) {
  const { data: ensName } = useEnsName({
    address: admin.address as `0x${string}`,
    chainId: 1,
  });

  return (
    <div key={admin.id} className='text-sm text-gray-600'>
      {admin.name && <span className='font-medium text-gray-900'>{admin.name} </span>}
      <span className='text-gray-500'>{ensName || formatAddress(admin.address)}</span>
    </div>
  );
}

export function SelectionAgreementStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const requirements = form.watch('requirements');
  const agreement = form.watch('agreement');
  const agreementAdmins = form.watch('agreementAdmins') || [];
  const createAgreementAdminRole = form.watch('createAgreementAdminRole');
  const admins = form.watch('admins') || [];

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'agreement', requirements);

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Spinner size='xl' color='blue.500' />
      </div>
    );
  }

  return (
    <form className='mx-auto flex w-[600px] flex-col space-y-6 p-8' onSubmit={form.handleSubmit(onNext)}>
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <FileText />
          <h2 className='text-2xl font-bold'>Sign Agreement</h2>
        </div>
        <p className='text-gray-600'>Add an agreement that Council Members sign and abide by to be on the council.</p>
      </div>

      <MarkdownEditor
        name='agreement'
        localForm={form}
        isDisabled={!canEdit}
        placeholder='Write or paste your agreement text below in a markdown format, use the preview buttons in the toolbar.'
      />

      <div className='space-y-8 bg-white'>
        <div>
          <h2 className='font-bold'>Who manages the agreement?</h2>
          <RadioBox
            name='createAgreementAdminRole'
            localForm={form}
            isDisabled={!canEdit}
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
        </div>

        {createAgreementAdminRole === 'false' && admins.length > 0 && (
          <div>
            <h3 className='mb-2 font-bold'>Council Managers can edit the Agreement</h3>
            <p className='text-sm text-gray-600'>
              Council Managers can update the agreement text and verify that Council Members have signed it.
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
              <h3 className='mb-2 font-bold'>Agreement Managers</h3>
              <p className='text-sm text-gray-600'>
                Agreement Managers can update the agreement text and verify that Council Members have signed it.
              </p>
            </div>

            {agreementAdmins.length > 0 && (
              <div>
                <AgreementAdminsList agreementAdmins={agreementAdmins} form={form} canEdit={canEdit} />
              </div>
            )}

            <div className='flex items-center justify-between'>
              <button
                type='button'
                onClick={() => setIsModalOpen(true)}
                disabled={!canEdit}
                className={`inline-flex items-center rounded-full border border-blue-500 px-4 py-2 text-sm font-medium text-blue-500 ${
                  !canEdit ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-50'
                }`}
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
            !canEdit ||
            !agreement ||
            agreement.trim().length === 0 ||
            (createAgreementAdminRole === 'true' && agreementAdmins.length === 0)
          }
        >
          {getNextStepButtonText(nextStep)}
        </NextStepButton>
      </div>

      <AddAgreementAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        canEdit={canEdit}
      />
    </form>
  );
}
