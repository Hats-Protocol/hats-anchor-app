'use client';

import { useCouncilForm, useOverlay } from 'contexts';
import { Form, MarkdownEditor, RadioBox, RadioCard } from 'forms';
import { useOrganization } from 'hooks';
import { FilePlus, FileText } from 'lucide-react';
import { useEffect } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { IconType } from 'react-icons/lib';
import { StepProps } from 'types';
import { Button, MemberAvatar, Skeleton } from 'ui';
import { logger } from 'utils';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AddAgreementAdminModal } from './add-agreement-admin-modal';
import { AgreementAdminsList } from './agreement-admins-list';

interface GroupedAgreement {
  councilName: string;
  agreement: string;
  agreementAdmins: AgreementAdmin[];
}

interface AgreementAdmin {
  id: string;
  name?: string;
  address: string;
}

export function SelectionAgreementStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();
  const { setModals } = useOverlay();
  const requirements = form.watch('requirements');
  const agreementAdmins = form.watch('agreementAdmins') || [];
  const createAgreementAdminRole = form.watch('createAgreementAdminRole');
  const admins = form.watch('admins') || [];
  const agreement = form.watch('agreement');

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'agreement', requirements);

  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization } = useOrganization(orgName);

  logger.info('organization', organization);
  // Group agreements from existing councils
  const existingAgreements =
    organization?.councils?.reduce<GroupedAgreement[]>((acc, council) => {
      if (council.creationForm?.agreement && council.creationForm?.councilName) {
        return [
          ...acc,
          {
            councilName: council.creationForm.councilName,
            agreement: council.creationForm.agreement,
            agreementAdmins: council.creationForm.agreementAdmins || [],
          },
        ];
      }
      return acc;
    }, []) || [];

  // Create radio options from existing agreements and add the "Create new" option
  const agreementOptions = [
    ...existingAgreements.map((existingAgreement) => ({
      value: existingAgreement.agreement,
      label: 'Agreement',
      icon: FileText as IconType,
      description: existingAgreement.councilName,
    })),
    {
      value: '',
      label: 'Create a new Agreement for this Council',
      icon: FilePlus as IconType,
      description: 'Write an agreement and select who controls it',
    },
  ];

  // When agreement text matches an existing option, select that radio option
  useEffect(() => {
    const selectedOption = form.watch('agreement');
    const matchingOption = agreementOptions.find((option) => option.value && option.value === agreement);

    // Only update if we find a match and it's different from current selection
    if (matchingOption && selectedOption !== matchingOption.value) {
      form.setValue('agreement', matchingOption.value, { shouldDirty: false });
    }
  }, [agreement]);

  if (isLoading) {
    return <Skeleton className='h-full w-full' />;
  }

  return (
    <>
      <Form {...form}>
        <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(onNext)}>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <FileText />
              <h2 className='text-2xl font-bold'>Sign Agreement</h2>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <h3 className='font-bold'>Which agreement should Council Members sign?</h3>
              </div>
            </div>

            <RadioCard name='agreement' localForm={form} options={agreementOptions} isDisabled={!canEdit} />
          </div>

          <div className='space-y-4'>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <h3 className='font-bold'>Agreement Text</h3>
                <span className='text-xs text-black/60'>Optional</span>
              </div>
              <p className='text-sm text-gray-600'>
                Add an agreement that Council Members sign and abide by to be on the council.
              </p>
            </div>

            <MarkdownEditor
              name='agreement'
              localForm={form}
              isDisabled={!canEdit || agreement !== ''}
              placeholder='Write or paste your agreement text below in a markdown format, use the preview buttons in the toolbar.'
              existingAgreements={existingAgreements.map(({ agreement, councilName }) => ({
                agreement,
                councilName,
              }))}
            />
          </div>

          <div className='space-y-8'>
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
                  <Button
                    variant='outline-blue'
                    rounded='full'
                    type='button'
                    onClick={() => setModals?.({ addAgreementAdminModal: true })}
                    disabled={!canEdit}
                  >
                    <FiUserPlus className='mr-2 h-4 w-4' />
                    Add Agreement Manager
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className='flex justify-end py-6'>
            <NextStepButton
              disabled={!canEdit || (createAgreementAdminRole === 'true' && agreementAdmins.length === 0)}
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
