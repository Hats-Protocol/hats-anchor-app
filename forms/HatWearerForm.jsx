import React from 'react';
import { Link as ChakraLink, Stack, Button, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';

const HatWearerForm = () => {
  const localForm = useForm();
  const { handleSubmit } = localForm;

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <ChakraLink
          as={Link}
          href='https://github.com/Hats-Protocol/hats-protocol#eligibility'
          isExternal
        >
          View docs for more information about eligibility and toggle {'->'}
        </ChakraLink>
        <Input
          localForm={localForm}
          name='newWearer'
          label='New Wearer Address'
        />

        <Flex justify='flex-end'>
          <Button type='submit'>Save</Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatWearerForm;
