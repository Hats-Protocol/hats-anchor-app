'use client';

import { pick } from 'lodash';
import { CalendarIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { Button, Calendar, cn, Popover, PopoverContent, PopoverTrigger, Tooltip } from 'ui';
import { formatDate } from 'utils';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './form';

// TODO more INTL friendly date formatting on button

const DatePicker = ({
  label,
  subLabel,
  name,
  info,
  options,
  localForm,
  isDisabled,
  setToZeroUTC,
  showLocalConversion = true,
}: DatePickerProps) => {
  const { setValue, getValues, control } = pick(localForm, ['setValue', 'getValues', 'control']);
  const defaultValue = getValues(name);
  const formDate = new Date();
  const formDefaultValue =
    defaultValue || setToZeroUTC
      ? new Date(Date.UTC(formDate.getUTCFullYear(), formDate.getUTCMonth(), formDate.getUTCDate() + 1))
      : formDate;
  const [currentValue, setCurrentValue] = useState(formDefaultValue);

  if (!localForm) return null;

  // const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleChange = (d: Date) => {
    if (setToZeroUTC) {
      const utcDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      setCurrentValue(utcDate);
      setValue(name, utcDate, { shouldDirty: true });
    } else {
      setCurrentValue(d);
      setValue(name, d, { shouldDirty: true });
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-col'>
          <div className='w-full space-y-2'>
            <div className='flex items-center gap-2'>
              {label && (
                <FormLabel>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm'>
                      {label.toUpperCase()}
                      {options?.required && '*'}
                    </p>
                    {info && (
                      <Tooltip label={info}>
                        <FaRegQuestionCircle />
                      </Tooltip>
                    )}
                  </div>
                </FormLabel>
              )}
              {typeof subLabel !== 'string' ? (
                subLabel
              ) : (
                <FormDescription>
                  {subLabel}
                  {setToZeroUTC ? '. Will use 0:00:00 UTC for timestamp.' : ''}
                </FormDescription>
              )}
            </div>
            <FormControl>
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant='outline'
                    type='button'
                    className={cn('w-[240px] pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                  >
                    {field.value ? formatDate(field.value) : <span>Pick a date</span>}
                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <div>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      // disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </FormControl>
          </div>
        </FormItem>
      )}
    />
  );
};

interface DatePickerProps {
  label?: string;
  subLabel?: string | ReactNode;
  name: string;
  info?: string;
  options?: {
    required?: boolean;
    pattern?: RegExp;
    min?: number;
    max?: number;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  placeholder?: string;
  defaultValue?: string | number;
  isDisabled?: boolean;
  setToZeroUTC?: boolean;
  showLocalConversion?: boolean;
}

export { DatePicker, type DatePickerProps };
