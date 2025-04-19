'use client';

import { useCouncilForm } from 'contexts';
import { Form, RadioCard, TokenNumberInput, TokenSelect } from 'forms';
import { Organization, useCouncilDeployFlag, useOrganization } from 'hooks';
import { isEmpty, toLower, toNumber } from 'lodash';
import { FilePlus, GemIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IconType } from 'react-icons/lib';
import { CouncilFormData, StepProps } from 'types';
import { Skeleton } from 'ui';
import { logger } from 'utils';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';

interface TokenRequirement {
  id: string;
  councilName: string;
  minimum: string;
  tokenAddress: string;
}

const createTokenRequirementsSelect = (organization: Organization | null | undefined) => {
  return (
    organization?.councils?.reduce<Array<TokenRequirement>>((acc, council) => {
      if (council.creationForm?.tokenAmount && council.creationForm?.tokenAddress) {
        return [
          ...acc,
          {
            id: council.creationForm.id,
            councilName: council.creationForm.councilName || '',
            minimum: council.creationForm.tokenAmount,
            tokenAddress: council.creationForm.tokenAddress,
          },
        ];
      }
      return acc;
    }, []) || []
  );
};

export function TokensStep({ onNext, draftId }: StepProps) {
  const { form: councilForm, isLoading, stepValidation, canEdit, availableTokens } = useCouncilForm();
  const { watch: councilFormWatch, getValues: councilFormGetValues, reset: councilFormReset } = councilForm;
  const localForm = useForm();
  const { setValue, handleSubmit, reset } = localForm;
  const { requirements, organizationName } = councilFormWatch();
  const { watch } = localForm;
  const tokenRequirement = watch('tokenRequirement');
  logger.info('tokenRequirement', tokenRequirement);

  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization, isLoading: isOrgLoading } = useOrganization(orgName);

  useCouncilDeployFlag(draftId);

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'tokens', requirements);

  // Group token requirements from existing councils
  const existingTokenRequirements = createTokenRequirementsSelect(organization);

  // Initialize selected option based on current token requirement
  // const [selectedOption, setSelectedOption] = useState(() => {
  //   const currentTokenAddress = getValues('tokenRequirement.address.value');
  //   const currentMinimum = getValues('tokenRequirement.minimum');

  //   return existingTokenRequirements.some(
  //     (req) => req.tokenAddress === currentTokenAddress && req.minimum === currentMinimum?.toString(),
  //   )
  //     ? `${currentTokenAddress}-${currentMinimum}`
  //     : 'new';
  // });

  // console.log('existingTokenRequirements', existingTokenRequirements, selectedOption);

  // Create radio options from existing token requirements and add the "Create new" option
  const tokenOptions = useMemo(
    () => [
      ...existingTokenRequirements.map((requirement) => {
        const token = availableTokens.find((t) => toLower(t.address) === toLower(requirement.tokenAddress));
        return {
          value: `${requirement.tokenAddress}-${requirement.minimum}`,
          label: `Hold ${requirement.minimum} ${token?.symbol || 'tokens'}`,
          icon: GemIcon as IconType,
          description: requirement.councilName,
          onSelect: () => {
            setValue('tokenType', `${requirement.tokenAddress}-${requirement.minimum}`);
            setValue('tokenRequirement.minimum', parseInt(requirement.minimum));
            setValue('tokenRequirement.address', { value: requirement.tokenAddress, label: token?.symbol || '' });
          },
        };
      }),
      {
        value: 'new',
        label: 'Create a new Token Limit',
        icon: FilePlus as IconType,
        description: 'Specify an amount of coins Council Members need to hold',
        onSelect: () => {
          // Only reset if switching from an existing requirement
          setValue('tokenType', 'new');
          setValue('tokenRequirement.minimum', 0);
          setValue('tokenRequirement.address', { value: '', label: '' });
        },
      },
    ],
    [existingTokenRequirements, availableTokens],
  );

  const submitForm = useCallback(
    async (data: Partial<CouncilFormData>) => {
      // set the current form values to prevent state flashing during transition
      // data contains the latest form values at submission time (as we advance the form)
      console.log('submitForm', data);
      councilFormReset({ ...councilFormGetValues(), ...data });
      // reset(data);
      await onNext();
    },
    [reset, onNext],
  );

  useEffect(() => {
    if (isLoading || isOrgLoading) return;
    const tokenReq = councilFormGetValues('tokenRequirement');
    const existingTokenReq = existingTokenRequirements.find(
      (req) => req.tokenAddress === tokenReq.address?.value && toNumber(req.minimum) === toNumber(tokenReq.minimum),
    );

    if (existingTokenReq) {
      reset({
        tokenRequirement: {
          minimum: tokenReq.minimum,
          address: { value: tokenReq.address?.value, label: tokenReq.address?.label },
        },
        tokenType: `${tokenReq.address?.value}-${tokenReq.minimum}`,
      });
    } else {
      reset({
        tokenRequirement: {
          minimum: tokenReq.minimum,
          address: { value: tokenReq.address?.value, label: tokenReq.address?.label },
        },
        tokenType: 'new',
      });
    }
  }, [councilFormGetValues, isLoading, isOrgLoading, reset]);

  if (isLoading) {
    return <Skeleton className='h-full w-full' />;
  }
  console.log('localForm', localForm.getValues('tokenRequirement'), tokenOptions);

  return (
    <Form {...localForm}>
      <form className='mx-auto flex w-full flex-col space-y-8' onSubmit={handleSubmit(submitForm)}>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <GemIcon />
            <h2 className='text-2xl font-bold'>Hold Tokens</h2>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <h3 className='font-bold'>Which token requirement should Council Members meet?</h3>
            </div>
          </div>

          <RadioCard name='tokenType' localForm={localForm} options={tokenOptions} isDisabled={!canEdit} />
        </div>

        <div className='grid grid-cols-2 gap-8'>
          <div className='w-full space-y-2'>
            <TokenNumberInput
              name='tokenRequirement.minimum'
              label='Token Limit'
              variant='councils'
              form={localForm}
              options={{
                required: true,
                min: 0,
              }}
              disabled={!canEdit || watch('tokenType') !== 'new'}
            />
          </div>

          <div className='w-full space-y-2'>
            <TokenSelect
              name='tokenRequirement.address'
              label='Token Type'
              variant='councils'
              localForm={localForm}
              options={availableTokens}
              isDisabled={!canEdit || watch('tokenType') !== 'new'}
            />
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton disabled={!tokenRequirement?.minimum || !tokenRequirement?.address?.value || !canEdit}>
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>
    </Form>
  );
}
