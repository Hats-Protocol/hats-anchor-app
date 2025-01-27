'use client';

import { UseFormReturn } from 'react-hook-form';
import { BaseInput } from 'ui';

import { FormControl, FormField, FormItem } from './form';
import { NumberInputSteppers } from './number-input-steppers';

interface TokenNumberInputProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  options?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
  disabled?: boolean;
}

// TODO handle label, tooltip, etc

function TokenNumberInput({ name, form, options, disabled }: TokenNumberInputProps) {
  return (
    <FormField
      name={name}
      control={form.control}
      render={({ field: { ref, value, ...restField } }) => (
        <FormItem>
          <FormControl>
            <div className='flex items-center'>
              <div className='flex h-9 items-center rounded-l-md border border-gray-200 bg-gray-50 px-2'>Minimum:</div>

              <BaseInput
                className='ml-[-1px] flex-1 rounded-none'
                min={options?.min}
                max={options?.max}
                disabled={disabled}
                value={value}
                {...restField}
              />

              <NumberInputSteppers
                stepUp={() => {
                  if (value < (options?.max ?? Infinity)) {
                    restField.onChange(value + 1);
                  }
                }}
                upDisabled={value >= (options?.max ?? Infinity)}
                stepDown={() => {
                  if (value > (options?.min ?? 0)) {
                    restField.onChange(value - 1);
                  }
                }}
                downDisabled={value <= (options?.min ?? 0)}
              />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export { TokenNumberInput };
