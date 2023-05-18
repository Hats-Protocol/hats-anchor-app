import _ from 'lodash';
import { Stack, Button, Flex } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '@/components/Input';
import useModuleUpdate from '@/hooks/useModuleUpdate';
import useDebounce from '@/hooks/useDebounce';
import CONFIG, { MODULE_TYPES } from '@/constants';

const HatModulesForm = ({
  hatData,
  chainId,
  type = MODULE_TYPES.eligibility,
}) => {
  const localForm = useForm();
  const { handleSubmit, watch } = localForm;

  const newAddress = useDebounce(watch('newAddress', null), CONFIG.debounce);

  const { writeAsync } = useModuleUpdate({
    hatsAddress: CONFIG.hatsAddress,
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
          label={`New ${_.capitalize(
            type,
          )} Address — https://docs.hatsprotocol.xyz/#${_.capitalize(type)}`}
          placeholder='0x4a75000089d9B5C25d7876403C3B91997911FCd9'
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
