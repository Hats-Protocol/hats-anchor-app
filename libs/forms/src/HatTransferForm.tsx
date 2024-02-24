import {
  Button,
  Code,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { useHatContractWrite } from 'hats-hooks';
import { useDebounce } from 'hooks';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { toTreeId } from 'shared';
import { AddressInput } from 'ui';
import { formatAddress } from 'utils';
import { isAddress } from 'viem';
import { useChainId, useEnsAddress } from 'wagmi';

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

  const { writeAsync, isLoading, prepareErrorMessage } = useHatContractWrite({
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
      ['hatDetails', { id: hatId, chainId }],
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

  const isDisabled =
    !writeAsync || isLoading || isLoadingNewWearerResolvedAddress;

  const showNewResolvedAddress =
    newWearerResolvedAddress && newWearer !== newWearerResolvedAddress;

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
          showResolvedAddress={showNewResolvedAddress}
          resolvedAddress={newWearerResolvedAddress}
        />
        <Flex justify='flex-end'>
          <Tooltip label={prepareErrorMessage} isDisabled={!isDisabled}>
            <Button type='submit' isDisabled={isDisabled}>
              Transfer
            </Button>
          </Tooltip>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatTransferForm;
