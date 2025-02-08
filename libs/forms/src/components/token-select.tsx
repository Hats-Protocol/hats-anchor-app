'use client';

import { TokenInfo } from '@hatsprotocol/constants';
import { map } from 'lodash';
import { Controller, UseFormReturn } from 'react-hook-form';
import Select, { components, OptionProps, SingleValueProps } from 'react-select';
import { ipfsUrl } from 'utils';

// TODO finish refactor with react-select

interface TokenSelectProps {
  name: string;
  options: TokenInfo[];
  form: UseFormReturn<any>;
  placeholder?: string;
}

interface TokenOption {
  value: string;
  label: string;
  logoURI: string;
}

const CustomOption = ({ children, ...props }: OptionProps<TokenOption>) => (
  <components.Option {...props}>
    <div className='flex items-center gap-2'>
      <img src={ipfsUrl(props.data.logoURI)} alt={props.data.label} className='h-5 w-5 rounded-full' />
      {children}
    </div>
  </components.Option>
);

const CustomSingleValue = ({ children, ...props }: SingleValueProps<TokenOption>) => (
  <components.SingleValue {...props}>
    <div className='flex items-center gap-2'>
      <img src={ipfsUrl(props.data.logoURI)} alt={props.data.label} className='h-5 w-5 rounded-full' />
      {children}
    </div>
  </components.SingleValue>
);

const TokenSelect = ({ name, options, form, placeholder }: TokenSelectProps) => {
  const { control } = form;

  const tokenOptions = map(options, (token) => ({
    value: token.address,
    label: `${token.name} (${token.symbol})`,
    logoURI: token.logoURI,
  }));

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          options={tokenOptions}
          {...field}
          placeholder={placeholder}
          components={{
            Option: CustomOption,
            SingleValue: CustomSingleValue,
          }}
        />
      )}
    />
  );
};

TokenSelect.displayName = 'TokenSelect';

export { TokenSelect };
