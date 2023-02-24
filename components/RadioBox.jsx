/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { UseFormReturn, useController, FieldValues } from 'react-hook-form';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import {
  Box,
  useRadio,
  useRadioGroup,
  HStack,
  VStack,
  ChakraRadioProps,
  useStyleConfig,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Stack,
  Flex,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
// import { Tooltip } from '../../atoms';

const RadioCard = ({ children, variant, size, ...props }) => {
  const styles = useStyleConfig('RadioBox', { variant, size });
  const { getInputProps, getCheckboxProps } = useRadio({ ...props });

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as='label'>
      <input {...input} />
      <Box {...checkbox} __css={styles}>
        {children}
      </Box>
    </Box>
  );
};

const RadioBox = ({
  name,
  label,
  localForm,
  options,
  stack,
  isRequired,
  size,
  helperText,
  tooltip,
}) => {
  if (!localForm) return null;
  const { control } = localForm;
  const {
    field,
    formState: { errors },
  } = useController({
    control,
    name,
    // rules: { required: { value: true, message: "Required field" } }
  });
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    onChange: field.onChange,
    value: field.value,
  });

  const Options = () =>
    options.map((v) => {
      const radio = getRadioProps({ value: v });
      return (
        <RadioCard key={v} size={size} {...radio}>
          {v}
        </RadioCard>
      );
    });

  const group = getRootProps();
  const error = errors[name] && errors[name]?.message;

  return (
    <FormControl isRequired={isRequired} isInvalid={!!errors[name]}>
      <Stack>
        <HStack align='center'>
          {label && <FormLabel m='0'>{label}</FormLabel>}
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
                <Icon as={AiOutlineInfoCircle} w='12px' h='12px' />
              </Flex>
            </Tooltip>
          )}
        </HStack>
        {stack === 'vertical' ? (
          <VStack {...group} alignItems='inherit'>
            <Options />
          </VStack>
        ) : (
          <HStack {...group}>
            <Options />
          </HStack>
        )}
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
        {typeof error === 'string' && (
          <FormErrorMessage>{error}</FormErrorMessage>
        )}
      </Stack>
    </FormControl>
  );
};

export default RadioBox;
