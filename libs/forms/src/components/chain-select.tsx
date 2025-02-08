'use client';

import { councilsChainsList } from '@hatsprotocol/config';
import { map, values } from 'lodash';
// import { useEffect } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import Select, { components, OptionProps, SingleValueProps } from 'react-select';

interface ChainSelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  name: string;
  placeholder: string;
  isDisabled?: boolean;
  className?: string;
}

interface ChainOption {
  value: string;
  label: string;
  icon: string;
}

const chainOptions = map(values(councilsChainsList), (chain) => ({
  value: chain.id.toString(),
  label: chain.name,
  icon: chain.iconUrl,
}));

const CustomOption = ({ children, ...props }: OptionProps<ChainOption>) => (
  <components.Option {...props}>
    <div className='flex items-center gap-2'>
      <img src={props.data.icon} alt={props.data.label} className='h-5 w-5' />
      {children}
    </div>
  </components.Option>
);

const CustomSingleValue = ({ children, ...props }: SingleValueProps<ChainOption>) => (
  <components.SingleValue {...props}>
    <div className='flex items-center gap-2'>
      <img src={props.data.icon} alt={props.data.label} className='h-5 w-5' />
      {children}
    </div>
  </components.SingleValue>
);

const ChainSelect = ({ localForm, name = 'chain', placeholder, isDisabled, className }: ChainSelectProps) => {
  const { watch } = localForm;
  const value = watch(name);

  return (
    <Controller
      name={name}
      control={localForm.control}
      render={({ field }) => (
        <Select
          placeholder={placeholder}
          value={value}
          options={chainOptions}
          onChange={(value) => {
            console.log(value);
            field.onChange(value);
          }}
          isDisabled={isDisabled}
          className={className}
          components={{
            Option: CustomOption,
            SingleValue: CustomSingleValue,
          }}
        />
      )}
    />
  );
};

ChainSelect.displayName = 'ChainSelect';

export { ChainSelect };
