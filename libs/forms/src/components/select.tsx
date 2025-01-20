'use client';

import { ChangeEvent, ReactNode } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { BaseSelect, SelectContent, SelectLabel, SelectTrigger, SelectValue, Tooltip } from 'ui';

import { FormControl, FormField, FormItem } from './form';

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
  // const { register, setValue } = localForm;

  // const handleChange = (e: any) => {
  //   if (onChange) {
  //     onChange(e);
  //   }
  //   setValue(name, e.target.value);
  // };

  return (
    <FormField
      control={localForm.control}
      name='email'
      render={({ field }) => (
        <FormItem>
          <div className='w-full'>
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

            <BaseSelect onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Theme' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>{children}</SelectContent>
            </BaseSelect>
          </div>
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
