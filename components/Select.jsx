/* eslint-disable react/jsx-props-no-spreading */
import {
  Select as ChakraSelect,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import React from 'react';

/**
 * Primary Select component for React Hook Form
 *
 * @param label - Label for the select
 * @param name - Name of the select
 * @param options - Options for the select (e.g. required)
 * @param localForm - React Hook Form object
 * @param children - Select options as JSX elements
 * @returns Select component
 *
 */
const Select = ({ label, name, options, localForm, children, ...props }) => {
  if (!localForm) return null;
  const { register } = localForm;

  return (
    <FormControl {...props}>
      {label && <FormLabel>{label}</FormLabel>}
      <ChakraSelect {...register(name, options)} {...props}>
        {children}
      </ChakraSelect>
    </FormControl>
  );
};

export default Select;
