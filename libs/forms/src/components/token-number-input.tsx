'use client';

import { get } from 'lodash';
import { InfoIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { GrUndo } from 'react-icons/gr';
import { BaseInput, cn, Tooltip } from 'ui';
import { Button } from 'ui';

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
  step?: number;
  disabled?: boolean;
  variant?: 'default' | 'councils';
}

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

function TokenNumberInput({
  name,
  label,
  labelNote,
  subLabel,
  tooltip,
  form,
  options,
  step = 1,
  disabled,
  variant = 'default',
}: TokenNumberInputProps) {
  if (!form) return null;

  const {
    control,
    resetField,
    setValue,
    formState: { dirtyFields, errors },
  } = form;

  const isDirty = get(dirtyFields, name);
  const getErrorMessage = () => {
    const errorMessage = get(errors, name)?.message;
    return typeof errorMessage === 'string' ? errorMessage : null;
  };
  const isError = !!getErrorMessage();

  return (
    <FormField
      name={name}
      control={control}
      render={({ field: { ref, value, ...restField } }) => (
        <FormItem>
          <div className='flex items-center justify-between'>
            {label && (
              <FormLabel className='mb-0'>
                <div className={getVariantStyles(variant).container}>
                  <span className={getVariantStyles(variant).label}>
                    {label}
                    {labelNote && <span className='ml-2 text-sm font-normal text-gray-400'>{labelNote}</span>}
                  </span>
                </div>
              </FormLabel>
            )}

            {tooltip && (
              <Tooltip label={tooltip}>
                <InfoIcon className='h-4 w-4' />
              </Tooltip>
            )}
          </div>

          <FormControl>
            <div className='relative flex items-center'>
              <div className='flex h-9 items-center rounded-l-md border border-gray-200 bg-gray-100 px-2'>Minimum:</div>

              <BaseInput
                className={cn(
                  'transition-colors duration-200 focus:outline-none focus:ring-0',
                  'ml-[-1px] flex-1 rounded-none bg-white',
                  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                  variant === 'default' && [
                    !isError && isDirty && 'border-cyan-500 focus:border-cyan-500',
                    isError && 'border-destructive focus:border-destructive',
                  ],
                )}
                type='number'
                min={options?.min}
                max={options?.max}
                step={step}
                disabled={disabled}
                value={value}
                {...restField}
                ref={ref}
              />

              {isDirty && !disabled && variant === 'default' && (
                <Button
                  aria-label='Reset'
                  onClick={() => resetField(name, { keepDirty: false })}
                  size='xs'
                  className='absolute right-8 top-1 bg-cyan-500'
                >
                  <GrUndo />
                </Button>
              )}

              <NumberInputSteppers
                stepUp={() => {
                  const currentValue = parseFloat(value) || 0;
                  if (currentValue < (options?.max ?? Infinity)) {
                    setValue(name, currentValue + step);
                  }
                }}
                upDisabled={disabled || parseFloat(value) >= (options?.max ?? Infinity)}
                stepDown={() => {
                  const currentValue = parseFloat(value) || 0;
                  if (!disabled && currentValue > (options?.min ?? 0)) {
                    setValue(name, currentValue - step);
                  }
                }}
                downDisabled={disabled || parseFloat(value) <= (options?.min ?? 0)}
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
