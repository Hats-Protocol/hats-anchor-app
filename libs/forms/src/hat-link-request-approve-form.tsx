'use client';

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
import { Button, DropZone, Switch } from 'ui';
import { fetchToken, pinJson } from 'utils';
import { Hex, zeroAddress } from 'viem';
import { useChainId, useEnsAddress } from 'wagmi';

import { FormControl, FormLabel, Input, Textarea } from './components';

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
      <div className='space-y-6'>
        <p>
          Link this Top Hat to your tree by making the selected hat its new admin. Optionally update details, image,
          eligibility, and toggle of the Top Hat now that it will be a child hat.
        </p>
        <div className='flex items-center gap-2'>
          <p className='font-medium'>New Admin:</p>
          <p>ID {hatIdDecimalToIp(BigInt(newAdmin))}</p>
        </div>
        <div className='flex items-center gap-2'>
          <p className='font-medium'>Domain of the Top Hat to be linked:</p>
          <p>ID {prettyIdToIp(topHatDomain)}</p>
        </div>

        <div className='space-y-4'>
          <FormControl>
            <div className='flex items-center gap-2'>
              <Switch checked={newDetails} onChange={() => setNewDetails(!newDetails)} />
              <FormLabel>New Details</FormLabel>
            </div>
          </FormControl>

          {newDetails && (
            <FormControl>
              <div className='space-y-2'>
                <Switch checked={customDetails} onChange={() => setCustomDetails(!customDetails)}>
                  Custom details
                </Switch>
                {!customDetails && (
                  <Textarea localForm={localForm} name='details' label='Details' placeholder='Hat details' />
                )}
                {customDetails && (
                  <div className='space-y-2'>
                    <Input name='name' label='Name' placeholder='Hat name' localForm={localForm} />
                    <Textarea
                      name='description'
                      label='Description'
                      placeholder='Hat description'
                      localForm={localForm}
                    />
                  </div>
                )}
              </div>
            </FormControl>
          )}
        </div>

        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <FormControl>
              <Switch checked={newImage} onChange={() => setNewImage(!newImage)} />
              <FormLabel>New Image</FormLabel>
            </FormControl>
          </div>
          {newImage && (
            <div className='space-y-2'>
              <Switch checked={customImage} onChange={() => setCustomImage(!customImage)}>
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
            </div>
          )}
        </div>

        <FormControl>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Switch checked={eligibilityChecked} onChange={() => setEligibilityChecked(!eligibilityChecked)} />
              {!eligibilityChecked && <FormLabel>New Eligibility</FormLabel>}
              {eligibilityChecked && (
                <div className='w-full'>
                  <Input
                    name='eligibility'
                    label='Eligibility — https://docs.hatsprotocol.xyz/#eligibility'
                    placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
                    rightElement={showEligibilityResolvedAddress && <FaCheck color='green' />}
                    localForm={localForm}
                  />
                  {showEligibilityResolvedAddress && (
                    <p className='text-sm text-gray-500'>Resolved address: {eligibilityResolvedAddress}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </FormControl>

        <FormControl>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Switch checked={toggleChecked} onChange={() => setToggleChecked(!toggleChecked)} />
              {!toggleChecked && <FormLabel>New Toggle</FormLabel>}
              {toggleChecked && (
                <div className='w-full'>
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
          </div>
        </FormControl>

        <div className='flex justify-end'>
          <Button
            type='submit'
            disabled={!writeAsync || chainId !== currentChainId}
            // isLoading={
            //   detailsCidLoading || isLoading || isLoadingEligibilityResolvedAddress || isLoadingToggleResolvedAddress
            // }
          >
            Approve
          </Button>
        </div>
      </div>
    </form>
  );
};

export { HatLinkRequestApproveForm };
