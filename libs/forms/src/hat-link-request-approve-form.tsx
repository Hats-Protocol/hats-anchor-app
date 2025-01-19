'use client';

import { Button, Flex, FormControl, FormLabel, HStack, Stack, Switch, Text } from '@chakra-ui/react';
import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useHatContractWrite } from 'hats-hooks';
import { useCid, useDebounce, usePinImageIpfs, useWaitForSubgraph } from 'hooks';
import { toString } from 'lodash';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import { prettyIdToIp } from 'shared';
import { ImageFile } from 'types';
import { DropZone } from 'ui';
import { fetchToken, pinJson } from 'utils';
import { Hex, zeroAddress } from 'viem';
import { useChainId, useEnsAddress } from 'wagmi';

import { Input, Textarea } from './components';

// ! update links to use new docs links constants

const HatLinkRequestApproveForm = ({ topHatDomain, newAdmin }: { topHatDomain: string; newAdmin: string }) => {
  const { handlePendingTx } = useOverlay();
  const { selectedHat } = useSelectedHat();
  const { chainId } = useTreeForm();
  const currentChainId = useChainId();

  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      details: '',
      topHatDomain,
      newAdmin: hatIdHexToDecimal(newAdmin),
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

  const { acceptedFiles, getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
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

  const { data: imagePinData } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: newImage && customImage,
    metadata: { name: `image_${toString(chainId)}_${decimalAdmin}` },
  });

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description },
  });

  const { data: eligibilityResolvedAddress, isLoading: isLoadingEligibilityResolvedAddress } = useEnsAddress({
    name: eligibility || '0x',
    chainId: 1,
  });

  const { data: toggleResolvedAddress, isLoading: isLoadingToggleResolvedAddress } = useEnsAddress({
    name: toggle,
    chainId: 1,
  });

  const waitForSubgraph = useWaitForSubgraph({ chainId, sendToast: true });

  const eligibilityAddress = (eligibilityResolvedAddress ?? eligibility) || FALLBACK_ADDRESS;
  const toggleAddress = (toggleResolvedAddress ?? toggle) || FALLBACK_ADDRESS;
  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'approveLinkTopHatToTree',
    args: [
      topHatDomain,
      hatIdHexToDecimal(newAdmin),
      eligibilityAddress,
      toggleAddress,
      newDetails && customDetails ? detailsCID : details,
      // eslint-disable-next-line no-nested-ternary
      newImage && customImage ? (imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined) : imageUrl,
    ],
    chainId,
    successToastData: {
      title: 'Link Request Approved!',
      description: `Successfully linked top hat ${BigInt(
        topHatDomain,
      ).toString()} to ${hatIdDecimalToIp(BigInt(newAdmin))}`,
    },
    handlePendingTx,
    waitForSubgraph,
    queryKeys: [['hatDetails'], ['treeDetails']],
  });

  const onSubmit = async () => {
    writeAsync?.();
    if (newDetails && customDetails) {
      const token = await fetchToken();
      await pinJson(
        { type: '1.0', data: { name, description } },
        { name: `details_${toString(chainId)}_${decimalAdmin}` },
        token,
      );
    }
  };

  const showEligibilityResolvedAddress = eligibilityResolvedAddress && eligibilityResolvedAddress !== eligibility;
  const showToggleResolvedAddress = toggleResolvedAddress && toggleResolvedAddress !== toggle;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={6}>
        <Text>
          Link this Top Hat to your tree by making the selected hat its new admin. Optionally update details, image,
          eligibility, and toggle of the Top Hat now that it will be a child hat.
        </Text>
        <HStack>
          <Text variant='medium'>New Admin:</Text>
          <Text>ID {hatIdDecimalToIp(BigInt(newAdmin))}</Text>
        </HStack>
        <HStack>
          <Text variant='medium'>Domain of the Top Hat to be linked:</Text>
          <Text>ID {prettyIdToIp(topHatDomain)}</Text>
        </HStack>
        <FormControl>
          <Stack>
            <HStack>
              <Switch isChecked={newDetails} onChange={() => setNewDetails(!newDetails)} />
              <FormLabel>New Details</FormLabel>
            </HStack>
            {newDetails && (
              <FormControl>
                <Stack>
                  <Switch isChecked={customDetails} onChange={() => setCustomDetails(!customDetails)}>
                    Custom details
                  </Switch>
                  {!customDetails && (
                    <Textarea localForm={localForm} name='details' label='Details' placeholder='Hat details' />
                  )}
                  {customDetails && (
                    <Stack spacing={2}>
                      <Input name='name' label='Name' placeholder='Hat name' localForm={localForm} />
                      <Textarea
                        name='description'
                        label='Description'
                        placeholder='Hat description'
                        localForm={localForm}
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
              <Switch isChecked={newImage} onChange={() => setNewImage(!newImage)} />
              <FormLabel>New Image</FormLabel>
            </HStack>
            {newImage && (
              <FormControl>
                <Stack spacing={2}>
                  <Switch isChecked={customImage} onChange={() => setCustomImage(!customImage)}>
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
            <Switch isChecked={eligibilityChecked} onChange={() => setEligibilityChecked(!eligibilityChecked)} />
            {!eligibilityChecked && <FormLabel>New Eligibility</FormLabel>}
            {eligibilityChecked && (
              <Stack w='100%'>
                <Input
                  name='eligibility'
                  label='Eligibility — https://docs.hatsprotocol.xyz/#eligibility'
                  placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
                  rightElement={showEligibilityResolvedAddress && <FaCheck color='green' />}
                  localForm={localForm}
                />
                {showEligibilityResolvedAddress && (
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
            <Switch isChecked={toggleChecked} onChange={() => setToggleChecked(!toggleChecked)} />
            {!toggleChecked && <FormLabel>New Toggle</FormLabel>}
            {toggleChecked && (
              <Stack spacing={1}>
                <Input
                  name='toggle'
                  label='Toggle — https://docs.hatsprotocol.xyz/#toggle'
                  placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
                  rightElement={showToggleResolvedAddress && <FaCheck color='green' />}
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
            isDisabled={!writeAsync || chainId !== currentChainId}
            isLoading={
              detailsCidLoading || isLoading || isLoadingEligibilityResolvedAddress || isLoadingToggleResolvedAddress
            }
          >
            Approve
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export { HatLinkRequestApproveForm };
