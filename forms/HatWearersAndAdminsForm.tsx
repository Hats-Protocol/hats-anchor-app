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
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';

import Input from '@/components/Input';
import { ZERO_ADDRESS } from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import { prettyIdToIp } from '@/lib/hats';

const HatWearersAndAdminsForm = ({
  defaultAdmin,
  mutable,
}: {
  defaultAdmin: string | undefined;
  mutable: boolean;
}) => {
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      maxSupply: 1,
      eligibility: '',
      toggle: '',
      mutable: mutable ? 'Mutable' : 'Immutable',
    },
  });
  const { handleSubmit, watch, setValue } = localForm;
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

  // changeHatMaxSupply
  // changeHatEligibility
  // changeHatToggle
  // makeHatImmutable

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
          isDisabled={!mutable}
          localForm={localForm}
        />

        <RadioGroup
          name='mutable'
          defaultValue={mutable ? 'Mutable' : 'Immutable'}
          onChange={(value) => setValue('mutable', value)}
          isDisabled={!mutable}
        >
          <HStack spacing={4}>
            <Radio value='Mutable'>Mutable</Radio>
            <Radio value='Immutable'>Immutable</Radio>
          </HStack>
        </RadioGroup>
        <Text>
          Whether or not this Hat should be able to be modified by its Admin. If
          unsure, default to mutable. This can be changed from mutable to
          immutable later (but not the other way).
        </Text>
        <FormControl>
          <HStack>
            <Switch
              isChecked={eligibilityChecked}
              onChange={() => setEligibilityChecked(!eligibilityChecked)}
              isDisabled={!mutable}
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
                  isDisabled={!mutable}
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
              isDisabled={!mutable}
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
                  isDisabled={!mutable}
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
