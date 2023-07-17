import { Button, Flex, Stack, Text } from '@chakra-ui/react';
import _ from 'lodash';
import { useForm } from 'react-hook-form';

import Select from '@/components/atoms/Select';
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import { decimalId, prettyIdToId, prettyIdToIp } from '@/lib/hats';

const HatLinkRequestCreateForm = ({
  newAdmin,
  wearerTopHats,
  chainId,
}: {
  newAdmin: string;
  wearerTopHats: string[];
  chainId: number;
}) => {
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

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'requestLinkTopHatToTree',
    args: [topHatDomain, decimalId(prettyIdToId(newAdmin))],
    chainId,
    onSuccessToastData: {
      title: 'Successfully Requested to Link!',
      description: `Successfully requested to link top hat ${prettyIdToIp(
        topHatDomain,
      )} to ${prettyIdToIp(newAdmin)}`,
    },
    queryKeys: [
      ['hatDetails', prettyIdToId(newAdmin)],
      ['hatDetails', prettyIdToId(topHatDomain)],
      ['treeDetails', topHatDomain],
      ['treeDetails', prettyIdToId(newAdmin)],
    ],
    enabled: Boolean(topHatDomain) && Boolean(newAdmin),
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
          <Button type='submit' isDisabled={!writeAsync} isLoading={isLoading}>
            Request
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatLinkRequestCreateForm;
