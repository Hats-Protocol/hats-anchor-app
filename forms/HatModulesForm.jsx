import _ from 'lodash';
import { Link as ChakraLink, Stack, Button, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import useModuleUpdate from '../hooks/useModuleUpdate';

// TODO handle eligibility vs toggle

const HatModulesForm = ({ type = 'ELIGIBILITY' }) => {
  const localForm = useForm();
  const { handleSubmit } = localForm;

  // const { writeAsync } = useModuleUpdate({ hatsAddress, hatId, newWearer });

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
          name={_.toLower(type)}
          label={`${_.capitalize(type)} Address`}
          placeholder='0x...'
        />

        <Flex justify='flex-end'>
          <Button type='submit'>Save</Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatModulesForm;
