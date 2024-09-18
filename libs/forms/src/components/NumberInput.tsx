'use client';

import {
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  InputGroup,
  InputProps as ChakraInputProps,
  InputRightAddon,
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
import { ChangeEvent, ReactNode } from 'react';
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
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  rightAddon?: ReactNode;
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
  rightAddon,
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

  const defaultHandleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(name, e.target.value, { shouldDirty: true });
  };

  const handleChange = onChange || defaultHandleChange;

  return (
    <FormControl
      isInvalid={!!errors[name]}
      isRequired={!!_.get(options, 'required')}
    >
      <Stack spacing={2} w='full'>
        {label && (
          <FormLabel mb={0} as={Text} fontSize='sm'>
            {label.toUpperCase()}
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
                min={numOptions?.min !== undefined ? numOptions.min : 0}
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

              {rightAddon && (
                <InputRightAddon px={0}>{rightAddon}</InputRightAddon>
              )}
            </InputGroup>
          )}
        />

        {getErrorMessage() && (
          <Text color='red.500' size='xs'>
            {getErrorMessage()}
          </Text>
        )}
      </Stack>
    </FormControl>
  );
};

export default NumberInput;
