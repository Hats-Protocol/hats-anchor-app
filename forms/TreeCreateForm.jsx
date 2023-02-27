import { Stack, Flex, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import useTreeCreate from '../hooks/useTreeCreate';
import { hatsAddresses } from '../constants';
import useDebounce from '../hooks/useDebounce';

// TODO more chains
const defaultChainId = 5;
const defaultDebounce = 1500;

const TreeCreateForm = () => {
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: { mutable: 'Mutable' },
  });
  const { handleSubmit, watch } = localForm;

  const details = useDebounce(watch('details', ''), defaultDebounce);
  const imageUrl = useDebounce(watch('imageUrl', ''), defaultDebounce);
  const receiver = useDebounce(watch('receiver'), defaultDebounce);

  const { writeAsync } = useTreeCreate({
    hatsAddress: hatsAddresses(defaultChainId),
    details,
    imageUrl,
    receiver,
  });
  console.log(writeAsync);

  const onSubmit = () => {
    writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Textarea
          localForm={localForm}
          name='details'
          label='Details'
          helperText='Brief description for your profile. URLs are hyperlinked.'
          placeholder='Pass an IPFS hash or URL here to set the details for this hat. Or add a string of markdown directly, but be careful with gas. e.g. "This Hat is for the coordinator of the DAO&apos;s marketing work stream"'
        />
        <Input
          localForm={localForm}
          name='image'
          label='Image'
          placeholder='ipfs://test.jpg'
        />
        <Input
          name='receiver'
          label='Receiver'
          placeholder='0xabcd...'
          localForm={localForm}
        />

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync}>
            Create
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default TreeCreateForm;
