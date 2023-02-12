/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import {
  ChakraTextarea,
  FormControl,
  FormLabel,
  Stack,
  FormHelperText,
  FormErrorMessage,
  Icon,
  HStack,
  Flex,
  Tooltip,
} from '@chakra-ui/react';

/**
 * Primary UI component for Textarea Input
 */
const Textarea = ({
  label,
  name,
  localForm,
  helperText,
  tooltip,
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = localForm;

  const error = errors[name] && errors[name]?.message;

  return (
    <FormControl>
      <Stack spacing={4}>
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

        <ChakraTextarea {...props} {...register(name)} />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
        {typeof error === 'string' && (
          <FormErrorMessage>Error Message</FormErrorMessage>
        )}
      </Stack>
    </FormControl>
  );
};

export default Textarea;
