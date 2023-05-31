import {
  Stack,
  Flex,
  Button,
  FormControl,
  Switch,
  FormLabel,
  HStack,
  Spinner,
  Text,
  Box,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { FaCheck } from 'react-icons/fa';
import _ from 'lodash';

import Input from '@/components/Input';
import Select from '@/components/Select';
import Textarea from '@/components/Textarea';
import DropZone from '@/components/DropZone';
import CONFIG, { FALLBACK_ADDRESS, ZERO_ADDRESS } from '@/constants';
import useHatRelinkTree from '@/hooks/useHatRelinkTree';
import useDebounce from '@/hooks/useDebounce';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import { prettyIdToIp } from '@/lib/hats';
import { pinJson } from '@/lib/ipfs';

const HatRelinkForm = ({ chainId, hatData, parentTreeHats }) => {
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      topHatDomain: hatData.prettyId,
      newAdmin: parentTreeHats[0],
      description: '',
    },
  });
  const { handleSubmit, watch } = localForm;

  const newAdmin = useDebounce(
    watch('newAdmin', parentTreeHats[0]),
    CONFIG.debounce,
  );

  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(false);
  const [newDetails, setNewDetails] = useState(false);
  const [newImage, setNewImage] = useState(false);
  const [image, setImage] = useState(hatData.imageUrl);

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (droppedFiles) => {
      setImage(
        Object.assign(droppedFiles[0], {
          preview: URL.createObjectURL(droppedFiles[0]),
        }),
      );
    },
  });

  const description = useDebounce(watch('description', ''));
  const eligibility = useDebounce(watch('eligibility', ZERO_ADDRESS));
  const toggle = useDebounce(watch('toggle', ZERO_ADDRESS));
  const imageUrl = useDebounce(watch('imageUrl', ''));

  const decimalAdmin = prettyIdToIp(hatData.prettyId);

  const { data: imagePinData, isLoading: imagePinLoading } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: newImage,
    metadata: { name: `image_${chainId.toString()}_${decimalAdmin}` },
  });

  const {
    writeAsync,
    isLoading,
    toggleResolvedAddress,
    eligibilityResolvedAddress,
  } = useHatRelinkTree({
    topHatDomain: hatData.prettyId,
    newAdmin,
    eligibility: eligibilityChecked && eligibility,
    toggle: toggleChecked && toggle,
    description,
    // eslint-disable-next-line no-nested-ternary
    imageUrl: newImage
      ? imagePinData !== undefined
        ? `ipfs://${imagePinData}`
        : undefined
      : imageUrl,
    chainId,
  });

  const showEligilityResolvedAddress =
    eligibilityResolvedAddress && eligibilityResolvedAddress !== eligibility;
  const showToggleResolvedAddress =
    toggleResolvedAddress && toggleResolvedAddress !== toggle;

  const onSubmit = async () => {
    writeAsync?.();
    if (newDetails) {
      await pinJson(
        { type: '1.0', data: { description } },
        { name: `details_${chainId.toString()}_${decimalAdmin}` },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={6}>
        <Text>
          Link this Top Hat to your tree by making the selected Hat its new
          admin. Optionally update details, image, eligibility, and toggle of
          the Top Hat now that it will be a child hat.
        </Text>
        <Flex>
          <Text fontWeight={500} mr={2}>
            Hat to be relinked:
          </Text>
          <Text>ID {prettyIdToIp(hatData?.prettyId)}</Text>
        </Flex>

        <Select
          label='Select new Admin Hat'
          name='newAdmin'
          localForm={localForm}
        >
          {_.map(parentTreeHats, (hat) => (
            <option value={hat} key={hat}>
              {prettyIdToIp(hat)}
            </option>
          ))}
        </Select>
        <FormControl>
          <Stack>
            <HStack>
              <Switch
                isChecked={newDetails}
                onChange={() => setNewDetails(!newDetails)}
              />
              <FormLabel>New Details</FormLabel>
            </HStack>
            {newDetails && (
              <Stack spacing={2}>
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
        <FormControl>
          <Stack spacing={2}>
            <HStack>
              <Switch
                isChecked={newImage}
                onChange={() => setNewImage(!newImage)}
              />
              <FormLabel>New Image</FormLabel>
            </HStack>
            {newImage && (
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
            {!eligibilityChecked && <FormLabel>New Eligibility</FormLabel>}
            {eligibilityChecked && (
              <Box>
                <Input
                  name='eligibility'
                  label='Eligibility — https://docs.hatsprotocol.xyz/#eligibility'
                  placeholder='0x1234, vitalik.eth'
                  rightElement={
                    showEligilityResolvedAddress && <FaCheck color='green' />
                  }
                  localForm={localForm}
                />
                {showEligilityResolvedAddress && (
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
              onChange={() => setToggleChecked(!toggleChecked)}
            />
            {!toggleChecked && <FormLabel>New Toggle</FormLabel>}
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
          <Button
            type='submit'
            isDisabled={!writeAsync || imagePinLoading || isLoading}
          >
            {imagePinLoading ? <Spinner /> : 'Relink'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatRelinkForm;
