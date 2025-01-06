'use client';
import { useCouncilForm } from 'contexts';
import { SignerThresholdSubForm } from 'forms';
import { StepProps } from 'types';

import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

export function ThresholdStep({ onNext }: StepProps) {
  const { form, stepValidation } = useCouncilForm();
  const requirements = form.watch('requirements');

  const nextStep = findNextInvalidStep(stepValidation, 'threshold', undefined, requirements);

  return (
    <form className='flex h-full flex-col space-y-6' onSubmit={form.handleSubmit(onNext)}>
      <div className='flex-1 space-y-6'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>Signer Threshold</h2>
          <p className='text-sm text-gray-600'>Powered by Safe</p>
        </div>

        <SignerThresholdSubForm form={form} />
      </div>

      <div className='flex justify-end py-6'>
        <NextStepButton disabled={!form.formState.isValid}>{getNextStepButtonText(nextStep)}</NextStepButton>
      </div>
    </form>
  );
}
