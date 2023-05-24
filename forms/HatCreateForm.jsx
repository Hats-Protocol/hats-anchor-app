/* eslint-disable no-nested-ternary */
import {
  Stack,
  Flex,
  Button,
  FormControl,
  Switch,
  FormLabel,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { useState } from 'react';
import _ from 'lodash';
import { useChainId } from 'wagmi';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';

import Input from '../components/Input';
import Textarea from '../components/Textarea';
import useHatCreate from '../hooks/useHatCreate';
import CONFIG, { FALLBACK_ADDRESS, ZERO_ADDRESS } from '../constants';
import useDebounce from '../hooks/useDebounce';
import RadioBox from '../components/RadioBox';
import { prettyIdToIp } from '../lib/hats';
import { pinJson } from '../lib/ipfs';
import useCid from '../hooks/useCid';
import usePinImageIpfs from '../hooks/usePinImageIpfs';
import DropZone from '../components/DropZone';

const HatCreateForm = ({ defaultAdmin, treeId }) => {
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: { mutable: 'Mutable' },
  });
  const { handleSubmit, watch } = localForm;
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [toggleChecked, setInputChecked] = useState(false);
  const [customDetails, setCustomDetails] = useState(true);
  const [customImage, setCustomImage] = useState(true);
  const chainId = useChainId();

  const [image, setImage] = useState();
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (a) => {
      setImage(
        Object.assign(a[0], {
          preview: URL.createObjectURL(a[0]),
        }),
      );
    },
  });

  const name = useDebounce(watch('name', ''));
  const description = useDebounce(watch('description', ''));
  const details = useDebounce(watch('details', ''));
  const maxSupply = useDebounce(watch('maxSupply', 1));
  const eligibility = useDebounce(watch('eligibility', ZERO_ADDRESS));
  const toggle = useDebounce(watch('toggle', ZERO_ADDRESS));
  const mutable = useDebounce(watch('mutable', true));
  const imageUrl = useDebounce(watch('imageUrl', ''));

  const decimalAdmin = prettyIdToIp(defaultAdmin);

  const {
    data: imagePinData,
    isLoading: imagePinLoading,
    // error: imagePinError,
  } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: customImage,
    metadata: { name: `image_${_.toString(chainId)}_${decimalAdmin}` },
  });

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description },
  });

  const { writeAsync, isLoading } = useHatCreate({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    treeId,
    admin: defaultAdmin,
    details: customDetails ? detailsCID : details,
    maxSupply: _.toNumber(maxSupply),
    eligibility: eligibilityChecked && eligibility,
    toggle: toggleChecked && toggle,
    mutable,
    imageUrl: customImage
      ? imagePinData !== undefined
        ? `ipfs://${imagePinData}`
        : undefined
      : imageUrl,
  });

  const onSubmit = async () => {
    writeAsync?.();
    if (customDetails) {
      await pinJson(
        { type: '1.0', data: { name, description } },
        { name: `details_${_.toString(chainId)}_${decimalAdmin}` },
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
          <Stack>
            <Switch
              isChecked={customDetails}
              onChange={() => setCustomDetails(!customDetails)}
            >
              Custom details
            </Switch>
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
                <Input
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
          </Stack>
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
          <Stack spacing={2}>
            <Switch
              isChecked={customImage}
              onChange={() => setCustomImage(!customImage)}
            >
              Custom image
            </Switch>
            {!customImage && (
              <Textarea
                localForm={localForm}
                name='imageUrl'
                label='Image'
                placeholder='ipfs://QmbQy4vsu4aAHuQwpHoHUsEURtiYKEbhv7ouumBXiierp9?filename=hats%20hat.jpg'
              />
            )}
            {customImage && (
              <DropZone
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                acceptedFiles={acceptedFiles}
                isFocused={isFocused}
                isDragAccept={isDragAccept}
                isDragReject={isDragReject}
                image={image}
              />
            )}
          </Stack>
        </FormControl>
        <FormControl>
          <HStack>
            <Switch
              isChecked={eligibilityChecked}
              onChange={() => setEligibilityChecked(!eligibilityChecked)}
            />
            {!eligibilityChecked && <FormLabel>Set Eligibility</FormLabel>}
            {eligibilityChecked && (
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
              isChecked={toggleChecked}
              onChange={() => setInputChecked(!toggleChecked)}
            />
            {!toggleChecked && <FormLabel>Set Toggle</FormLabel>}
            {toggleChecked && (
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
            isDisabled={
              !writeAsync || detailsCidLoading || imagePinLoading || isLoading
            }
          >
            {imagePinLoading ? <Spinner /> : 'Create'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatCreateForm;
