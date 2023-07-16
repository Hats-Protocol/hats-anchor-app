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
import { isAddress } from 'viem';
import { useEnsAddress } from 'wagmi';

import useDebounce from '@/hooks/useDebounce';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import { formatAddress } from '@/lib/general';
import { prettyIdToId, toTreeId } from '@/lib/hats';

const HatWearerStatusForm = ({
  prettyId,
  chainId,
  wearer,
  eligibility,
}: {
  prettyId: string;
  chainId: number;
  wearer: string;
  eligibility: string;
}) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch, setValue } = localForm;
  const hatId = prettyIdToId(prettyId);
  const standing = useDebounce(watch('standing', 'Good Standing'));

  const {
    data: wearerResolvedAddress,
    isLoading: isLoadingWearerResolvedAddress,
  } = useEnsAddress({
    name: wearer,
    chainId: 1,
  });

  const wearerAddress = (wearerResolvedAddress ?? wearer) || '';

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'setHatWearerStatus',
    args: [hatId, wearerAddress, eligibility, standing],
    chainId,
    onSuccessToastData: {
      title: 'Wearer Status Updated',
      description: 'Successfully updated hat',
    },
    onErrorToastData: {
      title: 'Error occurred!',
    },
    queryKeys: [
      ['hatDetails', hatId],
      ['treeDetails', toTreeId(hatId)],
    ],
    transactionTimeout: 4000,
    enabled: isAddress(wearerAddress),
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={8}>
        <Text>
          Are you sure? The revoked Hats will loose all permissions instantly.
        </Text>

        <VStack alignItems='start'>
          <Text fontSize='sm'>REVOKING HAT OF:</Text>
          <HStack>
            <FaRegUserCircle />
            <Text>{formatAddress(wearer)}</Text>
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
            isDisabled={
              !wearer ||
              isLoading ||
              !writeAsync ||
              isLoadingWearerResolvedAddress
            }
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
