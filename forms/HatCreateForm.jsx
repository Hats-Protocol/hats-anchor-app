import {
  Stack,
  Flex,
  Button,
  FormControl,
  Switch,
  FormLabel,
  HStack,
  Spinner,
  Checkbox,
} from '@chakra-ui/react';
import { useState } from 'react';
import _ from 'lodash';
import { useChainId } from 'wagmi';
import { useForm } from 'react-hook-form';

import Input from '../components/Input';
import Textarea from '../components/Textarea';
import useHatCreate from '../hooks/useHatCreate';
import { hatsAddresses, FALLBACK_ADDRESS, ZERO_ADDRESS } from '../constants';
import useDebounce from '../hooks/useDebounce';
import RadioBox from '../components/RadioBox';
import { prettyIdToIp } from '../lib/hats';
import { pinJson } from '../lib/ipfs';
import useCid from '../hooks/useCid';
import usePinImageIpfs from '../hooks/usePinImageIpfs';

const HatCreateForm = ({ defaultAdmin }) => {
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: { mutable: 'Mutable' },
  });
  const { handleSubmit, watch } = localForm;
  const [inputEligibility, setInputEligibility] = useState(false);
  const [inputToggle, setInputToggle] = useState(false);
  const [customDetails, setCustomDetails] = useState(true);
  const [customImage, setCustomImage] = useState(true);
  const chainId = useChainId();

  const name = useDebounce(watch('name', ''));
  const description = useDebounce(watch('description', ''));
  const details = useDebounce(watch('details', ''));
  const maxSupply = useDebounce(watch('maxSupply', 1));
  const eligibility = useDebounce(watch('eligibility', ZERO_ADDRESS));
  const toggle = useDebounce(watch('toggle', ZERO_ADDRESS));
  const mutable = useDebounce(watch('mutable', true));
  const imageUrl = useDebounce(watch('imageUrl', ''));
  const imageFile = useDebounce(watch('imageFile', ''));

  const decimalAdmin = prettyIdToIp(defaultAdmin);

  const {
    data: imagePinData,
    isLoading: imagePinLoading,
    error: imagePinError,
  } = usePinImageIpfs({
    imageFile: imageFile[0],
    enabled: customImage,
    metadata: { name: 'image_' + chainId.toString() + '_' + decimalAdmin },
  });

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description },
  });

  const { writeAsync } = useHatCreate({
    hatsAddress: hatsAddresses(chainId),
    chainId,
    admin: defaultAdmin,
    details: customDetails ? detailsCID : details,
    maxSupply: _.toNumber(maxSupply),
    eligibility: inputEligibility ? eligibility : FALLBACK_ADDRESS,
    toggle: inputToggle ? toggle : FALLBACK_ADDRESS,
    mutable,
    imageUrl: customImage
      ? imagePinData !== undefined
        ? 'ipfs://' + imagePinData
        : undefined
      : imageUrl,
  });

  const onSubmit = async () => {
    writeAsync?.();
    if (customDetails) {
      await pinJson(
        { type: '1.0', data: { name, description } },
        { name: 'details_' + chainId.toString() + '_' + decimalAdmin },
      );
    }
  };

  // const dropZoneContent = {
  //   title: 'Upload an image',
  //   details: `What image do you want to represent this role? This will be the
  //     image that appears alongside the hat token in the Hats dapp,
  //     other apps integrating with Hats Protocol, and anywhere the hat
  //     NFTs are viewable.`,
  //   fileTypes: 'PNG, JPG, GIF up to 2MB',
  // };

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
        <FormControl>
          <Checkbox
            isChecked={customDetails}
            onChange={() => setCustomDetails(!customDetails)}
          >
            Custom details
          </Checkbox>
          {!customDetails && (
            <Textarea
              localForm={localForm}
              name='details'
              label='Details'
              placeholder='Hat details'
            />
          )}
          {customDetails && (
            <Stack spacing={2}>
              <Textarea
                localForm={localForm}
                name='name'
                label='Name'
                placeholder='Hat name'
              />
              <Textarea
                localForm={localForm}
                name='description'
                label='Description'
                placeholder='Hat description'
              />
            </Stack>
          )}
        </FormControl>
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
          <Checkbox
            isChecked={customImage}
            onChange={() => setCustomImage(!customImage)}
          >
            Custom image
          </Checkbox>
          {!customImage && (
            <Textarea
              localForm={localForm}
              name='imageUrl'
              label='Image'
              placeholder='ipfs://QmbQy4vsu4aAHuQwpHoHUsEURtiYKEbhv7ouumBXiierp9?filename=hats%20hat.jpg'
            />
          )}
          {customImage && (
            <Input
              localForm={localForm}
              type='file'
              name='imageFile'
              label='Image'
            />
          )}
        </FormControl>
        <FormControl>
          <HStack>
            <Switch
              isChecked={inputEligibility}
              onChange={() => setInputEligibility(!inputEligibility)}
            />
            {!inputEligibility && <FormLabel>Set Eligibility</FormLabel>}
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
            {!inputToggle && <FormLabel>Set Toggle</FormLabel>}
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
          <Button
            type='submit'
            isDisabled={!writeAsync || detailsCidLoading || imagePinLoading}
          >
            {imagePinLoading ? <Spinner /> : 'Create'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatCreateForm;
