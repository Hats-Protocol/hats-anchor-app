import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';

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
  localForm: UseFormReturn<any>;
  placeholder?: string;
  isRequired?: boolean;
  customValidations?: any;
  label?: string;
  subLabel?: string;
}

const DurationInput: React.FC<DurationInputProps> = ({
  name,
  localForm,
  placeholder,
  isRequired,
  customValidations,
  label,
  subLabel,
}) => {
  const calculateSeconds = (value: number, timeUnit: string) => {
    const unitValue = timeUnits.find((tu) => tu.unit === timeUnit)?.value || 1;
    return String(value * unitValue);
  };

  const handleTimeValueChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { value } = event.target;
    localForm.setValue(`${name}-time-value`, value, { shouldDirty: true });
    const timeUnit = localForm.watch(`${name}-time-unit`) || 'minutes';
    const res = calculateSeconds(Number(value), timeUnit);
    localForm.setValue(name, res, { shouldDirty: true });
  };

  const handleTimeUnitChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { value: timeUnit } = event.target;
    localForm.setValue(`${name}-time-unit`, timeUnit, {
      shouldDirty: true,
    });
    const value = localForm.watch(`${name}-time-value`);
    const res = calculateSeconds(Number(value), timeUnit);
    localForm.setValue(name, res, { shouldDirty: true });
  };

  return (
    <FormControl>
      <Stack spacing={2} w='100%'>
        {label && (
          <FormLabel mb={0}>
            <Text fontSize='sm'>
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
        <HStack alignItems='end'>
          <NumberInput
            name={`${name}-time-value`}
            localForm={localForm}
            type='number'
            defaultValue={0}
            onChange={handleTimeValueChange}
            placeholder={placeholder}
            isRequired={isRequired}
            customValidations={customValidations}
          />
          <Select
            name={`${name}-time-unit`}
            localForm={localForm}
            defaultValue='seconds'
            onChange={handleTimeUnitChange}
          >
            {timeUnits.map(({ unit, value }) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
        </HStack>
        {!!Number(localForm.watch(name)) &&
          localForm.watch(`${name}-time-unit`) !== 'seconds' && (
            <Text fontSize='xs' color='gray.500' mt={1}>
              ({localForm.watch(name)} seconds)
            </Text>
          )}
      </Stack>
    </FormControl>
  );
};

export default DurationInput;
