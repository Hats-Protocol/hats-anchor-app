import { Stack, Text } from '@chakra-ui/react';
import { ModuleCreationArg } from '@hatsprotocol/modules-sdk';
import { FALLBACK_ARG_EXAMPLES } from 'app-constants';
import { useDebounce } from 'app-hooks';
import { explorerUrl } from 'app-utils';
import _ from 'lodash';
import React, { ChangeEvent, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Hex, isAddress } from 'viem';
import { useEnsAddress, useToken } from 'wagmi';

import AddressInput from '../../components/AddressInput';
import ChakraNextLink from '../../components/atoms/ChakraNextLink';
import Input from '../../components/atoms/Input';
import { useTreeForm } from '../../contexts/TreeFormContext';

const isEns = (value: string) =>
  value ? _.toString(value).endsWith('.eth') : false;

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

  const newWearer = useDebounce<string>(watch(arg.name, null));

  const handleChangeAddress = (
    e: ChangeEvent<HTMLInputElement>,
    name: string,
  ) => {
    const trimmedValue = e.target.value.trim();
    setValue(name, trimmedValue, { shouldDirty: true });
  };

  const { data: newWearerResolvedAddress } = useEnsAddress({
    name: newWearer,
    chainId: 1,
    enabled: !!newWearer && isEns(newWearer),
  });

  const showNewResolvedAddress =
    newWearerResolvedAddress && newWearer !== newWearerResolvedAddress;

  useEffect(() => {
    setValue(`${arg.name}-resolved`, newWearerResolvedAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newWearerResolvedAddress, arg.name]);

  const tokenArgName = arg.displayType === 'erc20' ? arg.name : '';
  const localTokenAddress = watch(tokenArgName, '');
  const { data: tokenDetails } = useToken({
    address: localTokenAddress || tokenAddress,
    chainId,
    enabled:
      (!!tokenAddress && isAddress(tokenAddress)) ||
      (!!localTokenAddress && isAddress(localTokenAddress)),
  });
  const tokenLabel = `${tokenDetails?.name} ($${tokenDetails?.symbol})`;

  if (
    arg.displayType === 'erc20' ||
    arg.displayType === 'erc721' ||
    arg.displayType === 'erc1155' ||
    arg.displayType === 'jokerace'
  ) {
    let argHelper = null;
    // TODO separate ArgHelper?
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
            <Text fontSize='sm' color='gray.500'>
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
        showResolvedAddress={showNewResolvedAddress}
        resolvedAddress={String(newWearerResolvedAddress)}
        placeholder={
          Array.isArray(arg.example)
            ? (arg.example as string[]).join(', ')
            : (arg.example as string) || FALLBACK_ARG_EXAMPLES.address
        }
        options={{
          required: !arg.optional,
          // validate: (value) => {
          //   if (!isAddress(value)) return 'Invalid address';
          //   return true;
          // },
        }}
        localForm={localForm}
        onChange={(e) => handleChangeAddress(e, arg.name)}
      />
    </Stack>
  );
};

export default ModuleAddressInput;
