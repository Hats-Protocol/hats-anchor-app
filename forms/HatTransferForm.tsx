import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import { isAddress } from 'viem';
import { useChainId, useEnsAddress } from 'wagmi';

import Input from '@/components/atoms/Input';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useDebounce from '@/hooks/useDebounce';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import { formatAddress } from '@/lib/general';
import { toTreeId } from '@/lib/hats';

const HatTransferForm = ({
  currentWearerAddress,
}: {
  currentWearerAddress: string;
}) => {
  const currentNetworkId = useChainId();
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;
  const { chainId, selectedHat } = useTreeForm();

  const hatId = selectedHat?.id;
  const newWearer = useDebounce<string>(watch('newWearer', null));

  const {
    data: newWearerResolvedAddress,
    isLoading: isLoadingNewWearerResolvedAddress,
  } = useEnsAddress({
    name: newWearer,
    chainId: 1,
  });

  const newWearerAddress = newWearerResolvedAddress ?? newWearer;

  const isTopHat = hatId && !_.includes(hatIdDecimalToIp(BigInt(hatId)), '.');

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'transferHat',
    args: [hatId, currentWearerAddress, newWearerAddress],
    chainId,
    onSuccessToastData: {
      title: `${isTopHat ? 'Top ' : ''}Hat Transferred!`,
      description:
        hatId &&
        `Successfully transferred ${
          isTopHat ? 'top ' : ''
        }hat #${hatIdDecimalToIp(BigInt(hatId))} from ${formatAddress(
          currentWearerAddress,
        )} to ${formatAddress(newWearerResolvedAddress)}`,
    },
    queryKeys: [
      ['hatDetails', hatId || 'none'],
      ['treeDetails', toTreeId(hatId)],
    ],
    enabled:
      Boolean(newWearerResolvedAddress ?? newWearer) &&
      Boolean(currentWearerAddress) &&
      Boolean(hatId) &&
      isAddress(newWearerResolvedAddress ?? newWearer) &&
      isAddress(currentWearerAddress) &&
      chainId === currentNetworkId,
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  const showNewResolvedAddress =
    newWearerResolvedAddress && newWearer !== newWearerResolvedAddress;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text>Transfer the selected hat to another address.</Text>
        <Stack>
          <Text>Tree Domain</Text>
          {hatId && (
            <Heading size='md' fontFamily='mono'>
              #{hatIdDecimalToIp(BigInt(hatId))}
            </Heading>
          )}
        </Stack>
        <HStack>
          <Text>Current wearer address: </Text>
          <Code>{currentWearerAddress}</Code>
        </HStack>
        <Box>
          <Input
            localForm={localForm}
            name='newWearer'
            label='New Wearer Address'
            placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
            rightElement={showNewResolvedAddress && <FaCheck color='green' />}
          />

          {showNewResolvedAddress && (
            <Text fontSize='sm' color='gray.500' mt={1}>
              Resolved address: {newWearerResolvedAddress}
            </Text>
          )}
        </Box>

        <Flex justify='flex-end'>
          <Button
            type='submit'
            isDisabled={
              !writeAsync || isLoading || isLoadingNewWearerResolvedAddress
            }
          >
            Transfer
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatTransferForm;
