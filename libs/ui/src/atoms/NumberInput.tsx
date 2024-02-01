/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
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
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import React from 'react';
import { Controller, RegisterOptions, UseFormReturn } from 'react-hook-form';
import { GrUndo } from 'react-icons/gr';

export interface CustomNumberInputProps {
  customValidations?: RegisterOptions;
  label?: string;
  subLabel?: string;
  name: string;
  localForm: UseFormReturn<any>; // UseFormReturn<FieldValues>;
  placeholder?: string;
  options?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
  step?: number;
  variant?: string;
  isRequired?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  subLabel,
  customValidations,
  isRequired,
  step = 1,
  variant = 'outline',
  placeholder,
  onChange,
}: NumberInputProps) => {
  if (!localForm) return null;

  const {
    control,
    resetField,
    setValue,
    formState: { errors, dirtyFields },
  } = localForm;

  const isDirty = _.get(dirtyFields, name);

  const onReset = () => {
    resetField(name, { keepDirty: false });
  };
  const getErrorMessage = () => {
    const errorMessage = _.get(errors, name)?.message;
    return typeof errorMessage === 'string' ? errorMessage : null;
  };

  const isError = !!getErrorMessage();

  const defaultHandleChange = (e) => {
    setValue(name, e.target.value, { shouldDirty: true });
  };

  const handleChange = onChange || defaultHandleChange;

  return (
    <FormControl isInvalid={!!errors[name]}>
      <Stack spacing={2} w='full'>
        {label && (
          <FormLabel mb={0}>
            <Text fontSize='sm'>
              {label.toUpperCase()}
              {isRequired && '*'}
            </Text>
          </FormLabel>
        )}
        {subLabel && <FormHelperText mt={0}>{subLabel}</FormHelperText>}
        <Controller
          control={control}
          name={name}
          rules={customValidations}
          render={({ field: { ref, ...restField } }) => (
            <InputGroup>
              <ChakraNumberInput
                w='full'
                variant={variant}
                step={step}
                min={options?.min !== undefined ? options?.min : 1}
                max={options?.max}
                borderColor={
                  isError ? 'red.500' : isDirty ? 'cyan.500' : undefined
                }
                {...restField}
              >
                <NumberInputField
                  ref={ref}
                  onChange={handleChange}
                  name={restField.name}
                  placeholder={placeholder}
                />
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

        {getErrorMessage() && (
          <Text color='red.500' fontSize='xs'>
            {getErrorMessage()}
          </Text>
        )}
      </Stack>
    </FormControl>
  );
};

export default NumberInput;
