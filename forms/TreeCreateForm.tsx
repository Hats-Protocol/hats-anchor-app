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
import { useChainId } from 'wagmi';

import DropZone from '@/components/DropZone';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import CONFIG from '@/constants';
import useCid from '@/hooks/useCid';
import useDebounce from '@/hooks/useDebounce';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import useTreeCreate from '@/hooks/useTreeCreate';
import { pinJson } from '@/lib/ipfs';

const TreeCreateForm = () => {
  const [customDetails, setCustomDetails] = useState(true);
  const [customImage, setCustomImage] = useState(true);

  const [image, setImage] = useState<any>();
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

  const localForm = useForm({
    mode: 'onChange',
  });
  const { handleSubmit, watch } = localForm;
  const chainId = useChainId();

  const [overrideReceiver, setOverrideReceiver] = useState(false);
  const name = useDebounce(watch('name', ''));
  const description = useDebounce(watch('description', ''));
  const details = useDebounce(watch('details', ''));
  const imageUrl = useDebounce(watch('imageUrl', ''));
  const receiver = useDebounce(watch('receiver'));
  const receiverResolvedAddress = useDebounce(watch('receiverResolvedAddress'));

  const {
    data: imagePinData,
    isLoading: imagePinLoading,
    // error: imagePinError,
  } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: customImage,
    metadata: { name: `image_${_.toString(chainId)}_tophat` },
  });

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description },
  });

  const { writeAsync, isLoading } = useTreeCreate({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    details: customDetails ? detailsCID : details,
    imageUrl: customImage
      ? imagePinData !== undefined
        ? `ipfs://${imagePinData}`
        : undefined
      : imageUrl,
    receiver,
    overrideReceiver,
  });

  const onSubmit = async () => {
    writeAsync?.();
    if (customDetails) {
      await pinJson(
        { type: '1.0', data: { name, description } },
        { name: `details_${_.toString(chainId)}_tophat` },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
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
                placeholder='Top-hat details'
              />
            )}
            {customDetails && (
              <Stack spacing={2}>
                <Input
                  localForm={localForm}
                  name='name'
                  label='Name'
                  placeholder='Top-hat name'
                />
                <Textarea
                  localForm={localForm}
                  name='description'
                  label='Description'
                  placeholder='Top-hat description'
                />
              </Stack>
            )}
          </Stack>
        </FormControl>
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

        <FormControl>
          <HStack>
            <Switch
              id='overrideReceiver'
              isChecked={!overrideReceiver}
              onChange={() => setOverrideReceiver(!overrideReceiver)}
            />
            <FormLabel htmlFor='overrideReceiver'>Mint to Me</FormLabel>
          </HStack>
        </FormControl>

        {overrideReceiver && (
          <Box>
            <Input
              name='receiver'
              label='Receiver'
              placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
              localForm={localForm}
              rightElement={
                receiverResolvedAddress && <FaCheck color='green' />
              }
            />
            {receiverResolvedAddress && (
              <Text fontSize='sm' color='gray.500'>
                Resolved address: {receiverResolvedAddress}
              </Text>
            )}
          </Box>
        )}

        <Flex justify='flex-end'>
          <Button
            type='submit'
            isDisabled={
              !writeAsync || isLoading || detailsCidLoading || imagePinLoading
            }
          >
            {imagePinLoading ? <Spinner /> : 'Create'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default TreeCreateForm;
