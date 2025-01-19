'use client';

import {
  Box,
  BoxProps,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  RadioGroup,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { IconType } from 'react-icons';
import { AiOutlineInfoCircle } from 'react-icons/ai';

interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: IconType;
  disabled?: boolean;
}

interface RadioCardProps extends BoxProps {
  name: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  options?: RadioCardOption[];
  textSize?: string;
  defaultValue?: string;
  isRequired?: boolean;
  helperText?: string;
  tooltip?: string;
  subLabel?: string;
  isDisabled?: boolean;
}

const RadioCard = ({
  name,
  label,
  localForm,
  options,
  defaultValue,
  isRequired,
  helperText,
  tooltip,
  subLabel,
  isDisabled,
  textSize = 'sm',
}: RadioCardProps) => {
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
                <Box
                  h='24px'
                  w='24px'
                  bg='primary.500'
                  borderRadius='full'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                >
                  <Icon as={AiOutlineInfoCircle} w={4} h={4} />
                </Box>
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
              <Stack spacing={4}>
                {options?.map((option) => (
                  <Box
                    key={option.value}
                    borderWidth='1px'
                    borderRadius='lg'
                    px={6}
                    py={4}
                    cursor={option.disabled ? 'not-allowed' : 'pointer'}
                    borderColor={field.value === option.value ? 'blue.500' : 'gray.200'}
                    bg={field.value === option.value ? 'blue.50' : 'white'}
                    _hover={{
                      borderColor: option.disabled ? 'gray.200' : 'blue.500',
                    }}
                    onClick={() => !option.disabled && field.onChange(option.value)}
                  >
                    <HStack justify='space-between' width='100%'>
                      <HStack spacing={4} opacity={option.disabled ? 0.5 : 1}>
                        {option.icon && (
                          <Icon
                            as={option.icon}
                            boxSize={6}
                            color={field.value === option.value ? 'blue.500' : 'gray.400'}
                          />
                        )}
                        <Stack spacing={0.5}>
                          <Text fontWeight='semibold' fontSize={textSize}>
                            {option.label}
                          </Text>
                          {option.description && (
                            <Text fontSize='sm' color='gray.500'>
                              {option.description}
                            </Text>
                          )}
                        </Stack>
                      </HStack>
                      {!option.disabled ? (
                        <Checkbox isChecked={field.value === option.value} pointerEvents='none' colorScheme='blue' />
                      ) : (
                        <Text
                          fontSize='2xs'
                          bg='red.50'
                          color='red.500'
                          px={2}
                          py={1}
                          borderRadius='full'
                          fontWeight='medium'
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                          minHeight='20px'
                          whiteSpace='nowrap'
                        >
                          coming soon
                        </Text>
                      )}
                    </HStack>
                  </Box>
                ))}
              </Stack>
            </RadioGroup>
          )}
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
        {typeof error === 'string' && <FormErrorMessage>{error}</FormErrorMessage>}
      </Stack>
    </FormControl>
  );
};

export { RadioCard };
