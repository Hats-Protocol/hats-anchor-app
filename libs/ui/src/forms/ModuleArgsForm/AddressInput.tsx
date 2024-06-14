import { Stack, Text } from '@chakra-ui/react';
import { FALLBACK_ARG_EXAMPLES } from '@hatsprotocol/constants';
import { ModuleCreationArg } from '@hatsprotocol/modules-sdk';
import { useTreeForm } from 'contexts';
import _ from 'lodash';
import { ChangeEvent, ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { explorerUrl } from 'utils';
import { Hex, isAddress } from 'viem';
import { useToken } from 'wagmi';

import { ChakraNextLink } from '../../atoms';
import { AddressInput, Input } from '..';

const TOKEN_TYPES = ['erc20', 'token'];

// !!!!! CURRENTLY UNUSED !!!!!!

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

  const handleChangeAddress = (
    e: ChangeEvent<HTMLInputElement>,
    name: string,
  ) => {
    const trimmedValue = e.target.value.trim();
    setValue(name, trimmedValue, { shouldDirty: true });
  };

  let tokenArgName = '';
  if (_.includes(TOKEN_TYPES, arg.displayType)) {
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
    if (
      arg.displayType === 'erc20' &&
      !tokenDetails &&
      (localTokenAddress || tokenAddress)
    ) {
      if (tokenDetails) {
        argHelper = (
          <ChakraNextLink
            href={`${explorerUrl(chainId)}/address/${tokenAddress}`}
            isExternal
          >
            <Text size='sm' variant='gray'>
              {tokenLabel}
            </Text>
          </ChakraNextLink>
        );
      }
    }

    return (
      <Stack w='100%'>
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
      </Stack>
    );
  }

  return (
    <Stack w='100%' spacing={1}>
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
    </Stack>
  );
};

export default ModuleAddressInput;
