'use client';

import { UseFormReturn } from 'react-hook-form';
import { BaseInput, cn } from 'ui';

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from './form';
import { NumberInputSteppers } from './number-input-steppers';

interface TokenNumberInputProps {
  name: string;
  label?: string;
  labelNote?: string;
  subLabel?: string;
  tooltip?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  options?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
  disabled?: boolean;
  variant?: 'default' | 'councils';
}

function TokenNumberInput({
  name,
  label,
  labelNote,
  subLabel,
  tooltip,
  form,
  options,
  disabled,
  variant = 'default',
}: TokenNumberInputProps) {
  const getVariantStyles = (variant: TokenNumberInputProps['variant'] = 'default') => {
    switch (variant) {
      case 'councils':
        return {
          label: 'font-bold normal-case text-base',
          description: 'text-gray-400',
          container: 'flex items-center justify-between w-full',
          tooltipContainer: 'flex items-center gap-1',
        };
      default:
        return {
          label: 'font-light uppercase',
          description: '',
          container: 'flex items-center gap-1',
        };
    }
  };

  return (
    <FormField
      name={name}
      control={form.control}
      render={({ field: { ref, value, ...restField } }) => (
        <FormItem>
          {label && (
            <FormLabel className='mb-0'>
              <div className={getVariantStyles(variant).container}>
                <span className={getVariantStyles(variant).label}>
                  {label}
                  {options?.required && <span className='text-red-500'> *</span>}
                  {labelNote && <span className='ml-2 text-sm font-normal text-gray-400'>{labelNote}</span>}
                </span>
              </div>
            </FormLabel>
          )}

          <FormControl>
            <div className='flex items-center'>
              <div className='flex h-9 items-center rounded-l-md border border-gray-200 bg-gray-100 px-2'>Minimum:</div>

              <BaseInput
                className={cn('ml-[-1px] flex-1 rounded-none bg-white')}
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

          {subLabel && <FormDescription variant={variant}>{subLabel}</FormDescription>}
        </FormItem>
      )}
    />
  );
}

export { TokenNumberInput };
