'use client';

import { useContractData } from 'hooks';
import { CodeIcon } from 'icons';
import { endsWith, pick } from 'lodash';
import { useModuleDetails } from 'modules-hooks';
import React, { ReactNode, useEffect } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { BsPersonBadge } from 'react-icons/bs';
import { SupportedChains } from 'types';
import { isAddress } from 'viem';
import { useEnsAddress, useEnsName } from 'wagmi';

import { Input } from './input';

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
  labelNote?: string;
  subLabel?: string | ReactNode;
  tooltip?: string;
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
  variant?: 'default' | 'councils';
};

// TODO handle resolving address here

const AddressInput: React.FC<AddressInputProps> = ({
  name,
  label,
  labelNote,
  subLabel,
  tooltip,
  localForm,
  hideAddressButtons,
  isDisabled,
  placeholder = 'Enter Wallet Address (0x…) or ENS (.eth)',
  options = {}, // { ...defaultOptions },
  onChange,
  chainId,
  originalValue,
  variant = 'default',
}) => {
  const { watch, setValue } = pick(localForm, ['watch', 'setValue']);
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

  const showResolvedAddress = !!resolvedAddress && resolvedAddress !== inputValue;
  const showResolvedEnsName = !!ensName && ensName !== inputValue;

  useEffect(() => {
    if (inputValue || inputValue === '' || !formValue) return;
    setValue(`${name}-input`, formValue);
    // intentionally exclude `setValue` from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, formValue, name]);

  useEffect(() => {
    if (endsWith(inputValue, '.eth')) {
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
  // TODO bring this up to actual contract lookup
  const isContract = (contractData && contractData?.contractName !== 'MetaMultiSigWallet') || moduleDetails;

  return (
    <div className='flex w-full flex-col gap-1'>
      <Input
        name={`${name}-input`}
        label={label}
        labelNote={labelNote}
        subLabel={subLabel}
        tooltip={tooltip}
        placeholder={placeholder}
        leftElement={
          isContract ? (
            <CodeIcon className='text-gray.500 h-4 w-4' />
          ) : (
            <BsPersonBadge className='text-gray.500 h-4 w-4' />
          )
        }
        localForm={localForm}
        isDisabled={isDisabled}
        options={options}
        addressButtons={!hideAddressButtons}
        resetValue={originalValue}
        onChange={onChange}
        variant={variant}
      />
      {showResolvedAddress && resolvedAddress && (
        <p className='mt-1 text-xs text-gray-500'>Resolved address: {resolvedAddress}</p>
      )}
      {showResolvedEnsName && ensName && <p className='mt-1 text-sm text-gray-500'>a.k.a. {ensName}</p>}
    </div>
  );
};

export { AddressInput };
