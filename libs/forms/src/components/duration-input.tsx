'use client';

import { find, get, pick, toNumber } from 'lodash';
import React, { useEffect } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { SelectItem } from 'ui';

import { FormControl, FormLabel } from './form';
import { NumberInput } from './number-input';
import { Select } from './select';

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
  options,
  label,
  subLabel,
  // defaultTimeUnit,
}) => {
  const { setValue, watch } = pick(localForm, ['setValue', 'watch']);
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

  return (
    <FormControl>
      <div className='w-full'>
        {label && (
          <FormLabel className='mb-0'>
            <p className='text-sm'>
              {label.toUpperCase()}
              {isRequired && '*'}
            </p>
          </FormLabel>
        )}

        {typeof subLabel !== 'string' ? subLabel : <p className='mt-0 text-gray-700'>{subLabel}</p>}

        <div className='flex flex-col gap-2 space-y-1'>
          <div className='flex gap-2'>
            <NumberInput
              name={`${name}-time-value`}
              localForm={localForm}
              // defaultValue={0}
              placeholder={placeholder}
              // isRequired={isRequired}
              options={options}
            />

            <div className='w-40'>
              <Select name={`${name}-time-unit`} localForm={localForm} defaultValue='seconds'>
                {timeUnits.map(({ unit, value }) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </Select>
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
  options?: RegisterOptions;
  label?: string;
  subLabel?: string;
  // defaultTimeUnit?: string; // is this easier to handle at the form level with `reset`?
}

export { DurationInput, type DurationInputProps };
