/* eslint-disable no-nested-ternary */
import {
  Stack,
  Flex,
  Button,
  FormControl,
  Switch,
  FormLabel,
  HStack,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useDropzone } from 'react-dropzone';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import useHatLinkRequestApprove from '../hooks/useHatLinkRequestApprove';
import { FALLBACK_ADDRESS, ZERO_ADDRESS } from '../constants';
import useDebounce from '../hooks/useDebounce';
import { prettyIdToIp, decimalId } from '../lib/hats';
import usePinImageIpfs from '../hooks/usePinImageIpfs';
import DropZone from '../components/DropZone';
import { pinJson } from '../lib/ipfs';
import useCid from '../hooks/useCid';

const HatLinkRequestApproveForm = ({ topHatDomain, chainId, hatData }) => {
  const localForm = useForm({
    mode: 'onChange',
    defaultValues: {
      topHatDomain,
      newAdmin: decimalId(hatData.id),
      description: '',
    },
  });
  const { handleSubmit, watch } = localForm;

  const [customDetails, setCustomDetails] = useState(true);
  const [customImage, setCustomImage] = useState(true);
  const [inputEligibility, setInputEligibility] = useState(false);
  const [inputToggle, setInputToggle] = useState(false);
  const [newDetails, setNewDetails] = useState(false);
  const [newImage, setNewImage] = useState(false);
  const [image, setImage] = useState(hatData.imageUrl);

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (droppedFiles) => {
      setImage(
        Object.assign(droppedFiles[0], {
          preview: URL.createObjectURL(droppedFiles[0]),
        }),
      );
    },
  });

  const name = useDebounce(watch('name', ''));
  const description = useDebounce(watch('description', ''));
  const details = useDebounce(watch('details', ''));
  const eligibility = useDebounce(watch('eligibility', ZERO_ADDRESS));
  const toggle = useDebounce(watch('toggle', ZERO_ADDRESS));
  const imageUrl = useDebounce(watch('imageUrl', ''));

  const decimalAdmin = prettyIdToIp(topHatDomain);

  const { data: imagePinData, isLoading: imagePinLoading } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: newImage && customImage,
    metadata: { name: `image_${_.toString(chainId)}_${decimalAdmin}` },
  });

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description },
  });

  const { writeAsync } = useHatLinkRequestApprove({
    topHatDomain,
    newAdmin: hatData.id,
    eligibility: inputEligibility ? eligibility : FALLBACK_ADDRESS,
    toggle: inputToggle ? toggle : FALLBACK_ADDRESS,
    description: newDetails && customDetails ? detailsCID : details,
    imageUrl:
      newImage && customImage
        ? imagePinData !== undefined
          ? `ipfs://${imagePinData}`
          : undefined
        : imageUrl,
    chainId,
  });

  const onSubmit = async () => {
    writeAsync?.();
    if (newDetails && customDetails) {
      await pinJson(
        { type: '1.0', data: { name, description } },
        { name: `details_${_.toString(chainId)}_${decimalAdmin}` },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={6}>
        <Text>
          Link this Top Hat to your tree by making the selected Hat its new
          admin. Optionally update details, image, eligibility, and toggle of
          the Top Hat now that it will be a child hat.
        </Text>
        <Flex>
          <Text fontWeight={500} mr={2}>
            New Admin:
          </Text>
          <Text>ID {prettyIdToIp(hatData.prettyId)}</Text>
        </Flex>
        <Flex>
          <Text fontWeight={500} mr={2}>
            Domain of the Top Hat to be linked:
          </Text>
          <Text>ID {prettyIdToIp(topHatDomain)}</Text>
        </Flex>
        <FormControl>
          <Stack>
            <HStack>
              <Switch
                isChecked={newDetails}
                onChange={() => setNewDetails(!newDetails)}
              />
              <FormLabel>New Details</FormLabel>
            </HStack>
            {newDetails && (
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
            )}
          </Stack>
        </FormControl>
        <FormControl>
          <Stack spacing={2}>
            <HStack>
              <Switch
                isChecked={newImage}
                onChange={() => setNewImage(!newImage)}
              />
              <FormLabel>New Image</FormLabel>
            </HStack>
            {newImage && (
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
            )}
          </Stack>
        </FormControl>
        <FormControl>
          <HStack>
            <Switch
              isChecked={inputEligibility}
              onChange={() => setInputEligibility(!inputEligibility)}
            />
            {!inputEligibility && <FormLabel>New Eligibility</FormLabel>}
            {inputEligibility && (
              <Input
                name='eligibility'
                label='Eligibility — https://docs.hatsprotocol.xyz/#eligibility'
                placeholder='0x4a750000403C3B91997911FCd989d9B5C25d7876'
                localForm={localForm}
              />
            )}
          </HStack>
        </FormControl>
        <FormControl>
          <HStack>
            <Switch
              isChecked={inputToggle}
              onChange={() => setInputToggle(!inputToggle)}
            />
            {!inputToggle && <FormLabel>New Toggle</FormLabel>}
            {inputToggle && (
              <Input
                name='toggle'
                label='Toggle — https://docs.hatsprotocol.xyz/#toggle'
                placeholder='0x4a75000089d9B5C25d7876403C3B91997911FCd9'
                localForm={localForm}
              />
            )}
          </HStack>
        </FormControl>
        <Flex justify='flex-end'>
          <Button
            type='submit'
            // shouldn't be disabled if newAdmin && topHatDomain are set
            isDisabled={!writeAsync || detailsCidLoading || imagePinLoading}
          >
            {imagePinLoading ? <Spinner /> : 'Approve'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatLinkRequestApproveForm;
