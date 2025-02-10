'use client';

import { ReactNode } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { ReactSelect, ReactSelectOption, ReactSelectProps, Tooltip } from 'ui';

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from './form';

export type SelectProps<TOption extends ReactSelectOption> = {
  label?: string;
  name: string;
  localForm: UseFormReturn<any>;
  options: TOption[];
  placeholder?: string;
  isDisabled?: boolean;
  subLabel?: string | ReactNode;
  info?: string;
  iconClassName?: string;
} & Omit<ReactSelectProps<TOption>, 'value' | 'onChange' | 'options'>;

export const Select = <TOption extends ReactSelectOption>({
  label,
  name,
  localForm,
  options,
  placeholder,
  isDisabled,
  subLabel,
  info,
  iconClassName,
  ...props
}: SelectProps<TOption>) => {
  if (!localForm) return null;

  const { control } = localForm;

  return (
    <FormItem className='w-full'>
      {label && (
        <div className='flex items-center gap-2'>
          <FormLabel className='mb-0 text-sm'>{label.toUpperCase()}</FormLabel>
          {info && (
            <Tooltip label={info}>
              <FaRegQuestionCircle />
            </Tooltip>
          )}
        </div>
      )}

      {typeof subLabel !== 'string' ? subLabel : <FormDescription>{subLabel}</FormDescription>}

      <FormControl>
        <Controller
          name={name}
          control={control}
          render={({ field: { value, onChange, ...field } }) => (
            <ReactSelect<TOption>
              {...field}
              {...props}
              value={options.find((option) => option.value === value?.value)}
              onChange={onChange}
              options={options}
              placeholder={placeholder}
              isDisabled={isDisabled}
              iconClassName={iconClassName}
            />
          )}
        />
      </FormControl>
    </FormItem>
  );
};
