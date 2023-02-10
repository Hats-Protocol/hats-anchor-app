import { Card, CardBody, Heading, Text, Stack, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';

const HatModulesForm = () => {
  const localForm = useForm();
  const { handleSubmit } = localForm;

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Heading as='h3'>Hat Modules</Heading>
        <Text>
          View docs for more information about eligibility and toggle:
          https://github.com/Hats-Protocol/hats-protocol#eligibility
        </Text>
      </Stack>

      <Stack>
        <Input
          localForm={localForm}
          name='eligibility'
          label='Eligibility Address'
        />
        <Input localForm={localForm} name='toggle' label='Toggle Address' />
      </Stack>

      <Button type='submit'>Save</Button>
    </form>
  );
};

export default HatModulesForm;
