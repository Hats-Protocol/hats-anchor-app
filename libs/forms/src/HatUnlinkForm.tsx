'use client';

import { Button, Flex, Stack, Text } from '@chakra-ui/react';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useTreeForm } from 'contexts';
import { useHatContractWrite, useHatDetails } from 'hats-hooks';
import { useDebounce } from 'hooks';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { Select } from 'ui';
import { Hex, isAddress } from 'viem';

const HatUnlinkForm = ({ parentOfTrees }: { parentOfTrees: Hex[] }) => {
  const { chainId } = useTreeForm();
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      topHatPrettyId: parentOfTrees[0],
    },
  });
  const { handleSubmit, watch } = localForm;

  const topHatPrettyId = useDebounce<Hex>(
    watch('topHatPrettyId', parentOfTrees[0]),
  );

  const { data: topHatData } = useHatDetails({
    hatId: topHatPrettyId,
    chainId,
  });

  const wearer = topHatData?.wearers?.[0]?.id || '0x';

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'unlinkTopHatFromTree',
    args: [topHatPrettyId, wearer],
    chainId,
    onSuccessToastData: {
      title: `Top Hat Unlinked!`,
      description: `Successfully unlinked top hat #${hatIdDecimalToIp(
        BigInt(topHatPrettyId),
      )}`,
    },
    queryKeys: [['topHat', topHatPrettyId]],
    enabled: Boolean(topHatPrettyId) && Boolean(wearer) && isAddress(wearer),
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text>
          Relinquish admin rights over the linked Top Hat, completely
          disconnecting it from the current tree.
        </Text>

        <Select
          label='Enter domain of the Top Hat to be unlinked'
          name='topHatPrettyId'
          localForm={localForm}
        >
          {_.map(parentOfTrees, (hat: Hex) => (
            <option value={hat} key={hat}>
              {hatIdDecimalToIp(BigInt(hat))}
            </option>
          ))}
        </Select>

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync || isLoading}>
            Unlink
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatUnlinkForm;
