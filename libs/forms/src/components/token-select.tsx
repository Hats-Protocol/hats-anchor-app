'use client';

import { TokenInfo } from '@hatsprotocol/constants';
import { map } from 'lodash';
import { Controller, UseFormReturn } from 'react-hook-form';
import Select from 'react-select';
import { ipfsUrl } from 'utils';

// TODO finish refactor with react-select

interface TokenSelectProps {
  name: string;
  options: TokenInfo[];
  form: UseFormReturn<any>;
  placeholder?: string;
}

const TokenSelect = ({ name, options, form, placeholder }: TokenSelectProps) => {
  const { control } = form;
  // const value = watch(name);
  // const selectedToken = options.find((token) => token.address === value.address) || options[0];
  // Set initial value if none exists
  // if (!value && selectedToken) {
  //   form.setValue(name, selectedToken.address);
  // }
  // console.log(value, selectedToken);

  // {options.map((token) => (
  //     <option key={token.address} value={token.address}>
  //     {token.name} ({token.symbol})
  //   </option>
  // ))}

  const tokenOptions = map(options, (token) => ({
    value: token.address,
    label: `${token.name} (${token.symbol})`,
  }));
  console.log(tokenOptions);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          options={tokenOptions}
          {...field}
          placeholder={placeholder}
          // sx={{
          //   '& > option': {
          //     paddingLeft: '2rem',
          //     backgroundRepeat: 'no-repeat',
          //     backgroundPosition: '8px center',
          //     backgroundSize: '20px',
          //   },
          //   ...options.reduce(
          //     (acc, token) => ({
          //       ...acc,
          //       [`& option[value="${token.address}"]`]: {
          //         backgroundImage: `url(${ipfsUrl(token.logoURI)})`,
          //       },
          //     }),
          //     {},
          //   ),
          //   '&': {
          //     paddingLeft: selectedToken ? '2.5rem' : '1rem',
          //     paddingRight: '2rem',
          //     backgroundImage: selectedToken ? `url(${ipfsUrl(selectedToken.logoURI)})` : 'none',
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

TokenSelect.displayName = 'TokenSelect';

export { TokenSelect };
