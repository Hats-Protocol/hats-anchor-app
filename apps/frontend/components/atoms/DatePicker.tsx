/* eslint-disable react/jsx-props-no-spreading */
import {
  Box,
  FormControl,
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

const DatePicker = ({
  label,
  subLabel,
  name,
  info,
  options,
  localForm,
  isDisabled,
  setToZeroUTC,
  ...props
}: DatePickerProps) => {
  const defaultValue = localForm?.getValues(name);
  const [currentValue, setCurrentValue] = useState(defaultValue || new Date());

  if (!localForm) return null;

  const { setValue } = localForm;

  const handleChange = (e) => {
    if (setToZeroUTC) {
      const utcDate = new Date(
        Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate()),
      );
      setCurrentValue(utcDate);
      setValue(name, utcDate, { shouldDirty: true });
    } else {
      setCurrentValue(e);
      setValue(name, e, { shouldDirty: true });
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
            </Text>
          )}
        </Box>
        <DatePickerComponent
          wrapperClassName='chakra-datepicker'
          selected={currentValue}
          onChange={handleChange}
        />
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
}
