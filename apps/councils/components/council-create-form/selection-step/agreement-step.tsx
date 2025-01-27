'use client';

import { useCouncilForm, useOverlay } from 'contexts';
import { Form, MarkdownEditor, RadioBox } from 'forms';
import { FileText } from 'lucide-react';
import { FiUserPlus } from 'react-icons/fi';
import { StepProps } from 'types';
import { MemberAvatar, Skeleton } from 'ui';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AddAgreementAdminModal } from './add-agreement-admin-modal';
import { AgreementAdminsList } from './agreement-admins-list';

export function SelectionAgreementStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit, toggleOptionalStep } = useCouncilForm();
  const { setModals } = useOverlay();
  const requirements = form.watch('requirements');
  const agreementAdmins = form.watch('agreementAdmins') || [];
  const createAgreementAdminRole = form.watch('createAgreementAdminRole');
  const admins = form.watch('admins') || [];

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'agreement', requirements);

  if (isLoading) {
    return <Skeleton className='h-full w-full' />;
  }

  return (
    <>
      <Form {...form}>
        <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(onNext)}>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <FileText />
              <h2 className='text-2xl font-bold'>Sign Agreement</h2>
            </div>
            <p className='text-gray-600'>
              Add an agreement that Council Members sign and abide by to be on the council.
            </p>
          </div>

          <MarkdownEditor
            name='agreement'
            localForm={form}
            isDisabled={!canEdit}
            placeholder='Write or paste your agreement text below in a markdown format, use the preview buttons in the toolbar.'
          />

          <div className='space-y-8 bg-white'>
            <div className='space-y-2'>
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
                    <MemberAvatar key={admin.id} member={admin} />
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
                    onClick={() => setModals?.({ addAgreementAdminModal: true })}
                    disabled={!canEdit}
                    className={`border-functional-link-primary text-functional-link-primary inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium ${
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
                // !agreement ||
                // agreement.trim().length === 0 ||
                (createAgreementAdminRole === 'true' && agreementAdmins.length === 0)
              }
              onClick={() => toggleOptionalStep('agreement')}
            >
              {getNextStepButtonText(nextStep)}
            </NextStepButton>
          </div>
        </form>
      </Form>

      <AddAgreementAdminModal form={form} canEdit={canEdit} />
    </>
  );
}
