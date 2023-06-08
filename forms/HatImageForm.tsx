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
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatImageUpdate from '@/hooks/useHatImageUpdate';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';

const HatImageForm = ({
  hatData,
  chainId,
}: {
  hatData: any;
  chainId: number;
}) => {
  const [customImage, setCustomImage] = useState(true);
  const [image, setImage] = useState<any>();
  const localForm = useForm({ mode: 'onChange' });
  const { handleSubmit, watch } = localForm;

  const imageUrl = useDebounce(watch('imageUrl'));

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

  const { writeAsync, isLoading } = useHatImageUpdate({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId: _.get(hatData, 'id'),
    image: customImage
      ? imagePinData !== undefined
        ? `ipfs://${imagePinData}`
        : undefined
      : imageUrl,
  });

  const onSubmit = () => {
    writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
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
              />
            )}
          </Stack>
        </FormControl>

        <Flex justify='flex-end'>
          <Button
            type='submit'
            isDisabled={!writeAsync || imagePinLoading || isLoading}
          >
            {imagePinLoading ? <Spinner /> : 'Update'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatImageForm;
