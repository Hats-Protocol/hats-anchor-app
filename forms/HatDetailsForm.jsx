import { Stack, Heading, Text, Flex, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import Textarea from '../components/Textarea';

const HatDetailsForm = () => {
  const localForm = useForm();
  const { handleSubmit } = localForm;

  const onSubmit = (data) => {
    console.log(data);
  };

  // <span className='inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm'>
  //   hatsprotocol.xyz/
  // </span>

  const dropZoneContent = {
    title: 'Upload an image',
    details: `What image do you want to represent this role? This will be the
      image that appears alongside the hat token in the Hats dapp,
      other apps integrating with Hats Protocol, and anywhere the hat
      NFTs are viewable.`,
    fileTypes: 'PNG, JPG, GIF up to 10MB',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Heading as='h3'>Hat Details</Heading>
        <Text>Some note.</Text>
      </Stack>

      <Stack>
        <Input localForm={localForm} name='hatName' label='Hat Name' />
        <Textarea
          localForm={localForm}
          name='details'
          label='Details'
          helperText='Brief description for your profile. URLs are hyperlinked.'
          placeholder='This Hat is for the coordinator of the DAO&amp;s marketing workstream'
        />
        <Input localForm={localForm} name='image' label='Image' />
      </Stack>

      <Flex>
        <Button type='submit'>Save</Button>
      </Flex>
    </form>
  );
};

export default HatDetailsForm;
