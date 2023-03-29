import React from 'react';
import { Stack, Button, Flex } from '@chakra-ui/react';
import { isAddress } from '@ethersproject/address';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import useHatMint from '../hooks/useHatMint';
import useDebounce from '../hooks/useDebounce';
import CONFIG, { hatsAddresses } from '../constants';

const HatWearerForm = ({ hatId, chainId }) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;

  const newWearer = useDebounce(watch('newWearer', null), CONFIG.debounce);
  // TODO handle ens name

  const { writeAsync } = useHatMint({
    hatsAddress: hatsAddresses(chainId),
    hatId,
    newWearer,
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Input
          localForm={localForm}
          name='newWearer'
          label='New Wearer Address'
          options={{
            validate: (value) =>
              isAddress(value) ? true : 'Must be a valid address',
          }}
          placeholder='0x4a75000089d9B5C25d7876403C3B91997911FCd9'
        />

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync}>
            Mint
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatWearerForm;
