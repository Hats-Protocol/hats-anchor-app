import React from 'react';
import {
  Stack,
  Button,
  Flex,
  Text,
  Heading,
  HStack,
  Code,
} from '@chakra-ui/react';
import { isAddress } from 'viem';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import useDebounce from '../hooks/useDebounce';
import CONFIG from '../constants';
import useHatTransferTree from '../hooks/useHatTransferTree';
import { prettyIdToIp } from '../lib/hats';

const HatTransferForm = ({ hatData, chainId, currentWearerAddress }) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;

  const newWearerAddress = useDebounce(
    watch('newWearerAddress', null),
    CONFIG.debounce,
  );

  const { writeAsync } = useHatTransferTree({
    currentWearerAddress,
    hatData,
    newWearerAddress,
    chainId,
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text>
          Transfer admin rights over the selected Hat to another address.
        </Text>
        <Stack>
          <Text>Tree Domain</Text>
          <Heading size='md' fontFamily='mono'>
            #{prettyIdToIp(_.get(hatData, 'prettyId'))}
          </Heading>
        </Stack>
        <HStack>
          <Text>Address of the current Wearer: </Text>
          <Code>{currentWearerAddress}</Code>
        </HStack>
        <Input
          localForm={localForm}
          name='newWearerAddress'
          label='New Wearer Address'
          options={{
            validate: (value) =>
              isAddress(value) ? true : 'Must be a valid address',
          }}
          placeholder='0x4a75000089d9B5C25d7876403C3B91997911FCd9'
        />

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync}>
            Transfer
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatTransferForm;
