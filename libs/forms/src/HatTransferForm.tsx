'use client';

import {
  Button,
  Code,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useHatContractWrite } from 'hats-hooks';
import { useDebounce, useWaitForSubgraph } from 'hooks';
import { includes } from 'lodash';
import { useForm } from 'react-hook-form';
import { formatAddress } from 'utils';
import { useChainId, useEnsAddress } from 'wagmi';

import { AddressInput } from './components';

const HatTransferForm = ({ currentWearerAddress }: HatTransferFormProps) => {
  const currentChainId = useChainId();
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;
  const { txPending, handlePendingTx } = useOverlay();
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();

  const hatId = selectedHat?.id;
  const newWearer = useDebounce<string>(watch('newWearer', null));

  const {
    data: newWearerResolvedAddress,
    isLoading: isLoadingNewWearerResolvedAddress,
  } = useEnsAddress({
    name: newWearer,
    chainId: 1,
  });

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const newWearerAddress = newWearerResolvedAddress ?? newWearer;

  const isTopHat = hatId && !includes(hatIdDecimalToIp(BigInt(hatId)), '.');

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'transferHat',
    args: [hatId, currentWearerAddress, newWearerAddress],
    chainId,
    waitForSubgraphToastData: {
      title: 'Transaction confirmed. Waiting for indexing...',
      description: "We're waiting for the data to be indexed. Stay tuned.",
      duration: 8000,
    },
    successToastData: {
      title: `${isTopHat ? 'Top ' : ''}Hat Transferred!`,
      description:
        hatId &&
        `Successfully transferred ${
          isTopHat ? 'top ' : ''
        }Hat #${hatIdDecimalToIp(BigInt(hatId))} from ${formatAddress(
          currentWearerAddress,
        )} to ${formatAddress(newWearerAddress)}`,
    },
    queryKeys: [
      ['hatDetails'],
      ['treeDetails'],
      ['wearerDetails'],
      ['orgChartTree'],
      ['wearerAndControllerDetails'],
    ],
    waitForSubgraph,
    handlePendingTx,
  });

  const onSubmit = async () => {
    // TODO check both addresses are addresses + current chainId
    await writeAsync?.();
  };

  const isDisabled =
    !writeAsync ||
    isLoading ||
    isLoadingNewWearerResolvedAddress ||
    chainId !== currentChainId;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text>Transfer the selected hat to another address.</Text>
        <Stack>
          <Text>Tree Domain</Text>
          {hatId && (
            <Heading size='md' variant='mono'>
              #{hatIdDecimalToIp(BigInt(hatId))}
            </Heading>
          )}
        </Stack>
        <HStack>
          <Text>Current wearer address: </Text>
          <Code>{currentWearerAddress}</Code>
        </HStack>
        <AddressInput
          label='New Wearer Address'
          name='newWearer'
          localForm={localForm}
          chainId={chainId}
        />
        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={isDisabled} isLoading={txPending}>
            Transfer
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

interface HatTransferFormProps {
  currentWearerAddress: string;
}

export default HatTransferForm;
