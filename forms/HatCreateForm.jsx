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
      <Stack spacing={4}>
        <Input
          localForm={localForm}
          name='admin'
          label='Admin ID'
          defaultValue={decimalAdmin}
          isDisabled
        />
        <Textarea
          localForm={localForm}
          name='details'
          label='Details'
          helperText='Brief description for your profile. URLs are hyperlinked.'
          placeholder='Pass an IPFS hash or URL here to set the details for this hat. Or add a string of markdown directly, but be careful with gas. e.g. "This Hat is for the coordinator of the DAO&apos;s marketing work stream"'
        />
        <Input
          name='maxSupply'
          label='Max Supply'
          placeholder='69'
          localForm={localForm}
        />
        <RadioBox
          name='mutable'
          label='Mutable?'
          options={['Mutable', 'Immutable']}
          localForm={localForm}
          isRequired
        />
        <Input
          localForm={localForm}
          name='imageUrl'
          label='Image'
          placeholder='ipfs://test.jpg'
        />
        <FormControl>
          <HStack>
            <Switch
              isChecked={inputEligibility}
              onChange={() => setInputEligibility(!inputEligibility)}
            />
            <FormLabel>Set Eligibility</FormLabel>
          </HStack>
        </FormControl>
        {inputEligibility && (
          <Input
            name='eligibility'
            label='Eligibility'
            placeholder='0x'
            localForm={localForm}
          />
        )}
        <FormControl>
          <HStack>
            <Switch
              isChecked={inputToggle}
              onChange={() => setInputToggle(!inputToggle)}
            />
            <FormLabel>Set Toggle</FormLabel>
          </HStack>
        </FormControl>
        {inputToggle && (
          <Input
            name='toggle'
            label='Toggle'
            placeholder='0x'
            localForm={localForm}
          />
        )}

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
