'use client';

import { TokenInfo } from '@hatsprotocol/constants';
import { map } from 'lodash';
import { Controller, UseFormReturn } from 'react-hook-form';
import Select, { components, CSSObjectWithLabel, OptionProps, SingleValueProps, StylesConfig } from 'react-select';
import { ipfsUrl } from 'utils';

// TODO finish refactor with react-select

interface TokenSelectProps {
  name: string;
  options: TokenInfo[];
  form: UseFormReturn<{ [key: string]: TokenOption }>;
  placeholder?: string;
}

interface TokenOption {
  value: string;
  label: string;
  logoURI: string;
}

const selectStyles: StylesConfig<TokenOption, false> = {
  control: (baseStyles: CSSObjectWithLabel, state: { isFocused: boolean }): CSSObjectWithLabel => ({
    ...baseStyles,
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
  valueContainer: (baseStyles: CSSObjectWithLabel): CSSObjectWithLabel => ({
    ...baseStyles,
    padding: '4px 12px',
  }),
  input: (baseStyles: CSSObjectWithLabel): CSSObjectWithLabel => ({
    ...baseStyles,
    margin: 0,
    padding: 0,
  }),
  placeholder: (baseStyles: CSSObjectWithLabel): CSSObjectWithLabel => ({
    ...baseStyles,
    color: 'var(--muted-foreground)',
  }),
  singleValue: (baseStyles: CSSObjectWithLabel): CSSObjectWithLabel => ({
    ...baseStyles,
    color: 'var(--foreground)',
  }),
  menu: (baseStyles: CSSObjectWithLabel): CSSObjectWithLabel => ({
    ...baseStyles,
    borderRadius: '0.375rem',
    overflow: 'hidden',
    backgroundColor: 'white',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    zIndex: 50,
  }),
  option: (baseStyles: CSSObjectWithLabel, state: { isSelected: boolean; isFocused: boolean }): CSSObjectWithLabel => ({
    ...baseStyles,
    backgroundColor: state.isSelected
      ? 'hsl(var(--primary) / 0.15)'
      : state.isFocused
        ? 'hsl(var(--accent) / 0.1)'
        : 'transparent',
    color: 'hsl(var(--foreground))',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: state.isSelected ? 'hsl(var(--primary) / 0.25)' : 'hsl(var(--accent) / 0.2)',
    },
  }),
  indicatorSeparator: (): CSSObjectWithLabel => ({
    display: 'none',
  }),
  dropdownIndicator: (baseStyles: CSSObjectWithLabel): CSSObjectWithLabel => ({
    ...baseStyles,
    padding: '4px 8px',
  }),
};

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

TokenSelect.displayName = 'TokenSelect';

export { TokenSelect };
