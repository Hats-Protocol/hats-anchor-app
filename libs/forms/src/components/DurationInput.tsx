'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import { FormControl, FormHelperText, FormLabel, HStack, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';

import NumberInput from './NumberInput';
import Select from './Select';

const timeUnits = [
  { unit: 'seconds', value: 1 },
  { unit: 'minutes', value: 60 },
  { unit: 'hours', value: 3600 },
  { unit: 'days', value: 86400 },
  { unit: 'weeks', value: 604800 },
  { unit: 'months', value: 2592000 }, // = 30 days
  { unit: 'years', value: 31536000 },
];

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
  const { setValue, watch } = _.pick(localForm, ['setValue', 'watch']);
  const calculateSeconds = (value: number, timeUnit: string) => {
    const unitValue = timeUnits.find((tu) => tu.unit === timeUnit)?.value || 1;
    return String(value * unitValue);
  };

  const timeValue = watch(`${name}-time-value`);
  const timeUnit = watch(`${name}-time-unit`);
  const finalValue = watch(name);

  useEffect(() => {
    if (timeValue && timeUnit !== 'seconds') {
      const res = calculateSeconds(_.toNumber(timeValue), timeUnit);
      setValue(name, res, { shouldDirty: true });
    }
  }, [timeValue, timeUnit]);

  return (
    <FormControl>
      <Stack w='100%'>
        {label && (
          <FormLabel mb={0}>
            <Text size='sm'>
              {label.toUpperCase()}
              {isRequired && '*'}
            </Text>
          </FormLabel>
        )}
        {typeof subLabel !== 'string' ? (
          subLabel
        ) : (
          <FormHelperText mt={0} color='blackAlpha.700'>
            {subLabel}
          </FormHelperText>
        )}
        <Stack spacing={1}>
          <HStack alignItems='end'>
            <NumberInput
              name={`${name}-time-value`}
              localForm={localForm}
              type='number'
              defaultValue={0}
              placeholder={placeholder}
              isRequired={isRequired}
              options={options}
              rightAddon={
                <Select name={`${name}-time-unit`} localForm={localForm} defaultValue='seconds' w='100%'>
                  {timeUnits.map(({ unit, value }) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </Select>
              }
            />
          </HStack>
          {timeUnit !== 'seconds' && finalValue && (
            <Text size='xs' variant='gray'>
              ({finalValue} seconds)
            </Text>
          )}
        </Stack>
      </Stack>
    </FormControl>
  );
};

export default DurationInput;
