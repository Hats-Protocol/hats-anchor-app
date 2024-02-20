import {
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
import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useDebounce, usePinImageIpfs } from 'hooks';
import { useHatContractWrite } from 'hats-hooks';
import { AppHat, ImageFile } from 'hats-types';
import _ from 'lodash';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import { DropZone, Input, Select, Textarea } from 'ui';
import { fetchToken, pinJson } from 'utils';
import { Hex, zeroAddress } from 'viem';
import { useChainId, useEnsAddress } from 'wagmi';

// TODO [low] update links to use new docs links constants

const HatRelinkForm = ({
  chainId,
  hatData,
  parentTreeHats,
}: {
  chainId: number;
  hatData: AppHat;
  parentTreeHats: AppHat[];
}) => {
  const currentNetworkId = useChainId();
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      topHatDomain: hatData.prettyId,
      newAdmin: _.get(_.first(parentTreeHats), 'id') as Hex,
      description: '',
      eligibility: zeroAddress as Hex,
      toggle: zeroAddress as Hex,
      imageUrl: '',
    },
  });
  const { handleSubmit, watch } = localForm;

  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(false);
  const [newDetails, setNewDetails] = useState(false);
  const [newImage, setNewImage] = useState(false);
  const [image, setImage] = useState<ImageFile>({
    path: hatData.imageUrl,
  });

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
        } as ImageFile),
      );
    },
  });

  const newParentId = _.get(_.first(parentTreeHats), 'id') as Hex;
  const newAdmin = useDebounce<Hex>(watch('newAdmin', newParentId));
  const description = useDebounce<string>(watch('description', ''));
  const eligibility = useDebounce(watch('eligibility', zeroAddress));
  const toggle = useDebounce(watch('toggle', zeroAddress));
  const imageUrl = useDebounce(watch('imageUrl', ''));

  const { data: imagePinData, isLoading: imagePinLoading } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: newImage,
    metadata: {
      name: `image_${chainId.toString()}_${hatIdDecimalToIp(BigInt(newAdmin))}`,
    },
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
      hatData.id,
      newAdmin,
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
      description: `Successfully relinked top hat ${hatIdDecimalToIp(
        BigInt(hatData.id),
      )} to ${hatIdDecimalToIp(BigInt(newAdmin))}`,
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
      const token = await fetchToken();
      await pinJson(
        { type: '1.0', data: { description } },
        {
          name: `details_${chainId.toString()}_${hatIdDecimalToIp(
            BigInt(newAdmin),
          )}`,
        },
        token,
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
        <HStack>
          <Text variant='medium'>Hat to be relinked:</Text>
          <Text>ID {hatIdDecimalToIp(BigInt(hatData?.id))}</Text>
        </HStack>

        <Select
          label='Select new Admin Hat'
          name='newAdmin'
          localForm={localForm}
        >
          {_.map(parentTreeHats, (hat: AppHat) => (
            <option value={hat.id} key={hat.id}>
              {hatIdDecimalToIp(BigInt(hat.id))}
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
              <Stack spacing={1}>
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
                  <Text size='sm' variant='gray'>
                    Resolved address: {eligibilityResolvedAddress}
                  </Text>
                )}
              </Stack>
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
              <Stack spacing={1}>
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
                  <Text size='sm' variant='gray'>
                    Resolved address: {toggleResolvedAddress}
                  </Text>
                )}
              </Stack>
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
