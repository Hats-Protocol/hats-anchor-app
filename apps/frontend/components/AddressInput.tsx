import { Box, FormControl, Text } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';

import Input from './atoms/Input';

type AddressInputProps = {
  name: string;
  label: string;
  subLabel: string | ReactNode;
  // docsLink?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  showResolvedAddress: boolean;
  isDisabled: boolean;
  resolvedAddress: string;
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
}) => (
  <FormControl>
    <Box>
      <Input
        name={name}
        label={label}
        subLabel={subLabel}
        placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
        rightElement={showResolvedAddress && <FaCheck color='green' />}
        localForm={localForm}
        isDisabled={isDisabled}
        addressButtons
      />
      {showResolvedAddress && (
        <Text fontSize='sm' color='gray.500' mt={1}>
          Resolved address: {resolvedAddress}
        </Text>
      )}
    </Box>
  </FormControl>
);

export default AddressInput;
