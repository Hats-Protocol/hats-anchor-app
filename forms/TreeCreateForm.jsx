import { useState } from 'react';
import {
  Stack,
  Flex,
  Button,
  Switch,
  FormControl,
  FormLabel,
  HStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useChainId } from 'wagmi';

import Input from '../components/Input';
import Textarea from '../components/Textarea';
import useTreeCreate from '../hooks/useTreeCreate';
import CONFIG, { hatsAddresses } from '../constants';
import useDebounce from '../hooks/useDebounce';

const TreeCreateForm = () => {
  const localForm = useForm({
    mode: 'onChange',
  });
  const { handleSubmit, watch } = localForm;
  const { chainId } = useChainId();

  const [overrideReceiver, setOverrideReceiver] = useState(false);
  const details = useDebounce(watch('details', ''), CONFIG.debounce);
  const imageUrl = useDebounce(watch('imageUrl', ''), CONFIG.debounce);
  const receiver = useDebounce(watch('receiver'), CONFIG.debounce);

  const { writeAsync } = useTreeCreate({
    hatsAddress: hatsAddresses(chainId),
    details,
    imageUrl,
    receiver,
    overrideReceiver,
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

        <FormControl>
          <HStack>
            <Switch
              id='overrideReceiver'
              isChecked={!overrideReceiver}
              onChange={() => setOverrideReceiver(!overrideReceiver)}
            />
            <FormLabel htmlFor='overrideReceiver'>Mint to Me</FormLabel>
          </HStack>
        </FormControl>

        {overrideReceiver && (
          <Input
            name='receiver'
            label='Receiver'
            placeholder='0xabcd...'
            localForm={localForm}
          />
        )}

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
