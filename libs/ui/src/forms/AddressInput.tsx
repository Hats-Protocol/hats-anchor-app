import { Box, FormControl, Icon, Text } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { BsPersonBadge } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa';

import Input from './Input';

type AddressInputProps = {
  name: string;
  label?: string;
  subLabel?: string | ReactNode;
  // docsLink?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  showResolvedAddress?: boolean;
  isDisabled?: boolean;
  resolvedAddress: string;
  placeholder?: string;
  options?: RegisterOptions;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

// only being used in forms/HatManagementForm.tsx currently (not wearer form)
const AddressInput: React.FC<AddressInputProps> = ({
  name,
  label,
  subLabel,
  localForm,
  showResolvedAddress,
  isDisabled,
  resolvedAddress,
  placeholder = 'Enter Wallet Address (0x…) or ENS (.eth)',
  options = {},
  onChange,
}) => (
  <FormControl>
    <Box>
      <Input
        name={name}
        label={label}
        subLabel={subLabel}
        placeholder={placeholder}
        leftElement={<Icon as={BsPersonBadge} w={4} h={4} color='gray.500' />}
        rightElement={showResolvedAddress && <FaCheck color='green' />}
        localForm={localForm}
        isDisabled={isDisabled}
        options={options}
        addressButtons
        onChange={onChange}
      />
      {showResolvedAddress && (
        <Text size='sm' variant='gray' mt={1}>
          Resolved address: {resolvedAddress}
        </Text>
      )}
    </Box>
  </FormControl>
);

export default AddressInput;
