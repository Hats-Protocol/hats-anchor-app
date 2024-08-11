'use client';

import {
  Button,
  Flex,
  HStack,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useHatContractWrite } from 'hats-hooks';
import { useDebounce, useWaitForSubgraph } from 'hooks';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { FaRegQuestionCircle, FaRegUserCircle } from 'react-icons/fa';
import { idToIp, toTreeId } from 'shared';
import { formatAddress, viemPublicClient } from 'utils';
import { Hex, isAddress } from 'viem';
import { useAccount, useChainId, useEnsName } from 'wagmi';

const HatWearerStatusForm = ({
  wearer,
  eligibility,
}: {
  wearer: Hex | undefined;
  eligibility: string; // form value
}) => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();
  const { setModals, handlePendingTx } = useOverlay();
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch, setValue } = localForm;
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();

  const hatId = selectedHat?.id;
  const standing = useDebounce<string>(watch('standing', 'Good Standing'));

  const { data: wearerName } = useEnsName({
    address: wearer,
    chainId: 1,
  });

  const getSuccessToastDescription = () => {
    if (eligibility !== 'Eligible') {
      return `Removed hat ${idToIp(hatId)} from ${formatAddress(wearerName)}${
        standing === 'Good Standing' ? '' : ' and set bad standing'
      }`;
    }

    return '';
  };

  const txDescription = getSuccessToastDescription();

  const waitForSubgraph = useWaitForSubgraph({
    fetchHelper: () => {
      if (!chainId) return Promise.reject(Error('No chainId'));
      return viemPublicClient(chainId).readContract({
        address: CONFIG.hatsAddress,
        abi: CONFIG.hatsAbi,
        functionName: 'isEligible',
        args: [wearer, hatId],
      });
    },
    checkResult: (isEligible) => !isEligible,
  });

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'setHatWearerStatus',
    args: [
      hatId,
      wearer,
      eligibility === 'Eligible',
      standing === 'Good Standing',
    ],
    chainId,
    queryKeys: [
      ['hatDetails', { id: hatId, chainId }],
      ['treeDetails', _.toNumber(toTreeId(hatId))],
    ],
    txDescription,
    handlePendingTx,
    waitForSubgraph,
    successToastData: {
      title: 'Wearer Status Updated',
      description: txDescription,
    },
    enabled:
      !!wearer &&
      !!hatId &&
      isAddress(wearer) &&
      _.toLower(address) === selectedHat.eligibility &&
      chainId === currentNetworkId,
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={8}>
        <Text>
          Are you sure? The revoked Hats will lose all permissions instantly.
        </Text>

        <VStack alignItems='start'>
          <Text size='sm' textTransform='uppercase'>
            Revoking hat of:
          </Text>
          <HStack>
            <FaRegUserCircle />
            <Text>{wearerName || formatAddress(wearer)}</Text>
            {wearerName && <Text size='sm'>({formatAddress(wearer)})</Text>}
          </HStack>
        </VStack>

        <VStack alignItems='start'>
          <HStack>
            <Text>WEARER STANDING</Text>
            <FaRegQuestionCircle />
          </HStack>
          <Text variant='gray'>
            Changes of wearer standing are being recorded on chain. To change it
            back to good you will have to submit a smart contract transaction.
          </Text>
        </VStack>

        <RadioGroup
          name='standing'
          defaultValue='Good Standing'
          onChange={(value) => setValue('standing', value)}
        >
          <HStack spacing={4}>
            <Radio value='Good Standing'>Good Standing</Radio>
            <Radio value='Bad Standing'>Bad Standing</Radio>
          </HStack>
        </RadioGroup>

        <Flex justify='flex-end' gap='3'>
          <Button onClick={() => setModals?.({})}>Cancel</Button>
          <Button
            type='submit'
            isDisabled={!wearer || isLoading || !writeAsync}
            isLoading={isLoading}
            colorScheme={standing === 'Good Standing' ? 'blue' : 'red'}
          >
            Revoke Hat Token in {standing}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatWearerStatusForm;
