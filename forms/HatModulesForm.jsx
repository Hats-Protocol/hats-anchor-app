import _ from 'lodash';
import { Stack, Button, Flex } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import useModuleUpdate from '../hooks/useModuleUpdate';
import useDebounce from '../hooks/useDebounce';
import { hatsAddresses, MODULE_TYPES } from '../constants';

const defaultDebounce = 1500;
const defaultChainId = 5;
const defaultHatsAddress = hatsAddresses(defaultChainId);

const HatModulesForm = ({
  hatData,
  chainId,
  type = MODULE_TYPES.eligibility,
}) => {
  const localForm = useForm();
  const { handleSubmit, watch } = localForm;

  const newAddress = useDebounce(watch('newAddress', null), defaultDebounce);

  // TODO hook up
  const { writeAsync } = useModuleUpdate({
    hatsAddress: defaultHatsAddress,
    chainId,
    hatId: hatData.id,
    moduleType: type,
    newAddress,
  });

  const onSubmit = () => {
    writeAsync?.();
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
          <Button type='submit' isDisabled={!writeAsync}>
            Update
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatModulesForm;
