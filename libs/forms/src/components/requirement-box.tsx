'use client';

import { UseFormReturn } from 'react-hook-form';
import { IconType } from 'react-icons';
import { BaseCheckbox, cn } from 'ui';

import { FormControl, FormField, FormItem } from './form';

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
            render={({ field }) => (
              <FormItem>
                <div
                  className={cn(
                    'flex flex-col rounded-lg border border-gray-200 px-6 py-4',
                    field.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white',
                    !isDisabled && 'cursor-pointer hover:border-blue-500',
                  )}
                >
                  <div className='flex w-full items-center justify-between'>
                    <div className='flex gap-4'>
                      <Icon className='h-6 w-6' color={field.value ? 'blue.500' : 'gray.900'} />
                      <div className='flex flex-col gap-0.5'>
                        <p className='font-semibold text-gray-900'>{item.title}</p>
                        <p className='text-gray-900'>{item.description}</p>
                      </div>
                    </div>

                    <FormControl>
                      <BaseCheckbox
                        checked={field.value}
                        // TODO check if this works. e.target.value wasn't working in the type
                        onChange={isDisabled ? undefined : () => field.onChange(!field.value)}
                        className='text-blue-500'
                        disabled={isDisabled}
                      />
                    </FormControl>
                  </div>
                </div>
              </FormItem>
            )}
          />
        );
      })}
    </div>
  );
};

export { RequirementBox, type RequirementBoxProps };
