/* eslint-disable react/jsx-props-no-spreading */
import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { AiOutlineInfoCircle } from 'react-icons/ai';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioBoxProps {
  name: string;
  label?: string;
  localForm: UseFormReturn<any>;
  options?: RadioOption[];
  isRequired?: boolean;
  helperText?: string;
  tooltip?: string;
  subLabel?: string;
  isDisabled?: boolean;
}

const RadioBox = ({
  name,
  label,
  localForm,
  options,
  isRequired,
  helperText,
  tooltip,
  subLabel,
  isDisabled,
}: RadioBoxProps) => {
  if (!localForm) return null;

  const { control } = localForm;

  const error = localForm.formState.errors[name]?.message;

  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      <Stack>
        <HStack align='center'>
          {label && (
            <FormLabel m='0' fontSize='sm'>
              {label.toUpperCase()}
            </FormLabel>
          )}
          {tooltip && (
            <Tooltip
              label={tooltip}
              shouldWrapChildren
              hasArrow
              placement='end'
            >
              <Flex
                h='24px'
                w='24px'
                bg='primary.500'
                borderRadius='full'
                align='center'
                justify='center'
              >
                <Icon as={AiOutlineInfoCircle} w={4} h={4} />
              </Flex>
            </Tooltip>
          )}
        </HStack>

        {subLabel && (
          <Text fontSize='sm' color='blackAlpha.700'>
            {subLabel}
          </Text>
        )}

        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <RadioGroup isDisabled={isDisabled} {...field}>
              <HStack spacing={4}>
                {options?.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    <Text fontSize='sm'>{option.label}</Text>
                  </Radio>
                ))}
              </HStack>
            </RadioGroup>
          )}
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
        {typeof error === 'string' && (
          <FormErrorMessage>{error}</FormErrorMessage>
        )}
      </Stack>
    </FormControl>
  );
};

export default RadioBox;
