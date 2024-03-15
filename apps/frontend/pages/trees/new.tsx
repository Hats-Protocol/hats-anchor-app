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
import { CONFIG } from '@hatsprotocol/constants';
import { useOverlay } from 'contexts';
import { useTreeCreate } from 'hats-hooks';
import {
  useCid,
  useDebounce,
  usePinImageIpfs,
  useRudderStackAnalytics,
} from 'hooks';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import { ImageFile } from 'types';
import { DropZone, Input, Layout, Textarea } from 'ui';
import { chainsMap, fetchToken, pinJson } from 'utils';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const NewTree = () => {
  const [image, setImage] = useState<ImageFile>();
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
        } as ImageFile),
      );
    },
  });

  const chainId = useChainId();
  const analytics = useRudderStackAnalytics();
  const { address } = useAccount();
  const { handlePendingTx } = useOverlay();
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
    enabled: !!image,
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
    handlePendingTx,
  });

  const onSubmit = async () => {
    writeAsync?.();
    if (detailsCID) {
      // TODO migrate to `handleDetailsPin`
      const token = await fetchToken();
      await pinJson(
        { type: '1.0', data: { name, description } },
        { name: `details_${_.toString(chainId)}_topHat` },
        token,
      );
    }
  };

  useEffect(() => {
    if (analytics) {
      analytics.page('Auto Track', 'New Tree', {
        isConnected: !!address,
        anonymousId: address || analytics.getAnonymousId(),
      });
    }
  }, [analytics, address]);

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
        <Heading size='lg' variant='medium'>
          New {_.capitalize(CONFIG.tree)}
        </Heading>
        <Box as='form' onSubmit={handleSubmit(onSubmit)} w='50%'>
          <Stack mt={10} spacing={6}>
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
                  <Text size='sm' variant='gray'>
                    Resolved address: {receiverResolvedAddress}
                  </Text>
                )}
              </Box>
            )}

            <Stack>
              <Text variant='medium' size='sm'>
                {_.toUpper('Network')}
              </Text>
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
