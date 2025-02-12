'use client';

import { find, get, pick, toNumber } from 'lodash';
import React, { useEffect } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { BaseSelect, BaseSelectContent, BaseSelectItem, BaseSelectTrigger } from 'ui';

import { FormControl, FormLabel } from './form';
import { NumberInput } from './number-input';
// import { Select } from './select';

const timeUnits = [
  { unit: 'seconds', value: 1 },
  { unit: 'minutes', value: 60 },
  { unit: 'hours', value: 3600 },
  { unit: 'days', value: 86400 },
  { unit: 'weeks', value: 604800 },
  { unit: 'months', value: 2592000 }, // = 30 days
  { unit: 'years', value: 31536000 },
];

const DurationInput: React.FC<DurationInputProps> = ({
  name,
  localForm,
  placeholder,
  isRequired,
  formOptions,
  label,
  subLabel,
  // defaultTimeUnit,
}) => {
  const { setValue, watch, reset } = pick(localForm, ['setValue', 'watch', 'reset']);
  const calculateSeconds = (value: number, timeUnit: string) => {
    const unitValue = get(find(timeUnits, { unit: timeUnit }), 'value', 1);
    return String(value * unitValue);
  };

  const timeValue = watch(`${name}-time-value`);
  const timeUnit = watch(`${name}-time-unit`);
  const finalValue = watch(name);

  useEffect(() => {
    if (timeValue && timeUnit !== 'seconds') {
      const res = calculateSeconds(toNumber(timeValue), timeUnit);
      setValue(name, res, { shouldDirty: true });
    }
    // intentionally not including `setValue` in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeValue, timeUnit, name]);
  console.log({ timeUnit });

  useEffect(() => {
    if (!timeUnit) {
      reset({ [`${name}-time-unit`]: 'hours', [`${name}-time-value`]: 24 });
    }
  }, [timeUnit, name, reset]);

  return (
    <FormControl>
      <div className='w-full space-y-1'>
        {label && (
          <FormLabel className='mb-0'>
            <p className='text-sm'>
              {label.toUpperCase()}
              {isRequired && '*'}
            </p>
          </FormLabel>
        )}

        {typeof subLabel !== 'string' ? subLabel : <p className='mt-0 text-xs text-gray-500'>{subLabel}</p>}

        <div className='flex w-full flex-col gap-2 space-y-1'>
          <div className='flex w-full'>
            <NumberInput
              name={`${name}-time-value`}
              localForm={localForm}
              placeholder={placeholder}
              // isRequired={isRequired}
              options={formOptions}
            />

            <div className='w-40'>
              <BaseSelect
                name={`${name}-time-unit`}
                value={timeUnit}
                onValueChange={(value: any) => setValue(`${name}-time-unit`, value)}
              >
                <BaseSelectTrigger className='bg-gray-50'>{timeUnit}</BaseSelectTrigger>
                <BaseSelectContent>
                  {timeUnits.map(({ unit, value }) => (
                    <BaseSelectItem key={unit} value={unit}>
                      {unit}
                    </BaseSelectItem>
                  ))}
                </BaseSelectContent>
              </BaseSelect>
            </div>
          </div>

          {timeUnit !== 'seconds' && finalValue && <p className='text-xs text-gray-700'>({finalValue} seconds)</p>}
        </div>
      </div>
    </FormControl>
  );
};

interface DurationInputProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  placeholder?: string;
  isRequired?: boolean;
  formOptions?: RegisterOptions;
  label?: string;
  subLabel?: string;
  // defaultTimeUnit?: string; // is this easier to handle at the form level with `reset`?
}

export { DurationInput, type DurationInputProps };
