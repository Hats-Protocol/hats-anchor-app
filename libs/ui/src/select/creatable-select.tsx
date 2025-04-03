'use client';

import {
  components,
  CSSObjectWithLabel,
  GroupBase,
  OptionProps,
  Props,
  SingleValueProps,
  StylesConfig,
  Theme,
} from 'react-select';
import CreatableSelect from 'react-select/creatable';

import { ReactSelectOption, selectStyles } from './select';

type ExtendedSelectProps<T> = Props<T, false, GroupBase<T>> & {
  iconClassName?: string;
};

export type CreatableReactSelectProps<T extends ReactSelectOption> = Omit<ExtendedSelectProps<T>, 'components'> & {
  formatCreateLabel?: (inputValue: string) => string;
};

const CreatableReactSelectOption = <T extends ReactSelectOption>({
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

const CreatableReactSelectSingleValue = <T extends ReactSelectOption>({
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

export const CreatableReactSelect = <T extends ReactSelectOption>({
  iconClassName,
  formatCreateLabel,
  ...props
}: CreatableReactSelectProps<T>) => {
  return (
    <CreatableSelect<T>
      {...props}
      components={{
        Option: CreatableReactSelectOption,
        SingleValue: CreatableReactSelectSingleValue,
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
      formatCreateLabel={formatCreateLabel}
    />
  );
};

CreatableReactSelect.displayName = 'CreatableReactSelect';
