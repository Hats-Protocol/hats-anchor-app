/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { ChakraInput, FormControl, FormLabel } from '@chakra-ui/react';

/**
 * Primary Input component for React Hook Form
 *
 * @param label - Label for the input
 * @param name - Name of the input
 * @param type - Type of the input
 * @param localForm - React Hook Form object
 * @returns Input component
 *
 */
const Input = ({ label, name, type, localForm, ...props }) => {
  if (!localForm) return null;
  const { register } = localForm;

  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <ChakraInput type={type} {...props} {...register(name)} />
    </FormControl>
  );
};

export default Input;
