'use client';

import { Button, Flex, Stack } from '@chakra-ui/react';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useDebounce } from 'hooks';
import { useHatClaimFor } from 'modules-hooks';
import { useForm } from 'react-hook-form';
import { Hex } from 'viem';
import { useEnsAddress } from 'wagmi';

import { AddressInput } from './components';

// TODO not handling hat at max supply (don't show button?)

const HatClaimForForm = () => {
  const localForm = useForm({
    mode: 'onBlur',
    defaultValues: {
      address: '',
    },
  });
  const { handleSubmit, watch } = localForm;
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { handlePendingTx } = useOverlay();
  const address = useDebounce<string>(watch('address'));

  const onSubmit = async () => {
    await claimHatFor(address as Hex);
  };

  const { data: resolvedAddress, isLoading: isLoadingAddressResolvedAddress } = useEnsAddress({
    name: address,
    chainId: 1,
  });

  const { claimHatFor, canClaimForAccount, isLoading } = useHatClaimFor({
    selectedHat,
    chainId,
    wearer: (resolvedAddress as Hex) || (address as Hex),
    handlePendingTx,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <AddressInput
          name='address'
          label='Hat Wearer Address'
          subLabel='Claim this hat for an eligible wearer'
          localForm={localForm}
          options={{
            validate: () => {
              if ((resolvedAddress || address) && !canClaimForAccount) return 'Account is not eligible';
              return true;
            },
          }}
          chainId={chainId}
        />

        <Flex justify='flex-end'>
          <Button
            type='submit'
            isLoading={isLoading}
            isDisabled={!canClaimForAccount || isLoadingAddressResolvedAddress}
          >
            Claim
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export { HatClaimForForm };
