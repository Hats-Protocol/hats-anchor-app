/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-props-no-spreading */
import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input as ChakraInput,
  InputGroup,
  InputProps as ChakraInputProps,
  InputRightElement,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import _ from 'lodash';
import React, { ReactNode } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { GrUndo } from 'react-icons/gr';

/**
 * Primary Input component for React Hook Form
 *
 * @param label - Label for the input
 * @param name - Name of the input
 * @param type - Type of the input, defaults to text
 * @param options - Options for the input (e.g. required)
 * @param localForm - React Hook Form object
 * @returns Input component
 *
 */
const Input = ({
  label,
  subLabel,
  name,
  info,
  tip,
  type = 'text',
  options,
  localForm,
  rightElement,
  isDisabled,
  ...props
}: InputProps) => {
  if (!localForm) return null;
  const {
    register,
    resetField,
    formState: { dirtyFields, errors },
  } = localForm;

  const isDirty = _.get(dirtyFields, name);

  const onReset = () => {
    resetField(name, { keepDirty: false });
  };

  const getErrorMessage = () => {
    const errorMessage = errors[name]?.message;
    return typeof errorMessage === 'string' ? errorMessage : null;
  };
  const isError = !!getErrorMessage();

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
        {tip && typeof tip === 'string' ? <Text>{tip}</Text> : tip}
        <InputGroup {...props}>
          <ChakraInput
            type={type}
            {...register(name, { ...options, validate: options?.validate })}
            {...props}
            borderColor={isError ? 'red.500' : isDirty ? 'cyan.500' : undefined}
            variant='filled'
          />
          {isDirty && (
            <InputRightElement>
              <IconButton
                icon={<GrUndo />}
                aria-label='Reset'
                onClick={onReset}
                size='xs'
                colorScheme='cyan'
              />
            </InputRightElement>
          )}
          {rightElement && (
            <InputRightElement>{rightElement}</InputRightElement>
          )}
        </InputGroup>
        <Text color='red.500' fontSize='xs'>
          {getErrorMessage()}
        </Text>
      </Stack>
    </FormControl>
  );
};

export default Input;

interface InputProps extends ChakraInputProps {
  label?: string;
  subLabel?: string | ReactNode;
  name: string;
  info?: string;
  tip?: string | ReactNode;
  type?: string;
  options?: RegisterOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  placeholder?: string;
  rightElement?: React.ReactNode;
  defaultValue?: string | number;
  isDisabled?: boolean;
}
