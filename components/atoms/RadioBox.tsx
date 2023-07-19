/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/jsx-props-no-spreading */
import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  Stack,
  Tooltip,
  useRadio,
  useRadioGroup,
  useStyleConfig,
  VStack,
} from '@chakra-ui/react';
import { ReactNode, useEffect } from 'react';
import { useController, UseFormReturn } from 'react-hook-form';
import { AiOutlineInfoCircle } from 'react-icons/ai';

const RadioCard = ({
  children,
  variant = 'outline',
  size,
  value,
  ...props
}: {
  children: ReactNode;
  variant?: string;
  size?: string;
  value: string;
}) => {
  const styles = useStyleConfig('RadioBox', { variant, size });
  const { getInputProps } = useRadio({ ...props });

  const input = getInputProps();

  return (
    <Box as='label'>
      <input {...input} value={value} type='radio' />
      <Box __css={styles}>{children}</Box>
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
  defaultValue,
  tooltip,
}: RadioBoxProps) => {
  if (!localForm) return null;
  const { control, setValue } = localForm;
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

  useEffect(() => {
    if (defaultValue) {
      setValue(name, defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            {options?.map((v) => {
              const radio = getRadioProps({ value: v });
              return (
                <RadioCard key={v} size={size} {...radio} value={v}>
                  {v}
                </RadioCard>
              );
            })}
          </VStack>
        ) : (
          <HStack {...group}>
            {options?.map((v) => {
              const radio = getRadioProps({ value: v });
              return (
                <RadioCard key={v} size={size} {...radio} value={v}>
                  {v}
                </RadioCard>
              );
            })}
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

interface RadioBoxProps {
  name: string;
  label?: string;
  localForm: UseFormReturn;
  options?: string[];
  stack?: string;
  isRequired?: boolean;
  size?: string;
  helperText?: string;
  defaultValue?: string;
  tooltip?: string;
}
