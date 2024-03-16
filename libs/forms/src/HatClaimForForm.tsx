import { Button, Flex, Stack } from '@chakra-ui/react';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useHatClaimFor } from 'hats-hooks';
import { useDebounce } from 'hooks';
import { useForm } from 'react-hook-form';
import { AddressInput } from 'ui';
import { Hex } from 'viem';
import { useEnsAddress } from 'wagmi';

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
  const address = useDebounce<string>(watch('address', null));

  const onSubmit = async () => {
    await claimHatFor(address as Hex);
  };

  const { data: resolvedAddress, isLoading: isLoadingAddressResolvedAddress } =
    useEnsAddress({
      name: address,
      chainId: 1,
    });

  const { claimHatFor, canClaimForAccount, isLoading } = useHatClaimFor({
    selectedHat,
    chainId,
    wearer: resolvedAddress || (address as Hex),
  });

  const showResolvedAddress = resolvedAddress && address !== resolvedAddress;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <AddressInput
          name='address'
          label='Hat Wearer Address'
          subLabel='Claim this hat for an eligible wearer'
          localForm={localForm}
          showResolvedAddress={showResolvedAddress}
          resolvedAddress={resolvedAddress}
          options={{
            validate: () => {
              if ((resolvedAddress || address) && !canClaimForAccount)
                return 'Account is not eligible';
              return true;
            },
          }}
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

export default HatClaimForForm;
