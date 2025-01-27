'use client';

import { UseFormReturn } from 'react-hook-form';
import { IconType } from 'react-icons';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { BaseCheckbox, cn, RadioGroup, Tooltip } from 'ui';

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from './form';

interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: IconType;
  disabled?: boolean;
}

interface RadioCardProps {
  name: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  options?: RadioCardOption[];
  textSize?: string;
  defaultValue?: string;
  isRequired?: boolean;
  helperText?: string;
  tooltip?: string;
  subLabel?: string;
  isDisabled?: boolean;
}

const RadioCard = ({
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
}: RadioCardProps) => {
  if (!localForm) return null;

  const { control } = localForm;
  const error = localForm.formState.errors[name]?.message;

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <div className='flex flex-col gap-2'>
            <div>
              <div className='flex items-center'>
                {label && <FormLabel className='m-0 text-sm'>{label.toUpperCase()}</FormLabel>}
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
                <div className='flex flex-col gap-4'>
                  {options?.map((option) => {
                    const RawIcon = option.icon;

                    return (
                      <FormLabel
                        key={option.value}
                        className={cn(
                          'flex cursor-pointer rounded-lg border border-gray-200 px-6 py-4',
                          option.disabled && 'cursor-not-allowed',
                          field.value === option.value &&
                            'border-functional-link-primary bg-functional-link-primary/10',
                        )}
                        onClick={() => !option.disabled && field.onChange(option.value)}
                      >
                        <div className='flex w-full items-center justify-between'>
                          <div className={cn('flex gap-4 opacity-100', option.disabled && 'opacity-50')}>
                            {RawIcon && (
                              <RawIcon
                                className={cn(
                                  'my-auto h-6 w-6 text-gray-900',
                                  field.value === option.value && 'text-functional-link-primary',
                                )}
                              />
                            )}
                            <div className='flex flex-col gap-0.5'>
                              <p className={cn('text-sm font-semibold', textSize === 'sm' && 'text-base')}>
                                {option.label}
                              </p>
                              {option.description && <p className='text-sm text-gray-500'>{option.description}</p>}
                            </div>
                          </div>
                          {!option.disabled ? (
                            <BaseCheckbox
                              onCheckedChange={(v) => {
                                field.onChange(option.value);
                              }}
                              checked={field.value === option.value}
                              className='pointer-none text-functional-link-primary'
                            />
                          ) : (
                            <span className='flex min-h-2 items-center justify-center whitespace-nowrap rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-500'>
                              coming soon
                            </span>
                          )}
                        </div>
                      </FormLabel>
                    );
                  })}
                </div>
              </RadioGroup>
            </FormControl>

            {helperText && <FormDescription>{helperText}</FormDescription>}
            {typeof error === 'string' && <FormDescription className='text-destructive'>{error}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  );
};

export { RadioCard };
