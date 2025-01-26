'use client';

import { FormControl, FormField, FormItem } from 'forms';
import { UseFormReturn } from 'react-hook-form';
import { BaseInput } from 'ui';

interface TokenNumberInputProps {
  name: string;
  form: UseFormReturn<any>;
  options?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
  disabled?: boolean;
}

// TODO handle label, tooltip, etc

export function TokenNumberInput({ name, form, options, disabled }: TokenNumberInputProps) {
  return (
    <FormField
      name={name}
      control={form.control}
      render={({ field: { ref, ...restField } }) => (
        <FormItem>
          <FormControl>
            <div className='flex items-center'>
              <div className='flex items-center rounded-l-md border border-gray-200 bg-gray-50 px-4'>Minimum:</div>

              <BaseInput className='flex-1' min={options?.min} max={options?.max} disabled={disabled} {...restField} />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
