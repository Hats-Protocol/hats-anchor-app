'use client';

import {
  Box,
  BoxProps,
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
  isDisabled?: boolean;
}

interface RadioBoxProps extends BoxProps {
  name: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  options?: RadioOption[];
  textSize?: string;
  defaultValue?: string;
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
  defaultValue,
  isRequired,
  helperText,
  maxW,
  tooltip,
  subLabel,
  isDisabled,
  textSize = 'sm',
}: RadioBoxProps) => {
  if (!localForm) return null;

  const { control } = localForm;

  const error = localForm.formState.errors[name]?.message;

  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      <Stack>
        <Box>
          <HStack align='center'>
            {label && (
              <FormLabel m='0' fontSize='sm'>
                {label.toUpperCase()}
              </FormLabel>
            )}
            {tooltip && (
              <Tooltip label={tooltip} shouldWrapChildren hasArrow placement='end'>
                <Flex h='24px' w='24px' bg='primary.500' borderRadius='full' align='center' justify='center'>
                  <Icon as={AiOutlineInfoCircle} w={4} h={4} />
                </Flex>
              </Tooltip>
            )}
          </HStack>

          {subLabel && <FormHelperText>{subLabel}</FormHelperText>}
        </Box>

        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <RadioGroup isDisabled={isDisabled} defaultValue={defaultValue} {...field}>
              <HStack spacing={4}>
                {options?.map((option) => (
                  <Radio key={option.value} value={option.value} maxW={maxW} isDisabled={option.isDisabled}>
                    <Text size={textSize}>{option.label}</Text>
                  </Radio>
                ))}
              </HStack>
            </RadioGroup>
          )}
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
        {typeof error === 'string' && <FormErrorMessage>{error}</FormErrorMessage>}
      </Stack>
    </FormControl>
  );
};

export { RadioBox };
