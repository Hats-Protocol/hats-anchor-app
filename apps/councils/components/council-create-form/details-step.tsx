'use client';

import { chainsList } from '@hatsprotocol/config';
import { useCouncilForm } from 'contexts';
import { ChainSelect, CreatableSelect, Form, Input, Textarea } from 'forms';
import { useGetOrganizations } from 'hooks';
import { useCouncilDeployFlag } from 'hooks';
import { isEmpty } from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { StepProps } from 'types';
import { MemberAvatar, Skeleton } from 'ui';

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

const chainOptions: ChainOption[] = Object.values(chainsList).map((chain) => ({
  value: chain.id.toString(),
  label: chain.name,
  icon: chain.iconUrl,
}));

export function DetailsStep({ onNext, draftId }: StepProps) {
  const searchParams = useSearchParams();

  const { data: organizationsData, isLoading: isLoadingOrgs } = useGetOrganizations();

  // memoize organization options to prevent infinite renders
  const organizationOptions = useMemo(() => {
    const existingOrganizations = organizationsData?.organizations || [];
    return existingOrganizations.map((org: { name: string }) => ({
      value: org.name,
      label: org.name,
    }));
  }, [organizationsData]);

  const orgParam = searchParams.get('organizationName');
  // get initial organization value from query param
  const initialOrgValue = useMemo(() => {
    if (!organizationsData?.organizations || !orgParam) return undefined;

    const decodedOrgName = decodeURIComponent(orgParam);
    const matchingOrg = organizationsData.organizations.find(
      (org) => org.name.toLowerCase() === decodedOrgName.toLowerCase(),
    );

    if (matchingOrg) {
      return { value: matchingOrg.name, label: matchingOrg.name };
    }
    return undefined;
  }, [organizationsData?.organizations, orgParam]);

  const { form: localForm, isLoading, stepValidation, canEdit } = useCouncilForm();

  const { watch, handleSubmit, reset, setValue } = localForm;
  const requirements = watch('requirements');

  // watch the organization name value for logging
  const organizationNameValue = watch('organizationName') as string | OrganizationOption;

  // update chain when organization changes (either from query param or selection)
  useEffect(() => {
    if (!organizationsData?.organizations || isEmpty(organizationsData?.organizations)) return;

    // Handle initial org from query param
    if (initialOrgValue && !organizationNameValue) {
      const selectedOrg = organizationsData.organizations.find((org) => org.name === initialOrgValue.value);
      if (selectedOrg?.councils?.[0]) {
        const chainId = selectedOrg.councils[0].chain;
        const chainOption = chainOptions.find((option) => Number(option.value) === chainId);
        if (chainOption) {
          reset({
            chain: {
              value: chainOption.value,
              label: chainOption.label,
              icon: chainOption.icon,
            },
            organizationName: {
              value: selectedOrg.name,
              label: selectedOrg.name,
            },
          });
        }
      }
    }
    // Handle org selection from dropdown
    else if (organizationNameValue && typeof organizationNameValue !== 'string') {
      const selectedOrg = organizationsData.organizations.find((org) => org.name === organizationNameValue.value);
      if (selectedOrg?.councils?.[0]) {
        const chainId = selectedOrg.councils[0].chain;
        const chainOption = chainOptions.find((option) => Number(option.value) === chainId);
        if (chainOption) {
          setValue('chain', {
            value: chainOption.value,
            label: chainOption.label,
            icon: chainOption.icon,
          });
        }
      }
    }
  }, [organizationsData, organizationNameValue, initialOrgValue, chainOptions, setValue, reset]);

  useCouncilDeployFlag(draftId);

  if (isLoading || isLoadingOrgs) {
    return <Skeleton className='h-100 w-100' />;
  }

  const nextStep = findNextInvalidStep(stepValidation, 'details', undefined, requirements);

  const selectedOrgValue = watch('organizationName') as unknown as OrganizationOption | null;

  // check if the selected value exists in our original organizations list
  const isExistingOrg =
    selectedOrgValue && organizationsData?.organizations.some((org) => org.name === selectedOrgValue.value);
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
            {selectedExistingOrg ? 'Create a new Council' : 'Create your first Council'}
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
