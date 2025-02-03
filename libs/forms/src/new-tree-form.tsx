'use client';

import { useOverlay } from 'contexts';
import { useTreeCreate } from 'hats-hooks';
import { useCid, useDebounce, usePinImageIpfs } from 'hooks';
import { toString, toUpper } from 'lodash';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import { ImageFile } from 'types';
import { DropZone } from 'ui';
import { Button, Switch } from 'ui';
import { chainsMap, fetchToken, pinJson } from 'utils';
import { Hex } from 'viem';
import { useChainId } from 'wagmi';

import { Form, FormLabel, Input, Textarea } from './components';

const NewTreeForm = () => {
  const [image, setImage] = useState<ImageFile>();
  const { acceptedFiles, getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (a) => {
      setImage(
        Object.assign(a[0], {
          preview: URL.createObjectURL(a[0]),
        } as ImageFile),
      );
    },
  });

  const chainId = useChainId();
  const { handlePendingTx } = useOverlay();
  const localForm = useForm({
    mode: 'onChange',
  });
  const { handleSubmit, watch, setValue } = localForm;

  const name = useDebounce(watch('name', ''));
  const description = useDebounce(watch('description', ''));
  const imageUrl = useDebounce<string>(watch('imageUrl', ''));
  const receiver = useDebounce<string>(watch('receiver'));
  const receiverResolvedAddress = useDebounce<Hex>(watch('receiverResolvedAddress'));
  const overrideReceiver = watch('overrideReceiver');
  const {
    data: imagePinData,
    // error: imagePinError,
  } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: !!image,
    metadata: { name: `image_${toString(chainId)}_tophat` },
  });

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description },
  });

  const { writeAsync, isLoading } = useTreeCreate({
    chainId,
    details: detailsCID,
    // eslint-disable-next-line no-nested-ternary
    imageUrl: image ? (imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined) : imageUrl,
    receiver,
    overrideReceiver,
    handlePendingTx,
  });

  const onSubmit = async () => {
    await writeAsync?.();
    if (detailsCID) {
      // TODO migrate to `handleDetailsPin`
      const token = await fetchToken();
      await pinJson(
        { type: '1.0', data: { name, description } },
        { name: `details_${toString(chainId)}_topHat` },
        token,
      );
    }
  };

  return (
    <Form {...localForm}>
      <form onSubmit={handleSubmit(onSubmit)} className='w-1/2'>
        <div className='mt-10 space-y-6'>
          <DropZone
            label='Top Hat Image'
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isFocused={isFocused}
            isDragAccept={isDragAccept}
            isDragReject={isDragReject}
            image={image}
            isFullWidth
          />
          <Input name='name' label={toUpper('Top Hat name')} placeholder='Name of Top Hat' localForm={localForm} />
          <Textarea
            name='description'
            label={toUpper('Top Hat description')}
            placeholder='Describe the Tree and this Top Hat'
            localForm={localForm}
          />

          <div className='flex items-center'>
            <Switch
              id='overrideReceiver'
              checked={overrideReceiver}
              onChange={() => setValue('overrideReceiver', !overrideReceiver)}
            />
            <FormLabel htmlFor='overrideReceiver' className='m-0'>
              {toUpper('Mint to Me')}
            </FormLabel>
          </div>

          {overrideReceiver && (
            <div>
              <Input
                name='receiver'
                label='Assign to'
                placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
                localForm={localForm}
                rightElement={receiverResolvedAddress && <FaCheck className='text-functional-success h-4 w-4' />}
              />
              {receiverResolvedAddress && (
                <p className='text-gray text-sm'>Resolved address: {receiverResolvedAddress}</p>
              )}
            </div>
          )}

          <div className='flex justify-end'>
            {/* isLoading={isLoading || detailsCidLoading} */}
            <Button type='submit' disabled={!writeAsync}>
              Create on {chainsMap(chainId)?.name}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export { NewTreeForm };
