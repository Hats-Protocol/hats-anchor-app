'use client';

import { ReactNode } from 'react';
import { Controller, RegisterOptions, UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { ReactSelect, ReactSelectOption, ReactSelectProps, Tooltip } from 'ui';

import { FormControl, FormDescription, FormItem, FormLabel } from './form';

// TODO handle required indicator on label

export type SelectProps<TOption extends ReactSelectOption> = {
  label?: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  options: TOption[];
  formOptions?: RegisterOptions;
  placeholder?: string;
  isDisabled?: boolean;
  subLabel?: string | ReactNode;
  sublabel?: string;
  info?: string;
  iconClassName?: string;
  variant?: 'default' | 'councils';
} & Omit<ReactSelectProps<TOption>, 'value' | 'onChange' | 'options'>;

export const Select = <TOption extends ReactSelectOption>({
  label,
  name,
  localForm,
  options,
  formOptions,
  placeholder,
  isDisabled,
  subLabel,
  sublabel,
  info,
  iconClassName,
  variant = 'default',
  ...props
}: SelectProps<TOption>) => {
  if (!localForm) return null;

  const { control } = localForm;

  const getVariantStyles = (variant: SelectProps<TOption>['variant'] = 'default') => {
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
    <FormItem className='w-full'>
      {label && (
        <div className={getVariantStyles(variant).container}>
          <FormLabel className='mb-0'>
            <span className={getVariantStyles(variant).label}>
              {variant === 'councils' ? label : label.toUpperCase()}
              {sublabel && <span className='ml-2 text-sm font-normal text-gray-400'>{sublabel}</span>}
            </span>
          </FormLabel>
          {info && (
            <Tooltip label={info} className={getVariantStyles(variant).tooltipContainer}>
              <FaRegQuestionCircle className='text-gray-400' />
            </Tooltip>
          )}
        </div>
      )}

      {typeof subLabel !== 'string' ? subLabel : <FormDescription>{subLabel}</FormDescription>}

      <FormControl>
        <Controller
          name={name}
          control={control}
          rules={formOptions}
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
