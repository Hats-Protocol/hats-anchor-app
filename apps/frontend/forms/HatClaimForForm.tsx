import { Button, Flex, Stack } from '@chakra-ui/react';
import { useHatClaimFor } from 'hats-hooks';
import { useForm } from 'react-hook-form';
import { Input } from 'ui';
import { Hex } from 'viem';

import { useTreeForm } from '../contexts/TreeFormContext';

const HatClaimForForm = () => {
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      address: '',
    },
  });
  const { handleSubmit, watch } = localForm;
  const { chainId, selectedHat } = useTreeForm();

  const address = watch('address', '');

  const { claimHatFor, canClaimForAccount, isLoading } = useHatClaimFor({
    selectedHat,
    chainId,
    wearer: address as Hex,
  });

  const onSubmit = async () => {
    await claimHatFor(address as Hex);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Input
          label='Hat Wearer Address'
          subLabel='Claim this hat for an eligible wearer'
          localForm={localForm}
          name='address'
          placeholder='vitalik.eth'
          options={{
            validate: () => {
              if (!canClaimForAccount) return 'Account is not eligible';
              return true;
            },
          }}
        />

        <Flex justify='flex-end'>
          <Button
            type='submit'
            isLoading={isLoading}
            isDisabled={!canClaimForAccount}
          >
            Claim
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatClaimForForm;
