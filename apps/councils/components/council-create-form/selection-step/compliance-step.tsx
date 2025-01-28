'use client';

import { useCouncilForm, useOverlay } from 'contexts';
import { Form, RadioBox } from 'forms';
import { BsPersonCheck } from 'react-icons/bs';
import { FiUserPlus } from 'react-icons/fi';
import { StepProps } from 'types';
import { Button, MemberAvatar, Skeleton } from 'ui';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AddComplianceModal } from './add-compliance-modal';
import { ComplianceList } from './compliance-list';

// TODO migrate buttons to new Button component

export function SelectionComplianceStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit, toggleOptionalStep } = useCouncilForm();
  const { setModals } = useOverlay();
  // const [editingAdmin, setEditingAdmin] = useState<CouncilMember | null>(null);
  const complianceAdmins = form.watch('complianceAdmins') || [];
  const createComplianceAdminRole = form.watch('createComplianceAdminRole');
  const admins = form.watch('admins') || [];

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'compliance', form.watch('requirements'));

  if (isLoading) {
    return <Skeleton className='h-full w-full' />;
  }

  return (
    <>
      <Form {...form}>
        <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(onNext)}>
          <div className='flex items-center gap-4'>
            <BsPersonCheck className='h-6 w-6' />
            <h2 className='text-2xl font-bold'>Pass Compliance Check</h2>
          </div>

          <div className='space-y-8'>
            <div className='space-y-2'>
              <h2 className='font-bold'>Who does the compliance check?</h2>
              <RadioBox
                name='createComplianceAdminRole'
                localForm={form}
                options={[
                  { value: 'false', label: 'Council Managers' },
                  { value: 'true', label: "New 'Compliance Manager' Role" },
                ]}
                // onChange={(e) => {
                //   form.setValue('createComplianceAdminRole', (e.target as HTMLInputElement).value as 'true' | 'false');
                // }}
                isDisabled={!canEdit}
              />
            </div>

            {createComplianceAdminRole === 'false' && admins.length > 0 && (
              <div>
                <h3 className='mb-2 font-medium'>Council Managers can edit the Compliance Check</h3>
                <p className='text-sm'>
                  Council Managers can verify the compliance of Council Members before they join the council and remove
                  members who are no longer compliant.
                </p>
                <div className='mt-4 space-y-2'>
                  {admins.map((admin) => (
                    <MemberAvatar key={admin.id} member={admin} />
                  ))}
                </div>
              </div>
            )}

            {createComplianceAdminRole === 'true' && (
              <>
                <div>
                  <h3 className='mb-2 font-medium'>Compliance Managers</h3>
                  <p className='text-sm'>
                    Compliance Managers can verify the compliance of Council Members before they join the council and
                    remove members who are no longer compliant.
                  </p>
                </div>

                {complianceAdmins.length > 0 && (
                  <div>
                    <ComplianceList
                      complianceAdmins={complianceAdmins}
                      // editingAdmin={editingAdmin}
                      // setEditingAdmin={setEditingAdmin}
                      form={form}
                      canEdit={canEdit}
                    />
                  </div>
                )}

                <div className='flex items-center justify-between'>
                  <Button
                    variant='outline-blue'
                    rounded='full'
                    onClick={() => setModals?.({ addComplianceModal: true })}
                    disabled={!canEdit}
                    type='button'
                  >
                    <FiUserPlus className='mr-2 h-4 w-4' />
                    Add Compliance Manager
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className='flex justify-end py-6'>
            <NextStepButton
              disabled={
                !form.formState.isValid ||
                (createComplianceAdminRole === 'true' && complianceAdmins.length === 0) ||
                !canEdit
              }
              onClick={() => toggleOptionalStep('compliance')}
            >
              {getNextStepButtonText(nextStep)}
            </NextStepButton>
          </div>
        </form>
      </Form>

      <AddComplianceModal form={form} canEdit={canEdit} />
    </>
  );
}
