'use client';

import { hatIdHexToDecimal, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useCouncilForm } from 'contexts';
import { Form, RadioCard, RadioCardOption } from 'forms';
import { useOrganization } from 'hooks';
import { filter, find, flatten, get, isEmpty, join, map, pick, reject, uniq, uniqBy } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BsPersonCheck } from 'react-icons/bs';
import { FiUserPlus } from 'react-icons/fi';
import { CouncilFormData, CouncilMember, StepProps } from 'types';
import { Button, Skeleton } from 'ui';
import { getKnownEligibilityModule, logger } from 'utils';
import { Hex } from 'viem';

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

const getAdminHatId = (treeId: number | undefined): Hex | null => {
  if (!treeId) return null;
  const newHatId = `${treeId}.1`;
  return hatIdDecimalToHex(hatIdIpToDecimal(newHatId));
};

export function ComplianceStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit, councilsData } = useCouncilForm();

  const [editingAdmin, setEditingAdmin] = useState<CouncilMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);

  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization, isFetching } = useOrganization(orgName);
  const eligibilityRequirements = form.watch('eligibilityRequirements');
  const { existingId, existingAdmins } = pick(eligibilityRequirements, ['compliance']);
  logger.info('eligibilityRequirments compliance', eligibilityRequirements);
  const complianceAdmins = form.watch('complianceAdmins') || [];

  // // Add useEffect to set initial values when component mounts // TODO: Come back to this, causing error in the context
  // useEffect(() => {
  //   if (isLoading) return;

  //   const { compliance } = eligibilityRequirements;
  //   const initialValues: Omit<Partial<CouncilFormData>, 'existingId'> = {
  //     eligibilityRequirements: {
  //       compliance: {
  //         // @ts-expect-error move to subforms to avoid challenges with the types between the parent and active forms
  //         existingId: compliance.existingId || 'new',
  //         existingAdmins: compliance.existingAdmins || null,
  //       },
  //     },
  //     complianceAdmins: compliance.existingAdmins ? [] : complianceAdmins,
  //   };

  //   form.reset(initialValues);
  // }, [isLoading, eligibilityRequirements]);

  const nextStep = findNextInvalidStep(stepValidation, 'eligibility', 'compliance', eligibilityRequirements);

  // Extract unique organization managers from existing councils
  const organizationManagers = useMemo(
    () =>
      councilsData?.reduce<CouncilMember[]>((acc, council) => {
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
    [councilsData],
  );

  const treeId = councilsData?.[0]?.treeId;
  const adminHatId = getAdminHatId(treeId);

  // Group unique admin sets across councils
  const complianceAdminGroups = useMemo(() => {
    if (!adminHatId) return [];
    const adminHats = flatten(
      map(councilsData, (council) => {
        if (!council) return null;
        // get the associated owner hat IDs for all the modules in the council
        const rules = flatten(council.eligibilityRules); //flatten rules per council
        const params = flatten(map(rules, 'liveParams')); // grab the params
        const ownerHats = filter(params, { label: 'Owner Hat' }); // look for the Owner Hat
        return uniq(map(ownerHats, 'value'));
      }),
    );

    const filteredAdminHats = reject(adminHats, (hatValue) => hatValue === hatIdHexToDecimal(adminHatId));

    const preExistingOptions = map(filteredAdminHats, (hatValue) => {
      const councilsByHatId = councilsData?.filter((council) => {
        const rules = flatten(council.eligibilityRules);
        const params = flatten(map(rules, 'liveParams'));
        const ownerHats = filter(params, { label: 'Owner Hat' });
        return ownerHats.some((hat) => hat?.value === hatValue);
      });

      const councilsByHatIdWithAgreementModule = councilsByHatId?.map((council) =>
        flatten(council?.eligibilityRules)?.find((rule) => rule.liveParams?.some((param) => param.value === hatValue)),
      );

      const moduleEligibilityRules = councilsByHatIdWithAgreementModule?.map((rule) =>
        getKnownEligibilityModule(rule?.module.implementationAddress as Hex),
      );

      const label = moduleEligibilityRules?.includes('allowlist') ? 'Compliance Manager' : 'Agreement Manager';

      const descriptionNames = councilsByHatId?.map((council) => council.creationForm.councilName).join(', ');
      const councilsCount = councilsByHatId?.length || 0;

      const description = moduleEligibilityRules?.includes('allowlist')
        ? `Manages Compliance for ${descriptionNames}`
        : `Manages ${councilsCount > 1 ? councilsCount + ' Agreements' : ' Agreement'} for ${descriptionNames}`;

      const avatars = moduleEligibilityRules?.includes('allowlist')
        ? flatten(councilsByHatId?.map((council) => council.creationForm.complianceAdmins))
        : flatten(councilsByHatId?.map((council) => council.creationForm.agreementAdmins));

      return {
        value: hatIdDecimalToHex(hatValue),
        label,
        description,
        avatars,
        onSelect: () => form.setValue('agreementAdmins', avatars),
      };
    });

    return preExistingOptions;
  }, [councilsData]);

  logger.info('complianceAdminGroups', complianceAdminGroups);

  const complianceManagerOptions = useMemo(
    () => [
      {
        value: 'org-managers',
        label: 'Organization Managers',
        description: 'Manage Roles on all Councils',
        avatars: organizationManagers,
        onSelect: () => form.setValue('complianceAdmins', organizationManagers),
      },
      ...complianceAdminGroups,

      {
        value: 'new',
        label: 'Create new Agreement Managers',
        description: 'Create a new group of agreement managers',
        onSelect: () => form.setValue('complianceAdmins', []),
      },
    ],
    [organizationManagers, form],
  );

  // Show loading state during mutation or while fetching updated data
  const isLoadingList = isMutating || (isFetching && !isLoading);

  // // Initialize the createComplianceAdminRole based on existing complianceAdmins
  // useEffect(() => {
  //   if (initialSetupComplete || isFetching || isLoading) return;

  //   const currentComplianceAdmins = form.getValues('complianceAdmins') || [];
  //   if (!currentComplianceAdmins.length) {
  //     setInitialSetupComplete(true);
  //     return;
  //   }

  //   const currentAddresses = currentComplianceAdmins
  //     .map((admin) => admin.address.toLowerCase())
  //     .sort()
  //     .join(',');

  //   // TODO replace key
  //   // Check if current admins match organization managers
  //   const orgManagerAddresses = organizationManagers
  //     .map((admin) => admin.address.toLowerCase())
  //     .sort()
  //     .join(',');

  //   // First check if we already have a role selected
  //   const eligibilityRequirements = form.getValues('eligibilityRequirements');
  //   const { compliance } = pick(eligibilityRequirements, ['compliance']);

  //   // If we have a role and it matches the data, keep it
  //   if (eligibilityRequirements) {
  //     if (compliance.existingId && currentAddresses === orgManagerAddresses) {
  //       // Already correctly set to organization managers
  //       setInitialSetupComplete(true);
  //       return;
  //     } else if (compliance.existingId) {
  //       const adminKey = compliance.existingId;
  //       // const group = complianceAdminGroups[adminKey];
  //       // if (group) {
  //       //   const groupAddresses = group.admins
  //       //     .map((admin) => admin.address.toLowerCase())
  //       //     .sort()
  //       //     .join(',');

  //       //   if (currentAddresses === groupAddresses) {
  //       //     // Already correctly set to the right existing group
  //       //     setInitialSetupComplete(true);
  //       //     return;
  //       //   }
  //       // }
  //     } else if (!compliance.existingId) {
  //       // Custom admins - this is fine
  //       setInitialSetupComplete(true);
  //       return;
  //     }
  //   }

  // If we get here, we need to determine the role based on the current admins

  // // Check if they match organization managers
  // if (currentAddresses === orgManagerAddresses) {
  //   // TODO is something wrong with the type inference here?
  //   form.setValue('eligibilityRequirements.compliance.existingId', 'org-managers' as any, {
  //     shouldDirty: false,
  //   });
  //   setInitialSetupComplete(true);
  //   return;
  // }

  // // Check if they match any existing compliance admin group
  // for (const [key, group] of Object.entries(complianceAdminGroups)) {
  //   // const groupAddresses = group.admins
  //   //   .map((admin) => admin.address.toLowerCase())
  //   //   .sort()
  //   //   .join(',');
  //   // if (currentAddresses === groupAddresses) {
  //   //   // @ts-expect-error TODO: fix this, need to upgrade the form to use a more flexible type
  //   //   form.setValue('eligibilityRequirements.compliance.existingId', `existing:${key}`, { shouldDirty: false });
  //   //   // @ts-expect-error TODO: fix this, need to upgrade the form to use a more flexible type
  //   //   prevRole.current = `existing:${key}`;
  //   //   setInitialSetupComplete(true);
  //   //   return;
  //   // }
  // }

  //   // If we have admins but they don't match any existing group, assume it's a custom group
  //   form.setValue('eligibilityRequirements.compliance.existingId', null, { shouldDirty: false });
  //   setInitialSetupComplete(true);
  // }, [complianceAdminGroups, form, isFetching, isLoading, organizationManagers, initialSetupComplete]);

  // useEffect(() => {
  //   // Only update if the role has actually changed and we're not just resetting the form
  //   if (
  //     eligibilityRequirements &&
  //     !isMutating &&
  //     !form.formState.isSubmitting &&
  //     initialSetupComplete && // Only run this effect after initial setup
  //     !form.formState.isDirty // Only update if the form hasn't been modified by user
  //   ) {
  //     const currentAdmins = form.getValues('complianceAdmins') || [];
  //     const currentAddresses = currentAdmins
  //       .map((admin) => admin.address.toLowerCase())
  //       .sort()
  //       .join(',');

  //     if (eligibilityRequirements.compliance.existingId === null) {
  //       // Check if already matches organization managers
  //       const orgManagerAddresses = organizationManagers
  //         .map((admin) => admin.address.toLowerCase())
  //         .sort()
  //         .join(',');

  //       if (currentAddresses !== orgManagerAddresses) {
  //         form.setValue('complianceAdmins', organizationManagers, { shouldDirty: false });
  //       }
  //     } else if (eligibilityRequirements.compliance.existingId) {
  //       const adminKey = eligibilityRequirements.compliance.existingId;
  //       // const group = complianceAdminGroups[adminKey];
  //       // if (group) {
  //       //   const groupAddresses = group.admins
  //       //     .map((admin) => admin.address.toLowerCase())
  //       //     .sort()
  //       //     .join(',');

  //       //   if (currentAddresses !== groupAddresses) {
  //       //     form.setValue('complianceAdmins', group.admins, { shouldDirty: false });
  //       //   }
  //       // }
  //     } else if (!eligibilityRequirements.compliance.existingId && currentAdmins.length === 0) {
  //       // Only clear if empty - don't override custom admins that may have been added
  //       form.setValue('complianceAdmins', [], { shouldDirty: false });
  //     }
  //   }
  // }, [eligibilityRequirements, form, organizationManagers, complianceAdminGroups, isMutating, initialSetupComplete]);

  // const handleSubmit = useCallback(
  //   async (data: CouncilFormData) => {
  //     // set the current form values to prevent state flashing during transition
  //     // data contains the latest form values at submission time (as we advance the form)
  //     const currentRole = data.eligibilityRequirements.compliance.existingId;
  //     const currentAdmins = [...(data.complianceAdmins || [])]; // Make a copy to preserve

  //     // Keep the initialSetupComplete true to prevent re-initialization
  //     setInitialSetupComplete(true);

  //     // Update the ref to match the current selection before reset
  //     // prevRole.current = currentRole;

  //     // Reset with keepValues to avoid flashing
  //     form.reset(data, { keepValues: true });

  //     // Ensure the admins and role are consistent after reset
  //     if (currentRole) {
  //       form.setValue('eligibilityRequirements.compliance.existingId', currentRole, { shouldDirty: false });
  //     }

  //     if (currentAdmins.length > 0) {
  //       form.setValue('complianceAdmins', currentAdmins, { shouldDirty: false });
  //     }

  //     await onNext();
  //   },
  //   [form, onNext, setInitialSetupComplete],
  // );

  const submitForm = useCallback(
    async (data: Partial<CouncilFormData>) => {
      // Get current council form values
      // const currentValues = councilFormGetValues();
      const currentValues = form.getValues();

      // Merge the local form's eligibility requirements with existing council form data
      // preserving existing fields like 'required'
      const mergedValues = {
        ...currentValues,
        eligibilityRequirements: {
          ...currentValues.eligibilityRequirements,
          compliance: {
            ...currentValues.eligibilityRequirements?.compliance,
            ...data.eligibilityRequirements?.compliance,
          },
        },
      };

      // Reset council form with merged values
      // councilFormReset(mergedValues);
      form.reset(mergedValues);
      onNext();
    },
    [form, onNext],
  );

  if (isLoading) {
    return <LoadingComplianceStep />;
  }

  return (
    <>
      <Form {...form}>
        <form className='mx-auto flex w-full flex-col space-y-6' onSubmit={form.handleSubmit(submitForm)}>
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
              {isLoading ? (
                <div className='flex flex-col gap-4'>
                  <RadioCardSkeleton />
                  <RadioCardSkeleton />
                  <RadioCardSkeleton />
                </div>
              ) : (
                <RadioCard
                  name='eligibilityRequirements.compliance.existingId'
                  localForm={form}
                  options={complianceManagerOptions as RadioCardOption[]}
                  isDisabled={!canEdit || isLoadingList}
                  defaultValue={form.getValues('eligibilityRequirements.compliance.existingId') || undefined}
                />
              )}
            </div>

            {!isLoading && (
              <div>
                <h3 className='mb-2 font-medium'>Compliance Managers</h3>
                <p className='text-sm'>
                  Compliance Managers can verify the compliance of Council Members before they join the council and
                  remove members who are no longer compliant.
                </p>
                <div className='mt-4 space-y-4'>
                  <ComplianceList
                    complianceAdmins={complianceAdmins}
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
            )}

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
