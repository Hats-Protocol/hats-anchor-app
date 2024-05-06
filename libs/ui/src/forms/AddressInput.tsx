import { Icon, Stack, Text } from '@chakra-ui/react';
// import _ from 'lodash';
import React, { ReactNode } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { BsPersonBadge } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa';

// import { isAddress } from 'viem';
import Input from './Input';

// const defaultOptions = {
//   validate: {
//     isAddress: (value: string) => {
//       if (!isAddress(value) && _.endsWith(value, '.eth'))
//         return 'Invalid address';
//       return true;
//     },
//   },
// };

type AddressInputProps = {
  name: string;
  label?: string;
  subLabel?: string | ReactNode;
  // docsLink?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  showResolvedAddress?: boolean;
  hideAddressButtons?: boolean;
  isDisabled?: boolean;
  resolvedAddress: string | undefined;
  placeholder?: string;
  options?: RegisterOptions;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

// TODO handle resolving address here

const AddressInput: React.FC<AddressInputProps> = ({
  name,
  label,
  subLabel,
  localForm,
  showResolvedAddress,
  hideAddressButtons,
  isDisabled,
  resolvedAddress,
  placeholder = 'Enter Wallet Address (0x…) or ENS (.eth)',
  options = {}, // { ...defaultOptions },
  onChange,
}) => {
  return (
    <Stack spacing='2px' w='100%'>
      <Input
        name={name}
        label={label}
        subLabel={subLabel}
        placeholder={placeholder}
        leftElement={<Icon as={BsPersonBadge} w={4} h={4} color='gray.500' />}
        rightElement={
          showResolvedAddress && resolvedAddress && <FaCheck color='green' />
        }
        localForm={localForm}
        isDisabled={isDisabled}
        options={options}
        addressButtons={!hideAddressButtons}
        onChange={onChange}
      />
      {showResolvedAddress && resolvedAddress && (
        <Text size='sm' variant='gray' mt={1}>
          Resolved address: {resolvedAddress}
        </Text>
      )}
    </Stack>
  );
};

export default AddressInput;
