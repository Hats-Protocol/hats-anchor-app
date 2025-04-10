'use client';

import { useCouncilForm } from 'contexts';
import { Form, FormLabel, RadioCard, TokenNumberInput, TokenSelect } from 'forms';
import { useCouncilDeployFlag, useOrganization } from 'hooks';
import { FilePlus, GemIcon } from 'lucide-react';
import { useEffect } from 'react';
import { IconType } from 'react-icons/lib';
import { StepProps } from 'types';
import { Skeleton } from 'ui';
import { logger } from 'utils';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';

export function SelectionTokensStep({ onNext, draftId }: StepProps) {
  const { form, isLoading, stepValidation, canEdit, availableTokens } = useCouncilForm();
  const requirements = form.watch('requirements');
  const tokenRequirement = form.watch('tokenRequirement');
  const selectedOption = form.watch('agreement');

  const organizationName = form.watch('organizationName') || '';
  const orgName = typeof organizationName === 'string' ? organizationName : organizationName.value;
  const { data: organization } = useOrganization(orgName);

  logger.info('organization', organization);

  useCouncilDeployFlag(draftId);

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'tokens', requirements);

  // Group token requirements from existing councils
  const existingTokenRequirements =
    organization?.councils?.reduce<
      Array<{
        councilName: string;
        tokenAmount: string;
        tokenAddress: string;
      }>
    >((acc, council) => {
      if (council.creationForm?.tokenAmount && council.creationForm?.tokenAddress) {
        return [
          ...acc,
          {
            councilName: council.creationForm.councilName || '',
            tokenAmount: council.creationForm.tokenAmount,
            tokenAddress: council.creationForm.tokenAddress,
          },
        ];
      }
      return acc;
    }, []) || [];

  // Create radio options from existing token requirements and add the "Create new" option
  const tokenOptions = [
    ...existingTokenRequirements.map((requirement) => {
      const token = availableTokens.find((t) => t.address === requirement.tokenAddress);
      return {
        value: JSON.stringify({
          minimum: requirement.tokenAmount,
          address: requirement.tokenAddress,
        }),
        label: `Hold ${requirement.tokenAmount} ${token?.symbol || 'tokens'}`,
        icon: GemIcon as IconType,
        description: requirement.councilName,
      };
    }),
    {
      value: '',
      label: 'Create a new Token Limit',
      icon: FilePlus as IconType,
      description: 'Specify an amount of coins Council Members need to hold',
    },
  ];

  // When token selection changes, update form values
  useEffect(() => {
    if (selectedOption && selectedOption !== '') {
      try {
        const { minimum, address } = JSON.parse(selectedOption);
        const token = availableTokens.find((t) => t.address === address);
        if (token) {
          form.setValue('tokenRequirement', {
            minimum: Number(minimum),
            address: {
              value: token.address,
              label: `${token.name} (${token.symbol})`,
            },
          });
        }
      } catch (e) {
        logger.error('Error parsing selected token requirement', e);
      }
    } else {
      // Reset form values when creating new
      form.setValue('tokenRequirement', {
        minimum: 0,
        address: undefined,
      });
    }
  }, [selectedOption, availableTokens, form]);

  if (isLoading) {
    return <Skeleton className='h-full w-full' />;
  }

  return (
    <Form {...form}>
      <form className='mx-auto flex w-full flex-col space-y-8' onSubmit={form.handleSubmit(onNext)}>
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

          <RadioCard name='agreement' localForm={form} options={tokenOptions} isDisabled={!canEdit} />
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
              disabled={!canEdit}
            />
          </div>

          <div className='w-full space-y-2'>
            <TokenSelect
              name='tokenRequirement.address'
              label='Token Type'
              variant='councils'
              localForm={form}
              options={availableTokens}
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
