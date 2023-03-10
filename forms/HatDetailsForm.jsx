import _ from 'lodash';
import { Stack, Flex, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import Textarea from '../components/Textarea';
import useHatDetailsUpdate from '../hooks/useHatDetailsUpdate';
import CONFIG, { hatsAddresses } from '../constants';
import useDebounce from '../hooks/useDebounce';

const HatDetailsForm = ({ hatData, chainId }) => {
  const localForm = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = localForm;

  const details = useDebounce(watch('details'), CONFIG.debounce);

  const { writeAsync } = useHatDetailsUpdate({
    hatsAddress: hatsAddresses(chainId),
    chainId,
    hatId: _.get(hatData, 'id'),
    details,
  });

  const onSubmit = () => {
    writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Textarea localForm={localForm} name='details' label='Details' />

        <Flex>
          <Button type='submit' isDisabled={!writeAsync}>
            Save
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatDetailsForm;
