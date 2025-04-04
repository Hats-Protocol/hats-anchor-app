'use client';

import { councilsChainsList } from '@hatsprotocol/config';
import { useCouncilForm } from 'contexts';
import { ChainSelect, CreatableSelect, Form, Input, Textarea } from 'forms';
import { useGetOrganizations } from 'hooks';
import { useCouncilDeployFlag, useToast } from 'hooks';
import { useEffect } from 'react';
import { StepProps } from 'types';
import { MemberAvatar, Skeleton } from 'ui';
import { logger } from 'utils';

import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

interface OrganizationOption {
  value: string;
  label: string;
}

interface ChainOption {
  value: string;
  label: string;
  icon: string;
}

const chainOptions: ChainOption[] = Object.values(councilsChainsList).map((chain) => ({
  value: chain.id.toString(),
  label: chain.name,
  icon: chain.iconUrl,
}));

export function DetailsStep({ onNext, draftId }: StepProps) {
  const { form: localForm, isLoading, stepValidation, canEdit } = useCouncilForm();
  const { watch, handleSubmit, setValue } = localForm;
  const requirements = watch('requirements');

  const { toast } = useToast();
  const { data: organizationsData, isLoading: isLoadingOrgs } = useGetOrganizations();

  // watch the organization name value
  const organizationNameValue = watch('organizationName') as string | OrganizationOption;

  // set default value for organizationName - only if it hasn't been set before
  useEffect(() => {
    const currentValue = watch('organizationName');
    if (currentValue === undefined) {
      setValue('organizationName', '');
    }
  }, [setValue, watch]);

  // set creator address as organization owner when selecting a pre-existing org
  useEffect(() => {
    if (!organizationNameValue) {
      setValue('chain', chainOptions[0], { shouldValidate: true });
      return;
    }

    // find the selected organization in the org data
    const selectedOrg = organizationsData?.organizations?.find(
      (org) =>
        org.name === (typeof organizationNameValue === 'object' ? organizationNameValue.value : organizationNameValue),
    );

    // if this is a new organization (not found in org data), keep chain selection editable
    if (!selectedOrg) {
      return;
    }

    // set chain for existing orgs and disable change
    if (selectedOrg.councils && selectedOrg.councils.length > 0) {
      const firstCouncil = selectedOrg.councils[0];
      if (!firstCouncil) return;

      const chainOption = chainOptions.find((option) => Number(option.value) === firstCouncil.chain);

      if (chainOption) {
        setValue('chain', chainOption, {
          shouldValidate: true,
        });
      } else {
        logger.error('Chain option not found for chain:', firstCouncil.chain);
      }

      if (firstCouncil.creationForm) {
        setValue('creator', firstCouncil.creationForm.creator);
      }
    }
  }, [organizationsData, setValue, chainOptions, organizationNameValue]);

  useCouncilDeployFlag(draftId);

  if (isLoading || isLoadingOrgs) {
    return <Skeleton className='h-100 w-100' />;
  }

  const nextStep = findNextInvalidStep(stepValidation, 'details', undefined, requirements);

  // create organization options from the data
  const existingOrganizations = organizationsData?.organizations || [];
  const organizationOptions: OrganizationOption[] = existingOrganizations.map((org: { name: string }) => ({
    value: org.name,
    label: org.name,
  }));

  const selectedOrgValue = watch('organizationName') as unknown as OrganizationOption | null;

  // check if the selected value exists in our original organizations list
  const isExistingOrg = selectedOrgValue && existingOrganizations.some((org) => org.name === selectedOrgValue.value);
  const selectedExistingOrg = isExistingOrg
    ? organizationsData?.organizations?.find((org) => org.name === selectedOrgValue.value)
    : undefined;

  const isChainDisabled = !canEdit || Boolean(isExistingOrg);

  return (
    <Form {...localForm}>
      <form
        className='flex h-full flex-col space-y-6'
        onSubmit={handleSubmit(() => {
          onNext();
        })}
      >
        <div className='flex-1 space-y-6'>
          <h2 className='text-xl font-bold'>
            {selectedOrgValue && existingOrganizations.some((org) => org.name === selectedOrgValue.value)
              ? 'Create a new Council'
              : 'Create your first Council'}
          </h2>

          <div className='space-y-2'>
            <CreatableSelect<OrganizationOption>
              name='organizationName'
              localForm={localForm}
              label='Organization Name'
              subLabel='The name of the organization you are creating councils for.'
              variant='councils'
              options={organizationOptions}
              placeholder='Select or create an organization'
              isDisabled={false}
              formatCreateLabel={(inputValue: string) => `Create "${inputValue}"`}
              noOptionsMessage={() => 'Type to create a new organization'}
            />
          </div>

          <div className='space-y-2'>
            <ChainSelect
              name='chain'
              localForm={localForm}
              label='Choose a Chain'
              subLabel={
                selectedExistingOrg
                  ? 'Chain is set to match the existing organization councils.'
                  : 'The chain you deploy the Safe Multisig and Hats Council to.'
              }
              variant='councils'
              placeholder='Select a chain'
              isDisabled={isChainDisabled}
            />
          </div>

          {selectedExistingOrg && selectedExistingOrg.councils[0] && (
            <div className='flex flex-col space-y-2'>
              <span className='text-base font-bold normal-case'>Organization Owner</span>
              <p className='text-sm text-gray-600'>
                Organization Owners can add and remove any addresses, change all Membership Criteria, deploy and edit
                Safes and Councils. You can change this after deploying.
              </p>
              <MemberAvatar
                member={{
                  address: selectedExistingOrg.councils[0].creationForm.creator,
                }}
                stack
              />
            </div>
          )}

          <div className='space-y-2'>
            <Input
              name='councilName'
              localForm={localForm}
              label='Council Name'
              subLabel='The name of your first council. You can add further councils later.'
              variant='councils'
              placeholder='Council Name'
              options={{ required: true }}
              isDisabled={!canEdit}
            />
          </div>

          <div className='space-y-2'>
            <Textarea
              name='councilDescription'
              localForm={localForm}
              label='Council Description'
              labelNote='Optional'
              subLabel='Add a short description or some links you want all council members to see.'
              variant='councils'
              placeholder='Bylaws, policies or important links'
              isDisabled={!canEdit}
            />
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton disabled={!localForm.formState.isValid || !canEdit}>
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>
    </Form>
  );
}
