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
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import { isAddress } from 'viem';
import { useChainId, useEnsAddress } from 'wagmi';

import Input from '@/components/atoms/Input';
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import { decimalId, prettyIdToIp, toTreeId } from '@/lib/hats';

const HatTransferForm = ({
  chainId,
  currentWearerAddress,
  hatId,
  prettyId,
}: {
  chainId: number;
  currentWearerAddress: string;
  hatId: string;
  prettyId: string | undefined;
}) => {
  const currentNetworkId = useChainId();
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;

  const newWearer = useDebounce(watch('newWearer', null), CONFIG.debounce);

  const {
    data: newWearerResolvedAddress,
    isLoading: isLoadingNewWearerResolvedAddress,
  } = useEnsAddress({
    name: newWearer,
    chainId: 1,
  });

  const newWearerAddress = newWearerResolvedAddress ?? newWearer;

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'transferHat',
    args: [decimalId(hatId), currentWearerAddress, newWearerAddress],
    chainId,
    onSuccessToastData: {
      title: `Top Hat Transferred!`,
      description: `Successfully transferred top hat #${prettyIdToIp(
        prettyId,
      )} from ${currentWearerAddress} to ${newWearerResolvedAddress}`,
    },
    queryKeys: [
      ['hatDetails', hatId],
      ['treeDetails', toTreeId(hatId)],
    ],
    enabled:
      Boolean(newWearerResolvedAddress ?? newWearer) &&
      Boolean(currentWearerAddress) &&
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
