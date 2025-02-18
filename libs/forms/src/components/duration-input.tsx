'use client';

import { find, get, pick, toNumber } from 'lodash';
import { Info } from 'lucide-react';
import React, { useEffect } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { BaseSelect, BaseSelectContent, BaseSelectItem, BaseSelectTrigger, Tooltip } from 'ui';

import { FormControl, FormDescription, FormLabel } from './form';
import { NumberInput } from './number-input';

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
  labelNote,
  subLabel,
  tooltip,
  variant = 'default',
  defaultTimeUnit = 'hours',
  defaultTimeValue = 24,
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
    if (timeValue && timeUnit) {
      const res = calculateSeconds(toNumber(timeValue), timeUnit);
      setValue(name, res, { shouldDirty: true });
    }
    // intentionally not including `setValue` in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeValue, timeUnit, name]);

  useEffect(() => {
    if (!timeUnit) {
      reset({ [`${name}-time-unit`]: defaultTimeUnit, [`${name}-time-value`]: defaultTimeValue });
    }
  }, [name, timeUnit, defaultTimeUnit, defaultTimeValue]);

  const getVariantStyles = (variant: DurationInputProps['variant'] = 'default') => {
    switch (variant) {
      case 'councils':
        return {
          label: 'font-bold normal-case text-base',
          description: 'text-gray-400',
          container: 'flex items-center justify-between w-full',
          tooltipContainer: 'max-w-md',
        };
      default:
        return {
          label: 'font-normal uppercase',
          description: '',
          container: 'flex items-center gap-1',
          tooltipContainer: 'max-w-xs',
        };
    }
  };

  return (
    <FormControl>
      <div className='w-full space-y-1'>
        {label && (
          <FormLabel className='mb-0'>
            <div className={getVariantStyles(variant).container}>
              <span className={getVariantStyles(variant).label}>
                {variant === 'councils' ? label : label.toUpperCase()}
                {isRequired && <span className='text-red-500'> *</span>}
                {labelNote && <span className='ml-2 text-sm font-normal text-gray-400'>{labelNote}</span>}
              </span>

              <div className='flex items-center gap-1'>
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
          </FormLabel>
        )}

        {typeof subLabel !== 'string' ? subLabel : <FormDescription variant={variant}>{subLabel}</FormDescription>}

        <div className='flex w-full flex-col gap-1'>
          <div className='flex w-full'>
            <NumberInput
              name={`${name}-time-value`}
              localForm={localForm}
              placeholder={placeholder}
              options={formOptions}
              variant={variant}
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

          {timeUnit !== 'seconds' && finalValue && (
            <FormDescription variant={variant}>({finalValue} seconds)</FormDescription>
          )}
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
  labelNote?: string;
  subLabel?: string | React.ReactNode;
  tooltip?: string;
  variant?: 'default' | 'councils';
  defaultTimeUnit?: string;
  defaultTimeValue?: number;
}

export { DurationInput, type DurationInputProps };
