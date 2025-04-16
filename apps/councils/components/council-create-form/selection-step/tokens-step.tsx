'use client';

import { useCouncilForm } from 'contexts';
import { Form, RadioCard, TokenNumberInput, TokenSelect } from 'forms';
import { useCouncilDeployFlag, useOrganization } from 'hooks';
import { FilePlus, GemIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { IconType } from 'react-icons/lib';
import { CouncilFormData, StepProps } from 'types';
import { Skeleton } from 'ui';
import { logger } from 'utils';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';

export function SelectionTokensStep({ onNext, draftId }: StepProps) {
  const { form, isLoading, stepValidation, canEdit, availableTokens } = useCouncilForm();
  const requirements = form.watch('requirements');
  const tokenRequirement = form.watch('tokenRequirement');
  logger.info('tokenRequirement', tokenRequirement);

  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization } = useOrganization(orgName);

  useCouncilDeployFlag(draftId);

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'tokens', requirements);

  // Group token requirements from existing councils
  const existingTokenRequirements =
    organization?.councils?.reduce<
      Array<{
        councilName: string;
        minimum: string;
        tokenAddress: string;
      }>
    >((acc, council) => {
      if (council.creationForm?.tokenAmount && council.creationForm?.tokenAddress) {
        return [
          ...acc,
          {
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
    const currentTokenAddress = form.getValues('tokenRequirement.address.value');
    const currentMinimum = form.getValues('tokenRequirement.minimum');

    return existingTokenRequirements.some(
      (req) => req.tokenAddress === currentTokenAddress && req.minimum === currentMinimum?.toString(),
    )
      ? 'existing'
      : 'new';
  });

  // Create radio options from existing token requirements and add the "Create new" option
  const tokenOptions = [
    ...existingTokenRequirements.map((requirement) => {
      const token = availableTokens.find((t) => t.address === requirement.tokenAddress);
      return {
        value: requirement.tokenAddress,
        label: `Hold ${requirement.minimum} ${token?.symbol || 'tokens'}`,
        icon: GemIcon as IconType,
        description: requirement.councilName,
        onSelect: () => {
          setSelectedOption('existing');
          form.setValue('tokenRequirement.minimum', parseInt(requirement.minimum));
          form.setValue('tokenRequirement.address.value', requirement.tokenAddress);
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
          form.setValue('tokenRequirement.minimum', 0);
          form.setValue('tokenRequirement.address.value', '');
        }
      },
    },
  ];

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
    <Form {...form}>
      <form className='mx-auto flex w-full flex-col space-y-8' onSubmit={form.handleSubmit(handleSubmit)}>
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
            localForm={form}
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
              form={form}
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
              localForm={form}
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
