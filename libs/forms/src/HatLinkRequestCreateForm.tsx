import { Button, Flex, HStack, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useDebounce } from 'hooks';
import { useTreeForm } from 'contexts';
import { useHatContractWrite } from 'hats-hooks';
import { decimalId } from 'hats-utils';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { Select } from 'ui';
import { Hex } from 'viem';
import { useChainId } from 'wagmi';

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
      topHatDomain: _.first(wearerTopHats),
    },
  });
  const { handleSubmit, watch } = localForm;

  const topHatDomain = useDebounce<Hex | undefined>(
    watch('topHatDomain', _.first(wearerTopHats)),
  );

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'requestLinkTopHatToTree',
    args: [topHatDomain, decimalId(newAdmin)],
    chainId,
    onSuccessToastData: {
      title: 'Successfully Requested to Link!',
      description:
        topHatDomain &&
        newAdmin &&
        `Successfully requested to link top hat ${hatIdDecimalToIp(
          BigInt(topHatDomain),
        )} to ${hatIdDecimalToIp(BigInt(newAdmin))}`,
    },
    queryKeys: [
      ['hatDetails', { id: newAdmin, chainId }],
      ['hatDetails', { id: topHatDomain, chainId }],
      ['treeDetails', topHatDomain || 'none', chainId || 1],
      ['treeDetails', newAdmin, chainId || 1],
    ],
    enabled:
      Boolean(topHatDomain) &&
      Boolean(newAdmin) &&
      !!chainId &&
      chainId === currentNetworkId,
  });

  const onSubmit = async () => {
    try {
      await writeAsync?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  if (_.isEmpty(wearerTopHats)) {
    return (
      <Stack spacing={4}>
        <Text>
          Ask the wearer of this hat to become the admin of a Top Hat that you
          are wearing. You will lose admin control of this Top Hat!
        </Text>
        <Text>
          You are not wearing any Top Hats that can be linked to this tree.
        </Text>
      </Stack>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text>
          Ask the wearer of this hat to become the admin of a Top Hat that you
          are wearing. You will lose admin control of this Top Hat!
        </Text>
        <HStack>
          <Text variant='medium'>New Admin:</Text>
          <Text>ID {hatIdDecimalToIp(BigInt(newAdmin))}</Text>
        </HStack>
        <Select
          label='Enter domain of the Top Hat to be linked'
          name='topHatDomain'
          localForm={localForm}
        >
          {_.map(wearerTopHats, (hat: Hex) => (
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
