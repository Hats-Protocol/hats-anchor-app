import { Link as ChakraLink, Stack, Button } from '@chakra-ui/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';

// TODO handle eligibility vs toggle

const HatModulesForm = () => {
  const localForm = useForm();
  const { handleSubmit } = localForm;

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        {/* <ChakraLink
          as={Link}
          href='https://github.com/Hats-Protocol/hats-protocol#eligibility'
          isExternal
        >
          View docs for more information about eligibility and toggle {'->'}
        </ChakraLink> */}

        <Input
          localForm={localForm}
          name='eligibility'
          label='Eligibility Address'
        />

        <Button type='submit'>Save</Button>
      </Stack>
    </form>
  );
};

export default HatModulesForm;
