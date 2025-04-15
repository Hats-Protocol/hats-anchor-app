'use client';

import { TokenInfo } from '@hatsprotocol/constants';
import { map } from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { ReactSelectOption } from 'ui';
import { ipfsUrl } from 'utils';

import { Select } from './select';

interface TokenSelectProps {
  name: string;
  options: TokenInfo[];
  localForm: UseFormReturn<any>;
  placeholder?: string;
  label?: string;
  info?: string;
  subLabel?: string;
  labelNote?: string;
  variant?: 'default' | 'councils';
  isDisabled?: boolean;
}

interface TokenOption extends ReactSelectOption {}

const TokenSelect = ({
  name,
  options,
  localForm,
  placeholder,
  label,
  info,
  subLabel,
  labelNote,
  variant,
  isDisabled = false,
}: TokenSelectProps) => {
  const tokenOptions = map(options, (token) => ({
    value: token.address,
    label: `${token.name} (${token.symbol})`,
    iconUrl: ipfsUrl(token.logoURI),
  }));

  return (
    <Select<TokenOption>
      name={name}
      localForm={localForm}
      options={tokenOptions}
      isDisabled={isDisabled}
      placeholder={placeholder}
      iconClassName='h-5 w-5 rounded-full'
      label={label}
      info={info}
      subLabel={subLabel}
      labelNote={labelNote}
      variant={variant}
    />
  );
};

TokenSelect.displayName = 'TokenSelect';

export { TokenSelect };
