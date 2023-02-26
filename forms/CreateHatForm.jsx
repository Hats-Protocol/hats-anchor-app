import { Stack, Text, Flex, Button, Radio } from '@chakra-ui/react';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import useHatCreate from '../hooks/useHatCreate';
import { hatsAddresses, ZERO_ADDRESS } from '../constants';
import useDebounce from '../hooks/useDebounce';
import RadioBox from '../components/RadioBox';

// TODO more chains
const defaultChainId = 5;
const defaultDebounce = 1500;

const CreateHatForm = ({ defaultAdmin }) => {
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: { mutable: 'Mutable' },
  });
  const { handleSubmit, watch } = localForm;

  const admin = useDebounce(watch('admin'), defaultDebounce);
  const details = useDebounce(watch('details', ''), defaultDebounce);
  const maxSupply = useDebounce(watch('maxSupply', 1), defaultDebounce);
  const eligibility = useDebounce(
    watch('eligibility', ZERO_ADDRESS),
    defaultDebounce,
  );
  const toggle = useDebounce(watch('toggle', ZERO_ADDRESS), defaultDebounce);
  const mutable = useDebounce(watch('mutable', true), defaultDebounce);
  const imageUrl = useDebounce(watch('imageUrl', ''), defaultDebounce);

  const { writeAsync } = useHatCreate({
    hatsAddress: hatsAddresses(defaultChainId),
    admin,
    details,
    maxSupply: _.toNumber(maxSupply),
    eligibility,
    toggle,
    mutable,
    imageUrl,
  });

  const onSubmit = (data) => {
    console.log(data);
    console.log(writeAsync);
    writeAsync?.();
  };

  const dropZoneContent = {
    title: 'Upload an image',
    details: `What image do you want to represent this role? This will be the
      image that appears alongside the hat token in the Hats dapp,
      other apps integrating with Hats Protocol, and anywhere the hat
      NFTs are viewable.`,
    fileTypes: 'PNG, JPG, GIF up to 2MB',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Input
          localForm={localForm}
          name='admin'
          label='Admin ID'
          placeholder='5346721554326...'
          defaultValue={defaultAdmin}
        />
        <Textarea
          localForm={localForm}
          name='details'
          label='Details'
          helperText='Brief description for your profile. URLs are hyperlinked.'
          placeholder='Pass an IPFS hash or URL here to set the details for this hat. Or add a string of markdown directly, but be careful with gas. e.g. "This Hat is for the coordinator of the DAO&apos;s marketing work stream"'
        />
        <Input
          name='maxSupply'
          label='Max Supply'
          placeholder='69'
          localForm={localForm}
        />
        <Input
          name='eligibility'
          label='Eligibility'
          placeholder='0x'
          localForm={localForm}
        />
        <Input
          name='toggle'
          label='Toggle'
          placeholder='0x'
          localForm={localForm}
        />
        <RadioBox
          name='mutable'
          label='Mutable?'
          options={['Mutable', 'Immutable']}
          localForm={localForm}
          isRequired
        />

        {/* <Input
          name='mutable'
          label='Mutable'
          defaultValue='true'
          placeholder='true'
          localForm={localForm}
        /> */}
        <Input
          localForm={localForm}
          name='image'
          label='Image'
          placeholder='ipfs://test.jpg'
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

export default CreateHatForm;
