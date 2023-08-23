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
import { useForm } from 'react-hook-form';
import { FaRegQuestionCircle, FaRegUserCircle } from 'react-icons/fa';
import { Hex, isAddress } from 'viem';
import { useChainId, useEnsName } from 'wagmi';

import useDebounce from '@/hooks/useDebounce';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import { formatAddress } from '@/lib/general';
import { toTreeId } from '@/lib/hats';

const HatWearerStatusForm = ({
  hatId,
  chainId,
  wearer,
  eligibility,
}: {
  hatId: string;
  chainId: number;
  wearer: Hex | undefined;
  // TODO is there a reason for this to be passed from above?
  eligibility: string;
}) => {
  const currentNetworkId = useChainId();
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch, setValue } = localForm;
  const standing = useDebounce(watch('standing', 'Good Standing'));

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
      ['hatDetails', hatId],
      ['treeDetails', toTreeId(hatId)],
    ],
    enabled: !!wearer && isAddress(wearer) && chainId === currentNetworkId,
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
          <Button>Cancel</Button>
          <Button
            type='submit'
            isDisabled={!wearer || isLoading || !writeAsync}
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
