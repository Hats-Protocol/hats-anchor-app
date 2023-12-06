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
import React, { ReactNode } from 'react';
import DatePickerComponent from 'react-datepicker';
import { Controller, UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';

const DatePicker = ({
  label,
  subLabel,
  name,
  info,
  options,
  localForm,
  isDisabled,
  ...props
}: DatePickerProps) => {
  if (!localForm) return null;

  const { control } = localForm;

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
            <Text color='blackAlpha.700'>{subLabel}</Text>
          )}
        </Box>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <DatePickerComponent
              wrapperClassName='chakra-datepicker'
              selected={value ? new Date(value) : new Date()}
              onChange={onChange}
            />
          )}
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
}
