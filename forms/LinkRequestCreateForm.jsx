import React from 'react';
import { Stack, Button, Flex, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import Select from '../components/Select';
import useLinkRequestCreate from '../hooks/useLinkRequestCreate';
import useDebounce from '../hooks/useDebounce';
import CONFIG from '../constants';

const LinkRequestCreateForm = ({ newAdmin, wearerHats, chainId }) => {
  const localForm = useForm({
    mode: 'all',
    defaultValues: { newAdmin, topHatDomain: wearerHats[0] },
  });
  const { handleSubmit, watch } = localForm;

  const topHatDomain = useDebounce(
    watch('topHatDomain', wearerHats[0]),
    CONFIG.debounce,
  );

  const { writeAsync } = useLinkRequestCreate({
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
        <Input
          label='New Admin'
          name='newAdmin'
          isDisabled
          localForm={localForm}
        />
        <Select
          label='Enter domain of the Top Hat to be linked'
          name='topHatDomain'
          localForm={localForm}
        >
          {wearerHats.map((hat) => (
            <option value={hat} key={hat}>
              {hat}
            </option>
          ))}
        </Select>

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync}>
            Request
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default LinkRequestCreateForm;
