'use client';
import { useCouncilForm } from 'contexts';
import { Form, SignerThresholdSubForm } from 'forms';
import { useCouncilDeployFlag } from 'hooks';
import { useCallback } from 'react';
import type { CouncilFormData, StepProps } from 'types';

import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

export function ThresholdStep({ onNext, draftId }: StepProps) {
  const { form, stepValidation, canEdit } = useCouncilForm();
  const { watch } = form;
  const { requirements } = watch();

  useCouncilDeployFlag(draftId);

  const nextStep = findNextInvalidStep(stepValidation, 'threshold', undefined, requirements);

  const handleSubmit = useCallback(
    async (data: CouncilFormData) => {
      // set the current form values to prevent state flashing during transition
      // data contains the latest form values at submission time (as we advance the form)
      form.reset(data);
      await onNext();
    },
    [form, onNext],
  );

  return (
    <Form {...form}>
      <form className='flex h-full flex-col space-y-6' onSubmit={form.handleSubmit(handleSubmit)}>
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
