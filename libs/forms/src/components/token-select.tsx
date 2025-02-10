'use client';

import { TokenInfo } from '@hatsprotocol/constants';
import { map } from 'lodash';
import { Controller, UseFormReturn } from 'react-hook-form';
import { IconSelect } from 'ui';
import { ipfsUrl } from 'utils';

interface TokenSelectProps {
  name: string;
  options: TokenInfo[];
  form: UseFormReturn<{ [key: string]: TokenOption }>;
  placeholder?: string;
}

interface TokenOption {
  value: string;
  label: string;
  iconUrl: string;
}

const TokenSelect = ({ name, options, form, placeholder }: TokenSelectProps) => {
  const { control } = form;
  const tokenOptions = map(options, (token) => ({
    value: token.address,
    label: `${token.name} (${token.symbol})`,
    iconUrl: ipfsUrl(token.logoURI),
  }));

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field } }) => (
        <IconSelect<TokenOption>
          {...field}
          value={tokenOptions.find((option) => option.value === value?.value)}
          onChange={onChange}
          options={tokenOptions}
          placeholder={placeholder}
          iconClassName='h-5 w-5 rounded-full'
        />
      )}
    />
  );
};

TokenSelect.displayName = 'TokenSelect';

export { TokenSelect };
