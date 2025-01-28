import { councilsChainsList } from '@hatsprotocol/config';
import { map, values } from 'lodash';
// import { useEffect } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import Select from 'react-select';

interface ChainSelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  name: string;
  placeholder: string;
  isDisabled?: boolean;
  className?: string;
}

const chainOptions = map(values(councilsChainsList), (chain) => ({
  value: chain.id.toString(),
  label: chain.name,
  icon: chain.iconUrl,
}));

const ChainSelect = ({ localForm, name, placeholder, isDisabled, className }: ChainSelectProps) => {
  const { watch } = localForm;
  const value = watch(name);
  // const selectedOption = options.find((opt: any) => opt.value === value);

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
            console.log(value);
            field.onChange(value);
          }}
          // sx={{
          //   '& > option': {
          //     paddingLeft: '2rem',
          //     backgroundRepeat: 'no-repeat',
          //     backgroundPosition: '8px center',
          //     backgroundSize: '20px',
          //   },
          //   ...options.reduce(
          //     (acc, opt) => ({
          //       ...acc,
          //       [`& option[value="${opt.value}"]`]: {
          //         backgroundImage: `url(${opt.icon})`,
          //       },
          //     }),
          //     {},
          //   ),
          //   '&': {
          //     paddingLeft: selectedOption ? '2.5rem' : '1rem',
          //     paddingRight: '2rem',
          //     backgroundImage: selectedOption ? `url(${selectedOption.icon})` : 'none',
          //     backgroundRepeat: 'no-repeat',
          //     backgroundPosition: '0.5rem center',
          //     backgroundSize: '1.25rem',
          //   },
          // }}
        />
      )}
    />
  );
};

ChainSelect.displayName = 'ChainSelect';

export { ChainSelect };
