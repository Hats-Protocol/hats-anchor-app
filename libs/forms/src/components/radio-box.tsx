'use client';

import { UseFormReturn } from 'react-hook-form';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { RadioGroup, RadioGroupItem, Tooltip } from 'ui';

import { FormControl, FormDescription, FormField, FormLabel } from './form';

interface RadioOption {
  value: string;
  label: string;
  isDisabled?: boolean;
}

interface RadioBoxProps {
  name: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  options?: RadioOption[];
  textSize?: string;
  defaultValue?: string;
  isRequired?: boolean;
  helperText?: string;
  tooltip?: string;
  subLabel?: string;
  isDisabled?: boolean;
}

const RadioBox = ({
  name,
  label,
  localForm,
  options,
  defaultValue,
  isRequired,
  helperText,
  // maxW,
  tooltip,
  subLabel,
  isDisabled,
  textSize = 'sm',
}: RadioBoxProps) => {
  if (!localForm) return null;

  const { control } = localForm;

  const error = localForm.formState.errors[name]?.message;

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <div className='flex flex-col gap-2'>
          <div>
            <div className='flex items-center gap-2'>
              {label && <FormLabel className='mb-0 text-sm font-normal'>{label.toUpperCase()}</FormLabel>}

              {tooltip && (
                <Tooltip label={tooltip}>
                  <div className='bg-primary-500 flex h-6 w-6 items-center justify-center rounded-full'>
                    <AiOutlineInfoCircle className='h-4 w-4' />
                  </div>
                </Tooltip>
              )}
            </div>

            {subLabel && <FormDescription>{subLabel}</FormDescription>}
          </div>

          <FormControl>
            <RadioGroup disabled={isDisabled} defaultValue={defaultValue} {...field}>
              <div className='flex gap-4'>
                {options?.map((option) => (
                  <RadioGroupItem key={option.value} value={option.value} disabled={option.isDisabled}>
                    <p className='text-sm'>{option.label}</p>
                  </RadioGroupItem>
                ))}
              </div>
            </RadioGroup>
          </FormControl>

          {helperText && <FormDescription>{helperText}</FormDescription>}
          {typeof error === 'string' && <FormDescription className='text-destructive'>{error}</FormDescription>}
        </div>
      )}
    />
  );
};

export { RadioBox };
