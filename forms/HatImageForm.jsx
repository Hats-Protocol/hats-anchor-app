import { useState } from 'react';
import _ from 'lodash';
import {
  Stack,
  Flex,
  Button,
  Spinner,
  Switch,
  FormControl,
  Textarea,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import useHatImageUpdate from '../hooks/useHatImageUpdate';
import { hatsAddresses } from '../constants';
import useDebounce from '../hooks/useDebounce';
import { useDropzone } from 'react-dropzone';
import DropZone from '../components/DropZone';
import usePinImageIpfs from '../hooks/usePinImageIpfs';

const HatImageForm = ({ hatData, chainId }) => {
  const [customImage, setCustomImage] = useState(true);
  const [image, setImage] = useState();
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

  const { writeAsync } = useHatImageUpdate({
    hatsAddress: hatsAddresses(chainId),
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
                acceptedFiles={acceptedFiles}
                isFocused={isFocused}
                isDragAccept={isDragAccept}
                isDragReject={isDragReject}
                image={image}
              />
            )}
          </Stack>
        </FormControl>

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync || imagePinLoading}>
            {imagePinLoading ? <Spinner /> : 'Update'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatImageForm;
