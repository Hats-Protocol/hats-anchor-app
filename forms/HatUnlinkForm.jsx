import React, { useState } from 'react';
import {
  Stack,
  Button,
  Flex,
  Switch,
  Text,
  Heading,
  FormControl,
} from '@chakra-ui/react';
import { isAddress } from 'viem';
import _ from 'lodash';
import { useAccount } from 'wagmi';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import useDebounce from '../hooks/useDebounce';
import CONFIG from '../constants';
import useHatUnlinkTree from '../hooks/useHatUnlinkTree';
import { prettyIdToIp } from '../lib/hats';

const HatUnlinkForm = ({
  hatData,
  // chainId
}) => {
  const { address } = useAccount();
  const [userMintChecked, setUserMintChecked] = useState(true);
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;

  const wearer = useDebounce(watch('wearer', null), CONFIG.debounce);

  const { writeAsync, ensError, isLoading } = useHatUnlinkTree({
    hatsAddress: CONFIG.hatsAddress,
    hatData,
    wearer: userMintChecked ? address : wearer,
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text>
          Relinquish admin rights over the linked Top Hat, completely
          disconnecting it from the current tree.
        </Text>
        <Stack>
          <Text>Tree Domain</Text>
          <Heading size='md' fontFamily='mono'>
            #{prettyIdToIp(_.get(hatData, 'prettyId'))}
          </Heading>
        </Stack>
        <FormControl>
          <Switch
            isChecked={userMintChecked}
            onChange={() => setUserMintChecked(!userMintChecked)}
          >
            Mint to me
          </Switch>
          {!userMintChecked && (
            <Input
              localForm={localForm}
              name='wearer'
              label='New Wearer Address'
              options={{
                validate: (value) =>
                  isAddress(value) ? true : 'Must be a valid address',
              }}
              placeholder='0x4a75000089d9B5C25d7876403C3B91997911FCd9'
            />
          )}
        </FormControl>

        <Flex justify='flex-end'>
          <Button
            type='submit'
            isDisabled={!writeAsync || isLoading || ensError}
          >
            Unlink
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatUnlinkForm;
