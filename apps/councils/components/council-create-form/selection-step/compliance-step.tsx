'use client';

import { useCouncilForm } from 'contexts';
import { Form, RadioCard } from 'forms';
import { useOrganization } from 'hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BsPersonCheck } from 'react-icons/bs';
import { FiUserPlus } from 'react-icons/fi';
import { CouncilFormData, CouncilMember, StepProps } from 'types';
import { Button, Skeleton } from 'ui';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { ComplianceList } from './compliance-list';
import { UnifiedUserForm } from './unified-user-form';

export function SelectionComplianceStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();

  const [editingAdmin, setEditingAdmin] = useState<CouncilMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const prevRole = useRef(form.getValues('createComplianceAdminRole'));

  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization, isFetching } = useOrganization(orgName);
  const createComplianceAdminRole = form.watch('createComplianceAdminRole');
  const complianceAdmins = form.watch('complianceAdmins') || [];

  // Extract unique organization managers from existing councils
  const organizationManagers =
    organization?.councils?.reduce<CouncilMember[]>((acc, council) => {
      if (council.creationForm?.admins) {
        council.creationForm.admins.forEach((admin) => {
          if (!acc.some((existing) => existing.address.toLowerCase() === admin.address.toLowerCase())) {
            acc.push(admin);
          }
        });
      }
      return acc;
    }, []) || [];

  // Group unique compliance admin sets across councils
  const complianceAdminGroups =
    organization?.councils?.reduce<{
      [key: string]: { admins: CouncilMember[]; councils: string[] };
    }>((acc, council) => {
      if (!council.creationForm?.complianceAdmins) return acc;

      // Create a sorted string of admin addresses as a key
      const complianceAdminKey = council.creationForm.complianceAdmins
        .map((admin) => admin.address.toLowerCase())
        .sort()
        .join(',');

      if (!acc[complianceAdminKey]) {
        acc[complianceAdminKey] = {
          admins: council.creationForm.complianceAdmins.map((admin) => ({
            ...admin,
            email: '', // Adding required email field
          })) as CouncilMember[],
          councils: [council.creationForm.councilName],
        };
      } else {
        acc[complianceAdminKey].councils.push(council.creationForm.councilName);
      }
      return acc;
    }, {}) || {};

  // Create a sorted string of organization manager addresses to compare against
  const orgManagerKey = organizationManagers
    .map((admin) => admin.address.toLowerCase())
    .sort()
    .join(',');

  // Filter out any admin groups that exactly match organization managers
  const filteredComplianceAdminGroups = Object.entries(complianceAdminGroups).reduce<typeof complianceAdminGroups>(
    (acc, [key, group]) => {
      if (key !== orgManagerKey) {
        acc[key] = group;
      }
      return acc;
    },
    {},
  );

  // Create options for compliance managers
  const complianceManagerOptions = [
    {
      value: 'false',
      label: 'Organization Managers',
      description: 'Manage Roles on all Councils',
      avatars: organizationManagers,
      onSelect: () => form.setValue('complianceAdmins', organizationManagers),
    },
    ...Object.entries(filteredComplianceAdminGroups)
      .filter(([_, group]) => group.admins.length > 0)
      .map(([key, group]) => ({
        value: `existing:${key}`,
        label: 'Compliance Managers',
        description: `Manages ${group.councils.length} Compliance Check${group.councils.length > 1 ? 's' : ''} on ${group.councils.join(', ')}`,
        avatars: group.admins,
        onSelect: () => form.setValue('complianceAdmins', group.admins),
      })),
    {
      value: 'true',
      label: 'Create new Compliance Managers',
      description: 'Create a new group of Compliance Managers',
      onSelect: () => form.setValue('complianceAdmins', []),
    },
  ];

  // Show loading state during mutation or while fetching updated data
  const isLoadingList = isMutating || (isFetching && !isLoading);

  useEffect(() => {
    // Only update if the role has actually changed and we're not just resetting the form
    if (prevRole.current !== createComplianceAdminRole && createComplianceAdminRole && !isMutating) {
      if (createComplianceAdminRole === 'false') {
        form.setValue('complianceAdmins', organizationManagers, { shouldDirty: false });
      } else if (createComplianceAdminRole.startsWith('existing:')) {
        const adminKey = createComplianceAdminRole.split(':')[1];
        const group = complianceAdminGroups[adminKey];
        if (group) {
          form.setValue('complianceAdmins', group.admins, { shouldDirty: false });
        }
      } else if (createComplianceAdminRole === 'true') {
        form.setValue('complianceAdmins', [], { shouldDirty: false });
      }
      prevRole.current = createComplianceAdminRole;
    }
  }, [createComplianceAdminRole, form, organizationManagers, complianceAdminGroups, isMutating]);

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'compliance', form.watch('requirements'));

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
    return (
      <div className='mx-auto flex w-full flex-col space-y-6'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-5 w-96' />
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='flex items-center gap-4'>
            <BsPersonCheck className='h-6 w-6' />
            <h2 className='text-2xl font-bold'>Configure Compliance Requirement</h2>
          </div>

          <div>
            <p className='text-sm'>
              Require that Council Members pass a compliance check (such as KYC) before being allowed to join the
              Council. Compliance checks are handled by the provider of your choosing outside of Hats Pro, then verified
              (and revoked) via onchain transactions.
            </p>
          </div>

          <div className='space-y-8'>
            <div className='space-y-2'>
              <h2 className='font-bold'>Who does the compliance check?</h2>
              <RadioCard
                name='createComplianceAdminRole'
                localForm={form}
                options={complianceManagerOptions}
                isDisabled={!canEdit}
              />
            </div>

            <div>
              <h3 className='mb-2 font-medium'>Compliance Managers</h3>
              <p className='text-sm'>
                Compliance Managers can verify the compliance of Council Members before they join the council and remove
                members who are no longer compliant.
              </p>
              <div className='mt-4 space-y-4'>
                <ComplianceList
                  complianceAdmins={complianceAdmins}
                  form={form}
                  canEdit={createComplianceAdminRole === 'true' && canEdit}
                  canDelete={createComplianceAdminRole === 'true' ? canEdit : false}
                  showButtons={true}
                  onEdit={(admin) => {
                    setEditingAdmin(admin);
                    setShowAddForm(true);
                  }}
                  loading={isLoadingList}
                />

                {createComplianceAdminRole === 'true' && !showAddForm && (
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
                    Add Compliance Manager
                  </Button>
                )}
              </div>
            </div>

            {createComplianceAdminRole === 'true' && showAddForm && (
              <div className='-mx-16 border-b border-gray-200'>
                <UnifiedUserForm
                  parentForm={form}
                  editingUser={editingAdmin}
                  userType='complianceAdmin'
                  onClose={() => {
                    setShowAddForm(false);
                    setEditingAdmin(null);
                  }}
                  canEdit={canEdit}
                  className='bg-white px-16 py-6'
                  onMutationStateChange={setIsMutating}
                />
              </div>
            )}
          </div>

          <div className='flex justify-end py-6'>
            <NextStepButton
              disabled={
                !form.formState.isValid ||
                (createComplianceAdminRole === 'true' && complianceAdmins.length === 0) ||
                !canEdit ||
                isLoadingList
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
