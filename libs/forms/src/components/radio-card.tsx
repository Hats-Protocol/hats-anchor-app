'use client';

import { UseFormReturn } from 'react-hook-form';
import { IconType } from 'react-icons';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { cn, MemberAvatar, RadioGroup, RadioGroupItem, Tooltip } from 'ui';

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from './form';

interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: IconType;
  disabled?: boolean;
  avatars?: Array<{
    id: string;
    address: string;
    name?: string;
    email?: string;
  }>;
  onSelect?: () => void;
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
      render={({ field: { onChange, value } }) => (
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
              <RadioGroup
                // disabled={isDisabled}
                defaultValue={defaultValue}
                onValueChange={(val) => {
                  const selectedOption = options?.find((opt) => opt.value === val);
                  if (!selectedOption?.disabled && !isDisabled) {
                    selectedOption?.onSelect?.();
                    onChange(val);
                  }
                }}
                value={value}
              >
                <div className='flex flex-col gap-4'>
                  {options?.map((option) => {
                    const RawIcon = option.icon;

                    return (
                      <FormLabel
                        key={option.value}
                        className={cn(
                          'flex cursor-pointer rounded-lg border border-gray-200 px-6 py-4',
                          option.disabled && 'cursor-not-allowed',
                          value === option.value && 'border-functional-link-primary bg-white/90 shadow',
                        )}
                        htmlFor={`${name}-${option.value}`}
                      >
                        <div className='flex w-full items-center gap-3'>
                          <RadioGroupItem
                            id={`${name}-${option.value}`}
                            className='pointer-none text-functional-link-primary'
                            value={option.value}
                            disabled={option.disabled || isDisabled}
                          />

                          <div className={cn('flex w-full gap-4 opacity-100', option.disabled && 'opacity-50')}>
                            {RawIcon && (
                              <RawIcon
                                className={cn(
                                  'my-auto h-6 w-6 text-gray-900',
                                  value === option.value && 'text-functional-link-primary',
                                )}
                              />
                            )}
                            <div className='flex w-full flex-col gap-0.5'>
                              <div className='flex w-full items-center justify-between'>
                                <div>
                                  <p className={cn('text-sm font-medium', textSize === 'sm' && 'text-base')}>
                                    {option.label}
                                  </p>
                                  {option.description && <p className='text-sm font-normal'>{option.description}</p>}
                                </div>

                                {option.avatars && option.avatars.length > 0 && (
                                  <div className='flex -space-x-2'>
                                    {option.avatars.map((avatar) => (
                                      <MemberAvatar
                                        key={avatar.id}
                                        member={avatar}
                                        className='h-6 w-6'
                                        showDetails={false}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {option.disabled && (
                            <span className='flex min-h-2 items-center justify-center whitespace-nowrap rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800'>
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
