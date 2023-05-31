import React from 'react';
import { Stack, Button, Flex, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import _ from 'lodash';
import Select from '@/components/Select';
import useHatLinkRequestCreate from '@/hooks/useHatLinkRequestCreate';
import useDebounce from '@/hooks/useDebounce';
import CONFIG from '@/constants';
import { prettyIdToIp, prettyIdToId, decimalId } from '@/lib/hats';

const HatLinkRequestCreateForm = ({ newAdmin, wearerTopHats, chainId }) => {
  const localForm = useForm({
    mode: 'all',
    defaultValues: {
      newAdmin: decimalId(prettyIdToId(newAdmin)),
      topHatDomain: wearerTopHats[0],
    },
  });
  const { handleSubmit, watch } = localForm;

  const topHatDomain = useDebounce(
    watch('topHatDomain', wearerTopHats[0]),
    CONFIG.debounce,
  );

  const { writeAsync, isLoading } = useHatLinkRequestCreate({
    chainId,
    newAdmin,
    topHatDomain,
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text>
          Ask the Wearer of this Hat to become the admin of a Top Hat that you
          are wearing. You will lose admin control of this Top Hat!
        </Text>
        <Flex>
          <Text fontWeight={500} mr={2}>
            New Admin:
          </Text>
          <Text>ID {prettyIdToIp(newAdmin)}</Text>
        </Flex>
        <Select
          label='Enter domain of the Top Hat to be linked'
          name='topHatDomain'
          localForm={localForm}
        >
          {_.map(wearerTopHats, (hat) => (
            <option value={hat} key={hat}>
              {prettyIdToIp(hat)}
            </option>
          ))}
        </Select>

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync || isLoading}>
            Request
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatLinkRequestCreateForm;
