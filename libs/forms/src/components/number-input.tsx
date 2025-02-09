'use client';

import { get, toNumber } from 'lodash';
import { Info } from 'lucide-react';
import { ChangeEvent, ReactNode } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { GrUndo } from 'react-icons/gr';
import { BaseInput, Button, cn } from 'ui';
import { Tooltip } from 'ui';

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from './form';
import { NumberInputSteppers } from './number-input-steppers';

// TODO re-add stepper controls

export interface NumberInputProps {
  label?: string;
  subLabel?: string;
  helperText?: string;
  name: string;
  tooltip?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  options?: RegisterOptions;
  numOptions?: {
    min?: number;
    max?: number;
  };
  placeholder?: string;
  step?: number;
  variant?: 'default' | 'councils';
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  rightAddon?: ReactNode;
  enableReset?: boolean;
  inputClassName?: string;
}

/**
 * Primary UI component for Heading
 */
const NumberInput = ({
  name,
  label,
  localForm,
  options,
  numOptions,
  subLabel,
  helperText,
  step = 1,
  variant = 'default',
  placeholder,
  onChange,
  isDisabled,
  enableReset = true,
  inputClassName,
  tooltip,
}: NumberInputProps) => {
  if (!localForm) return null;

  const {
    control,
    resetField,
    setValue,
    formState: { errors, dirtyFields },
  } = localForm;

  const isDirty = get(dirtyFields, name);

  const onReset = () => {
    resetField(name, { keepDirty: false });
  };
  const getErrorMessage = () => {
    const errorMessage = get(errors, name)?.message;
    return typeof errorMessage === 'string' ? errorMessage : null;
  };

  const isError = !!getErrorMessage();

  const defaultHandleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(name, e.target.value, { shouldDirty: true });
  };

  const handleChange = onChange || defaultHandleChange;
  // isInvalid={!!errors[name]} isRequired={!!_.get(options, 'required')}

  const getVariantStyles = (variant: NumberInputProps['variant'] = 'default') => {
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
          label: 'font-normal uppercase',
          description: '',
          container: 'flex items-center gap-1',
        };
    }
  };

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <div className='flex w-full flex-col gap-2'>
            {label && (
              <FormLabel className='mb-0'>
                <div className={getVariantStyles(variant).container}>
                  <span className={getVariantStyles(variant).label}>
                    {label}
                    {options?.required && <span className='text-red-500'> *</span>}
                    {subLabel && <span className='ml-2 text-sm font-normal text-gray-400'>{subLabel}</span>}
                  </span>

                  <div className='flex items-center gap-1'>
                    {tooltip && (
                      <Tooltip
                        label={tooltip}
                        delayDuration={100}
                        className={getVariantStyles(variant).tooltipContainer}
                        side={variant === 'councils' ? 'bottom' : 'top'}
                      >
                        {variant === 'councils' ? (
                          <Info className='h-4 w-4 text-gray-400' />
                        ) : (
                          <FaRegQuestionCircle className='text-gray-400' />
                        )}
                      </Tooltip>
                    )}
                  </div>
                </div>
              </FormLabel>
            )}

            <FormControl className='flex'>
              <div className='relative flex items-center'>
                <BaseInput
                  className={cn(
                    'w-full rounded-r-none',
                    {
                      'border-destructive': isError,
                      'border-cyan-500': isDirty,
                    },
                    inputClassName,
                  )}
                  step={step}
                  min={numOptions?.min ?? 0}
                  max={numOptions?.max ?? Infinity}
                  disabled={isDisabled}
                  {...field}
                  onChange={handleChange}
                />

                {isDirty && !isDisabled && enableReset && (
                  <div className='absolute right-8'>
                    <Button aria-label='Reset' onClick={onReset} size='xs' className='bg-cyan-500'>
                      <GrUndo />
                    </Button>
                  </div>
                )}

                <NumberInputSteppers
                  stepUp={() => {
                    if (field.value < (numOptions?.max ?? Infinity)) {
                      field.onChange(toNumber(field.value) + 1);
                    }
                  }}
                  stepDown={() => {
                    if (field.value > (numOptions?.min ?? 0)) {
                      field.onChange(toNumber(field.value) - 1);
                    }
                  }}
                  upDisabled={field.value >= (numOptions?.max ?? Infinity) || !!isDisabled}
                  downDisabled={field.value <= (numOptions?.min ?? 0) || !!isDisabled}
                />
              </div>
            </FormControl>

            {helperText && <FormDescription>{helperText}</FormDescription>}

            {getErrorMessage() && <FormDescription className='text-destructive'>{getErrorMessage()}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  );
};

export { NumberInput };
