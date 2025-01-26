'use client';

import { TokenInfo } from '@hatsprotocol/constants';
import { UseFormReturn } from 'react-hook-form';
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
  const value = form.watch(name);
  const selectedToken = options.find((token) => token.address === value) || options[0];
  // Set initial value if none exists
  if (!value && selectedToken) {
    form.setValue(name, selectedToken.address);
  }

  // {options.map((token) => (
  //     <option key={token.address} value={token.address}>
  //     {token.name} ({token.symbol})
  //   </option>
  // ))}

  return (
    <Select
      value={selectedToken?.address || ''}
      onChange={(e) => form.setValue(name, e?.valueOf())}
      placeholder={value ? undefined : placeholder}
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
  );
};

TokenSelect.displayName = 'TokenSelect';

export { TokenSelect };
