/* eslint-disable react/jsx-props-no-spreading */
import {
  FormControl,
  FormHelperText,
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
  onChange,
  ...props
}: SelectProps) => {
  if (!localForm) return null;
  const { register, setValue } = localForm;

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
    setValue(name, e.target.value);
  };

  return (
    <FormControl {...props}>
      <Stack spacing={2} w='100%'>
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
          <FormHelperText mt={0} color='blackAlpha.700'>
            {subLabel}
          </FormHelperText>
        )}
        <ChakraSelect
          {...register(name, { ...options, validate: options?.validate })}
          bg='white'
          color='gray.700'
          iconColor='gray.400'
          onChange={handleChange}
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
    validate?: (value: object) => boolean | string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  placeholder?: string;
  defaultValue?: string | number;
  isDisabled?: boolean;
  children: ReactNode;
  subLabel?: string | ReactNode;
  info?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}
