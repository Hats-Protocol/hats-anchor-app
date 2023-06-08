import { Stack, Button, Flex, Text } from '@chakra-ui/react';
import _ from 'lodash';
import React from 'react';
import { useForm } from 'react-hook-form';

import Link from '@/components/ChakraNextLink';
import RadioBox from '@/components/RadioBox';
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatStatusUpdate from '@/hooks/useHatStatusUpdate';

const HatStatusForm = ({
  hatData,
  chainId,
}: {
  hatData: any;
  chainId: number;
}) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;

  const status = useDebounce(watch('status', null), CONFIG.debounce);

  const { writeAsync, isLoading } = useHatStatusUpdate({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId: _.get(hatData, 'prettyId'),
    status,
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text>
          Turn a Hat type on or off. While inactive, all wearer balances will be
          0.{' '}
          <Link href='https://docs.hatsprotocol.xyz/src/Hats.sol/contract.Hats.html#sethatstatus'>
            Learn more in the docs.
          </Link>
        </Text>
        <RadioBox
          localForm={localForm}
          name='status'
          label='Status'
          options={['Active', 'Inactive']}
          isRequired
        />

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync || isLoading}>
            Update
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatStatusForm;
