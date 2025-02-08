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

const selectStyles = {
  control: (base: any, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: '36px',
    backgroundColor: 'white',
    border: '1px solid hsl(var(--input))',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '&:hover': {
      borderColor: 'hsl(var(--input))',
    },
    '&:focus-within': {
      outline: 'none',
      ring: '1px hsl(var(--ring))',
      borderColor: 'hsl(var(--ring))',
    },
    padding: '1px',
    transition: 'colors 150ms ease',
    fontSize: '0.875rem',
    '@media (min-width: 768px)': {
      fontSize: '0.875rem',
    },
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: '4px 12px',
  }),
  input: (base: any) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'var(--muted-foreground)',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'var(--foreground)',
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: '0.375rem',
    overflow: 'hidden',
    backgroundColor: 'white',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    zIndex: 50,
  }),
  option: (base: any, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--accent)' : 'transparent',
    color: state.isSelected ? 'white' : 'var(--foreground)',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: state.isSelected ? 'var(--primary)' : 'var(--accent)',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    padding: '4px 8px',
  }),
};

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
            field.onChange(value);
          }}
          isDisabled={isDisabled}
          className={className}
          components={{
            Option: CustomOption,
            SingleValue: CustomSingleValue,
          }}
          styles={selectStyles}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: 'var(--primary)',
              primary75: 'var(--primary-foreground)',
              primary50: 'var(--primary-foreground)',
              primary25: 'var(--accent)',
            },
          })}
        />
      )}
    />
  );
};

ChainSelect.displayName = 'ChainSelect';

export { ChainSelect };
