import _ from 'lodash';
import { Stack, Flex, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '@/components/Input';
import useHatSupplyUpdate from '@/hooks/useHatSupplyUpdate';
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';

const HatSupplyForm = ({ hatData, chainId }) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;

  const amount = useDebounce(watch('amount'), CONFIG.defaultDebounce);

  const { writeAsync } = useHatSupplyUpdate({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId: _.get(hatData, 'id'),
    amount,
  });

  const onSubmit = () => {
    writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Input
          localForm={localForm}
          name='amount'
          label='New Max Supply'
          placeholder='10'
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

export default HatSupplyForm;
