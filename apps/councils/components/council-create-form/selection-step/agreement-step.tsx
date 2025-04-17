'use client';

import { useCouncilForm } from 'contexts';
import { Form, MarkdownEditor, RadioCard } from 'forms';
import { useOrganization } from 'hooks';
import { FilePlus, FileText } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { IconType } from 'react-icons/lib';
import { CouncilFormData, CouncilMember, StepProps } from 'types';
import { Button, Skeleton } from 'ui';
import { logger } from 'utils';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { AgreementAdminsList } from './agreement-admins-list';
import { UnifiedUserForm } from './unified-user-form';

interface GroupedAgreement {
  councilName: string;
  agreement: string;
  agreementAdmins: CouncilMember[];
}

export function SelectionAgreementStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();
  const [editingAdmin, setEditingAdmin] = useState<CouncilMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const prevRole = useRef(form.getValues('createAgreementAdminRole'));

  const requirements = form.watch('requirements');
  const agreementAdmins = form.watch('agreementAdmins') || [];
  logger.info('agreementAdmins', agreementAdmins);
  const createAgreementAdminRole = form.watch('createAgreementAdminRole');
  logger.info('createAgreementAdminRole', createAgreementAdminRole);
  // const admins = form.watch('admins') || []; // Don't think we need this anymore, but leaving here until the permissions are tested in QA
  const agreement = form.watch('agreement');
  logger.info('agreement', agreement);

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'agreement', requirements);

  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization, isFetching: isFetchingOrganization } = useOrganization(orgName);

  // Group agreements from existing councils
  const existingAgreements = useMemo(
    () =>
      organization?.councils?.reduce<GroupedAgreement[]>((acc, council) => {
        // TODO we can't (currently) rely on this agreement data to be updated for deployed councils
        // do we need to get other deployed instances outside of our known module deploys?
        if (council.creationForm?.agreement && council.creationForm?.councilName) {
          return [
            ...acc,
            {
              councilName: council.creationForm.councilName,
              agreement: council.creationForm.agreement,
              agreementAdmins: (council.creationForm.agreementAdmins || []).map((admin) => ({
                ...admin,
                email: '', // Adding required email field
              })),
            },
          ];
        }
        return acc;
      }, []) || [],
    [organization?.councils],
  );

  // Extract unique organization managers from existing councils
  const organizationManagers = useMemo(
    () =>
      organization?.councils?.reduce<CouncilMember[]>((acc, council) => {
        if (council.creationForm?.admins) {
          council.creationForm.admins.forEach((admin) => {
            if (!acc.some((existing) => existing.address.toLowerCase() === admin.address.toLowerCase())) {
              acc.push({
                ...admin,
                email: '', // Adding required email field
              });
            }
          });
        }
        return acc;
      }, []) || [],
    [organization?.councils],
  );

  logger.info('organizationManagers', organizationManagers);

  // Group unique admin sets across councils
  const agreementAdminGroups = useMemo(
    () =>
      organization?.councils?.reduce<{
        [key: string]: { admins: CouncilMember[]; councils: string[] };
      }>((acc, council) => {
        if (!council.creationForm?.agreementAdmins) return acc;

        // Create a sorted string of admin addresses as a key
        const adminKey = council.creationForm.agreementAdmins
          .map((admin) => admin.address.toLowerCase())
          .sort()
          .join(',');

        if (!acc[adminKey]) {
          acc[adminKey] = {
            admins: council.creationForm.agreementAdmins.map((admin) => ({
              ...admin,
              email: '', // Adding required email field
            })) as CouncilMember[],
            councils: [council.creationForm.councilName],
          };
        } else {
          acc[adminKey].councils.push(council.creationForm.councilName);
        }
        return acc;
      }, {}) || {},
    [organization?.councils],
  );

  logger.info('agreementAdminGroups', agreementAdminGroups);

  // Create a sorted string of organization manager addresses to compare against
  const orgManagerKey = organizationManagers
    .map((admin) => admin.address.toLowerCase())
    .sort()
    .join(',');

  // Filter out any admin groups that exactly match organization managers
  const filteredAgreementAdminGroups = Object.entries(agreementAdminGroups).reduce<typeof agreementAdminGroups>(
    (acc, [key, group]) => {
      if (key !== orgManagerKey) {
        acc[key] = group;
      }
      return acc;
    },
    {},
  );

  useEffect(() => {
    if (prevRole.current !== createAgreementAdminRole) {
      if (createAgreementAdminRole === 'false') {
        form.setValue('agreementAdmins', organizationManagers);
      } else if (createAgreementAdminRole?.startsWith('existing:')) {
        const adminKey = createAgreementAdminRole.split(':')[1];
        const group = agreementAdminGroups[adminKey];
        if (group) {
          form.setValue('agreementAdmins', group.admins);
        }
      } else if (createAgreementAdminRole === 'true') {
        // Only clear the array if there are no existing admins
        const currentAdmins = form.getValues('agreementAdmins') || [];
        if (currentAdmins.length === 0) {
          form.setValue('agreementAdmins', []);
        }
      }
      prevRole.current = createAgreementAdminRole;
    }
  }, [createAgreementAdminRole, form, organizationManagers, agreementAdminGroups]);

  const [selectedOption, setSelectedOption] = useState(() => {
    const currentAgreement = form.getValues('agreement');
    // Check if the current agreement matches any existing ones
    return existingAgreements?.some((existing) => existing.agreement === currentAgreement) ? 'existing' : 'new';
  });

  // Create radio options from existing agreements and add the "Create new" option
  const agreementOptions = useMemo(
    () => [
      ...(existingAgreements || []).map((existingAgreement: GroupedAgreement) => ({
        value: existingAgreement.agreement,
        label: 'Agreement',
        icon: FileText as IconType,
        description: existingAgreement.councilName,
        onSelect: () => {
          setSelectedOption('existing');
          form.setValue('agreement', existingAgreement.agreement);
        },
      })),
      {
        value: 'new',
        label: 'Create a new Agreement for this Council',
        icon: FilePlus as IconType,
        description: 'Write an agreement and select who controls it',
        onSelect: () => {
          setSelectedOption('new');
          // Only reset if switching from an existing agreement
          if (selectedOption === 'existing') {
            form.setValue('agreement', '');
          }
        },
      },
    ],
    [existingAgreements, selectedOption, form],
  );

  // Determine which radio option should be selected based on agreement value
  const selectedAgreementOption = selectedOption;
  console.log('selectedAgreementOption', selectedAgreementOption, selectedOption);

  // Create radio options for agreement managers
  const agreementManagerOptions = [
    {
      value: 'false',
      label: 'Organization Managers',
      description: 'Manage Roles on all Councils',
      avatars: organizationManagers,
      onSelect: () => form.setValue('agreementAdmins', organizationManagers),
    },
    ...Object.entries(filteredAgreementAdminGroups)
      .filter(([_, group]) => group.admins.length > 0)
      .map(([key, group]) => ({
        value: `existing:${key}`,
        label: 'Agreement Managers',
        description: `Manages ${group.councils.length} Agreement${group.councils.length > 1 ? 's' : ''} on ${group.councils.join(', ')}`,
        avatars: group.admins,
        onSelect: () => form.setValue('agreementAdmins', group.admins),
      })),
    {
      value: 'true',
      label: 'Create new Agreement Managers',
      description: 'Create a new group of agreement managers',
      onSelect: () => form.setValue('agreementAdmins', []),
    },
  ];

  // useEffect(() => {
  //   console.log('agreementOptions', agreementOptions);
  //   if (isFetchingOrganization || !selectedOption) return;
  //   const existingAgreement = existingAgreements.find((localAgreement) => localAgreement.agreement === agreement);
  //   form.reset({
  //     agreement: existingAgreement?.agreement || '',
  //     agreementAdmins: existingAgreement?.agreementAdmins || [],
  //   });
  // }, [existingAgreements, form, isFetchingOrganization, agreement, agreementOptions, selectedOption]);

  // Show loading state during mutation or while fetching updated data
  const isLoadingList = isMutating || (isFetchingOrganization && !isLoading);

  const handleSubmit = useCallback(
    async (data: CouncilFormData) => {
      // set the current form values to prevent state flashing during transition
      // data contains the latest form values at submission time (as we advance the form)
      form.reset(data);
      await onNext();
    },
    [form, onNext],
  );

  if (isLoading) {
    return <Skeleton className='h-full w-full' />;
  }

  return (
    <>
      <Form {...form}>
        <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(handleSubmit)}>
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

            <RadioCard
              name='agreementType'
              localForm={form}
              options={agreementOptions}
              isDisabled={!canEdit}
              defaultValue={selectedOption}
            />
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
              isDisabled={selectedOption === 'existing'}
              placeholder='Write or paste your agreement text below in a markdown format, use the preview buttons in the toolbar.'
              existingAgreements={(existingAgreements || []).map(({ agreement, councilName }: GroupedAgreement) => ({
                agreement,
                councilName,
              }))}
            />
          </div>

          <div className='space-y-8'>
            <div className='space-y-2'>
              <h2 className='font-bold'>Who manages the agreement?</h2>
              <RadioCard
                name='createAgreementAdminRole'
                localForm={form}
                options={agreementManagerOptions}
                isDisabled={!canEdit}
              />
            </div>

            {createAgreementAdminRole === 'true' && (
              <>
                <div>
                  <h3 className='mb-2 font-bold'>Agreement Managers</h3>
                  <p className='text-sm text-gray-600'>
                    Agreement Managers can update the agreement text and verify that Council Members have signed it.
                  </p>
                  <div className='mt-4 space-y-4'>
                    <AgreementAdminsList
                      agreementAdmins={agreementAdmins}
                      form={form}
                      canEdit={createAgreementAdminRole === 'true' && canEdit}
                      canDelete={createAgreementAdminRole === 'true' ? canEdit : false}
                      showButtons={true}
                      onEdit={(admin) => {
                        setEditingAdmin(admin);
                        setShowAddForm(true);
                      }}
                      loading={isLoadingList}
                    />

                    {!showAddForm && (
                      <Button
                        variant='outline-blue'
                        rounded='full'
                        onClick={() => {
                          setEditingAdmin(null);
                          setShowAddForm(true);
                        }}
                        disabled={!canEdit}
                        type='button'
                      >
                        <FiUserPlus className='mr-2 h-4 w-4' />
                        Add Agreement Manager
                      </Button>
                    )}
                  </div>
                </div>

                {showAddForm && (
                  <div className='-mx-16 border-b border-gray-200'>
                    <UnifiedUserForm
                      parentForm={form}
                      editingUser={editingAdmin}
                      userType='agreementAdmin'
                      onClose={() => {
                        setShowAddForm(false);
                        setEditingAdmin(null);
                      }}
                      canEdit={canEdit}
                      className='bg-white px-16 py-6'
                      hideAddressButtons={true}
                      onMutationStateChange={setIsMutating}
                    />
                  </div>
                )}
              </>
            )}

            {createAgreementAdminRole === 'false' && organizationManagers.length > 0 && (
              <>
                <div>
                  <h3 className='mb-2 font-bold'>Agreement Managers</h3>
                  <p className='text-sm text-gray-600'>
                    Organization Managers can update the agreement text and verify that Council Members have signed it.
                  </p>
                  <div className='mt-4'>
                    <AgreementAdminsList
                      agreementAdmins={organizationManagers}
                      form={form}
                      canEdit={false}
                      canDelete={false}
                      showButtons={true}
                    />
                  </div>
                </div>
              </>
            )}

            {/* TODO look at this option state */}
            {createAgreementAdminRole.startsWith('existing:') && (
              <>
                <div>
                  <h3 className='mb-2 font-bold'>Agreement Managers</h3>
                  <p className='text-sm text-gray-600'>
                    These Agreement Managers can update the agreement text and verify that Council Members have signed
                    it.
                  </p>
                  <div className='mt-4'>
                    <AgreementAdminsList
                      agreementAdmins={(() => {
                        const adminKey = createAgreementAdminRole.split(':')[1];
                        const group = agreementAdminGroups[adminKey];
                        return group?.admins || [];
                      })()}
                      form={form}
                      canEdit={false}
                      canDelete={false}
                      showButtons={true}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className='flex justify-end py-6'>
            <NextStepButton
              disabled={
                !canEdit ||
                (createAgreementAdminRole === 'true' && agreementAdmins.length === 0) ||
                isLoadingList ||
                isMutating
              }
            >
              {getNextStepButtonText(nextStep)}
            </NextStepButton>
          </div>
        </form>
      </Form>
    </>
  );
}
