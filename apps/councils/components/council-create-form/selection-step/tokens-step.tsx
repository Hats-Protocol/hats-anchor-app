'use client';

// import { getChainTokens } from '@hatsprotocol/constants';
import { useCouncilForm } from 'contexts';
import { Form, FormLabel, TokenNumberInput, TokenSelect } from 'forms';
// import { toNumber } from 'lodash';
import { GemIcon } from 'lucide-react';
import { StepProps } from 'types';
import { Skeleton } from 'ui';

import { NextStepButton } from '../../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';

export function SelectionTokensStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit, availableTokens } = useCouncilForm();
  const requirements = form.watch('requirements');
  // const selectedChain = form.watch('chain').value;
  // const chainId = toNumber(selectedChain);
  // const availableTokens = getChainTokens(chainId as number);
  // console.log(form.watch('tokenRequirement.address'));

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'tokens', requirements);

  if (isLoading) {
    return <Skeleton className='h-full w-full' />;
  }

  return (
    <Form {...form}>
      <form className='mx-auto flex w-full flex-col space-y-8' onSubmit={form.handleSubmit(onNext)}>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <GemIcon />
            <h2 className='text-2xl font-bold'>Configure Token Requirement</h2>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-8'>
          <div className='w-full space-y-2'>
            <FormLabel className='font-bold'>Minimum Token Balance</FormLabel>
            <TokenNumberInput
              name='tokenRequirement.minimum'
              form={form}
              options={{
                required: true,
                min: 0,
                // step: 0.1,
              }}
              disabled={!canEdit}
            />
          </div>

          <div className='w-full space-y-2'>
            <FormLabel className='font-bold'>Token</FormLabel>
            <TokenSelect name='tokenRequirement.address' localForm={form} options={availableTokens} />
          </div>
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton disabled={!(form.watch('tokenRequirement.minimum') > 0) || !canEdit}>
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>
    </Form>
  );
}
