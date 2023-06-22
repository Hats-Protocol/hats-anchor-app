/* eslint-disable no-nested-ternary */
import {
  Stack,
  Flex,
  Button,
  Spinner,
  Switch,
  FormControl,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';

import DropZone from '@/components/DropZone';
import Textarea from '@/components/Textarea';
import Input from '@/components/Input';
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatImageUpdate from '@/hooks/useHatImageUpdate';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import useHatDetailsUpdate from '@/hooks/useHatDetailsUpdate';
import useCid from '@/hooks/useCid';
import { pinJson } from '@/lib/ipfs';
import { prettyIdToIp } from '@/lib/hats';

const HatDetailsForm = ({
  hatData,
  chainId,
}: {
  hatData: any;
  chainId: number;
}) => {
  const [customImage, setCustomImage] = useState(true);
  const [image, setImage] = useState<any>();
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      name: hatData.details?.name || '',
      imageUrl: hatData.details?.imageUrl || '',
      description: hatData.details?.description || '',
      details: {},
    },
  });
  const { handleSubmit, watch } = localForm;

  const imageUrl = useDebounce(
    watch('imageUrl', hatData.details?.imageUrl || ''),
  );
  const name = useDebounce(watch('name', hatData.details?.name || ''));
  const description = useDebounce(
    watch('description', hatData.details?.description || ''),
  );

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description },
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
    onDrop: (a) => {
      setImage(
        Object.assign(a[0], {
          preview: URL.createObjectURL(a[0]),
        }),
      );
    },
  });

  const {
    data: imagePinData,
    isLoading: imagePinLoading,
    // error: imagePinError,
  } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: customImage,
    metadata: { name: `image_${_.toString(chainId)}_tophat` },
  });

  const { writeAsync: writeAsyncImage, isLoading } = useHatImageUpdate({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId: _.get(hatData, 'id'),
    image: customImage
      ? imagePinData !== undefined
        ? `ipfs://${imagePinData}`
        : undefined
      : imageUrl,
  });
  console.log('writeAsyncImage', writeAsyncImage);

  const { writeAsync } = useHatDetailsUpdate({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId: _.get(hatData, 'id'),
    details: detailsCID,
  });
  console.log('writeAsync', writeAsync);

  const onSubmit = async () => {
    writeAsync?.();
    writeAsyncImage?.();
    await pinJson(
      { type: '1.0', data: { name, description } },
      {
        name: `details_${_.toString(chainId)}_${prettyIdToIp(
          _.get(hatData, 'admin.id'),
        )}`,
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FormControl>
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
              />
            )}
          </Stack>
        </FormControl>

        <Flex justify='flex-end'>
          <Button
            type='submit'
            isDisabled={
              !writeAsync ||
              !writeAsyncImage ||
              imagePinLoading ||
              isLoading ||
              detailsCidLoading
            }
          >
            {imagePinLoading ? <Spinner /> : 'Update'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatDetailsForm;
