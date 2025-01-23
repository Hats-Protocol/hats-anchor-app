'use client';

import { forwardRef, Select, SelectProps } from '@chakra-ui/react';
import { TokenInfo } from '@hatsprotocol/constants';
import { UseFormReturn } from 'react-hook-form';
import { ipfsUrl } from 'utils';

interface TokenSelectProps extends Omit<SelectProps, 'children' | 'form'> {
  options: TokenInfo[];
  form: UseFormReturn<any>;
  name: string;
}

export const TokenSelect = forwardRef<TokenSelectProps, 'select'>(
  ({ options, form, name, placeholder, ...props }, ref) => {
    const value = form.watch(name);
    const selectedToken = options.find((token) => token.address === value) || options[0];
    // Set initial value if none exists
    if (!value && selectedToken) {
      form.setValue(name, selectedToken.address);
    }

    return (
      <Select
        ref={ref}
        {...props}
        value={selectedToken?.address || ''}
        onChange={(e) => form.setValue(name, e.target.value)}
        placeholder={value ? undefined : placeholder}
        sx={{
          '& > option': {
            paddingLeft: '2rem',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '8px center',
            backgroundSize: '20px',
          },
          ...options.reduce(
            (acc, token) => ({
              ...acc,
              [`& option[value="${token.address}"]`]: {
                backgroundImage: `url(${ipfsUrl(token.logoURI)})`,
              },
            }),
            {},
          ),
          '&': {
            paddingLeft: selectedToken ? '2.5rem' : '1rem',
            paddingRight: '2rem',
            backgroundImage: selectedToken ? `url(${ipfsUrl(selectedToken.logoURI)})` : 'none',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '0.5rem center',
            backgroundSize: '1.25rem',
          },
        }}
      >
        {options.map((token) => (
          <option key={token.address} value={token.address}>
            {token.name} ({token.symbol})
          </option>
        ))}
      </Select>
    );
  },
);

TokenSelect.displayName = 'TokenSelect';
