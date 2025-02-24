'use client';

import { Info } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { cn, RadioGroup, RadioGroupItem, Tooltip } from 'ui';

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from './form';

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
  variant?: 'default' | 'councils';
}

const RadioBox = ({
  name,
  label,
  localForm,
  options,
  defaultValue,
  isRequired,
  helperText,
  tooltip,
  subLabel,
  isDisabled,
  textSize = 'sm',
  variant = 'default',
}: RadioBoxProps) => {
  if (!localForm) return null;

  const { control } = localForm;

  const error = localForm.formState.errors[name]?.message;

  const getVariantStyles = (variant: RadioBoxProps['variant'] = 'default') => {
    switch (variant) {
      case 'councils':
        return {
          label: 'text-base font-bold normal-case',
          description: 'text-gray-400',
          container: 'flex items-center justify-between w-full',
          tooltipContainer: 'max-w-md',
        };
      default:
        return {
          label: 'text-sm font-normal uppercase',
          description: '',
          container: 'flex items-center gap-2',
          tooltipContainer: 'max-w-xs',
        };
    }
  };

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <div className='flex flex-col gap-2'>
            {label && (
              <div>
                <div className={getVariantStyles(variant).container}>
                  <FormLabel className='mb-0'>
                    <span className={getVariantStyles(variant).label}>
                      {label}
                      {subLabel && <span className='ml-2 text-sm font-normal text-gray-400'>{subLabel}</span>}
                    </span>
                  </FormLabel>

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
            )}

            <FormControl>
              <RadioGroup disabled={isDisabled} onValueChange={field.onChange} value={field.value}>
                <div className='flex flex-wrap gap-4'>
                  {options?.map((option) => (
                    <FormItem className='flex items-center gap-2 space-y-0' key={option.value}>
                      <FormControl>
                        <RadioGroupItem value={option.value} id={option.value} disabled={option.isDisabled} />
                      </FormControl>
                      <FormLabel
                        className={cn('text-sm', option.isDisabled ? 'cursor-not-allowed' : 'hover:cursor-pointer')}
                        htmlFor={option.value}
                      >
                        {option.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
              </RadioGroup>
            </FormControl>

            {helperText && (
              <FormDescription className={getVariantStyles(variant).description}>{helperText}</FormDescription>
            )}
            {typeof error === 'string' && <FormDescription className='text-destructive'>{error}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  );
};

export { RadioBox };
