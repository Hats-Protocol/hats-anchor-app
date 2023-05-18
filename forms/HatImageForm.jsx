import _ from 'lodash';
import { Stack, Flex, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '@/components/Input';
import useHatImageUpdate from '@/hooks/useHatImageUpdate';
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';

const HatImageForm = ({ hatData, chainId }) => {
  const localForm = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = localForm;

  const image = useDebounce(watch('image'));

  const { writeAsync } = useHatImageUpdate({
    hatsAddress: CONFIG.hatsAddress,
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
        <Input
          localForm={localForm}
          name='image'
          label='New Image'
          placeholder='ipfs://QmbQy4vsu4aAHuQwpHoHUsEURtiYKEbhv7ouumBXiierp9?filename=hats%20hat.jpg'
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

export default HatImageForm;
