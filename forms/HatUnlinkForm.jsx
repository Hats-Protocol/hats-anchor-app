import React from 'react';
import { Stack, Button, Flex, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useAccount } from 'wagmi';
import { useForm } from 'react-hook-form';
import useDebounce from '../hooks/useDebounce';
import CONFIG from '../constants';
import useHatUnlinkTree from '../hooks/useHatUnlinkTree';
import { prettyIdToIp } from '../lib/hats';
import Select from '../components/Select';

const HatUnlinkForm = ({ parentOfTrees }) => {
  const { address } = useAccount();
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

  const { writeAsync } = useHatUnlinkTree({
    topHatPrettyId,
    wearer: address,
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
          <Button type='submit' isDisabled={!writeAsync}>
            Unlink
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatUnlinkForm;
