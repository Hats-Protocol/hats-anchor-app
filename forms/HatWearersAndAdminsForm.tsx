/* eslint-disable no-nested-ternary */
import {
  Stack,
  Flex,
  Button,
  FormControl,
  Switch,
  FormLabel,
  HStack,
  Box,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';

import Input from '@/components/Input';
import { ZERO_ADDRESS } from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import RadioBox from '@/components/RadioBox';
import { prettyIdToIp } from '@/lib/hats';

const HatWearersAndAdminsForm = ({
  defaultAdmin,
}: {
  defaultAdmin: string | undefined;
}) => {
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      maxSupply: 1,
      eligibility: '',
      toggle: '',
    },
  });
  const { handleSubmit, watch } = localForm;
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [toggleChecked, setInputChecked] = useState(false);

  const maxSupply = useDebounce(watch('maxSupply', 1));
  console.log('maxSupply', maxSupply);
  const eligibility = useDebounce(watch('eligibility', ZERO_ADDRESS));
  const toggle = useDebounce(watch('toggle', ZERO_ADDRESS));

  const decimalAdmin = prettyIdToIp(defaultAdmin);

  const toggleResolvedAddress = 'toggle';
  const eligibilityResolvedAddress = 'eligibility';

  const showEligibilityResolvedAddress =
    eligibilityResolvedAddress && eligibilityResolvedAddress !== eligibility;
  const showToggleResolvedAddress =
    toggleResolvedAddress && toggleResolvedAddress !== toggle;

  const onSubmit = async () => {
    // writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={6}>
        <Input
          localForm={localForm}
          name='admin'
          label='Admin of Hat'
          defaultValue={decimalAdmin}
          isDisabled
        />
        <Input
          name='maxSupply'
          label='Max Supply'
          placeholder='10'
          localForm={localForm}
        />
        <RadioBox
          name='mutable'
          label='Mutablility'
          options={['Mutable', 'Immutable']}
          helperText='Whether or not this Hat should be able to be modified by its Admin. If unsure, default to mutable. This can be changed from mutable to immutable later (but not the other way).'
          localForm={localForm}
          isRequired
        />
        <FormControl>
          <HStack>
            <Switch
              isChecked={eligibilityChecked}
              onChange={() => setEligibilityChecked(!eligibilityChecked)}
            />
            {!eligibilityChecked && <FormLabel>Set Eligibility</FormLabel>}
            {eligibilityChecked && (
              <Box>
                <Input
                  name='eligibility'
                  label='Eligibility — https://docs.hatsprotocol.xyz/#eligibility'
                  placeholder='0x1234, vitalik.eth'
                  rightElement={
                    showEligibilityResolvedAddress && <FaCheck color='green' />
                  }
                  localForm={localForm}
                />
                {showEligibilityResolvedAddress && (
                  <Text fontSize='sm' color='gray.500' mt={1}>
                    Resolved address: {eligibilityResolvedAddress}
                  </Text>
                )}
              </Box>
            )}
          </HStack>
        </FormControl>
        <FormControl>
          <HStack>
            <Switch
              isChecked={toggleChecked}
              onChange={() => setInputChecked(!toggleChecked)}
            />
            {!toggleChecked && <FormLabel>Set Toggle</FormLabel>}
            {toggleChecked && (
              <Box>
                <Input
                  name='toggle'
                  label='Toggle — https://docs.hatsprotocol.xyz/#toggle'
                  placeholder='0x1234, vitalik.eth'
                  rightElement={
                    showToggleResolvedAddress && <FaCheck color='green' />
                  }
                  localForm={localForm}
                />
                {showToggleResolvedAddress && (
                  <Text fontSize='sm' color='gray.500' mt={1}>
                    Resolved address: {toggleResolvedAddress}
                  </Text>
                )}
              </Box>
            )}
          </HStack>
        </FormControl>
        <Flex justify='flex-end'>
          <Button type='submit'>Update</Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatWearersAndAdminsForm;
