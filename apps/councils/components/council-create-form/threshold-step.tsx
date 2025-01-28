'use client';
import { useCouncilForm } from 'contexts';
import { Form, SignerThresholdSubForm } from 'forms';
import { useEffect } from 'react';
import { StepProps } from 'types';

import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

export function ThresholdStep({ onNext }: StepProps) {
  const { form, stepValidation, canEdit } = useCouncilForm();
  const { watch, setValue } = form;
  const { requirements, thresholdType, min, target } = watch();

  // useEffect(() => {
  //   if (thresholdType === 'RELATIVE') {
  //     setValue('target', target || 51);
  //   } else if (thresholdType === 'ABSOLUTE') {
  //     setValue('target', min);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [thresholdType]);

  const nextStep = findNextInvalidStep(stepValidation, 'threshold', undefined, requirements);

  return (
    <Form {...form}>
      <form className='flex h-full flex-col space-y-6' onSubmit={form.handleSubmit(onNext)}>
        <div className='flex-1 space-y-6'>
          <div className='space-y-2'>
            <h2 className='text-2xl font-bold'>Signer Threshold</h2>
            <p className='text-sm text-gray-600'>Powered by Safe</p>
          </div>

          <SignerThresholdSubForm form={form} isDisabled={!canEdit} />
        </div>

        <div className='flex justify-end py-6'>
          <NextStepButton disabled={!form.formState.isValid || !canEdit}>
            {getNextStepButtonText(nextStep)}
          </NextStepButton>
        </div>
      </form>
    </Form>
  );
}
