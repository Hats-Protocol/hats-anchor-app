/* eslint-disable no-nested-ternary */
import {
  Stack,
  Flex,
  Button,
  Spinner,
  Switch,
  FormControl,
  Box,
  Icon,
  IconButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Tooltip,
  Input as ChakraInput,
  Text,
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
import { isTopHat, prettyIdToIp } from '@/lib/hats';
import useResolveGuild from '@/hooks/useResolvedGuild';
import { FaInfoCircle, FaHouseUser, FaCheck, FaTrash } from 'react-icons/fa';

const HatDetailsForm = ({
  hatData,
  chainId,
  defaultValues,
}: {
  hatData: any;
  chainId: number;
  defaultValues: {
    name?: string;
    description?: string;
    imageUrl?: string;
    guilds?: string[];
  };
}) => {
  const [customImage, setCustomImage] = useState(true);
  const [image, setImage] = useState<any>();
  const localForm = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: defaultValues.name || '',
      imageUrl: defaultValues.imageUrl || '',
      description: defaultValues.description || '',
      details: {},
    },
  });
  const { handleSubmit, watch } = localForm;
  const [guilds, setGuilds] = useState(defaultValues.guilds || []);
  const [newGuild, setNewGuild] = useState('');

  const { isResolved, isLoading: isResolvingGuild } = useResolveGuild({
    guildName: newGuild,
  });

  const handleAddGuild = () => {
    setGuilds([...guilds, newGuild]);
    setNewGuild('');
  };

  const handleRemoveGuild = (index: number) => {
    setGuilds(guilds.filter((__: any, i: number) => i !== index));
  };

  const name = useDebounce(watch('name', defaultValues?.name || ''));
  const description = useDebounce(
    watch('description', defaultValues?.description || ''),
  );
  const imageUrl = useDebounce(
    watch('imageUrl', defaultValues?.imageUrl || ''),
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

  const { writeAsync } = useHatDetailsUpdate({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId: _.get(hatData, 'id'),
    details: detailsCID,
  });

  const onSubmit = async () => {
    writeAsync?.();
    writeAsyncImage?.();
    await pinJson(
      { type: '1.0', data: { name, description, guilds } },
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
            {isTopHat(hatData) && (
              <>
                <Text fontSize='sm' color='blue.500' pt={3}>
                  <Icon as={FaInfoCircle} mr={1} />
                  Bind one or more guild.xyz to this hat. Remember to click the
                  checkmark to add the guild.
                </Text>
                <Flex alignItems='center'>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaHouseUser} ml={2} />
                    </InputLeftElement>
                    <ChakraInput
                      w='calc(100% - 1rem)'
                      textOverflow='ellipsis'
                      type='guild'
                      placeholder='Guild name (e.g. hats-protocol)'
                      value={newGuild}
                      onChange={(e) => setNewGuild(e.target.value)}
                    />
                    {isResolved ? (
                      <InputRightElement right='2rem'>
                        <FaCheck color='green' />
                      </InputRightElement>
                    ) : (
                      isResolvingGuild && (
                        <InputRightElement right='2rem'>
                          <Spinner size='sm' />
                        </InputRightElement>
                      )
                    )}
                  </InputGroup>
                  <Tooltip
                    label={!newGuild ? 'Please input a guild name' : ''}
                    shouldWrapChildren
                  >
                    <IconButton
                      isDisabled={!newGuild}
                      onClick={handleAddGuild}
                      icon={<FaCheck />}
                      aria-label='Add'
                      height={9}
                      w={16}
                    />
                  </Tooltip>
                </Flex>
                {guilds.map((guild: string, index: number) => (
                  <Box key={guild}>
                    <Flex
                      align='center'
                      w='full'
                      justifyContent='space-between'
                    >
                      <ChakraInput
                        value={guild}
                        readOnly
                        w='calc(100% - 5rem)'
                      />
                      <IconButton
                        type='button'
                        onClick={() => handleRemoveGuild(index)}
                        icon={<FaTrash />}
                        aria-label='Remove'
                        height={9}
                        w={16}
                      />
                    </Flex>
                  </Box>
                ))}
              </>
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
