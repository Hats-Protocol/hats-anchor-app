/* eslint-disable react/jsx-props-no-spreading */
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  InputProps as ChakraInputProps,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import React, { ReactNode, useState } from 'react';
import DatePickerComponent from 'react-datepicker';
import { UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';

// TODO more INTL friendly date formatting

const DatePicker = ({
  label,
  subLabel,
  name,
  info,
  options,
  localForm,
  isDisabled,
  setToZeroUTC,
  showLocalConversion = true,
  ...props
}: DatePickerProps) => {
  const defaultValue = localForm?.getValues(name);
  const [currentValue, setCurrentValue] = useState(defaultValue || new Date());

  if (!localForm) return null;

  const { setValue } = localForm;
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleChange = (d: Date) => {
    if (setToZeroUTC) {
      const utcDate = new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      );
      setCurrentValue(utcDate);
      setValue(name, utcDate, { shouldDirty: true });
    } else {
      setCurrentValue(d);
      setValue(name, d, { shouldDirty: true });
    }
  };

  return (
    <FormControl isDisabled={isDisabled} {...props}>
      <Stack spacing={1} w='100%'>
        <Box>
          {label && (
            <FormLabel mb={0}>
              <HStack>
                <Text fontSize='sm'>
                  {label.toUpperCase()}
                  {options?.required && '*'}
                </Text>
                {info && (
                  <Tooltip shouldWrapChildren label={info}>
                    <FaRegQuestionCircle />
                  </Tooltip>
                )}
              </HStack>
            </FormLabel>
          )}
          {typeof subLabel !== 'string' ? (
            subLabel
          ) : (
            <Text color='blackAlpha.700' fontSize='xs'>
              {subLabel}
              {setToZeroUTC ? '. Will use 0:00:00 UTC for timestamp.' : ''}
            </Text>
          )}
        </Box>
        <DatePickerComponent
          wrapperClassName='chakra-datepicker'
          selected={currentValue}
          onChange={handleChange}
        />
        {showLocalConversion && (
          <HStack color='blackAlpha.800' fontSize='xs' spacing={1}>
            <Text fontWeight={600}>Local Timezone:</Text>
            <Text>{userTz}</Text>
            <Text fontWeight={600}>Current:</Text>
            <Tooltip label={currentValue.toUTCString()} placement='top'>
              <Text>
                {currentValue.toLocaleString()}{' '}
                {`UTC${-currentValue.getTimezoneOffset() / 60}`}
              </Text>
            </Tooltip>
          </HStack>
        )}
      </Stack>
    </FormControl>
  );
};

export default DatePicker;

interface DatePickerProps extends ChakraInputProps {
  label?: string;
  subLabel?: string | ReactNode;
  name: string;
  info?: string;
  options?: {
    required?: boolean;
    pattern?: RegExp;
    min?: number;
    max?: number;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  placeholder?: string;
  defaultValue?: string | number;
  isDisabled?: boolean;
  setToZeroUTC?: boolean;
  showLocalConversion?: boolean;
}
