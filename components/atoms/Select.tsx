/* eslint-disable react/jsx-props-no-spreading */
import {
  FormControl,
  FormLabel,
  HStack,
  Select as ChakraSelect,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';

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
const Select = ({
  label,
  name,
  options,
  localForm,
  children,
  subLabel,
  info,
  ...props
}: SelectProps) => {
  if (!localForm) return null;
  const { register } = localForm;

  return (
    <FormControl {...props}>
      <Stack spacing={1} w='100%'>
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
        <ChakraSelect
          {...register(name, { ...options, validate: options?.validate })}
          {...props}
        >
          {children}
        </ChakraSelect>
      </Stack>
    </FormControl>
  );
};

export default Select;

interface SelectProps {
  label?: string;
  name: string;
  options?: {
    required?: boolean;
    pattern?: RegExp;
    min?: number;
    max?: number;
    validate?: (value: any) => boolean | string;
  };
  localForm: UseFormReturn<any>;
  placeholder?: string;
  defaultValue?: string | number;
  isDisabled?: boolean;
  children: ReactNode;
  subLabel?: string | ReactNode;
  info?: string;
}
