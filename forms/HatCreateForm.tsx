import {
  Box,
  Button,
  Flex,
  Stack,
  Text,
  HStack,
  Icon,
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useChainId } from 'wagmi';
import { BsBoxArrowInUpRight } from 'react-icons/bs';

import DropZone from '@/components/atoms/DropZone';
import Input from '@/components/atoms/Input';
import { FALLBACK_ADDRESS, MUTABILITY, ZERO_ADDRESS } from '@/constants';
import useCid from '@/hooks/useCid';
import useDebounce from '@/hooks/useDebounce';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import { prettyIdToId, prettyIdToIp } from '@/lib/hats';
import { pinJson } from '@/lib/ipfs';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import HatCreateCard from '@/components/HatCreateCard';
import NumberInput from '@/components/atoms/NumberInput';

const HatCreateForm = ({
  defaultAdmin,
  treeId,
}: {
  defaultAdmin: string | undefined;
  treeId: string;
}) => {
  const currentNetworkId = useChainId();
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      details: '',
      maxSupply: 1,
      eligibility: '',
      toggle: '',
      imageUrl: '',
      mutable: MUTABILITY.MUTABLE,
    },
  });
  const { handleSubmit, watch } = localForm;
  const chainId = useChainId();

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

  const name = useDebounce(watch('name', ''));
  const maxSupply = useDebounce(watch('maxSupply', 1));

  const decimalAdmin = prettyIdToIp(defaultAdmin);

  const {
    data: imagePinData,
    isLoading: imagePinLoading,
    error: imagePinError,
  } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: false,
    metadata: { name: `image_${_.toString(chainId)}_${decimalAdmin}` },
  });

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name },
  });

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'createHat',
    args: [
      prettyIdToId(defaultAdmin) || ZERO_ADDRESS, // not a valid fallback? throw instead?
      detailsCID || '',
      maxSupply || '1',
      FALLBACK_ADDRESS,
      FALLBACK_ADDRESS,
      true,
      imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined || '',
    ],
    chainId,
    onSuccessToastData: {
      title: 'Hat Created',
      description: 'Successfully created hat',
    },
    queryKeys: [['treeDetails', treeId]],
    enabled: Boolean(defaultAdmin) && chainId === currentNetworkId,
  });

  const onSubmit = async () => {
    writeAsync?.();
    // TODO handle pin error
    await pinJson(
      { type: '1.0', data: { name } },
      { name: `details_${_.toString(chainId)}_${decimalAdmin}` },
    );
  };

  // const dropZoneContent = {
  //   title: 'Upload an image',
  //   details: `What image do you want to represent this role? This will be the
  //     image that appears alongside the hat token in the Hats dapp,
  //     other apps integrating with Hats Protocol, and anywhere the hat
  //     NFTs are viewable.`,
  //   fileTypes: 'PNG, JPG, GIF up to 2MB',
  // };

  return (
    <Box>
      <Flex my={10} justify='center'>
        <HatCreateCard
          name={name}
          adminId={defaultAdmin}
          supply={maxSupply}
          image={image}
          chainId={chainId}
        />
      </Flex>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={6}>
          {/* <Text>Admin: {prettyIdToIp(defaultAdmin)}</Text> */}

          <Input
            localForm={localForm}
            name='name'
            label='Name'
            options={{ required: true }}
            placeholder='Hat name'
          />
          <Stack>
            <Text fontWeight={600}>Image</Text>
            <Text fontSize='sm' color='gray.600'>
              If not customized, image will default to the admin's image.
            </Text>
            <DropZone
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isFocused={isFocused}
              isDragAccept={isDragAccept}
              isDragReject={isDragReject}
              isFullWidth
              image={image}
            />
          </Stack>
          <NumberInput
            name='maxSupply'
            label='Max Supply'
            helperText='Total number of addresses that can wear this Hat at the same time.'
            options={{ required: true }}
            defaultValue={1}
            localForm={localForm}
          />

          <Flex justify='flex-end'>
            <HStack>
              <Tooltip label='Coming Soon!'>
                <Button isDisabled>Customize</Button>
              </Tooltip>
              <Button
                type='submit'
                colorScheme='blue'
                isDisabled={
                  !writeAsync ||
                  detailsCidLoading ||
                  imagePinLoading ||
                  isLoading
                }
              >
                {imagePinLoading ? (
                  <Spinner />
                ) : (
                  <HStack>
                    <Icon as={BsBoxArrowInUpRight} color='white' />
                    <Text>Create and customize later</Text>
                  </HStack>
                )}
              </Button>
            </HStack>
          </Flex>
        </Stack>
      </form>
    </Box>
  );
};

export default HatCreateForm;
