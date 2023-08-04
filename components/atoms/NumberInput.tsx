/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  InputProps as ChakraInputProps,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput as ChakraNumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
} from '@chakra-ui/react';
import React from 'react';
import {
  Controller,
  // FieldValues,
  RegisterOptions,
  UseFormReturn,
} from 'react-hook-form';

export interface CustomNumberInputProps {
  customValidations?: RegisterOptions;
  label?: string | React.ReactNode;
  helperText?: string;
  name: string;
  localForm: UseFormReturn<any>; // UseFormReturn<FieldValues>;
  options?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
  step?: number;
  variant?: string;
}

type NumberInputProps = ChakraInputProps & CustomNumberInputProps;

/**
 * Primary UI component for Heading
 */
const NumberInput = ({
  name,
  label,
  localForm,
  options,
  helperText,
  customValidations,
  isRequired,
  step = 1,
  variant = 'outline',
}: NumberInputProps) => {
  if (!localForm) return null;

  const {
    control,
    formState: { errors },
  } = localForm;

  const error = name && errors[name] && errors[name]?.message;

  return (
    <FormControl isRequired={isRequired} isInvalid={!!errors[name]}>
      {label && (
        <FormLabel>
          {label}
          {options?.required && '*'}
        </FormLabel>
      )}
      <Stack spacing={2}>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
        <Controller
          control={control}
          name={name}
          rules={customValidations}
          render={({ field: { ref, ...restField } }) => (
            <ChakraNumberInput
              variant={variant}
              step={step}
              min={options?.min || 1}
              max={options?.max}
              {...restField}
            >
              <NumberInputField ref={ref} name={restField.name} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </ChakraNumberInput>
          )}
        />
      </Stack>

      {typeof error === 'string' && (
        <FormErrorMessage>{error}</FormErrorMessage>
      )}
    </FormControl>
  );
};

export default NumberInput;
