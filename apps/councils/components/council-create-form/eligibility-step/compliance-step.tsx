'use client';

import { useCouncilForm } from 'contexts';
import { Form, RadioCard } from 'forms';
import { useOrganization } from 'hooks';
import { concat, flatten, get, map, pick, toLower, uniqBy } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BsPersonCheck } from 'react-icons/bs';
import { FiUserPlus } from 'react-icons/fi';
import { CouncilFormData, CouncilMember, StepProps } from 'types';
import { Button, Skeleton } from 'ui';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';
import { ComplianceList } from './compliance-list';
import { UnifiedUserForm } from './unified-user-form';

interface GroupedComplianceAdmin {
  id: string;
  admins: CouncilMember[];
  councils: string[];
}

const RadioCardSkeleton = () => (
  <div className='flex cursor-pointer rounded-lg border border-gray-200 px-6 py-4'>
    <div className='flex w-full items-center gap-3'>
      <Skeleton className='h-4 w-4 rounded-full' />
      <div className='flex w-full items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-6 w-6' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-64' />
          </div>
        </div>
        <div className='flex -space-x-2'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-6 w-6 rounded-full' />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const LoadingComplianceStep = () => (
  <div className='mx-auto flex w-full flex-col space-y-6'>
    {/* Header */}
    <div className='flex items-center gap-4'>
      <Skeleton className='h-6 w-6' />
      <Skeleton className='h-8 w-64' />
    </div>

    {/* Description */}
    <div>
      <Skeleton className='h-4 w-full max-w-2xl' />
    </div>

    {/* Compliance Manager Selection */}
    <div className='space-y-8'>
      <div className='space-y-2'>
        <Skeleton className='h-6 w-48' />
        <div className='flex flex-col gap-4'>
          <RadioCardSkeleton />
          <RadioCardSkeleton />
          <RadioCardSkeleton />
        </div>
      </div>

      {/* Compliance Managers List Section */}
      <div>
        <Skeleton className='mb-2 h-6 w-48' />
        <Skeleton className='h-4 w-96' />
        <div className='mt-4 space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-3 w-24' />
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-10 w-20 rounded-full' />
                <Skeleton className='h-10 w-10 rounded-full' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Next Button */}
    <div className='flex justify-end py-6'>
      <Skeleton className='h-10 w-32' />
    </div>
  </div>
);

