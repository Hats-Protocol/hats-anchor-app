import { RadioBox } from 'forms';
import { UseFormReturn } from 'react-hook-form';

import { NumberInput } from './components';

// TO BE USED WITHIN A FORM
export function SignerThresholdSubForm({ form, isDisabled }: { form: UseFormReturn<any>; isDisabled?: boolean }) {
  const { watch } = form;
  const { thresholdType, target, min, maxMembers } = watch();

  const calculateConfirmations = (total: number) => {
    if (thresholdType === 'RELATIVE') {
      return Math.ceil((total * (target || 0)) / 100);
    }
    return watch('confirmationsRequired');
  };
  console.log(thresholdType);

  if (!thresholdType) return null;

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
          isDisabled={isDisabled}
        />
      </div>

      {thresholdType === 'ABSOLUTE' ? (
        <div className='space-y-6'>
          <div className='flex flex-col gap-2'>
            <label className='font-bold'>Confirmations required</label>
            <NumberInput
              name='min'
              localForm={form}
              options={{
                min: 1,
                max: maxMembers,
                required: true,
              }}
              isDisabled={isDisabled}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label className='font-bold'>Total council members</label>
            <NumberInput
              name='maxMembers'
              localForm={form}
              options={{
                min: min,
                required: true,
              }}
              isDisabled={isDisabled}
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
                    name='target'
                    localForm={form}
                    options={{
                      min: 1,
                      max: 100,
                      required: true,
                    }}
                    isDisabled={isDisabled}
                  />
                </div>
              </div>
            </div>
            <div className='flex w-full flex-col gap-y-2'>
              <label className='font-bold'>Minimum confirmations</label>
              <NumberInput
                name='min'
                localForm={form}
                options={{
                  min: 1,
                  max: maxMembers,
                  required: true,
                }}
                isDisabled={isDisabled}
              />
            </div>
          </div>

          <div className='flex w-full flex-col gap-2'>
            <label className='font-bold'>Total council members</label>
            <NumberInput
              name='maxMembers'
              localForm={form}
              helperText={`${calculateConfirmations(maxMembers)} confirmation${calculateConfirmations(maxMembers) > 1 ? 's' : ''} required`}
              options={{
                min: min,
                required: true,
              }}
              isDisabled={isDisabled}
            />
          </div>
        </div>
      )}
    </>
  );
}
