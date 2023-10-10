import { Button, Flex, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import { Hex, isAddress } from 'viem';

import Select from '@/components/atoms/Select';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useDebounce from '@/hooks/useDebounce';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useHatDetails from '@/hooks/useHatDetails';
import { prettyIdToIp } from '@/lib/hats';

// TODO refactor without prettyId

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