export function ComplianceStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();

  const [editingAdmin, setEditingAdmin] = useState<CouncilMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);

  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization, isFetching } = useOrganization(orgName);
  const eligibilityRequirements = form.watch('eligibilityRequirements');
  const complianceAdmins = form.watch('complianceAdmins') || [];

  // Extract unique organization managers from existing councils
  const rawAdmins = form.watch('admins');
  const organizationManagers = useMemo(() => {
    const localAdmins = concat(
      flatten(map(organization?.councils, (council) => council.creationForm?.admins)),
      rawAdmins,
    );
    const lowerAdmins = map(localAdmins, (admin) => ({
      ...admin,
      address: toLower(admin.address),
    }));
    return uniqBy(lowerAdmins, 'address');
  }, [organization, rawAdmins]);

  // Group unique compliance admin sets across councils
  const complianceAdminGroups = useMemo(() => {
    const groupsByAdmins = new Map<string, { id: string; admins: CouncilMember[]; councils: string[] }>();

    organization?.councils?.forEach((council) => {
      if (!council.creationForm?.complianceAdmins?.length) return;

      // Create a sorted string of admin addresses as a key
      const adminKey = council.creationForm.complianceAdmins
        .map((admin) => admin.address.toLowerCase())
        .sort()
        .join(',');

      const existing = get(groupsByAdmins, adminKey);
      if (existing) {
        existing.councils.push(council.creationForm.councilName || '');
        // Merge any new admins (shouldn't happen if keys match, but being thorough)
        if (council.creationForm.complianceAdmins) {
          const newAdmins = council.creationForm.complianceAdmins
            .filter(
              (admin) =>
                !existing.admins.some(
                  (existingAdmin: any) => existingAdmin.address.toLowerCase() === admin.address.toLowerCase(),
                ),
            )
            .map((admin) => ({
              ...admin,
              email: '', // Adding required email field
            }));
          existing.admins.push(...newAdmins);
        }
      } else {
        groupsByAdmins.set(adminKey, {
          id: council.creationForm.id,
          admins: council.creationForm.complianceAdmins.map((admin) => ({
            ...admin,
            email: '', // Adding required email field
          })),
          councils: [council.creationForm.councilName || ''],
        });
      }
    });

    return Object.fromEntries(groupsByAdmins.entries());
  }, [organization?.councils]);

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
  const complianceManagerOptions = useMemo(
    () => [
      {
        value: 'false',
        label: 'Organization Managers',
        description: 'Manage Roles on all Councils',
        avatars: organizationManagers,
        onSelect: () => form.setValue('complianceAdmins', organizationManagers),
      },
      ...Object.entries(filteredComplianceAdminGroups).map(([key, group]) => ({
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
    ],
    [organizationManagers, filteredComplianceAdminGroups, form],
  );

  // Show loading state during mutation or while fetching updated data
  const isLoadingList = isMutating || (isFetching && !isLoading);

  // Initialize the createComplianceAdminRole based on existing complianceAdmins
  useEffect(() => {
    if (initialSetupComplete || isFetching || isLoading) return;

    const currentComplianceAdmins = form.getValues('complianceAdmins') || [];
    if (!currentComplianceAdmins.length) {
      setInitialSetupComplete(true);
      return;
    }

    const currentAddresses = currentComplianceAdmins
      .map((admin) => admin.address.toLowerCase())
      .sort()
      .join(',');

    // TODO replace key
    // Check if current admins match organization managers
    const orgManagerAddresses = organizationManagers
      .map((admin) => admin.address.toLowerCase())
      .sort()
      .join(',');

    // First check if we already have a role selected
    const eligibilityRequirements = form.getValues('eligibilityRequirements');
    const { compliance } = pick(eligibilityRequirements, ['compliance']);

    // If we have a role and it matches the data, keep it
    if (eligibilityRequirements) {
      if (compliance.existingId && currentAddresses === orgManagerAddresses) {
        // Already correctly set to organization managers
        setInitialSetupComplete(true);
        return;
      } else if (compliance.existingId) {
        const adminKey = compliance.existingId;
        const group = complianceAdminGroups[adminKey];
        if (group) {
          const groupAddresses = group.admins
            .map((admin) => admin.address.toLowerCase())
            .sort()
            .join(',');

          if (currentAddresses === groupAddresses) {
            // Already correctly set to the right existing group
            setInitialSetupComplete(true);
            return;
          }
        }
      } else if (!compliance.existingId) {
        // Custom admins - this is fine
        setInitialSetupComplete(true);
        return;
      }
    }

    // If we get here, we need to determine the role based on the current admins

    // Check if they match organization managers
    if (currentAddresses === orgManagerAddresses) {
      // TODO is something wrong with the type inference here?
      form.setValue('eligibilityRequirements.compliance.existingId', 'org-managers' as any, {
        shouldDirty: false,
      });
      setInitialSetupComplete(true);
      return;
    }

    // Check if they match any existing compliance admin group
    for (const [key, group] of Object.entries(complianceAdminGroups)) {
      const groupAddresses = group.admins
        .map((admin) => admin.address.toLowerCase())
        .sort()
        .join(',');

      if (currentAddresses === groupAddresses) {
        // @ts-expect-error TODO: fix this, need to upgrade the form to use a more flexible type
        form.setValue('eligibilityRequirements.compliance.existingId', `existing:${key}`, { shouldDirty: false });
        // @ts-expect-error TODO: fix this, need to upgrade the form to use a more flexible type
        prevRole.current = `existing:${key}`;
        setInitialSetupComplete(true);
        return;
      }
    }

    // If we have admins but they don't match any existing group, assume it's a custom group
    form.setValue('eligibilityRequirements.compliance.existingId', null, { shouldDirty: false });
    setInitialSetupComplete(true);
  }, [complianceAdminGroups, form, isFetching, isLoading, organizationManagers, initialSetupComplete]);

  useEffect(() => {
    // Only update if the role has actually changed and we're not just resetting the form
    if (
      eligibilityRequirements &&
      !isMutating &&
      !form.formState.isSubmitting &&
      initialSetupComplete && // Only run this effect after initial setup
      !form.formState.isDirty // Only update if the form hasn't been modified by user
    ) {
      const currentAdmins = form.getValues('complianceAdmins') || [];
      const currentAddresses = currentAdmins
        .map((admin) => admin.address.toLowerCase())
        .sort()
        .join(',');

      if (eligibilityRequirements.compliance.existingId === null) {
        // Check if already matches organization managers
        const orgManagerAddresses = organizationManagers
          .map((admin) => admin.address.toLowerCase())
          .sort()
          .join(',');

        if (currentAddresses !== orgManagerAddresses) {
          form.setValue('complianceAdmins', organizationManagers, { shouldDirty: false });
        }
      } else if (eligibilityRequirements.compliance.existingId) {
        const adminKey = eligibilityRequirements.compliance.existingId;
        const group = complianceAdminGroups[adminKey];
        if (group) {
          const groupAddresses = group.admins
            .map((admin) => admin.address.toLowerCase())
            .sort()
            .join(',');

          if (currentAddresses !== groupAddresses) {
            form.setValue('complianceAdmins', group.admins, { shouldDirty: false });
          }
        }
      } else if (!eligibilityRequirements.compliance.existingId && currentAdmins.length === 0) {
        // Only clear if empty - don't override custom admins that may have been added
        form.setValue('complianceAdmins', [], { shouldDirty: false });
      }
    }
  }, [eligibilityRequirements, form, organizationManagers, complianceAdminGroups, isMutating, initialSetupComplete]);

  const nextStep = findNextInvalidStep(stepValidation, 'eligibility', 'compliance', eligibilityRequirements);

  const handleSubmit = useCallback(
    async (data: CouncilFormData) => {
      // set the current form values to prevent state flashing during transition
      // data contains the latest form values at submission time (as we advance the form)
      const currentRole = data.eligibilityRequirements.compliance.existingId;
      const currentAdmins = [...(data.complianceAdmins || [])]; // Make a copy to preserve

      // Keep the initialSetupComplete true to prevent re-initialization
      setInitialSetupComplete(true);

      // Update the ref to match the current selection before reset
      // prevRole.current = currentRole;

      // Reset with keepValues to avoid flashing
      form.reset(data, { keepValues: true });

      // Ensure the admins and role are consistent after reset
      if (currentRole) {
        form.setValue('eligibilityRequirements.compliance.existingId', currentRole, { shouldDirty: false });
      }

      if (currentAdmins.length > 0) {
        form.setValue('complianceAdmins', currentAdmins, { shouldDirty: false });
      }

      await onNext();
    },
    [form, onNext, setInitialSetupComplete],
  );

  if (isLoading) {
    return <LoadingComplianceStep />;
  }

  console.log(
    'complianceAdmins',
    eligibilityRequirements.compliance.existingId
      ? (() => {
          const adminKey = eligibilityRequirements.compliance.existingId;
          const group = complianceAdminGroups[adminKey];
          return group?.admins || complianceAdmins;
        })()
      : complianceAdmins,
  );

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
              {isFetching ? (
                <div className='flex flex-col gap-4'>
                  <RadioCardSkeleton />
                  <RadioCardSkeleton />
                  <RadioCardSkeleton />
                </div>
              ) : (
                <RadioCard
                  name='eligibilityRequirements.compliance.existingId'
                  localForm={form}
                  options={complianceManagerOptions}
                  isDisabled={!canEdit}
                  defaultValue={form.getValues('eligibilityRequirements.compliance.existingId') || undefined}
                />
              )}
            </div>

            <div>
              <h3 className='mb-2 font-medium'>Compliance Managers</h3>
              <p className='text-sm'>
                Compliance Managers can verify the compliance of Council Members before they join the council and remove
                members who are no longer compliant.
              </p>
              <div className='mt-4 space-y-4'>
                <ComplianceList
                  complianceAdmins={
                    // @ts-expect-error check whats up with this type // TODO
                    eligibilityRequirements.compliance.existingId === 'org-managers'
                      ? organizationManagers
                      : eligibilityRequirements.compliance.existingId
                        ? (() => {
                            const adminKey = eligibilityRequirements.compliance.existingId;
                            const group = complianceAdminGroups[adminKey];
                            return group?.admins || complianceAdmins;
                          })()
                        : complianceAdmins
                  }
                  form={form}
                  canEdit={eligibilityRequirements.compliance.existingId === null && canEdit}
                  canDelete={eligibilityRequirements.compliance.existingId === null ? canEdit : false}
                  showButtons={eligibilityRequirements.compliance.existingId === null}
                  onEdit={(admin) => {
                    setEditingAdmin(admin);
                    setShowAddForm(true);
                  }}
                  loading={isLoadingList}
                />

                {eligibilityRequirements.compliance.existingId === null && !showAddForm && (
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

            {eligibilityRequirements.compliance.existingId === null && showAddForm && (
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
                (eligibilityRequirements.compliance.existingId === null && complianceAdmins.length === 0) ||
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
