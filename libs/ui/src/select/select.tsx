'use client';

import {
  components,
  CSSObjectWithLabel,
  GroupBase,
  OptionProps,
  SingleValueProps,
  StylesConfig,
  Theme,
} from 'react-select';
import Select, { Props } from 'react-select';

export interface ReactSelectOption {
  value: string;
  label: string;
  iconUrl?: string;
}

type ExtendedSelectProps<T> = Props<T, false, GroupBase<T>> & {
  iconClassName?: string;
};

export type ReactSelectProps<T extends ReactSelectOption> = Omit<ExtendedSelectProps<T>, 'components'>;

const selectStyles = <T extends ReactSelectOption>(): StylesConfig<T, false, GroupBase<T>> => ({
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
});

const ReactSelectOption = <T extends ReactSelectOption>({
  children,
  ...props
}: OptionProps<T, false, GroupBase<T>>) => (
  <components.Option {...props}>
    <div className='flex items-center gap-2'>
      {props.data.iconUrl && (
        <img
          src={props.data.iconUrl}
          alt={props.data.label}
          className={(props.selectProps as ExtendedSelectProps<T>).iconClassName || 'h-5 w-5'}
        />
      )}
      {children}
    </div>
  </components.Option>
);

const ReactSelectSingleValue = <T extends ReactSelectOption>({
  children,
  ...props
}: SingleValueProps<T, false, GroupBase<T>>) => (
  <components.SingleValue {...props}>
    <div className='flex items-center gap-2'>
      {props.data.iconUrl && (
        <img
          src={props.data.iconUrl}
          alt={props.data.label}
          className={(props.selectProps as ExtendedSelectProps<T>).iconClassName || 'h-5 w-5'}
        />
      )}
      {children}
    </div>
  </components.SingleValue>
);

export const ReactSelect = <T extends ReactSelectOption>({ iconClassName, ...props }: ReactSelectProps<T>) => {
  return (
    <Select<T>
      {...props}
      components={{
        Option: ReactSelectOption,
        SingleValue: ReactSelectSingleValue,
      }}
      styles={selectStyles<T>()}
      theme={(theme: Theme) => ({
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
  );
};

ReactSelect.displayName = 'ReactSelect';

export { selectStyles };
export { ReactSelectOption as Option };
export { ReactSelectSingleValue };
