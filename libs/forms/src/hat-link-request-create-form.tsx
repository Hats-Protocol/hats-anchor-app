'use client';

import { Button, Flex, HStack, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp, hatIdHexToDecimal, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useTreeForm } from 'contexts';
import { useHatContractWrite } from 'hats-hooks';
import { useDebounce, useWaitForSubgraph } from 'hooks';
import { first, isEmpty, map } from 'lodash';
import { useForm } from 'react-hook-form';
import { Hex } from 'viem';
import { useChainId } from 'wagmi';

import { Select } from './components';

const HatLinkRequestCreateForm = ({ newAdmin, wearerTopHats }: { newAdmin: string; wearerTopHats: Hex[] }) => {
  const currentChainId = useChainId();
  const { handlePendingTx } = useOverlay();
  const { chainId } = useTreeForm();
  const localForm = useForm({
    mode: 'all',
    defaultValues: {
      newAdmin: hatIdHexToDecimal(newAdmin),
      topHatDomain: first(wearerTopHats),
    },
  });
  const { handleSubmit, watch } = localForm;

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  // first(wearerTopHats) is the default value for topHatDomain
  const topHatDomain = useDebounce<Hex | undefined>(watch('topHatDomain'));

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'requestLinkTopHatToTree',
    args: topHatDomain ? [hatIdToTreeId(BigInt(topHatDomain)), hatIdHexToDecimal(newAdmin)] : [],
    chainId,
    successToastData: {
      title: 'Successfully Requested to Link!',
      description:
        topHatDomain &&
        newAdmin &&
        `Successfully requested to link top hat ${hatIdDecimalToIp(
          BigInt(topHatDomain),
        )} to ${hatIdDecimalToIp(BigInt(newAdmin))}`,
    },
    queryKeys: [['hatDetails'], ['treeDetails']],
    handlePendingTx,
    waitForSubgraph,
  });

  const onSubmit = async () => {
    try {
      await writeAsync?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  if (isEmpty(wearerTopHats)) {
    return (
      <Stack spacing={4}>
        <Text>
          Ask the wearer of this hat to become the admin of a Top Hat that you are wearing. You will lose admin control
          of this Top Hat!
        </Text>
        <Text>You are not wearing any Top Hats that can be linked to this tree.</Text>
      </Stack>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text>
          Ask the wearer of this hat to become the admin of a Top Hat that you are wearing. You will lose admin control
          of this Top Hat!
        </Text>
        <HStack>
          <Text variant='medium'>New Admin:</Text>
          <Text>ID {hatIdDecimalToIp(BigInt(newAdmin))}</Text>
        </HStack>
        <Select label='Enter domain of the Top Hat to be linked' name='topHatDomain' localForm={localForm}>
          {map(wearerTopHats, (hat: Hex) => (
            <option value={hat} key={hat}>
              {hatIdDecimalToIp(BigInt(hat))}
            </option>
          ))}
        </Select>

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync || chainId !== currentChainId} isLoading={isLoading}>
            Request
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export { HatLinkRequestCreateForm };
