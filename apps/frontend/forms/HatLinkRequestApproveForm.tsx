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
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { useCid, useDebounce, usePinImageIpfs } from 'app-hooks';
import { fetchToken, pinJson } from 'app-utils';
import { useHatContractWrite } from 'hats-hooks';
import { ImageFile } from 'hats-types';
import { decimalId } from 'hats-utils';
import _ from 'lodash';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import { prettyIdToIp, toTreeId } from 'shared';
import { DropZone, Input, Textarea } from 'ui';
import { Hex, zeroAddress } from 'viem';
import { useChainId, useEnsAddress } from 'wagmi';

import { useTreeForm } from '../contexts/TreeFormContext';

// ! update links to use new docs links constants

const HatLinkRequestApproveForm = ({
  topHatDomain,
  newAdmin,
}: {
  topHatDomain: string;
  newAdmin: string;
}) => {
  const currentNetworkId = useChainId();
  const { chainId, selectedHat } = useTreeForm();

  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      details: '',
      topHatDomain,
      newAdmin: decimalId(newAdmin),
      eligibility: zeroAddress as Hex,
      toggle: zeroAddress as Hex,
      description: '',
      imageUrl: '',
    },
  });
  const { handleSubmit, watch } = localForm;

  const [customDetails, setCustomDetails] = useState(true);
  const [customImage, setCustomImage] = useState(true);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(false);
  const [newDetails, setNewDetails] = useState(false);
  const [newImage, setNewImage] = useState(false);
  const [image, setImage] = useState<ImageFile | undefined>();

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

  const name = useDebounce(watch('name', ''));
  const description = useDebounce(watch('description', ''));
  const details = useDebounce(watch('details', ''));
  const eligibility = useDebounce(watch('eligibility', FALLBACK_ADDRESS));
  const toggle = useDebounce(watch('toggle', FALLBACK_ADDRESS));
  const imageUrl = useDebounce(watch('imageUrl', ''));

  const decimalAdmin = topHatDomain;

  const { data: imagePinData, isLoading: imagePinLoading } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: newImage && customImage,
    metadata: { name: `image_${_.toString(chainId)}_${decimalAdmin}` },
  });

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description },
  });

  const {
    data: eligibilityResolvedAddress,
    isLoading: isLoadingEligibilityResolvedAddress,
  } = useEnsAddress({
    name: eligibility || '0x',
    chainId: 1,
    enabled: !!eligibility,
  });

  const {
    data: toggleResolvedAddress,
    isLoading: isLoadingToggleResolvedAddress,
  } = useEnsAddress({
    name: toggle,
    chainId: 1,
    enabled: !!toggle,
  });

  const eligibilityAddress =
    (eligibilityResolvedAddress ?? eligibility) || FALLBACK_ADDRESS;
  const toggleAddress = (toggleResolvedAddress ?? toggle) || FALLBACK_ADDRESS;
  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'approveLinkTopHatToTree',
    args: [
      topHatDomain,
      decimalId(newAdmin),
      eligibilityAddress,
      toggleAddress,
      newDetails && customDetails ? detailsCID : details,
      // eslint-disable-next-line no-nested-ternary
      newImage && customImage
        ? imagePinData !== undefined
          ? `ipfs://${imagePinData}`
          : undefined
        : imageUrl,
    ],
    chainId,
    onSuccessToastData: {
      title: 'Link Request Approved!',
      description: `Successfully linked top hat ${BigInt(
        topHatDomain,
      ).toString()} to ${hatIdDecimalToIp(BigInt(newAdmin))}`,
    },
    queryKeys: [
      ['hatDetails', { id: newAdmin, chainId }],
      ['hatDetails', { id: topHatDomain, chainId }],
      ['treeDetails', topHatDomain, chainId || 1],
      ['treeDetails', toTreeId(newAdmin), chainId || 1],
    ],
    enabled:
      Boolean(topHatDomain) &&
      Boolean(newAdmin) &&
      !!chainId &&
      chainId === currentNetworkId,
  });

  const onSubmit = async () => {
    writeAsync?.();
    if (newDetails && customDetails) {
      const token = await fetchToken();
      await pinJson(
        { type: '1.0', data: { name, description } },
        { name: `details_${_.toString(chainId)}_${decimalAdmin}` },
        token,
      );
    }
  };

  const showEligibilityResolvedAddress =
    eligibilityResolvedAddress && eligibilityResolvedAddress !== eligibility;
  const showToggleResolvedAddress =
    toggleResolvedAddress && toggleResolvedAddress !== toggle;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={6}>
        <Text>
          Link this Top Hat to your tree by making the selected hat its new
          admin. Optionally update details, image, eligibility, and toggle of
          the Top Hat now that it will be a child hat.
        </Text>
        <Flex>
          <Text fontWeight='medium' mr={2}>
            New Admin:
          </Text>
          <Text>ID {hatIdDecimalToIp(BigInt(newAdmin))}</Text>
        </Flex>
        <Flex>
          <Text fontWeight='medium' mr={2}>
            Domain of the Top Hat to be linked:
          </Text>
          <Text>ID {prettyIdToIp(topHatDomain)}</Text>
        </Flex>
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
                      isFocused={isFocused}
                      isDragAccept={isDragAccept}
                      isDragReject={isDragReject}
                      image={image}
                      imageUrl={selectedHat?.imageUrl || '/icon.jpeg'}
                    />
                  )}
                </Stack>
              </FormControl>
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
            isDisabled={!writeAsync}
            isLoading={
              detailsCidLoading ||
              imagePinLoading ||
              isLoading ||
              isLoadingEligibilityResolvedAddress ||
              isLoadingToggleResolvedAddress
            }
          >
            {imagePinLoading ? <Spinner /> : 'Approve'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatLinkRequestApproveForm;
