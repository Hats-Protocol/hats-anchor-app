import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
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
import { Hex } from 'viem';
import { useChainId } from 'wagmi';

import DropZone from '@/components/atoms/DropZone';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Layout from '@/components/Layout';
import CONFIG from '@/constants';
import useCid from '@/hooks/useCid';
import useDebounce from '@/hooks/useDebounce';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import useTreeCreate from '@/hooks/useTreeCreate';
import { pinJson } from '@/lib/ipfs';
import { chainsMap } from '@/lib/web3';

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

  const chainId = useChainId();
  const localForm = useForm({
    mode: 'onChange',
  });
  const { handleSubmit, watch } = localForm;

  const [overrideReceiver, setOverrideReceiver] = useState(false);
  const name = useDebounce(watch('name', ''));
  const description = useDebounce(watch('description', ''));
  const imageUrl = useDebounce<string>(watch('imageUrl', ''));
  const receiver = useDebounce<string>(watch('receiver'));
  const receiverResolvedAddress = useDebounce<Hex>(
    watch('receiverResolvedAddress'),
  );

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
    chainId,
    details: detailsCID,
    // eslint-disable-next-line no-nested-ternary
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
        { name: `details_${_.toString(chainId)}_topHat` },
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
        opacity={0.02}
        zIndex={-1}
      />

      <Flex pt={125} direction='column' align='center'>
        <Heading size='lg' fontWeight='medium'>
          New {_.capitalize(CONFIG.tree)}
        </Heading>
        <Box as='form' onSubmit={handleSubmit(onSubmit)} w='50%'>
          <Stack mt={10} spacing={6}>
            <Stack>
              <Text fontWeight='semibold'>{_.toUpper('Top Hat Image')}</Text>
              <DropZone
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isFocused={isFocused}
                isDragAccept={isDragAccept}
                isDragReject={isDragReject}
                image={image}
              />
            </Stack>
            <Input
              name='name'
              label={_.toUpper('Top Hat name')}
              placeholder='Name of Top Hat'
              variant='filled'
              localForm={localForm}
            />
            <Textarea
              name='description'
              label={_.toUpper('Top Hat description')}
              placeholder='Describe the Tree and this Top Hat'
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
                  {_.toUpper('Mint to Me')}
                </FormLabel>
              </HStack>
            </FormControl>

            {overrideReceiver && (
              <Box>
                <Input
                  name='receiver'
                  label='Receiver'
                  placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
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

            <Stack>
              <Text fontWeight='semibold'>{_.toUpper('Network')}</Text>
              <Text>
                This Tree will be minted on{' '}
                {_.capitalize(chainsMap(chainId).name)}
              </Text>
            </Stack>

            <Flex justify='flex-end'>
              <Button
                type='submit'
                colorScheme='blue'
                isDisabled={!writeAsync}
                isLoading={isLoading || detailsCidLoading || imagePinLoading}
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
