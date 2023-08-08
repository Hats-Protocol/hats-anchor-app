import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Spinner,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import { useChainId, useEnsAddress } from 'wagmi';

import DropZone from '@/components/atoms/DropZone';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Textarea from '@/components/atoms/Textarea';
import CONFIG, { FALLBACK_ADDRESS, ZERO_ADDRESS } from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import { decimalId, prettyIdToId, prettyIdToIp } from '@/lib/hats';
import { pinJson } from '@/lib/ipfs';

// TODO refactor without prettyId

const HatRelinkForm = ({
  chainId,
  hatData,
  parentTreeHats,
}: {
  chainId: number;
  hatData: any;
  parentTreeHats: any;
}) => {
  const currentNetworkId = useChainId();
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      topHatDomain: hatData.prettyId,
      newAdmin: parentTreeHats[0],
      description: '',
      eligibility: ZERO_ADDRESS,
      toggle: ZERO_ADDRESS,
      imageUrl: '',
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
  const [image, setImage] = useState<any>(hatData.imageUrl);

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
    data: eligibilityResolvedAddress,
    isLoading: isLoadingEligibilityResolvedAddress,
  } = useEnsAddress({ name: eligibility, chainId: 1 });
  const {
    data: toggleResolvedAddress,
    isLoading: isLoadingToggleResolvedAddress,
  } = useEnsAddress({ name: toggle, chainId: 1 });

  const eligibilityAddress = eligibilityResolvedAddress || FALLBACK_ADDRESS;
  const toggleAddress = toggleResolvedAddress || FALLBACK_ADDRESS;

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'relinkTopHatWithinTree',
    args: [
      hatData.prettyId,
      decimalId(prettyIdToId(newAdmin)),
      eligibilityAddress,
      toggleAddress,
      description,
      // eslint-disable-next-line no-nested-ternary
      newImage
        ? imagePinData !== undefined
          ? `ipfs://${imagePinData}`
          : undefined
        : imageUrl,
    ],
    chainId,
    onSuccessToastData: {
      title: 'Top Hat Relinked!',
      description: `Successfully relinked top hat ${prettyIdToIp(
        hatData.prettyId,
      )} to ${prettyIdToIp(newAdmin)}`,
    },
    enabled: !!hatData.prettyId && !!newAdmin && chainId === currentNetworkId,
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
                  placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
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
                  placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
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
            isDisabled={
              !writeAsync ||
              imagePinLoading ||
              isLoading ||
              isLoadingEligibilityResolvedAddress ||
              isLoadingToggleResolvedAddress
            }
          >
            {imagePinLoading ? <Spinner /> : 'Relink'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatRelinkForm;
