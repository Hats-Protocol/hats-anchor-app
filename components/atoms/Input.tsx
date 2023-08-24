/* eslint-disable react/jsx-props-no-spreading */
import {
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
import { UseFormReturn } from 'react-hook-form';
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
  name,
  info,
  tip,
  type = 'text',
  options,
  localForm,
  rightElement,
  ...props
}: InputProps) => {
  if (!localForm) return null;
  const {
    register,
    resetField,
    formState: { dirtyFields, defaultValues },
  } = localForm;

  const isDirty = _.get(dirtyFields, name);

  const onReset = () => {
    if (defaultValues) resetField(name, { keepDirty: false });
  };

  return (
    <FormControl {...props}>
      <Stack spacing={1} w='100%'>
        {label && (
          <FormLabel>
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
        {tip && typeof tip === 'string' ? <Text>{tip}</Text> : tip}
        <InputGroup {...props}>
          <ChakraInput
            type={type}
            {...register(name, options)}
            {...props}
            borderColor={isDirty ? 'cyan.500' : undefined}
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
      </Stack>
    </FormControl>
  );
};

export default Input;

interface InputProps extends ChakraInputProps {
  label?: string;
  name: string;
  info?: string;
  tip?: string | ReactNode;
  type?: string;
  options?: {
    required?: boolean;
    pattern?: RegExp;
    min?: number;
    max?: number;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  placeholder?: string;
  rightElement?: React.ReactNode;
  defaultValue?: string | number;
  isDisabled?: boolean;
}
