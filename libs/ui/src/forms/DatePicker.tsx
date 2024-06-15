'use client';

/* eslint-disable react/jsx-props-no-spreading */
import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  InputProps as ChakraInputProps,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import _ from 'lodash';
import { ReactNode, useState } from 'react';
import DatePickerComponent from 'react-datepicker';
import { UseFormReturn } from 'react-hook-form';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { formatDate } from 'utils';

// TODO more INTL friendly date formatting on button

const DatePicker = ({
  label,
  subLabel,
  name,
  info,
  options,
  localForm,
  isDisabled,
  setToZeroUTC,
  showLocalConversion = true,
  ...props
}: DatePickerProps) => {
  const { setValue, getValues } = _.pick(localForm, ['setValue', 'getValues']);
  const defaultValue = getValues(name);
  const formDate = new Date();
  const formDefaultValue =
    defaultValue || setToZeroUTC
      ? new Date(
          Date.UTC(
            formDate.getUTCFullYear(),
            formDate.getUTCMonth(),
            formDate.getUTCDate() + 1,
          ),
        )
      : formDate;
  const [currentValue, setCurrentValue] = useState(formDefaultValue);

  if (!localForm) return null;

  // const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleChange = (d: Date) => {
    if (setToZeroUTC) {
      const utcDate = new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
      );
      setCurrentValue(utcDate);
      setValue(name, utcDate, { shouldDirty: true });
    } else {
      setCurrentValue(d);
      setValue(name, d, { shouldDirty: true });
    }
  };

  return (
    <FormControl isDisabled={isDisabled} {...props}>
      <Stack spacing={1} w='100%'>
        <Box>
          {label && (
            <FormLabel mb={0}>
              <HStack>
                <Text size='sm'>
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
            <Text size='xs' variant='light'>
              {subLabel}
              {setToZeroUTC ? '. Will use 0:00:00 UTC for timestamp.' : ''}
            </Text>
          )}
        </Box>
        <DatePickerComponent
          wrapperClassName='chakra-datepicker'
          selected={currentValue}
          onChange={handleChange}
        />
        {showLocalConversion && (
          <HStack color='blackAlpha.800' fontSize='xs' spacing={1}>
            {/* <Text variant='medium'>Local Timezone:</Text>
            <Text>{userTz}</Text> */}
            <Text variant='medium'>Current:</Text>
            <Tooltip label={formatDate(currentValue, true)} placement='top'>
              <Text>{formatDate(currentValue)}</Text>
            </Tooltip>
          </HStack>
        )}
      </Stack>
    </FormControl>
  );
};

export default DatePicker;

interface DatePickerProps extends ChakraInputProps {
  label?: string;
  subLabel?: string | ReactNode;
  name: string;
  info?: string;
  options?: {
    required?: boolean;
    pattern?: RegExp;
    min?: number;
    max?: number;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  placeholder?: string;
  defaultValue?: string | number;
  isDisabled?: boolean;
  setToZeroUTC?: boolean;
  showLocalConversion?: boolean;
}
