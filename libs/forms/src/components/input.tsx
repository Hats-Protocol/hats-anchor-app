'use client';

import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { get } from 'lodash';
import { Info } from 'lucide-react';
import React, { ChangeEvent, ReactNode } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { GrUndo } from 'react-icons/gr';
import { BaseInput, Button, cn, Tooltip } from 'ui';
import { catchEnterKey } from 'utils';
import { useAccount } from 'wagmi';

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from './form';

// TODO errors aren't being bubbled up to formState for some reason

/**
 * Primary Input component for React Hook Form
 *
 * @param label - Label for the input
 * @param name - Name of the input
 * @param type - Type of the input, defaults to text
 * @param options - Options for the input (e.g. required)
 * @param localForm - React Hook Form object
 * @returns Input component
 *
 */
const Input = ({
  label,
  sublabel,
  subLabel,
  subInput,
  name,
  tooltip,
  type = 'text',
  options,
  variant = 'default',
  localForm,
  rightElement,
  leftElement,
  isDisabled,
  resetValue,
  addressButtons,
  placeholder,
  // showNull = true,
  onChange,
  isInvalid,
  readOnly,
  ...props
}: InputProps) => {
  const { address } = useAccount();

  if (!localForm) return null;
  const {
    register,
    trigger,
    resetField,
    setValue,
    watch,
    control,
    formState: { dirtyFields, errors },
  } = localForm;

  const isDirty = get(dirtyFields, name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePaste = async (event: any) => {
    event.preventDefault();
    const pastedValue = event.clipboardData.getData('text');
    setValue(name, pastedValue, { shouldDirty: true });

    await trigger(name);
  };

  const onReset = async () => {
    if (resetValue) {
      setValue(name, resetValue, { shouldDirty: false });

      await trigger(name);
    } else {
      resetField(name, { keepDirty: false });
    }
  };

  const getErrorMessage = () => {
    const errorMessage = get(errors, name)?.message;
    return typeof errorMessage === 'string' ? errorMessage : null;
  };
  // const isError = !!getErrorMessage();

  const setFallback = async () => {
    setValue(name, FALLBACK_ADDRESS, { shouldDirty: true });
  };

  const setMe = async () => {
    setValue(name, address, { shouldDirty: true });
  };

  // allow override onChange handler
  const defaultHandleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(name, e.target.value, { shouldDirty: true, shouldValidate: true });
  };
  const handleChange = onChange || defaultHandleChange;

  const inputLength = watch(name)?.length || 0;
  const maxLength = (options?.maxLength?.valueOf() as { value: number })?.value || 0;

  let rightElementWidth = 0;
  if (isDirty) rightElementWidth += 35;
  if (rightElement) rightElementWidth += 40;
  if (maxLength > 0) rightElementWidth += 30;

  const getVariantStyles = (variant: InputProps['variant'] = 'default') => {
    switch (variant) {
      case 'councils':
        return {
          label: 'font-bold normal-case text-base',
          description: 'text-gray-400',
          container: 'flex items-center justify-between w-full',
          tooltipContainer: 'max-w-md',
        };
      default:
        return {
          label: 'font-normal uppercase',
          description: '',
          container: 'flex items-center gap-1',
          tooltipContainer: 'max-w-xs',
        };
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex-grow'>
          <FormControl className='flex-grow'>
            <div className='flex w-full flex-col gap-1'>
              {label && (
                <FormLabel className='mb-0'>
                  <div className={getVariantStyles(variant).container}>
                    <span className={getVariantStyles(variant).label}>
                      {label}
                      {options?.required && <span className='text-red-500'> *</span>}
                      {sublabel && <span className='ml-2 text-sm font-normal text-gray-400'>{sublabel}</span>}
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

              {/* ADDRESS BUTTONS PRIMARILY FOR ADDRESS INPUT */}
              <div className='flex items-end justify-between gap-10'>
                <div>{typeof subLabel !== 'string' ? subLabel : <FormDescription>{subLabel}</FormDescription>}</div>

                {addressButtons && (
                  <div className='flex justify-end'>
                    <div className='flex gap-2'>
                      {/* {showNull && ( */}
                      <Button size='xs' variant='outline-blue' onClick={setFallback}>
                        Null
                      </Button>
                      {/* )} */}
                      {address && (
                        <Button size='xs' variant='outline-blue' onClick={setMe}>
                          Me
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className='relative'>
                {leftElement && (
                  <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                    {leftElement}
                  </div>
                )}
                <BaseInput
                  type={type}
                  {...register(name, options)}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  onKeyDown={catchEnterKey}
                  {...props}
                  readOnly={readOnly || isDisabled}
                  placeholder={placeholder}
                  className={cn(!!leftElement && 'pl-8', !!rightElement && 'pr-10')}
                  // borderColor={isError ? 'red.500' : isDirty ? 'cyan.500' : undefined} // TODO handle error state border
                />

                <div className={cn('w-full space-y-1', { 'w-[100%]': rightElementWidth })}>
                  <div className='flex w-full items-center justify-between pr-4'>
                    {rightElement && (
                      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                        {rightElement}
                      </div>
                    )}
                    {isDirty && (
                      <Button
                        aria-label='Reset'
                        onClick={onReset}
                        size='xs'
                        disabled={isDisabled}
                        className='absolute inset-y-0 right-1 top-1 bg-cyan-500'
                      >
                        <GrUndo />
                      </Button>
                    )}
                  </div>
                  {maxLength > 0 && (
                    <p
                      className={cn('text-xs', {
                        'text-red-500': maxLength - inputLength < 0,
                      })}
                    >
                      {maxLength - inputLength} characters remaining
                    </p>
                  )}
                </div>

                {typeof subInput !== 'string' ? subInput : <FormDescription>{subInput}</FormDescription>}
                {getErrorMessage() && (
                  <FormDescription className='text-destructive'>{getErrorMessage()}</FormDescription>
                )}
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

interface InputProps {
  label?: string;
  sublabel?: string;
  subLabel?: string | ReactNode;
  subInput?: string | ReactNode;
  name: string;
  tooltip?: string;
  type?: string;
  options?: RegisterOptions;
  variant?: 'default' | 'councils';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  placeholder?: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  defaultValue?: string | number;
  isDisabled?: boolean;
  isInvalid?: boolean;
  resetValue?: string | number;
  addressButtons?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}

export { Input, type InputProps };
