'use client';

import { Spinner } from '@chakra-ui/react';
import { useCouncilForm } from 'contexts';
import { RadioBox } from 'forms';
import { useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { formatAddress } from 'utils';
import { useEnsName } from 'wagmi';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AddComplianceModal } from './add-compliance-modal';
import { ComplianceList } from './compliance-list';

interface CouncilMember {
  id: string;
  address: string;
  email: string;
  name?: string;
}

export function SelectionComplianceStep({ onNext }: { onNext: () => void }) {
  const { form, isLoading, stepValidation } = useCouncilForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const complianceAdmins = form.watch('complianceAdmins') || [];
  const createComplianceAdminRole = form.watch('createComplianceAdminRole');
  const admins = form.watch('admins') || [];

  const nextStep = findNextInvalidStep(
    stepValidation,
    'selection',
    'compliance',
    form.watch('requirements'),
  );

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Spinner size='xl' color='blue.500' />
      </div>
    );
  }

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

  return (
    <form
      className='mx-auto flex w-[600px] flex-col space-y-8 p-8'
      onSubmit={form.handleSubmit(onNext)}
    >
      <h1 className='text-2xl font-bold'>Pass Compliance Check</h1>

      <div className='space-y-8 bg-white'>
        <div>
          <h2 className='font-semibold'>Who does the compliance check?</h2>
        </div>

        <RadioBox
          name='createComplianceAdminRole'
          localForm={form}
          options={[
            {
              value: 'false',
              label: 'Council Managers',
            },
            {
              value: 'true',
              label: "New 'Compliance Manager' Role",
            },
          ]}
          onChange={(e) => {
            form.setValue(
              'createComplianceAdminRole',
              (e.target as HTMLInputElement).value as 'true' | 'false',
            );
          }}
        />

        {createComplianceAdminRole === 'false' && admins.length > 0 && (
          <div>
            <h3 className='mb-2 font-medium'>
              Council Managers can edit the Compliance Check
            </h3>
            <p className='text-sm text-gray-600'>
              Council Managers can verify the compliance of Council Members
              before they join the council and remove members who are no longer
              compliant.
            </p>
            <div className='mt-4 space-y-2'>
              {admins.map((admin) => (
                <AdminDisplay key={admin.id} admin={admin} />
              ))}
            </div>
          </div>
        )}

        {createComplianceAdminRole === 'true' && (
          <>
            <div>
              <h3 className='mb-2 font-medium'>Compliance Managers</h3>
              <p className='text-sm text-gray-600'>
                Compliance Managers can verify the compliance of Council Members
                before they join the council and remove members who are no
                longer compliant.
              </p>
            </div>

            {complianceAdmins.length > 0 && (
              <div>
                <ComplianceList
                  complianceAdmins={complianceAdmins}
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
                Add Compliance Manager
              </button>
            </div>
          </>
        )}
      </div>

      <div className='flex justify-end py-6'>
        <NextStepButton
          disabled={
            !form.formState.isValid ||
            (createComplianceAdminRole === 'true' &&
              complianceAdmins.length === 0)
          }
        >
          {getNextStepButtonText(nextStep)}
        </NextStepButton>
      </div>

      <AddComplianceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
      />
    </form>
  );
}
