/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-props-no-spreading */
import {
  Button,
  Flex,
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
import { useAccount } from 'wagmi';

import { FALLBACK_ADDRESS } from '@/utils/constants';

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
  subInput,
  name,
  tooltip,
  type = 'text',
  options,
  localForm,
  rightElement,
  isDisabled,
  resetValue,
  addressButtons,
  ...props
}: InputProps) => {
  const { address } = useAccount();

  if (!localForm) return null;
  const {
    register,
    resetField,
    setValue,
    formState: { dirtyFields, errors },
  } = localForm;

  const isDirty = _.get(dirtyFields, name);

  const onReset = () => {
    if (resetValue) {
      setValue(name, resetValue, { shouldDirty: true });
    } else {
      resetField(name, { keepDirty: false });
    }
  };

  const getErrorMessage = () => {
    const errorMessage = _.get(errors, name)?.message;
    return typeof errorMessage === 'string' ? errorMessage : null;
  };
  const isError = !!getErrorMessage();

  const resetFallback = () => {
    setValue(name, FALLBACK_ADDRESS, { shouldDirty: true });
  };

  const resetMe = () => {
    setValue(name, address, { shouldDirty: true });
  };

  return (
    <FormControl isDisabled={isDisabled} {...props}>
      <Stack spacing={1} w='100%'>
        {label && (
          // disabled input lessens opacity of FormLabel
          <FormLabel mb={0}>
            <HStack>
              <Text fontSize='sm'>
                {_.toUpper(label)}
                {options?.required && ' *'}
              </Text>
              {tooltip && (
                <Tooltip shouldWrapChildren label={tooltip}>
                  <FaRegQuestionCircle />
                </Tooltip>
              )}
            </HStack>
          </FormLabel>
        )}
        {typeof subLabel !== 'string' ? (
          subLabel
        ) : (
          <Text color='blackAlpha.700' fontSize='sm'>
            {subLabel}
          </Text>
        )}
        {addressButtons && (
          <Flex justify='flex-end'>
            <HStack>
              <Button
                size='xs'
                variant='outline'
                colorScheme='blue.500'
                onClick={resetFallback}
              >
                Reset
              </Button>
              <Button
                size='xs'
                variant='outline'
                colorScheme='blue.500'
                onClick={resetMe}
              >
                Me
              </Button>
            </HStack>
          </Flex>
        )}

        <InputGroup {...props}>
          <ChakraInput
            type={type}
            {...register(name, { ...options, validate: options?.validate })}
            {...props}
            borderColor={isError ? 'red.500' : isDirty ? 'cyan.500' : undefined}
            variant='filled'
          />
          {rightElement && (
            <InputRightElement mr={isDirty ? '28px' : ''}>
              {rightElement}
            </InputRightElement>
          )}
          {isDirty && (
            <InputRightElement>
              <IconButton
                icon={<GrUndo />}
                aria-label='Reset'
                onClick={onReset}
                size='xs'
                isDisabled={isDisabled}
                colorScheme='cyan'
              />
            </InputRightElement>
          )}
        </InputGroup>
        {typeof subInput !== 'string' ? (
          subInput
        ) : (
          <Text color='blackAlpha.700' fontSize='xs'>
            {subInput}
          </Text>
        )}
        {getErrorMessage() && (
          <Text color='red.500' fontSize='xs'>
            {getErrorMessage()}
          </Text>
        )}
      </Stack>
    </FormControl>
  );
};

export default Input;

interface InputProps extends ChakraInputProps {
  label?: string;
  subLabel?: string | ReactNode;
  subInput?: string | ReactNode;
  name: string;
  tooltip?: string;
  type?: string;
  options?: RegisterOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  placeholder?: string;
  rightElement?: React.ReactNode;
  defaultValue?: string | number;
  isDisabled?: boolean;
  resetValue?: string | number;
  addressButtons?: boolean;
}
