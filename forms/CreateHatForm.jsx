import { Stack, Text, Flex, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import useHatCreate from '../hooks/useHatCreate';
import { hatsAddresses, ZERO_ADDRESS } from '../constants';
import useDebounce from '../hooks/useDebounce';

// TODO more chains
const defaultChainId = 5;
const defaultDebounce = 1500;

const CreateHatForm = () => {
  const localForm = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = localForm;

  const admin = useDebounce(watch('admin'), defaultDebounce);
  // const name = useDebounce(watch('name'), defaultDebounce);
  const details = useDebounce(watch('details', ''), defaultDebounce);
  const maxSupply = useDebounce(watch('maxSupply', 1), defaultDebounce);
  const eligibility = useDebounce(
    watch('eligibility', ZERO_ADDRESS),
    defaultDebounce,
  );
  const toggle = useDebounce(watch('toggle', ZERO_ADDRESS), defaultDebounce);
  const mutable = useDebounce(watch('mutable', true), defaultDebounce);
  const imageUrl = useDebounce(watch('imageUrl', ''), defaultDebounce);

  // console.log(adminId);
  const { writeAsync } = useHatCreate({
    hatsAddress: hatsAddresses(defaultChainId),
    admin,
    details,
    maxSupply,
    eligibility,
    toggle,
    mutable,
    imageUrl,
  });

  const onSubmit = (data) => {
    console.log(data);
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
        <Text>Some note.</Text>

        <Input localForm={localForm} name='admin' label='Admin ID' />
        {/* <Input localForm={localForm} name='name' label='Hat Name' /> */}
        <Textarea
          localForm={localForm}
          name='details'
          label='Details'
          helperText='Brief description for your profile. URLs are hyperlinked.'
          placeholder={`Pass an IPFS hash or URL here to set the details for this hat. Or add a string of markdown directly, but be careful with gas.
          
          This Hat is for the coordinator of the DAO&amp;s marketing workstream`}
        />
        <Input name='maxSupply' label='Max Supply' localForm={localForm} />
        <Input name='eligibility' label='Eligibility' localForm={localForm} />
        <Input name='toggle' label='Toggle' localForm={localForm} />
        <Input name='mutable' label='Mutable' localForm={localForm} />
        <Input localForm={localForm} name='image' label='Image' />

        <Flex justify='flex-end'>
          <Button type='submit'>Create</Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default CreateHatForm;
