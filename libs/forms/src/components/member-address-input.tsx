'use client';

import { useContractData } from 'hooks';
import { CodeIcon } from 'icons';
import { useModuleDetails } from 'modules-hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { RegisterOptions, UseFormReturn } from 'react-hook-form';
import { BsPersonBadge } from 'react-icons/bs';
import { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { CouncilMember, SupportedChains } from 'types';
import { MemberAvatar } from 'ui';
import { isAddress } from 'viem';
import { useEnsAddress, useEnsName } from 'wagmi';

type MemberAddressInputProps = {
  name: string;
  label?: string;
  labelNote?: string;
  subLabel?: string | React.ReactNode;
  tooltip?: string;
  localForm: UseFormReturn<any>;
  isDisabled?: boolean;
  placeholder?: string;
  options?: RegisterOptions;
  chainId: SupportedChains | undefined;
  originalValue?: string;
  members: CouncilMember[];
  variant?: 'default' | 'councils';
  onSubmit?: (data: any) => void;
  onClose?: () => void;
};

type MemberOptionProps = {
  member: CouncilMember;
  isSelected?: boolean;
};

type Option = {
  value: string;
  label: string;
  member?: CouncilMember;
  ensName?: string;
};

const MemberOption = ({ member, isSelected }: MemberOptionProps) => {
  const { data: ensName } = useEnsName({
    address: member.address as `0x${string}`,
    chainId: 1,
  });

  return {
    value: member.address,
    label: ensName || member.address,
    member,
    ensName: member.name || '',
    displayName: ensName,
  };
};

const MemberAddressInput: React.FC<MemberAddressInputProps> = ({
  name,
  label,
  labelNote,
  subLabel,

  localForm,
  isDisabled,
  placeholder = 'Search for member or enter wallet address',

  chainId,

  members,
  variant = 'default',
  onSubmit,
  onClose,
}) => {
  const { watch, setValue } = localForm;
  const formValue = watch(name);
  const [ensDetails, setEnsDetails] = useState<{ name: string; address: string } | null>(null);

  // Use ensAddress hook to resolve ENS names
  const { data: resolvedAddress } = useEnsAddress({
    name: formValue,
    chainId: 1,
  });

  // Use ensName hook to get ENS for existing address
  const { data: ensName } = useEnsName({
    address: isAddress(formValue || '') ? (formValue as `0x${string}`) : undefined,
    chainId: 1,
  });

  // Initialize ENS details when editing an existing address
  useEffect(() => {
    if (formValue && isAddress(formValue) && ensName && !ensDetails) {
      setEnsDetails({ name: ensName, address: formValue });
    }
  }, [formValue, ensName, ensDetails]);

  // When ENS resolves, update state and form
  useEffect(() => {
    if (resolvedAddress && formValue && !isAddress(formValue) && formValue.includes('.')) {
      setEnsDetails({ name: formValue, address: resolvedAddress });
      setValue(name, resolvedAddress, { shouldValidate: true });
    }
  }, [resolvedAddress, formValue, setValue, name]);

  // Clear ENS details when form value is manually changed
  useEffect(() => {
    if (ensDetails && formValue && formValue !== ensDetails.address && !ensName) {
      setEnsDetails(null);
    }
  }, [formValue, ensDetails, ensName]);

  // Decide whether to show the resolved address
  const showResolvedAddress = !!ensDetails;

  const memberOptions = useMemo(
    () =>
      members.map((member) => ({
        value: member.address,
        label: member.address,
        member,
        ensName: member.name || '',
      })),
    [members],
  );

  const { data: contractData } = useContractData({
    address: formValue,
    chainId,
    editMode: true,
  });

  const { details: moduleDetails } = useModuleDetails({
    address: formValue,
    chainId,
  });

  const isContract = (contractData && contractData?.contractName !== 'MetaMultiSigWallet') || moduleDetails;

  const handleChange = (newValue: Option | null, actionMeta: any) => {
    // Clear all fields if no value
    if (!newValue) {
      setValue(name, '');
      setValue('email', '');
      setValue('name', '');
      setEnsDetails(null);
      return;
    }

    const address = newValue.value;
    setValue(name, address, { shouldValidate: true });

    // If directly selecting an address, clear ENS details
    if (isAddress(address)) {
      setEnsDetails(null);
    }

    // If it's a member selection, populate their details and submit
    if (newValue.member) {
      setValue('email', newValue.member.email || '');
      setValue('name', newValue.member.name || '');
      setEnsDetails(null);

      // If onSubmit is provided, trigger form submission and close
      if (onSubmit) {
        const data = localForm.getValues();
        onSubmit(data);
        onClose?.();
      }
    }
  };

  const Option = ({ children, ...props }: any) => {
    const { data } = props;
    return (
      <components.Option {...props}>
        <div className='flex items-center gap-2'>
          <MemberAvatar
            member={{
              address: data.value,
              name: data.ensName,
            }}
          />
        </div>
      </components.Option>
    );
  };

  const SingleValue = ({ children, ...props }: any) => {
    const { data } = props;
    return (
      <components.SingleValue {...props}>
        <div className='flex items-center gap-2'>
          <MemberAvatar
            member={{
              address: data.value,
              name: data.ensName,
            }}
          />
        </div>
      </components.SingleValue>
    );
  };

  const Control = ({ children, ...props }: any) => (
    <components.Control {...props}>
      {isContract ? (
        <CodeIcon className='ml-3 h-4 w-4 text-gray-500' />
      ) : (
        <BsPersonBadge className='ml-3 h-4 w-4 text-gray-500' />
      )}
      {children}
    </components.Control>
  );

  return (
    <div className='flex w-full flex-col gap-1'>
      <div className='relative'>
        {label && (
          <div className='mb-1 flex items-center gap-1'>
            <label className='text-sm font-medium text-gray-700'>{label}</label>
            {labelNote && <span className='text-xs text-gray-500'>({labelNote})</span>}
          </div>
        )}
        {subLabel && <div className='mb-2 text-sm text-gray-500'>{subLabel}</div>}
        <CreatableSelect
          options={memberOptions}
          onChange={handleChange}
          value={
            formValue
              ? {
                  value: formValue,
                  label: formValue,
                }
              : null
          }
          isDisabled={isDisabled}
          placeholder={placeholder}
          isClearable
          formatCreateLabel={(inputValue) => `Use address: ${inputValue}`}
          components={{ Control, Option, SingleValue }}
          filterOption={(option: any, input: string): boolean => {
            if (!input) return false;
            return (
              option.data.value.toLowerCase().includes(input.toLowerCase()) ||
              (option.data.ensName && option.data.ensName.toLowerCase().includes(input.toLowerCase()))
            );
          }}
          classNames={{
            control: (state) =>
              `border rounded-lg ${
                variant === 'councils'
                  ? 'border-gray-300 bg-white hover:border-gray-400'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              } ${state.isFocused ? 'border-blue-500 ring-1 ring-blue-500' : ''}`,
            input: () => 'ml-2',
            option: () => 'hover:bg-gray-100 cursor-pointer py-2 px-3',
          }}
        />
      </div>
      {showResolvedAddress && ensDetails && (
        <p className='mt-1 text-xs text-gray-500'>
          {ensDetails.name} resolved to: {ensDetails.address}
        </p>
      )}
    </div>
  );
};

export { MemberAddressInput };
