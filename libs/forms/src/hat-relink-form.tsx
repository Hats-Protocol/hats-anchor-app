'use client';

import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useOverlay } from 'contexts';
import { useHatContractWrite } from 'hats-hooks';
import { useDebounce, usePinImageIpfs, useWaitForSubgraph } from 'hooks';
import { first, get } from 'lodash';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import { AppHat, ImageFile } from 'types';
import { Button, DropZone, Switch } from 'ui';
import { fetchToken, pinJson } from 'utils';
import { Hex, zeroAddress } from 'viem';
import { useEnsAddress } from 'wagmi';

import { FormControl, FormLabel, Input, Select, Textarea } from './components';

// TODO [low] update links to use new docs links constants
// TODO fix select

const HatRelinkForm = ({
  chainId,
  hatData,
  parentTreeHats,
}: {
  chainId: number;
  hatData: AppHat;
  parentTreeHats: AppHat[];
}) => {
  // const currentNetworkId = useChainId();
  const { handlePendingTx } = useOverlay();
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      topHatDomain: hatData.prettyId,
      newAdmin: get(first(parentTreeHats), 'id') as Hex,
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
    path: hatData.imageUrl || '', // TODO better fallback?
  });

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

  const newParentId = get(first(parentTreeHats), 'id') as Hex;
  const newAdmin = useDebounce<Hex>(watch('newAdmin', newParentId));
  const description = useDebounce<string>(watch('description', ''));
  const eligibility = useDebounce(watch('eligibility', zeroAddress));
  const toggle = useDebounce(watch('toggle', zeroAddress));
  const imageUrl = useDebounce(watch('imageUrl', ''));

  const { data: imagePinData } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: newImage,
    metadata: {
      name: `image_${chainId.toString()}_${hatIdDecimalToIp(BigInt(newAdmin))}`,
    },
  });

  const { data: eligibilityResolvedAddress, isLoading: isLoadingEligibilityResolvedAddress } = useEnsAddress({
    name: eligibility,
    chainId: 1,
  });
  const { data: toggleResolvedAddress, isLoading: isLoadingToggleResolvedAddress } = useEnsAddress({
    name: toggle,
    chainId: 1,
  });

  const eligibilityAddress = eligibilityResolvedAddress || FALLBACK_ADDRESS;
  const toggleAddress = toggleResolvedAddress || FALLBACK_ADDRESS;

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'relinkTopHatWithinTree',
    args: [
      hatData.id,
      newAdmin,
      eligibilityAddress,
      toggleAddress,
      description,
      // eslint-disable-next-line no-nested-ternary
      newImage ? (imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined) : imageUrl,
    ],
    chainId,
    successToastData: {
      title: 'Top Hat Relinked!',
      description: `Successfully relinked top hat ${hatIdDecimalToIp(
        BigInt(hatData.id),
      )} to ${hatIdDecimalToIp(BigInt(newAdmin))}`,
    },
    handlePendingTx,
    waitForSubgraph,
    // enabled: !!hatData.prettyId && !!newAdmin && chainId === currentNetworkId,
  });

  const showEligilityResolvedAddress = eligibilityResolvedAddress && eligibilityResolvedAddress !== eligibility;
  const showToggleResolvedAddress = toggleResolvedAddress && toggleResolvedAddress !== toggle;

  const onSubmit = async () => {
    writeAsync?.();
    if (newDetails) {
      const token = await fetchToken();
      await pinJson(
        { type: '1.0', data: { description } },
        {
          name: `details_${chainId.toString()}_${hatIdDecimalToIp(BigInt(newAdmin))}`,
        },
        token,
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-6'>
        <p>
          Link this Top Hat to your tree by making the selected Hat its new admin. Optionally update details, image,
          eligibility, and toggle of the Top Hat now that it will be a child hat.
        </p>
        <div className='flex items-center gap-2'>
          <p className='font-medium'>Hat to be relinked:</p>
          <p>ID {hatIdDecimalToIp(BigInt(hatData?.id))}</p>
        </div>

        <Select label='Select new Admin Hat' name='newAdmin' localForm={localForm} options={[]}>
          {/* {map(parentTreeHats, (hat: AppHat) => (
            <option value={hat.id} key={hat.id}>
              {hatIdDecimalToIp(BigInt(hat.id))}
            </option>
          ))} */}
        </Select>

        <FormControl>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Switch checked={newDetails} onChange={() => setNewDetails(!newDetails)} />
              <FormLabel>New Details</FormLabel>
            </div>

            {newDetails && (
              <div className='space-y-2'>
                <Textarea localForm={localForm} name='description' label='Description' placeholder='Hat description' />
              </div>
            )}
          </div>
        </FormControl>

        <FormControl>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Switch checked={newImage} onChange={() => setNewImage(!newImage)} />
              <FormLabel>New Image</FormLabel>
            </div>

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
          </div>
        </FormControl>

        <FormControl>
          <div className='flex items-center gap-2'>
            <Switch checked={eligibilityChecked} onChange={() => setEligibilityChecked(!eligibilityChecked)} />
            {!eligibilityChecked && <FormLabel>New Eligibility</FormLabel>}
            {eligibilityChecked && (
              <div className='space-y-1'>
                <Input
                  name='eligibility'
                  label='Eligibility — https://docs.hatsprotocol.xyz/#eligibility'
                  placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
                  rightElement={showEligilityResolvedAddress && <FaCheck color='green' />}
                  localForm={localForm}
                />
                {showEligilityResolvedAddress && (
                  <p className='text-sm text-gray-500'>Resolved address: {eligibilityResolvedAddress}</p>
                )}
              </div>
            )}
          </div>
        </FormControl>

        <FormControl>
          <div className='flex items-center gap-2'>
            <Switch checked={toggleChecked} onChange={() => setToggleChecked(!toggleChecked)} />
            {!toggleChecked && <FormLabel>New Toggle</FormLabel>}
            {toggleChecked && (
              <div className='space-y-1'>
                <Input
                  name='toggle'
                  label='Toggle — https://docs.hatsprotocol.xyz/#toggle'
                  placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
                  rightElement={showToggleResolvedAddress && <FaCheck color='green' />}
                  localForm={localForm}
                />

                {showToggleResolvedAddress && (
                  <p className='text-sm text-gray-500'>Resolved address: {toggleResolvedAddress}</p>
                )}
              </div>
            )}
          </div>
        </FormControl>

        <div className='flex justify-end'>
          <Button
            type='submit'
            disabled={!writeAsync || isLoading || isLoadingEligibilityResolvedAddress || isLoadingToggleResolvedAddress}
          >
            Relink
          </Button>
        </div>
      </div>
    </form>
  );
};

export { HatRelinkForm };
