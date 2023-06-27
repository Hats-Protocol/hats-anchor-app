import React, { useState } from 'react';
import _ from 'lodash';
import {
  Flex,
  Heading,
  Stack,
  Text,
  FormControl,
  Box,
  HStack,
  Switch,
  FormLabel,
  Button,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { FaCheck } from 'react-icons/fa';

import Layout from '@/components/Layout';
import CONFIG from '@/constants';
import DropZone from '@/components/DropZone';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import useDebounce from '@/hooks/useDebounce';
import useTreeCreate from '@/hooks/useTreeCreate';
import useCid from '@/hooks/useCid';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import { pinJson } from '@/lib/ipfs';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';

const NewTree = () => {
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

  const [overrideReceiver, setOverrideReceiver] = useState(false);
  const name = useDebounce(watch('name', ''));
  const description = useDebounce(watch('description', ''));
  const imageUrl = useDebounce(watch('imageUrl', ''));
  const receiver = useDebounce(watch('receiver'));
  const chainId = useDebounce(watch('chainId', 5));
  const receiverResolvedAddress = useDebounce(watch('receiverResolvedAddress'));

  const {
    data: imagePinData,
    isLoading: imagePinLoading,
    // error: imagePinError,
  } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: image,
    metadata: { name: `image_${_.toString(chainId)}_tophat` },
  });

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description },
  });

  const { writeAsync, isLoading } = useTreeCreate({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    details: detailsCID,
    imageUrl: image
      ? imagePinData !== undefined
        ? `ipfs://${imagePinData}`
        : undefined
      : imageUrl,
    receiver,
    overrideReceiver,
  });

  const onSubmit = async () => {
    writeAsync?.();
    if (detailsCID) {
      await pinJson(
        { type: '1.0', data: { name, description } },
        { name: `details_${_.toString(chainId)}_tophat` },
      );
    }
  };

  return (
    <Layout>
      <Box
        w='100%'
        h='100%'
        bg='blue'
        position='fixed'
        opacity={0.07}
        zIndex={-1}
      />

      <Flex pt={125} direction='column' align='center'>
        <Heading size='lg' fontWeight={500}>
          New {_.capitalize(CONFIG.tree)}
        </Heading>
        <Box as='form' onSubmit={handleSubmit(onSubmit)} w='50%'>
          <Stack mt={10} spacing={6}>
            <Stack>
              <Text fontWeight={600}>Top Hat Image</Text>
              <DropZone
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isFocused={isFocused}
                isDragAccept={isDragAccept}
                isDragReject={isDragReject}
              />
            </Stack>
            <Input
              name='name'
              label='Top Hat name'
              variant='filled'
              localForm={localForm}
            />
            <Textarea
              name='description'
              label='Top Hat description'
              variant='filled'
              localForm={localForm}
            />

            <FormControl>
              <HStack align='center'>
                <Switch
                  id='overrideReceiver'
                  isChecked={!overrideReceiver}
                  onChange={() => setOverrideReceiver(!overrideReceiver)}
                />
                <FormLabel htmlFor='overrideReceiver' m={0}>
                  Mint to Me
                </FormLabel>
              </HStack>
            </FormControl>

            {overrideReceiver && (
              <Box>
                <Input
                  name='receiver'
                  label='Receiver'
                  placeholder='0x1234, vitalik.eth'
                  localForm={localForm}
                  variant='filled'
                  rightElement={
                    receiverResolvedAddress && (
                      <Icon as={FaCheck} color='green' />
                    )
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
                  !writeAsync ||
                  isLoading ||
                  detailsCidLoading ||
                  imagePinLoading
                }
              >
                {imagePinLoading ? <Spinner /> : 'Create'}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Flex>
    </Layout>
  );
};

export default NewTree;
