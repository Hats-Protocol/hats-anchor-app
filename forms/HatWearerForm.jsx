import React from 'react';
import { Link as ChakraLink, Stack, Button, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import useHatMint from '../hooks/useHatMint';
import useDebounce from '../hooks/useDebounce';
import { hatsAddresses } from '../constants';

const defaultChainId = 5;
const hatsAddress = hatsAddresses(defaultChainId);
const defaultDebounce = 1500;

const HatWearerForm = ({ hatId }) => {
  const localForm = useForm();
  const { handleSubmit, watch } = localForm;

  const newWearer = useDebounce(watch('newWearer', null), defaultDebounce);
  // TODO handle ens name

  const { writeAsync } = useHatMint({ hatsAddress, hatId, newWearer });

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
          placeholder='0x...'
        />

        <Flex justify='flex-end'>
          <Button type='submit'>Mint</Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatWearerForm;
