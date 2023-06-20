import { Stack, Button, Flex, Text } from '@chakra-ui/react';
import _ from 'lodash';
import React from 'react';
import { useForm } from 'react-hook-form';

import Select from '@/components/Select';
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatDetails from '@/hooks/useHatDetails';
import useHatUnlinkTree from '@/hooks/useHatUnlinkTree';
import { prettyIdToIp, prettyIdToId } from '@/lib/hats';

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

  const { writeAsync, isLoading } = useHatUnlinkTree({
    topHatPrettyId,
    wearer: topHatData?.wearers?.[0]?.id || '0x',
    chainId,
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
