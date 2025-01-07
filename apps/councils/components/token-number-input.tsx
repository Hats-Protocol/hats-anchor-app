'use client';

import {
  InputGroup,
  InputLeftAddon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput as ChakraNumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react';
import { Controller, UseFormReturn } from 'react-hook-form';

interface TokenNumberInputProps {
  name: string;
  form: UseFormReturn<any>;
  options?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
}

export function TokenNumberInput({ name, form, options }: TokenNumberInputProps) {
  return (
    <InputGroup size='md'>
      <InputLeftAddon bg='gray.50' color='gray.600' borderRightRadius='0' px={4} display='flex' alignItems='center'>
        Minimum:
      </InputLeftAddon>
      <Controller
        control={form.control}
        name={name}
        rules={options}
        render={({ field: { ref, ...restField } }) => (
          <ChakraNumberInput flex={1} min={options?.min} max={options?.max} size='md' {...restField}>
            <NumberInputField ref={ref} borderLeftRadius='0' />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </ChakraNumberInput>
        )}
      />
    </InputGroup>
  );
}
