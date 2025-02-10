'use client';

import { councilsChainsList } from '@hatsprotocol/config';
import { map, values } from 'lodash';
import { Controller, UseFormReturn } from 'react-hook-form';
import { IconSelect } from 'ui';

interface ChainSelectProps {
  localForm: UseFormReturn<{ [key: string]: ChainOption }>;
  name: string;
  placeholder: string;
  isDisabled?: boolean;
  className?: string;
}

interface ChainOption {
  value: string;
  label: string;
  iconUrl: string;
}

const chainOptions = map(values(councilsChainsList), (chain) => ({
  value: chain.id.toString(),
  label: chain.name,
  iconUrl: chain.iconUrl,
}));

const ChainSelect = ({ localForm, name = 'chain', placeholder, isDisabled, className }: ChainSelectProps) => {
  const { control } = localForm;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field } }) => (
        <IconSelect<ChainOption>
          {...field}
          value={chainOptions.find((option) => option.value === value?.value)}
          onChange={onChange}
          options={chainOptions}
          placeholder={placeholder}
          isDisabled={isDisabled}
          className={className}
        />
      )}
    />
  );
};

ChainSelect.displayName = 'ChainSelect';

export { ChainSelect };
