/* eslint-disable react/jsx-props-no-spreading */
import {
  Textarea as ChakraTextarea,
  FormControl,
  FormLabel,
  Stack,
  FormHelperText,
  FormErrorMessage,
  Icon,
  HStack,
  Flex,
  Tooltip,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';

/**
 * Primary UI component for Textarea Input
 */
const Textarea = ({
  label,
  name,
  localForm,
  helperText,
  tooltip,
  headerNote,
  ...props
}: TextareaProps) => {
  const {
    register,
    formState: { errors },
  } = localForm;

  const error = errors[name] && errors[name]?.message;

  return (
    <FormControl>
      <Stack spacing={2}>
        <HStack align='center'>
          {label && (
            <FormLabel m='0' display='contents' alignItems='baseline'>
              {label}
              <Text fontSize={14} color='gray.400'>
                {headerNote}
              </Text>
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

interface TextareaProps {
  label?: string;
  name: string;
  localForm: any;
  helperText?: string;
  tooltip?: string;
  placeholder?: string;
  headerNote?: string;
}
