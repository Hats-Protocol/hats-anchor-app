import {
  Stack,
  Flex,
  Button,
  FormControl,
  Switch,
  FormLabel,
  HStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import _ from 'lodash';
import { useChainId } from 'wagmi';
import { useForm } from 'react-hook-form';

import Input from '../components/Input';
import Textarea from '../components/Textarea';
import useHatCreate from '../hooks/useHatCreate';
import { hatsAddresses, ONE_ADDRESS, ZERO_ADDRESS } from '../constants';
import useDebounce from '../hooks/useDebounce';
import RadioBox from '../components/RadioBox';
import { prettyIdToIp } from '../lib/hats';

const HatCreateForm = ({ defaultAdmin }) => {
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: { mutable: 'Mutable' },
  });
  const { handleSubmit, watch } = localForm;
  const [inputEligibility, setInputEligibility] = useState(false);
  const [inputToggle, setInputToggle] = useState(false);
  const chainId = useChainId();

  const details = useDebounce(watch('details', ''));
  const maxSupply = useDebounce(watch('maxSupply', 1));
  const eligibility = useDebounce(watch('eligibility', ZERO_ADDRESS));
  const toggle = useDebounce(watch('toggle', ZERO_ADDRESS));
  const mutable = useDebounce(watch('mutable', true));
  const imageUrl = useDebounce(watch('imageUrl', ''));

  const { writeAsync } = useHatCreate({
    hatsAddress: hatsAddresses(chainId),
    chainId,
    admin: defaultAdmin,
    details,
    maxSupply: _.toNumber(maxSupply),
    eligibility: inputEligibility ? eligibility : ONE_ADDRESS,
    toggle: inputToggle ? toggle : ONE_ADDRESS,
    mutable,
    imageUrl,
  });

  const onSubmit = () => {
    writeAsync?.();
  };

  // const dropZoneContent = {
  //   title: 'Upload an image',
  //   details: `What image do you want to represent this role? This will be the
  //     image that appears alongside the hat token in the Hats dapp,
  //     other apps integrating with Hats Protocol, and anywhere the hat
  //     NFTs are viewable.`,
  //   fileTypes: 'PNG, JPG, GIF up to 2MB',
  // };

  const decimalAdmin = prettyIdToIp(defaultAdmin);

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
        <Textarea
          localForm={localForm}
          name='details'
          label='Details'
          placeholder='Marketing Facilitator Hat: responsibilities, authorities, qualifications.'
          helperText='Name and description of the hat. Pass an IPFS hash or URL here to set additional responsibilities for this hat, or add a string of markdown directly (but be careful with gas!)'
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
        <Input
          localForm={localForm}
          name='imageUrl'
          label='Image'
          placeholder='ipfs://QmbQy4vsu4aAHuQwpHoHUsEURtiYKEbhv7ouumBXiierp9?filename=hats%20hat.jpg'
        />
        <FormControl>
          <HStack>
            <Switch
              isChecked={inputEligibility}
              onChange={() => setInputEligibility(!inputEligibility)}
            />
            {!inputEligibility && (<FormLabel>Set Eligibility</FormLabel>)}
            {inputEligibility && (
              <Input
                name='eligibility'
                label='Eligibility — https://docs.hatsprotocol.xyz/#eligibility'
                placeholder='0x4a750000403C3B91997911FCd989d9B5C25d7876'
                localForm={localForm}
              />
            )}
          </HStack>
        </FormControl>
        <FormControl>
          <HStack>
            <Switch
              isChecked={inputToggle}
              onChange={() => setInputToggle(!inputToggle)}
            />
            {!inputToggle && (<FormLabel>Set Toggle</FormLabel>)}
            {inputToggle && (
              <Input
                name='toggle'
                label='Toggle — https://docs.hatsprotocol.xyz/#toggle'
                placeholder='0x4a75000089d9B5C25d7876403C3B91997911FCd9'
                localForm={localForm}
              />
            )}
          </HStack>
        </FormControl>
        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync}>
            Create
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatCreateForm;
