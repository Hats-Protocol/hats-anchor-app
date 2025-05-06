import { UseFormReturn } from 'react-hook-form';

import { NumberInput, RadioBox } from './components';

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
        <RadioBox
          name='thresholdType'
          label='How are decisions made for this council?'
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
          variant='councils'
        />
      </div>

      {thresholdType === 'ABSOLUTE' ? (
        <div className='space-y-6'>
          <div className='flex flex-col gap-2'>
            <NumberInput
              name='min'
              label='Confirmations required'
              localForm={form}
              numOptions={{
                min: 1,
                max: maxMembers,
              }}
              options={{
                required: true,
                min: 1,
                max: maxMembers,
                validate: (value) => {
                  if (!value || !maxMembers) return true;
                  if (value > maxMembers) {
                    return `Cannot require more confirmations (${value}) than total members (${maxMembers})`;
                  }
                  return true;
                },
              }}
              isDisabled={isDisabled}
              variant='councils'
              helperText={`Must be between 1 and ${maxMembers} members`}
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
              <div className='flex'>
                <div className='flex-1'>
                  <NumberInput
                    name='target'
                    label='Confirmations required'
                    localForm={form}
                    numOptions={{
                      min: 1,
                      max: 100,
                    }}
                    options={{
                      required: true,
                      min: 1,
                      max: 100,
                      validate: (value) => {
                        if (!value || !maxMembers) return true;
                        const calculatedConfirmations = Math.ceil((maxMembers * value) / 100);
                        if (calculatedConfirmations > maxMembers) {
                          return `${value}% of ${maxMembers} members (${calculatedConfirmations}) exceeds total members`;
                        }
                        return true;
                      },
                    }}
                    isDisabled={isDisabled}
                    inputClassName='rounded-l-none'
                    helperText={
                      maxMembers
                        ? `${calculateConfirmations(maxMembers)} confirmation${calculateConfirmations(maxMembers) > 1 ? 's' : ''} required (max ${maxMembers})`
                        : 'Enter total council members first'
                    }
                    prefix={
                      <div className='flex items-center justify-center rounded-l-md border border-r-0 bg-gray-50 px-3'>
                        %
                      </div>
                    }
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
              numOptions={{
                min: min || 1,
              }}
              options={{
                required: true,
                min: min || 1,
                validate: (value) => {
                  if (!value || !min) return true;
                  if (min > value) {
                    return `Total members (${value}) must be greater than required confirmations (${min})`;
                  }
                  return true;
                },
              }}
              isDisabled={isDisabled}
              tooltip='The total number of members in the council'
              variant='councils'
              helperText={`Must be at least ${min || 1} ${min === 1 ? 'member' : 'members'} to satisfy confirmation requirements`}
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
