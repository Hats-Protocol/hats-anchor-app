/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  IconButton,
  InputGroup,
  InputProps as ChakraInputProps,
  InputRightElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput as ChakraNumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
} from '@chakra-ui/react';
import _ from 'lodash';
import React from 'react';
import {
  Controller,
  // FieldValues,
  RegisterOptions,
  UseFormReturn,
} from 'react-hook-form';
import { GrUndo } from 'react-icons/gr';

export interface CustomNumberInputProps {
  customValidations?: RegisterOptions;
  label?: string | React.ReactNode;
  sublabel?: string;
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
  sublabel,
  customValidations,
  isRequired,
  step = 1,
  variant = 'outline',
}: NumberInputProps) => {
  if (!localForm) return null;

  const {
    control,
    resetField,
    formState: { errors, dirtyFields, defaultValues },
  } = localForm;

  const error = name && errors[name] && errors[name]?.message;

  const isDirty = _.get(dirtyFields, name);

  const onReset = () => {
    if (defaultValues) resetField(name, { keepDirty: false });
  };

  return (
    <FormControl isRequired={isRequired} isInvalid={!!errors[name]}>
      {label && (
        <FormLabel>
          {label}
          {options?.required && '*'}
        </FormLabel>
      )}
      <Stack spacing={2}>
        {sublabel && <FormHelperText>{sublabel}</FormHelperText>}
        <Controller
          control={control}
          name={name}
          rules={customValidations}
          render={({ field: { ref, ...restField } }) => (
            <InputGroup>
              <ChakraNumberInput
                variant={variant}
                step={step}
                min={options?.min || 1}
                max={options?.max}
                {...restField}
              >
                <NumberInputField ref={ref} name={restField.name} />
                {isDirty && (
                  <InputRightElement mr={6}>
                    <IconButton
                      icon={<GrUndo />}
                      aria-label='Reset'
                      onClick={onReset}
                      size='xs'
                      colorScheme='cyan'
                    />
                  </InputRightElement>
                )}
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </ChakraNumberInput>
            </InputGroup>
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
