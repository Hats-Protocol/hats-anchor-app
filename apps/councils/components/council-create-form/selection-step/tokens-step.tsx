'use client';

import { getChainTokens } from '@hatsprotocol/constants';
import { useCouncilForm } from 'contexts';
import { toNumber } from 'lodash';
import { GemIcon } from 'lucide-react';
import { StepProps } from 'types';
import { Skeleton } from 'ui';

import { NextStepButton } from '../../next-step-button';
import { TokenNumberInput } from '../../token-number-input';
import { TokenSelect } from '../../token-select';
import { findNextInvalidStep, getNextStepButtonText } from '../utils';

export function SelectionTokensStep({ onNext }: StepProps) {
  const { form, isLoading, stepValidation, canEdit } = useCouncilForm();
  const requirements = form.watch('requirements');
  const selectedChain = form.watch('chain');
  const chainId = toNumber(selectedChain);
  const availableTokens = getChainTokens(chainId as number);

  const nextStep = findNextInvalidStep(stepValidation, 'selection', 'tokens', requirements);

  if (isLoading) {
    return <Skeleton className='h-full w-full' />;
  }

  return (
    <form className='mx-auto flex w-[600px] flex-col space-y-8 p-8' onSubmit={form.handleSubmit(onNext)}>
      <div className='space-y-2'>
        <div className='flex items-center gap-3'>
          <GemIcon />
          <h2 className='text-2xl font-bold'>Hold Tokens</h2>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-8'>
        <div className='w-full space-y-2'>
          <label className='font-bold'>Token Limit</label>
          <TokenNumberInput
            name='tokenRequirement.minimum'
            form={form}
            options={{
              required: true,
              min: 0,
            }}
            disabled={!canEdit}
          />
        </div>

        <div className='w-full space-y-2'>
          <label className='font-bold'>Token Type</label>
          <TokenSelect name='tokenRequirement.address' form={form} options={availableTokens} disabled={!canEdit} />
        </div>
      </div>

      <div className='flex justify-end py-6'>
        <NextStepButton disabled={!(form.watch('tokenRequirement.minimum') > 0) || !canEdit}>
          {getNextStepButtonText(nextStep)}
        </NextStepButton>
      </div>
    </form>
  );
}
