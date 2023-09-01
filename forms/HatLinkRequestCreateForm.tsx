import { Button, Flex, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { Hex } from 'viem';
import { useChainId } from 'wagmi';

import Select from '@/components/atoms/Select';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useDebounce from '@/hooks/useDebounce';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import { decimalId } from '@/lib/hats';

const HatLinkRequestCreateForm = ({
  newAdmin,
  wearerTopHats,
}: {
  newAdmin: string;
  wearerTopHats: Hex[];
}) => {
  const currentNetworkId = useChainId();
  const { chainId } = useTreeForm();
  const localForm = useForm({
    mode: 'all',
    defaultValues: {
      newAdmin: decimalId(newAdmin),
      topHatDomain: wearerTopHats[0],
    },
  });
  const { handleSubmit, watch } = localForm;

  const topHatDomain = useDebounce<Hex>(
    watch('topHatDomain', wearerTopHats[0]),
  );

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'requestLinkTopHatToTree',
    args: [topHatDomain, newAdmin],
    chainId,
    onSuccessToastData: {
      title: 'Successfully Requested to Link!',
      description: `Successfully requested to link top hat ${hatIdDecimalToIp(
        BigInt(topHatDomain),
      )} to ${hatIdDecimalToIp(BigInt(newAdmin))}`,
    },
    queryKeys: [
      ['hatDetails', newAdmin, chainId || 1],
      ['hatDetails', topHatDomain, chainId || 1],
      ['treeDetails', topHatDomain, chainId || 1],
      ['treeDetails', newAdmin, chainId || 1],
    ],
    enabled:
      Boolean(topHatDomain) &&
      Boolean(newAdmin) &&
      !!chainId &&
      chainId === currentNetworkId,
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text>
          Ask the wearer of this hat to become the admin of a Top Hat that you
          are wearing. You will lose admin control of this Top Hat!
        </Text>
        <Flex>
          <Text fontWeight='medium' mr={2}>
            New Admin:
          </Text>
          <Text>ID {hatIdDecimalToIp(BigInt(newAdmin))}</Text>
        </Flex>
        <Select
          label='Enter domain of the Top Hat to be linked'
          name='topHatDomain'
          localForm={localForm}
        >
          {_.map(wearerTopHats, (hat) => (
            <option value={hat} key={hat}>
              {hatIdDecimalToIp(BigInt(hat))}
            </option>
          ))}
        </Select>

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync} isLoading={isLoading}>
            Request
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatLinkRequestCreateForm;
