'use client';
import { useCouncilForm } from 'contexts';
import { NumberInput, RadioBox } from 'forms';

import { NextStepButton } from '../next-step-button';
import { findNextInvalidStep, getNextStepButtonText } from './utils';

export function ThresholdStep({ onNext }: { onNext: () => void }) {
  const { form, stepValidation } = useCouncilForm();
  const requirements = form.watch('requirements');

  const nextStep = findNextInvalidStep(
    stepValidation,
    'threshold',
    undefined,
    requirements,
  );

  const thresholdType = form.watch('thresholdType');
  const percentageRequired = form.watch('percentageRequired');
  const minConfirmations = form.watch('minConfirmations');
  const maxMembers = form.watch('maxMembers');

  const calculateConfirmations = (total: number) => {
    if (thresholdType === 'RELATIVE') {
      return Math.ceil((total * (percentageRequired || 0)) / 100);
    }
    return form.watch('confirmationsRequired');
  };

  return (
    <form
      className='flex h-full flex-col space-y-6'
      onSubmit={form.handleSubmit(onNext)}
    >
      <div className='flex-1 space-y-6'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold'>Signer Threshold</h2>
          <p className='text-sm text-gray-600'>Powered by Safe</p>
        </div>

        <div>
          <label className='font-bold'>
            What&apos;s the Signer Threshold logic
          </label>
          <RadioBox
            name='thresholdType'
            localForm={form}
            options={[
              { label: 'Fixed number of confirmations', value: 'ABSOLUTE' },
              {
                label: 'Fixed percentage of council members',
                value: 'RELATIVE',
              },
            ]}
            textSize='md'
          />
        </div>

        {thresholdType === 'ABSOLUTE' ? (
          <div className='space-y-6'>
            <div className='flex flex-col gap-2'>
              <label className='font-bold'>Confirmations required</label>
              <NumberInput
                name='confirmationsRequired'
                localForm={form}
                options={{
                  min: 1,
                  max: maxMembers,
                  required: true,
                }}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <label className='font-bold'>Total council members</label>
              <NumberInput
                name='maxMembers'
                localForm={form}
                options={{
                  min: 1,
                  required: true,
                }}
              />
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='flex w-full gap-4'>
              <div className='flex w-full flex-col gap-y-2'>
                <label className='font-bold'>Confirmations required</label>
                <div className='flex'>
                  <div className='flex items-center justify-center rounded-l-md border border-r-0 bg-gray-50 px-3'>
                    %
                  </div>
                  <div className='flex-1'>
                    <NumberInput
                      name='percentageRequired'
                      localForm={form}
                      options={{
                        min: 1,
                        max: 100,
                        required: true,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className='flex w-full flex-col gap-y-2'>
                <label className='font-bold'>Minimum confirmations</label>
                <NumberInput
                  name='minConfirmations'
                  localForm={form}
                  options={{
                    min: 1,
                    max: maxMembers,
                    required: true,
                  }}
                />
              </div>
            </div>

            <div className='flex w-full flex-col gap-2'>
              <label className='font-bold'>Total council members</label>
              <NumberInput
                name='maxMembers'
                localForm={form}
                helperText={`${calculateConfirmations(maxMembers)} Confirmations required`}
                options={{
                  min: minConfirmations,
                  required: true,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className='flex justify-end py-6'>
        <NextStepButton disabled={!form.formState.isValid}>
          {getNextStepButtonText(nextStep)}
        </NextStepButton>
      </div>
    </form>
  );
}
