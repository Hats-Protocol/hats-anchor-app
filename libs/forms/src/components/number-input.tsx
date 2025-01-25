'use client';

import _ from 'lodash';
import { ChangeEvent, ReactNode } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { GrUndo } from 'react-icons/gr';
import { BaseInput, Button, cn } from 'ui';

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from './form';

// TODO re-add stepper controls

export interface NumberInputProps {
  label?: string;
  subLabel?: string;
  helperText?: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  options?: RegisterOptions;
  numOptions?: {
    min?: number;
    max?: number;
  };
  placeholder?: string;
  step?: number;
  variant?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  rightAddon?: ReactNode;
  enableReset?: boolean;
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
  variant = 'outline',
  placeholder,
  onChange,
  isDisabled,
  rightAddon,
  enableReset = true,
}: NumberInputProps) => {
  if (!localForm) return null;

  const {
    control,
    resetField,
    setValue,
    formState: { errors, dirtyFields },
  } = localForm;

  const isDirty = _.get(dirtyFields, name);

  const onReset = () => {
    resetField(name, { keepDirty: false });
  };
  const getErrorMessage = () => {
    const errorMessage = _.get(errors, name)?.message;
    return typeof errorMessage === 'string' ? errorMessage : null;
  };

  const isError = !!getErrorMessage();

  const defaultHandleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(name, e.target.value, { shouldDirty: true });
  };

  const handleChange = onChange || defaultHandleChange;
  // isInvalid={!!errors[name]} isRequired={!!_.get(options, 'required')}
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <div className='flex w-full flex-col gap-2'>
            {label && <FormLabel className='mb-0 text-sm font-normal'>{label.toUpperCase()}</FormLabel>}
            {subLabel && <FormDescription>{subLabel}</FormDescription>}

            <FormControl className='flex'>
              <BaseInput
                className={cn('w-full', {
                  'border-destructive': isError,
                  'border-cyan-500': isDirty,
                })}
                // variant={variant}
                step={step}
                min={numOptions?.min !== undefined ? numOptions.min : 0}
                max={numOptions?.max}
                disabled={isDisabled}
                {...field}
                onChange={handleChange}
              />
              {/* <NumberInputField ref={ref} onChange={handleChange} name={restField.name} placeholder={placeholder} /> */}
              {isDirty && !isDisabled && enableReset && (
                <div className='mr-6'>
                  <Button aria-label='Reset' onClick={onReset} size='xs' className='bg-cyan-500'>
                    <GrUndo />
                  </Button>
                </div>
              )}

              {rightAddon && <div className='px-0'>{rightAddon}</div>}
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
