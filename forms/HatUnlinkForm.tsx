import { Button, Flex, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { isAddress } from 'viem';

import Select from '@/components/Select';
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useHatDetails from '@/hooks/useHatDetails';
import { prettyIdToId, prettyIdToIp } from '@/lib/hats';

const HatUnlinkForm = ({
  parentOfTrees,
  chainId,
}: {
  parentOfTrees: string[];
  chainId: number;
}) => {
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      topHatPrettyId: parentOfTrees[0],
    },
  });
  const { handleSubmit, watch } = localForm;

  const topHatPrettyId = useDebounce(
    watch('topHatPrettyId', parentOfTrees[0]),
    CONFIG.debounce,
  );

  const { data: topHatData } = useHatDetails({
    hatId: prettyIdToId(topHatPrettyId),
    chainId,
  });

  const wearer = topHatData?.wearers?.[0]?.id || '0x';

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'unlinkTopHatFromTree',
    args: [topHatPrettyId, wearer],
    chainId,
    onSuccessToastData: {
      title: `Top Hat Unlinked!`,
      description: `Successfully unlinked top hat #${prettyIdToIp(
        topHatPrettyId,
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
          {_.map(parentOfTrees, (hat) => (
            <option value={hat} key={hat}>
              {prettyIdToIp(hat)}
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
