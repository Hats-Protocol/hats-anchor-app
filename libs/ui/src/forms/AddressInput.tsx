import { Icon, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import React, { ReactNode, useEffect } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { BsPersonBadge } from 'react-icons/bs';
// import { FaCheck } from 'react-icons/fa';
import { isAddress } from 'viem';
import { useEnsAddress, useEnsName } from 'wagmi';

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
  hideAddressButtons?: boolean;
  isDisabled?: boolean;
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
  hideAddressButtons,
  isDisabled,
  placeholder = 'Enter Wallet Address (0x…) or ENS (.eth)',
  options = {}, // { ...defaultOptions },
  onChange,
}) => {
  const { watch, setValue } = _.pick(localForm, ['watch', 'setValue']);
  const inputValue = watch(`${name}-input`);
  const formValue = watch(name);

  const { data: ensName } = useEnsName({
    address: inputValue,
    enabled: isAddress(inputValue),
    chainId: 1,
  });
  const { data: resolvedAddress } = useEnsAddress({
    name: inputValue,
    enabled: _.endsWith(inputValue, '.eth'),
    chainId: 1,
  });

  const showResolvedAddress =
    !!resolvedAddress && resolvedAddress !== inputValue;
  const showResolvedEnsName = !!ensName && ensName !== inputValue;

  useEffect(() => {
    if (inputValue || !formValue) return;
    setValue(`${name}-input`, formValue);
    // intentionally exclude `setValue` from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, formValue, name]);

  useEffect(() => {
    if (_.endsWith(inputValue, '.eth')) {
      setValue(`${name}`, resolvedAddress);
    }
    // intentionally exclude `setValue` from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, resolvedAddress, name]);

  useEffect(() => {
    if (isAddress(inputValue)) {
      if (ensName) {
        setValue(`${name}-name`, ensName);
      }
      setValue(`${name}`, inputValue);
    }
    // intentionally exclude `setValue` from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, ensName, name]);

  return (
    <Stack spacing='2px' w='100%'>
      <Input
        name={`${name}-input`}
        label={label}
        subLabel={subLabel}
        placeholder={placeholder}
        leftElement={<Icon as={BsPersonBadge} w={4} h={4} color='gray.500' />}
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
      {showResolvedEnsName && ensName && (
        <Text size='sm' variant='gray' mt={1}>
          a.k.a. {ensName}
        </Text>
      )}
    </Stack>
  );
};

export default AddressInput;
