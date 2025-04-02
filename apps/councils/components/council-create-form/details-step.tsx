'use client';

import { councilsChainsList } from '@hatsprotocol/config';
import { usePrivy } from '@privy-io/react-auth';
import { useCouncilForm } from 'contexts';
import { ChainSelect, Form, Input, Select, Textarea } from 'forms';
import { useGetOrganizations } from 'hooks';
import { useCouncilDeployFlag, useToast } from 'hooks';
import { get } from 'lodash';
import { useEffect } from 'react';
import { StepProps } from 'types';
import { MemberAvatar, ReactSelectOption, Skeleton } from 'ui';
import { getOrganizationByName, logger } from 'utils';

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

const CREATE_NEW_ORGANIZATION_OPTION: OrganizationOption = {
  value: 'newOrganization',
  label: 'Create a New Organization',
};

const chainOptions: ChainOption[] = Object.values(councilsChainsList).map((chain) => ({
  value: chain.id.toString(),
  label: chain.name,
  icon: chain.iconUrl,
}));

export function DetailsStep({ onNext, draftId }: StepProps) {
  const { form: localForm, isLoading, stepValidation, canEdit } = useCouncilForm();
  const { watch, handleSubmit, setValue } = localForm;
  const requirements = watch('requirements');
  const { getAccessToken } = usePrivy();
  const { toast } = useToast();
  const { data: organizationsData, isLoading: isLoadingOrgs } = useGetOrganizations();

  // Set default value for organizationName
  useEffect(() => {
    if (!watch('organizationName')) {
      setValue('organizationName', {
        value: CREATE_NEW_ORGANIZATION_OPTION.value,
        label: CREATE_NEW_ORGANIZATION_OPTION.label,
      });
    }
  }, [setValue, watch]);

  // Set creator address as organization owner when selecting a pre-existing org
  useEffect(() => {
    const selectedOrgName = (watch('organizationName') as OrganizationOption | undefined)?.value;
    logger.info('Selected org name:', selectedOrgName);
    logger.info('Organizations data:', organizationsData);

    const selectedOrg = organizationsData?.organizations?.find((org) => {
      logger.info('Comparing org:', org.name, 'with selected:', selectedOrgName);
      return org.name === selectedOrgName;
    });
    logger.info('Found org:', selectedOrg);

    if (!selectedOrg || !selectedOrg.councils || selectedOrg.councils.length === 0) {
      return;
    }

    logger.info('Selected org logic path:', selectedOrg);
    const firstCouncil = selectedOrg.councils[0];
    if (!firstCouncil) return;

    logger.info('Setting chain from council:', firstCouncil.chain);

    // Find the matching chain option directly from chainOptions
    const chainOption = chainOptions.find((option) => Number(option.value) === firstCouncil.chain);

    if (chainOption) {
      logger.info('Found chain option:', chainOption);
      // Map to match ChainSelect's expected format with iconUrl
      setValue('chain', {
        value: chainOption.value,
        label: chainOption.label,
        iconUrl: chainOption.icon, // Map icon to iconUrl
      });
    } else {
      logger.error('Chain option not found for chain:', firstCouncil.chain);
    }

    // Set creator value if creationForm exists
    if (firstCouncil.creationForm) {
      setValue('creator', firstCouncil.creationForm.creator);
    }
  }, [organizationsData, setValue, watch, chainOptions]);

  useCouncilDeployFlag(draftId);

  if (isLoading || isLoadingOrgs) {
    return <Skeleton className='h-100 w-100' />;
  }

  const errorToast = (error: Error) => {
    toast({
      title: 'Error fetching organization',
      description: error.message?.slice(0, 100),
      variant: 'destructive',
    });
  };

  const nextStep = findNextInvalidStep(stepValidation, 'details', undefined, requirements);

  // Debug the raw data
  logger.info('Raw organizations data:', organizationsData);

  // Create organization options from the data, handling the data property
  const existingOrganizations = organizationsData?.organizations || [];

  // Map organizations to options, ensuring we handle the data structure correctly
  const mappedOptions = existingOrganizations.map((org: { name: string }) => ({
    value: org.name,
    label: org.name,
  }));

  const organizationOptions: OrganizationOption[] = [CREATE_NEW_ORGANIZATION_OPTION, ...mappedOptions];

  const selectedOrg = watch('organizationName') as OrganizationOption | undefined;
  const showCreateOrgInput = selectedOrg?.value === CREATE_NEW_ORGANIZATION_OPTION.value;

  const selectedExistingOrg = organizationsData?.organizations?.find((org) => org.name === selectedOrg?.value);
  logger.info('Selected existing org:', selectedExistingOrg);
  const isChainDisabled = !canEdit || selectedExistingOrg !== undefined;

  return (
    <Form {...localForm}>
      <form className='flex h-full flex-col space-y-6' onSubmit={handleSubmit(onNext)}>
        <div className='flex-1 space-y-6'>
          <h2 className='text-xl font-bold'>Create your first Council</h2>

          <div className='space-y-2'>
            <Select<OrganizationOption>
              name='organizationName'
              localForm={localForm}
              label='Organization Name'
              subLabel='The name of the organization you are creating councils for.'
              variant='councils'
              options={organizationOptions}
              placeholder='Select an organization'
              isDisabled={!canEdit}
            />

            {showCreateOrgInput && (
              <Input
                name='newOrganizationName'
                localForm={localForm}
                label='New Organization Name'
                variant='councils'
                placeholder='Enter organization name'
                options={{
                  required: showCreateOrgInput,
                }}
                isDisabled={!canEdit}
              />
            )}
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
