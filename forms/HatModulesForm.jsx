import _ from 'lodash';
import { Link as ChakraLink, Stack, Button, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import useModuleUpdate from '../hooks/useModuleUpdate';
import useDebounce from '../hooks/useDebounce';
import { hatsAddresses } from '../constants';

// TODO handle eligibility vs toggle
const defaultDebounce = 1500;
const defaultChainId = 5;
const defaultHatsAddress = hatsAddresses(defaultChainId);

const HatModulesForm = ({ hatId, type = 'ELIGIBILITY' }) => {
  const localForm = useForm();
  const { handleSubmit, watch } = localForm;

  const newAddress = useDebounce(watch('newAddress', null), defaultDebounce);

  const { writeAsync } = useModuleUpdate({
    hatsAddress: defaultHatsAddress,
    hatId,
    newAddress,
  });

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
          name='newAddress'
          label={`${_.capitalize(type)} Address`}
          placeholder='0x...'
        />

        <Flex justify='flex-end'>
          <Button type='submit'>Update</Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatModulesForm;
