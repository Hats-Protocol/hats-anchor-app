'use client';
import { useCouncilForm } from 'contexts';
import { Form, SignerThresholdSubForm } from 'forms';
import { useSearchParams } from 'next/navigation';
import { StepProps } from 'types';
import { LinkButton } from 'ui';

import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

export function ThresholdStep({ onNext }: StepProps) {
  const { form, stepValidation, canEdit } = useCouncilForm();
  const { watch } = form;
  const { requirements } = watch();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');

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
