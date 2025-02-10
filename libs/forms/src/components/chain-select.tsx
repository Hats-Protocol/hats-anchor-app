'use client';

import { councilsChainsList } from '@hatsprotocol/config';
import { map, values } from 'lodash';
// import { useEffect } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import Select, {
  components,
  CSSObjectWithLabel,
  GroupBase,
  OptionProps,
  SingleValueProps,
  StylesConfig,
} from 'react-select';

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
  icon: string;
}

const selectStyles: StylesConfig<ChainOption, false> = {
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
      ? 'hsl(var(--primary) / 0.05)'
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
  const { watch, control } = localForm;
  const currentValue = watch(name);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select<ChainOption>
          placeholder={placeholder}
          value={chainOptions.find((option) => option.value === currentValue?.value)}
          options={chainOptions}
          onChange={field.onChange}
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
