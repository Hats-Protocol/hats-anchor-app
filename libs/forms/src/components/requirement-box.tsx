'use client';

import { UseFormReturn } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BaseCheckbox, cn } from 'ui';

import { FormControl, FormField, FormItem, FormLabel } from './form';

interface RequirementOption {
  key: string;
  icon: IconType;
  title: string;
  description: string;
}

interface RequirementBoxProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  options: RequirementOption[];
  isDisabled?: boolean;
}

const RequirementBox = ({ name, localForm, options, isDisabled }: RequirementBoxProps) => {
  const { control } = localForm;

  return (
    <div className='flex flex-col gap-4'>
      {options.map((item) => {
        const Icon = item.icon;

        return (
          <FormField
            key={item.key}
            name={`${name}.${item.key}`}
            control={control}
            defaultValue={false}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel
                    className={cn(
                      'flex flex-col items-center rounded-lg border border-gray-200 px-6 py-4',
                      field.value
                        ? 'border-functional-link-primary bg-functional-link-primary/10'
                        : 'border-gray-200 bg-white',
                      !isDisabled && 'hover:border-functional-link-primary cursor-pointer',
                    )}
                  >
                    <div className='flex w-full items-center justify-between'>
                      <div className='flex gap-4'>
                        <Icon
                          className={cn('my-auto h-6 w-6 text-gray-900', field.value && 'text-functional-link-primary')}
                        />
                        <div className='flex flex-col gap-0.5'>
                          <p className='font-semibold text-gray-900'>{item.title}</p>
                          <p className='text-sm text-gray-500'>{item.description}</p>
                        </div>
                      </div>

                      <FormControl>
                        <BaseCheckbox
                          checked={field.value}
                          onCheckedChange={isDisabled ? undefined : () => field.onChange(!field.value)}
                          className='text-functional-link-primary'
                          disabled={isDisabled}
                        />
                      </FormControl>
                    </div>
                  </FormLabel>
                </FormItem>
              );
            }}
          />
        );
      })}
    </div>
  );
};

export { RequirementBox, type RequirementBoxProps };
