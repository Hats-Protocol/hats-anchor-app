import _ from 'lodash';
import { Stack, Button, Flex, Box, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import Input from '../components/Input';
import useModuleUpdate from '../hooks/useModuleUpdate';
import useDebounce from '../hooks/useDebounce';
import CONFIG, { MODULE_TYPES } from '../constants';

const HatModulesForm = ({
  hatData,
  chainId,
  type = MODULE_TYPES.eligibility,
}) => {
  const localForm = useForm();
  const { handleSubmit, watch } = localForm;

  const newAddress = useDebounce(watch('newAddress', null), CONFIG.debounce);

  const { writeAsync, isLoading, newResolvedAddress } = useModuleUpdate({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId: hatData.id,
    moduleType: type,
    newAddress,
  });

  const onSubmit = () => {
    writeAsync?.();
  };

  const showNewResolvedAddress =
    newResolvedAddress && newAddress !== newResolvedAddress;

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

        <Box>
          <Input
            localForm={localForm}
            name='newAddress'
            label={`New ${_.capitalize(
              type,
            )} Address — https://docs.hatsprotocol.xyz/#${_.capitalize(type)}`}
            placeholder='0x1234, vitalik.eth'
            rightElement={showNewResolvedAddress && <FaCheck color='green' />}
          />

          {showNewResolvedAddress && (
            <Text fontSize='sm' color='gray.500' mt={1}>
              Resolved address: {newResolvedAddress}
            </Text>
          )}
        </Box>

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync || isLoading}>
            Update
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatModulesForm;
