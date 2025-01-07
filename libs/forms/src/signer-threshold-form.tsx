import { NumberInput } from './components';

import { RadioBox } from 'forms';
import { UseFormReturn } from 'react-hook-form';

// TO BE USED WITHIN A FORM
export function SignerThresholdSubForm({ form }: { form: UseFormReturn<any> }) {
  const { watch } = form;
  const thresholdType = watch('thresholdType');
  const percentageRequired = watch('percentageRequired');
  const minConfirmations = watch('minConfirmations');
  const maxMembers = watch('maxMembers');

  const calculateConfirmations = (total: number) => {
    if (thresholdType === 'RELATIVE') {
      return Math.ceil((total * (percentageRequired || 0)) / 100);
    }
    return watch('confirmationsRequired');
  };

  return (
    <>
      <div>
        <label className='font-bold'>What&apos;s the Signer Threshold logic</label>
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
                <div className='flex items-center justify-center rounded-l-md border border-r-0 bg-gray-50 px-3'>%</div>
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
    </>
  );
}
