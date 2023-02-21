import { Stack, Heading, Text, Flex, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';

const detailFunctions = ['changeHatDetails', 'changeHatImageUri'];

const HatDetailsForm = () => {
  const localForm = useForm();
  const { handleSubmit } = localForm;

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Heading as='h3'>Hat Information</Heading>
        <Text>Some note.</Text>
      </Stack>

      <Stack spacing={4}>
        <Input localForm={localForm} name='adminId' label='Admin ID' />
        {/* <RadioBox name='mutable' values={[true, false]} /> */}
        <Input
          localForm={localForm}
          name='maxSupply'
          label='Maximum Number of Wearers'
        />
      </Stack>

      <Flex>
        <Button type='submit'>Save</Button>
      </Flex>
    </form>
  );
};

export default HatDetailsForm;
