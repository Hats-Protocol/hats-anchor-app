import _ from 'lodash';
import { Stack, Flex, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import useHatImageUpdate from '../hooks/useHatImageUpdate';
import { hatsAddresses } from '../constants';
import useDebounce from '../hooks/useDebounce';

const defaultDebounce = 1500;
const defaultChainId = 5;
const defaultHatsAddress = hatsAddresses(defaultChainId);

const HatImageForm = ({ hatData, chainId }) => {
  const localForm = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = localForm;

  const image = useDebounce(watch('image'), defaultDebounce);

  const { writeAsync } = useHatImageUpdate({
    hatsAddress: defaultHatsAddress,
    chainId,
    hatId: _.get(hatData, 'id'),
    image,
  });

  const onSubmit = () => {
    writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Input localForm={localForm} name='image' label='Image' />

        <Flex>
          <Button type='submit' isDisabled={!writeAsync}>
            Save
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatImageForm;
