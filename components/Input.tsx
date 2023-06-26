/* eslint-disable react/jsx-props-no-spreading */
import {
  Input as ChakraInput,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  InputProps as ChakraInputProps,
} from '@chakra-ui/react';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';

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
  type = 'text',
  options,
  localForm,
  rightElement,
  ...props
}: InputProps) => {
  if (!localForm) return null;
  const { register } = localForm;

  return (
    <FormControl {...props}>
      {label && <FormLabel>{label}</FormLabel>}
      <InputGroup {...props}>
        <ChakraInput type={type} {...register(name, options)} {...props} />
        {rightElement && <InputRightElement>{rightElement}</InputRightElement>}
      </InputGroup>
    </FormControl>
  );
};

export default Input;

interface InputProps extends ChakraInputProps {
  label?: string;
  name: string;
  type?: string;
  options?: object;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  placeholder?: string;
  rightElement?: React.ReactNode;
  defaultValue?: string | number;
  isDisabled?: boolean;
}
