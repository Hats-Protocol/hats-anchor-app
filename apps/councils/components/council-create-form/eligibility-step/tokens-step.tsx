'use client';

import { useCouncilForm } from 'contexts';
import { Form, RadioCard, TokenNumberInput, TokenSelect } from 'forms';
import { useCouncilDeployFlag, useOrganization } from 'hooks';
import { toLower } from 'lodash';
import { FilePlus, GemIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
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

export function TokensStep({ onNext, draftId }: StepProps) {
  const { form: councilForm, isLoading, stepValidation, canEdit, availableTokens } = useCouncilForm();
  const { watch: councilFormWatch, getValues: councilFormGetValues, reset } = councilForm;
  const localForm = useForm();
  const { setValue, handleSubmit } = localForm;
  const { requirements, organizationName } = councilFormWatch();
  const { watch } = localForm;
  const tokenRequirement = watch('tokenRequirement');
  logger.info('tokenRequirement', tokenRequirement);

  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization } = useOrganization(orgName);

  useCouncilDeployFlag(draftId);

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'tokens', requirements);

  // Group token requirements from existing councils
  const existingTokenRequirements =
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
    }, []) || [];

  // Initialize selected option based on current token requirement
  const [selectedOption, setSelectedOption] = useState(() => {
    const currentTokenAddress = councilFormGetValues('tokenRequirement.address.value');
    const currentMinimum = councilFormGetValues('tokenRequirement.minimum');

    return existingTokenRequirements.some(
      (req) => req.tokenAddress === currentTokenAddress && req.minimum === currentMinimum?.toString(),
    )
      ? 'existing'
      : 'new';
  });

  console.log('existingTokenRequirements', existingTokenRequirements);

  // Create radio options from existing token requirements and add the "Create new" option
  const tokenOptions = [
    ...existingTokenRequirements.map((requirement) => {
      const token = availableTokens.find((t) => toLower(t.address) === toLower(requirement.tokenAddress));
      return {
        value: requirement.tokenAddress,
        label: `Hold ${requirement.minimum} ${token?.symbol || 'tokens'}`,
        icon: GemIcon as IconType,
        description: requirement.councilName,
        onSelect: () => {
          setSelectedOption('existing');
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
        setSelectedOption('new');
        // Only reset if switching from an existing requirement
        if (selectedOption === 'existing') {
          setValue('tokenRequirement.minimum', 0);
          setValue('tokenRequirement.address', { value: '', label: '' });
        }
      },
    },
  ];

  const submitForm = useCallback(
    async (data: Partial<CouncilFormData>) => {
      // set the current form values to prevent state flashing during transition
      // data contains the latest form values at submission time (as we advance the form)
      reset({ ...councilFormGetValues(), ...data });
      // reset(data);
      await onNext();
    },
    [reset, councilFormGetValues, onNext],
  );

  if (isLoading) {
    return <Skeleton className='h-full w-full' />;
  }
  console.log('localForm', localForm.getValues('tokenRequirement'));

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

          <RadioCard
            name='tokenType'
            localForm={localForm}
            options={tokenOptions}
            isDisabled={!canEdit}
            defaultValue={selectedOption}
          />
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
              disabled={!canEdit || selectedOption === 'existing'}
            />
          </div>

          <div className='w-full space-y-2'>
            <TokenSelect
              name='tokenRequirement.address'
              label='Token Type'
              variant='councils'
              localForm={localForm}
              options={availableTokens}
              isDisabled={!canEdit || selectedOption === 'existing'}
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
