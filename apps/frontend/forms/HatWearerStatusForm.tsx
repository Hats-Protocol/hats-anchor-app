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
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { FaRegQuestionCircle, FaRegUserCircle } from 'react-icons/fa';
import { Hex, isAddress } from 'viem';
import { useAccount, useChainId, useEnsName } from 'wagmi';

import { useOverlay } from '../contexts/OverlayContext';
import { useTreeForm } from '../contexts/TreeFormContext';
import useDebounce from '../hooks/useDebounce';
import useHatContractWrite from '../hooks/useHatContractWrite';
import { formatAddress } from '../lib/general';
import { toTreeId } from '../lib/hats';

const HatWearerStatusForm = ({
  wearer,
  eligibility,
}: {
  wearer: Hex | undefined;
  // TODO is there a reason for this to be passed from above?
  eligibility: string;
}) => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();
  const { setModals } = useOverlay();
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch, setValue } = localForm;
  const { chainId, selectedHat } = useTreeForm();

  const hatId = selectedHat?.id;
  const standing = useDebounce<string>(watch('standing', 'Good Standing'));

  const { data: wearerName } = useEnsName({
    address: wearer,
    chainId: 1,
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
    onSuccessToastData: {
      title: 'Wearer Status Updated',
      description: 'Successfully updated hat',
    },
    queryKeys: [
      ['hatDetails', { id: hatId, chainId }],
      ['treeDetails', _.toNumber(toTreeId(hatId))],
    ],
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
          <Text fontSize='sm'>REVOKING HAT OF:</Text>
          <HStack>
            <FaRegUserCircle />
            <Text>{wearerName || formatAddress(wearer)}</Text>
            {wearerName && <Text fontSize='sm'>({formatAddress(wearer)})</Text>}
          </HStack>
        </VStack>

        <VStack alignItems='start'>
          <HStack>
            <Text>WEARER STANDING</Text>
            <FaRegQuestionCircle />
          </HStack>
          <Text color='gray.600'>
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
