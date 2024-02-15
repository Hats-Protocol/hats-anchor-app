/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-props-no-spreading */
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input as ChakraInput,
  InputGroup,
  InputLeftElement,
  InputProps as ChakraInputProps,
  InputRightElement,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import _ from 'lodash';
import React, { ChangeEvent, ReactNode } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { GrUndo } from 'react-icons/gr';
import { useAccount } from 'wagmi';

// TODO errors aren't being bubbled up to formState for some reason

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
  leftElement,
  isDisabled,
  resetValue,
  addressButtons,
  onChange,
  ...props
}: InputProps) => {
  const { address } = useAccount();

  if (!localForm) return null;
  const {
    register,
    trigger,
    resetField,
    setValue,
    watch,
    formState: { dirtyFields, errors },
  } = localForm;

  const isDirty = _.get(dirtyFields, name);

  const handlePaste = async (event) => {
    event.preventDefault();
    const pastedValue = event.clipboardData.getData('text');
    setValue(name, pastedValue, { shouldDirty: true });

    await trigger(name);
  };

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

  // allow override onChange handler
  const defaultHandleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(name, e.target.value, { shouldDirty: true });
  };
  const handleChange = onChange || defaultHandleChange;

  const inputLength = watch(name)?.length || 0;
  const maxLength =
    (options?.maxLength?.valueOf() as { value: number })?.value || 0;

  let rightElementWidth = 0;
  if (isDirty) rightElementWidth += 35;
  if (rightElement) rightElementWidth += 40;
  if (maxLength > 0) rightElementWidth += 30;

  return (
    <FormControl isDisabled={isDisabled} {...props}>
      <Stack spacing={1} w='full'>
        {label && (
          // disabled input lessens opacity of FormLabel
          <FormLabel mb={0}>
            <HStack>
              <Text size='sm'>
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
          <Text size='sm' variant='light'>
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
          {leftElement && <InputLeftElement>{leftElement}</InputLeftElement>}
          <ChakraInput
            type={type}
            {...register(name, options)}
            onChange={handleChange}
            onPaste={handlePaste}
            {...props}
            borderColor={isError ? 'red.500' : isDirty ? 'cyan.500' : undefined}
            variant='filled'
          />
          <InputRightElement w={`${rightElementWidth}px`}>
            <Flex w='100%' align='center' justify='space-between' pr={4}>
              {rightElement && <Box>{rightElement}</Box>}
              {isDirty && (
                <IconButton
                  icon={<GrUndo />}
                  aria-label='Reset'
                  onClick={onReset}
                  size='xs'
                  isDisabled={isDisabled}
                  colorScheme='cyan'
                />
              )}
              {maxLength > 0 && (
                <Text
                  size='xs'
                  color={maxLength - inputLength < 0 ? 'red.500' : 'inherit'}
                  variant='light'
                >
                  {maxLength - inputLength}
                </Text>
              )}
            </Flex>
          </InputRightElement>
        </InputGroup>
        {typeof subInput !== 'string' ? (
          subInput
        ) : (
          <Text size='xs' variant='light'>
            {subInput}
          </Text>
        )}
        {getErrorMessage() && (
          <Text color='red.500' size='xs'>
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
  leftElement?: React.ReactNode;
  defaultValue?: string | number;
  isDisabled?: boolean;
  resetValue?: string | number;
  addressButtons?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
