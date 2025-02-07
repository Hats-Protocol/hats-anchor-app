import { UseFormReturn } from 'react-hook-form';

import { FormLabel, NumberInput, RadioBox } from './components';

// TO BE USED WITHIN A FORM
function SignerThresholdSubForm({ form, isDisabled }: SignerThresholdSubFormProps) {
  const { watch } = form;
  const { thresholdType, target, min, maxMembers } = watch();

  const calculateConfirmations = (total: number) => {
    if (thresholdType === 'RELATIVE') {
      return Math.ceil((total * (target || 0)) / 100);
    }
    return watch('confirmationsRequired');
  };

  if (!thresholdType) return null;

  return (
    <>
      <div className='space-y-2'>
        <label className='font-bold'>How are decisions made for this council?</label>
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
            <NumberInput
              name='min'
              label='Confirmations required'
              localForm={form}
              options={{
                min: 1,
                max: maxMembers,
                required: true,
              }}
              isDisabled={isDisabled}
              variant='councils'
            />
          </div>

          <div className='flex flex-col gap-2'>
            <NumberInput
              name='maxMembers'
              label='Total council members'
              localForm={form}
              options={{
                min: min,
                required: true,
              }}
              isDisabled={isDisabled}
              tooltip='The total number of members in the council'
              variant='councils'
            />
          </div>
        </div>
      ) : (
        <div className='space-y-6'>
          <div className='flex w-full gap-4'>
            <div className='flex w-full flex-col gap-y-2'>
              <FormLabel className='mb-0'>
                <div className='flex w-full items-center justify-between'>
                  <span className='text-base font-bold normal-case'>
                    Confirmations required
                    <span className='text-red-500'> *</span>
                  </span>
                </div>
              </FormLabel>
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
                    inputClassName='rounded-l-none'
                    variant='councils'
                  />
                </div>
              </div>
            </div>

            <div className='flex w-full flex-col gap-y-2'>
              <NumberInput
                name='min'
                label='Minimum confirmations'
                localForm={form}
                options={{
                  min: 1,
                  max: maxMembers,
                  required: true,
                }}
                isDisabled={isDisabled}
                variant='councils'
              />
            </div>
          </div>

          <div className='flex w-full flex-col gap-2'>
            <NumberInput
              name='maxMembers'
              label='Total council members'
              localForm={form}
              helperText={`${calculateConfirmations(maxMembers)} confirmation${calculateConfirmations(maxMembers) > 1 ? 's' : ''} required`}
              options={{
                min: min,
                required: true,
              }}
              isDisabled={isDisabled}
              tooltip='The total number of members in the council'
              variant='councils'
            />
          </div>
        </div>
      )}
    </>
  );
}

interface SignerThresholdSubFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  isDisabled?: boolean;
}

export { SignerThresholdSubForm };
