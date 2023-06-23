import {
  Stack,
  Button,
  Flex,
  Text,
  Heading,
  HStack,
  Code,
  Box,
} from '@chakra-ui/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';

import Input from '@/components/Input';
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatTransferTree from '@/hooks/useHatTransferTree';
import { prettyIdToIp } from '@/lib/hats';

const HatTransferForm = ({
  chainId,
  currentWearerAddress,
  hatId,
  prettyId,
}: {
  chainId: number;
  currentWearerAddress: string;
  hatId: string | undefined;
  prettyId: string | undefined;
}) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;

  const newWearer = useDebounce(watch('newWearer', null), CONFIG.debounce);

  const { writeAsync, isLoading, newWearerResolvedAddress } =
    useHatTransferTree({
      currentWearerAddress,
      hatId,
      prettyId,
      newWearer,
      chainId,
    });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  const showNewResolvedAddress =
    newWearerResolvedAddress && newWearer !== newWearerResolvedAddress;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text>
          Transfer admin rights over the selected Hat to another address.
        </Text>
        <Stack>
          <Text>Tree Domain</Text>
          <Heading size='md' fontFamily='mono'>
            #{prettyIdToIp(prettyId)}
          </Heading>
        </Stack>
        <HStack>
          <Text>Address of the current Wearer: </Text>
          <Code>{currentWearerAddress}</Code>
        </HStack>
        <Box>
          <Input
            localForm={localForm}
            name='newWearer'
            label='New Wearer Address'
            placeholder='0x1234, vitalik.eth'
            rightElement={showNewResolvedAddress && <FaCheck color='green' />}
          />

          {showNewResolvedAddress && (
            <Text fontSize='sm' color='gray.500' mt={1}>
              Resolved address: {newWearerResolvedAddress}
            </Text>
          )}
        </Box>

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync || isLoading}>
            Transfer
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatTransferForm;
