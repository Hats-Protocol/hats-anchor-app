import { Icon, Stack, Text } from '@chakra-ui/react';
import { useModuleDetails } from 'hats-hooks';
import { useContractData } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import React, { ReactNode, useEffect } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { BsPersonBadge } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { isAddress } from 'viem';
import { useEnsAddress, useEnsName } from 'wagmi';

import Input from './Input';

const CodeIcon = dynamic(() => import('icons').then((mod) => mod.CodeIcon));

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
  chainId: SupportedChains | undefined;
  originalValue?: string;
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
  chainId,
  originalValue,
}) => {
  const { watch, setValue } = _.pick(localForm, ['watch', 'setValue']);
  const inputValue = watch(`${name}-input`);
  const formValue = watch(name);

  const { data: ensName } = useEnsName({
    address: inputValue,
    chainId: 1,
  });
  const { data: resolvedAddress } = useEnsAddress({
    name: inputValue,
    chainId: 1,
  });

  const showResolvedAddress =
    !!resolvedAddress && resolvedAddress !== inputValue;
  const showResolvedEnsName = !!ensName && ensName !== inputValue;

  useEffect(() => {
    if (inputValue || inputValue === '' || !formValue) return;
    setValue(`${name}-input`, formValue);
    // intentionally exclude `setValue` from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, formValue, name]);

  useEffect(() => {
    if (_.endsWith(inputValue, '.eth')) {
      setValue(`${name}`, resolvedAddress, { shouldValidate: true });
    } else if (inputValue === '') {
      setValue(`${name}`, '');
    }
    // intentionally exclude `setValue` from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, resolvedAddress, name]);

  useEffect(() => {
    if (isAddress(inputValue)) {
      if (ensName) {
        setValue(`${name}-name`, ensName);
      }
      setValue(`${name}`, inputValue, { shouldValidate: true });
    }
    // intentionally exclude `setValue` from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, ensName, name]);

  const { data: contractData } = useContractData({
    address: formValue,
    chainId,
    editMode: true,
  });

  const { details: moduleDetails } = useModuleDetails({
    address: formValue,
    chainId,
  });
  const isContract =
    (contractData && contractData?.contractName !== 'MetaMultiSigWallet') ||
    moduleDetails;

  return (
    <Stack spacing='2px' w='100%'>
      <Input
        name={`${name}-input`}
        label={label}
        subLabel={subLabel}
        placeholder={placeholder}
        leftElement={
          <Icon
            as={isContract ? CodeIcon : BsPersonBadge}
            w={4}
            h={4}
            color='gray.500'
          />
        }
        localForm={localForm}
        isDisabled={isDisabled}
        options={options}
        addressButtons={!hideAddressButtons}
        resetValue={originalValue}
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
