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
  label?: string;
  subLabel?: string;
  name: string;
  localForm: UseFormReturn<any>; // UseFormReturn<FieldValues>;
  options?: RegisterOptions;
  numOptions?: {
    min?: number;
    max?: number;
  };
  placeholder?: string;
  step?: number;
  variant?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
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
  numOptions,
  subLabel,
  step = 1,
  variant = 'outline',
  placeholder,
  onChange,
  isDisabled,
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
    <FormControl
      isInvalid={!!errors[name]}
      isRequired={_.get(options, 'required')}
    >
      <Stack spacing={2} w='full'>
        {label && (
          <FormLabel mb={0}>
            <Text fontSize='sm'>{label.toUpperCase()}</Text>
          </FormLabel>
        )}
        {subLabel && <FormHelperText mt={0}>{subLabel}</FormHelperText>}
        <Controller
          control={control}
          name={name}
          rules={options}
          render={({ field: { ref, ...restField } }) => (
            <InputGroup>
              <ChakraNumberInput
                w='full'
                variant={variant}
                step={step}
                min={numOptions?.min !== undefined ? numOptions?.min : 1}
                max={numOptions?.max}
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
                  disabled={isDisabled}
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
