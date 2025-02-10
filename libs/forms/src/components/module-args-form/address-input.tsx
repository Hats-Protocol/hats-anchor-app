'use client';

import { FALLBACK_ARG_EXAMPLES } from '@hatsprotocol/constants';
import { ModuleCreationArg } from '@hatsprotocol/modules-sdk';
import { useTreeForm } from 'contexts';
import { includes } from 'lodash';
import { ChangeEvent, ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Link } from 'ui';
import { explorerUrl } from 'utils';
import { Hex, isAddress } from 'viem';
import { useToken } from 'wagmi';

import { AddressInput, Input } from '..';

const TOKEN_TYPES = ['erc20', 'token'];

// !!!!! CURRENTLY UNUSED !!!!!!
// TODO migrate off useToken or remove component

const ModuleAddressInput = ({
  arg,
  localForm,
  tokenAddress,
}: {
  arg: ModuleCreationArg;
  localForm: UseFormReturn;
  tokenAddress: Hex;
}) => {
  const { setValue, watch } = localForm;
  const { chainId } = useTreeForm();

  const handleChangeAddress = (e: ChangeEvent<HTMLInputElement>, name: string) => {
    const trimmedValue = e.target.value.trim();
    setValue(name, trimmedValue, { shouldDirty: true });
  };

  let tokenArgName = '';
  if (includes(TOKEN_TYPES, arg.displayType)) {
    tokenArgName = arg.name;
  }
  // watch() by default returns whole object, so not good fallback
  const localTokenAddress = tokenArgName ? watch(tokenArgName) : undefined;
  const { data: tokenDetails } = useToken({
    address: localTokenAddress || tokenAddress,
    chainId,
    // enabled:
    //   (!!tokenAddress && isAddress(tokenAddress)) ||
    //   (!!localTokenAddress && isAddress(localTokenAddress)),
  });
  const tokenLabel = `${tokenDetails?.name} ($${tokenDetails?.symbol})`;

  if (
    arg.displayType === 'erc20' ||
    arg.displayType === 'erc721' ||
    arg.displayType === 'erc1155' ||
    arg.displayType === 'jokerace'
  ) {
    let argHelper: ReactNode | null = null;
    // TODO [low] separate ArgHelper?
    if (arg.displayType === 'erc20' && !tokenDetails && (localTokenAddress || tokenAddress)) {
      if (tokenDetails) {
        argHelper = (
          <Link href={`${explorerUrl(chainId)}/address/${tokenAddress}`} isExternal>
            <p className='text-sm text-gray-500'>{tokenLabel}</p>
          </Link>
        );
      }
    }

    return (
      <div className='flex w-full flex-col gap-2'>
        <Input
          name={arg.name}
          label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
          subLabel={arg.description}
          placeholder={
            Array.isArray(arg.example)
              ? (arg.example as string[]).join(', ')
              : (arg.example as string) || FALLBACK_ARG_EXAMPLES.address
          }
          options={{
            required: !arg.optional,
            validate: (value) => {
              if (!isAddress(value)) return 'Invalid address';
              return true;
            },
          }}
          localForm={localForm}
          onChange={(e) => handleChangeAddress(e, arg.name)}
        />
        {argHelper}
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col gap-1'>
      <AddressInput
        name={arg.name}
        label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
        subLabel={arg.description}
        placeholder={
          Array.isArray(arg.example)
            ? (arg.example as string[]).join(', ')
            : (arg.example as string) || FALLBACK_ARG_EXAMPLES.address
        }
        options={{
          required: !arg.optional,
        }}
        localForm={localForm}
        onChange={(e) => handleChangeAddress(e, arg.name)}
        chainId={chainId}
      />
    </div>
  );
};

export { ModuleAddressInput };
