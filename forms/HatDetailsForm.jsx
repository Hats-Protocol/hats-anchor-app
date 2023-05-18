import _ from 'lodash';
import { Stack, Flex, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import Textarea from '@/components/Textarea';
import useHatDetailsUpdate from '@/hooks/useHatDetailsUpdate';
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';

const HatDetailsForm = ({ hatData, chainId }) => {
  const localForm = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = localForm;

  const details = useDebounce(watch('details'));

  const { writeAsync } = useHatDetailsUpdate({
    hatsAddress: CONFIG.hatsAddress,
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
        <Textarea
          localForm={localForm}
          name='details'
          label='New Details'
          placeholder='Marketing Facilitator Hat: responsibilities, authorities, qualifications.'
          helperText='Name and description of the hat. Pass an IPFS hash or URL here to set additional responsibilities for this hat, or add a string of markdown directly (but be careful with gas!)'
        />

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync}>
            Update
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatDetailsForm;
