import { Stack, Flex, Button } from '@chakra-ui/react';
import _ from 'lodash';
import { useForm } from 'react-hook-form';

import Input from '@/components/Input';
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatSupplyUpdate from '@/hooks/useHatSupplyUpdate';

const HatSupplyForm = ({
  hatData,
  chainId,
}: {
  hatData: any;
  chainId: number;
}) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;

  const amount = useDebounce(watch('amount'), CONFIG.debounce);

  const { writeAsync, isLoading } = useHatSupplyUpdate({
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
          <Button type='submit' isDisabled={!writeAsync || isLoading}>
            Update
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatSupplyForm;
