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
  Radio,
  RadioGroup,
  FormHelperText,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';
import { useChainId } from 'wagmi';

import DropZone from '@/components/DropZone';
import Input from '@/components/Input';
import RadioBox from '@/components/RadioBox';
import Textarea from '@/components/Textarea';
import CONFIG, { MUTABILITY, ZERO_ADDRESS } from '@/constants';
import useCid from '@/hooks/useCid';
import useDebounce from '@/hooks/useDebounce';
import useHatCreate from '@/hooks/useHatCreate';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import { prettyIdToIp } from '@/lib/hats';
import { pinJson } from '@/lib/ipfs';
import ChakraNextLink from '@/components/ChakraNextLink';

const HatCreateForm = ({
  defaultAdmin,
  treeId,
}: {
  defaultAdmin: string | undefined;
  treeId: string;
}) => {
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
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [toggleChecked, setInputChecked] = useState(false);
  const [customDetails, setCustomDetails] = useState(true);
  const [customImage, setCustomImage] = useState(true);
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
  const description = useDebounce(watch('description', ''));
  const details = useDebounce(watch('details', ''));
  const maxSupply = useDebounce(watch('maxSupply', 1));
  const eligibility = useDebounce(watch('eligibility', ZERO_ADDRESS));
  const toggle = useDebounce(watch('toggle', ZERO_ADDRESS));
  const mutable = useDebounce(watch('mutable', MUTABILITY.MUTABLE));
  const imageUrl = useDebounce(watch('imageUrl', ''));

  const decimalAdmin = prettyIdToIp(defaultAdmin);

  const {
    data: imagePinData,
    isLoading: imagePinLoading,
    // error: imagePinError,
  } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: customImage,
    metadata: { name: `image_${_.toString(chainId)}_${decimalAdmin}` },
  });

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description },
  });

  const {
    writeAsync,
    isLoading,
    toggleResolvedAddress,
    eligibilityResolvedAddress,
  } = useHatCreate({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    treeId,
    admin: defaultAdmin,
    details: customDetails ? detailsCID : details,
    maxSupply: _.toNumber(maxSupply),
    eligibility: eligibilityChecked && eligibility,
    toggle: toggleChecked && toggle,
    mutable,
    imageUrl: customImage
      ? imagePinData !== undefined
        ? `ipfs://${imagePinData}`
        : undefined
      : imageUrl,
  });

  const showEligibilityResolvedAddress =
    eligibilityResolvedAddress && eligibilityResolvedAddress !== eligibility;
  const showToggleResolvedAddress =
    toggleResolvedAddress && toggleResolvedAddress !== toggle;

  const onSubmit = async () => {
    writeAsync?.();
    if (customDetails) {
      await pinJson(
        { type: '1.0', data: { name, description } },
        { name: `details_${_.toString(chainId)}_${decimalAdmin}` },
      );
    }
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={6}>
        <Input
          localForm={localForm}
          name='admin'
          label='Admin of Hat'
          defaultValue={decimalAdmin}
          isDisabled
        />
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
                placeholder='Hat details'
              />
            )}
            {customDetails && (
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
              </Stack>
            )}
          </Stack>
        </FormControl>
        <Input
          name='maxSupply'
          label='Max Supply'
          placeholder='10'
          localForm={localForm}
        />
        <FormControl isRequired>
          <FormLabel>Mutability</FormLabel>
          <Controller
            control={localForm.control}
            name='mutable'
            render={({ field: { onChange, value } }) => (
              <RadioGroup onChange={onChange} value={value}>
                <HStack spacing='24px'>
                  <Radio value={MUTABILITY.MUTABLE}>{MUTABILITY.MUTABLE}</Radio>
                  <Radio value={MUTABILITY.IMMUTABLE}>
                    {MUTABILITY.IMMUTABLE}
                  </Radio>
                </HStack>
              </RadioGroup>
            )}
          />
          <FormHelperText>
            Whether or not this Hat should be able to be modified by its Admin.
            If unsure, default to mutable. This can be changed from mutable to
            immutable later (but not the other way).
          </FormHelperText>
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
                isFullWidth
                image={image}
              />
            )}
          </Stack>
        </FormControl>
        <FormControl>
          <HStack>
            <Switch
              isChecked={eligibilityChecked}
              onChange={() => setEligibilityChecked(!eligibilityChecked)}
            />
            {!eligibilityChecked && <FormLabel>Set Eligibility</FormLabel>}
            {eligibilityChecked && (
              <Box w='100%'>
                <Input
                  name='eligibility'
                  label='Eligibility'
                  tip={
                    <Text size='xs' color='gray.600'>
                      See{' '}
                      <ChakraNextLink
                        href='https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/eligibility-requirements-for-wearers'
                        decoration
                        isExternal
                      >
                        docs.hatsprotocol.xyz
                      </ChakraNextLink>{' '}
                      for details
                    </Text>
                  }
                  placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
                  rightElement={
                    showEligibilityResolvedAddress && <FaCheck color='green' />
                  }
                  // w='100%'
                  localForm={localForm}
                />
                {showEligibilityResolvedAddress && (
                  <Text fontSize='sm' color='gray.500' mt={1}>
                    Resolved address: {eligibilityResolvedAddress}
                  </Text>
                )}
              </Box>
            )}
          </HStack>
        </FormControl>
        <FormControl>
          <HStack>
            <Switch
              isChecked={toggleChecked}
              onChange={() => setInputChecked(!toggleChecked)}
            />
            {!toggleChecked && <FormLabel>Set Toggle</FormLabel>}
            {toggleChecked && (
              <Box w='100%'>
                <Input
                  name='toggle'
                  label='Toggle'
                  tip={
                    <Text size='xs' color='gray.500'>
                      See{' '}
                      <ChakraNextLink
                        href='https://docs.hatsprotocol.xyz/using-hats/setting-accountabilities/toggle-activating-and-deactivating-hats'
                        decoration
                        isExternal
                      >
                        docs.hatsprotocol.xyz
                      </ChakraNextLink>{' '}
                      for details
                    </Text>
                  }
                  placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
                  rightElement={
                    showToggleResolvedAddress && <FaCheck color='green' />
                  }
                  localForm={localForm}
                />
                {showToggleResolvedAddress && (
                  <Text fontSize='sm' color='gray.500' mt={1}>
                    Resolved address: {toggleResolvedAddress}
                  </Text>
                )}
              </Box>
            )}
          </HStack>
        </FormControl>
        <Flex justify='flex-end'>
          <Button
            type='submit'
            isDisabled={
              !writeAsync || detailsCidLoading || imagePinLoading || isLoading
            }
          >
            {imagePinLoading ? <Spinner /> : 'Create'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatCreateForm;
