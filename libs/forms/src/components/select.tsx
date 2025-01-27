'use client';

import { ChangeEvent, ReactNode } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { BaseSelect, SelectContent, SelectLabel, SelectTrigger, SelectValue, Tooltip } from 'ui';

import { FormControl, FormField, FormItem } from './form';

// TODO migrate to react-select

/**
 * Primary Select component for React Hook Form
 *
 * @param label - Label to appear above the select
 * @param name - Name used to identify the field in the form state
 * @param options - Register options for the React Hook Form register function (e.g. required, min, max, etc.)
 * @param localForm - React Hook Form object
 * @param children - Select options as `SelectItem` elements
 * @returns Select component
 *
 */
const Select = ({ label, name, options, localForm, children, subLabel, info, onChange, ...props }: SelectProps) => {
  if (!localForm) return null;
  const { setValue, control, watch } = localForm;
  const value = watch(name);

  const handleChange = (value: string) => {
    // TODO handle custom onChange
    // if (onChange) {
    //   onChange(value);
    // }
    setValue(name, value);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='w-full'>
          {label && (
            <div className='flex items-center gap-2'>
              <SelectLabel className='mb-0 text-sm'>{label.toUpperCase()}</SelectLabel>

              {info && (
                <Tooltip label={info}>
                  <FaRegQuestionCircle />
                </Tooltip>
              )}
            </div>
          )}

          {typeof subLabel !== 'string' ? subLabel : <p className='mt-0 text-sm text-slate-700'>{subLabel}</p>}

          <BaseSelect onValueChange={handleChange} value={value}>
            <FormControl>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Select chain' />
              </SelectTrigger>
            </FormControl>
            <SelectContent>{children}</SelectContent>
          </BaseSelect>
        </FormItem>
      )}
    />
  );
};

interface SelectProps {
  label?: string;
  name: string;
  options?: RegisterOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  placeholder?: string;
  defaultValue?: string | number;
  isDisabled?: boolean;
  children: ReactNode;
  subLabel?: string | ReactNode;
  info?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export { Select, type SelectProps };
