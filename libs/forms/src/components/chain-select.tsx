'use client';

import { councilsChainsList } from '@hatsprotocol/config';
import { map, values } from 'lodash';
import { UseFormReturn } from 'react-hook-form';
import { ReactSelectOption } from 'ui';

import { Select } from './select';

interface ChainSelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  name: string;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  label?: string;
  info?: string;
  subLabel?: string;
  labelNote?: string;
  variant?: 'default' | 'councils';
}

interface ChainOption extends ReactSelectOption {}

const chainOptions = map(values(councilsChainsList), (chain) => ({
  value: chain.id.toString(),
  label: chain.name,
  iconUrl: chain.iconUrl,
}));

const ChainSelect = ({
  localForm,
  name = 'chain',
  placeholder = 'Select a chain',
  isDisabled,
  className,
  label,
  info,
  subLabel,
  labelNote,
  variant,
}: ChainSelectProps) => {
  return (
    <Select<ChainOption>
      name={name}
      localForm={localForm}
      options={chainOptions}
      placeholder={placeholder}
      isDisabled={isDisabled}
      className={className}
      label={label}
      info={info}
      subLabel={subLabel}
      labelNote={labelNote}
      variant={variant}
    />
  );
};

ChainSelect.displayName = 'ChainSelect';

export { ChainSelect };
