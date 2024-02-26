/* eslint-disable react/jsx-props-no-spreading */
import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  Textarea as ChakraTextarea,
  TextareaProps as ChakraTextareaProps,
  Tooltip,
} from '@chakra-ui/react';
import _ from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { GrUndo } from 'react-icons/gr';

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
    resetField,
    formState: { errors, dirtyFields },
  } = localForm;

  const isDirty = dirtyFields[name];

  const onReset = () => {
    resetField(name, { keepDirty: false });
  };

  const error = errors[name] && errors[name]?.message;

  return (
    <FormControl>
      <Stack spacing={2}>
        <HStack align='center'>
          {label && (
            <FormLabel m='0' display='contents' alignItems='baseline' size='sm'>
              {_.toUpper(label)}
              <Text variant='gray'>{headerNote}</Text>
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

        <HStack>
          <InputGroup>
            <ChakraTextarea
              {...props}
              {...register(name)}
              borderColor={isDirty ? 'cyan.500' : undefined}
              variant='filled'
            />
            {isDirty && (
              <InputRightElement>
                <IconButton
                  icon={<GrUndo />}
                  aria-label='Reset'
                  onClick={onReset}
                  size='xs'
                  colorScheme='cyan'
                />
              </InputRightElement>
            )}
          </InputGroup>
        </HStack>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
        {typeof error === 'string' && (
          <FormErrorMessage>Error Message</FormErrorMessage>
        )}
      </Stack>
    </FormControl>
  );
};

export default Textarea;

interface TextareaProps extends ChakraTextareaProps {
  label?: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  helperText?: string;
  tooltip?: string;
  placeholder?: string;
  headerNote?: string;
}
