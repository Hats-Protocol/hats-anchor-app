import {
  Box,
  Input as ChakraInput,
  Flex,
  FormControl,
  Icon,
  IconButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Stack,
  Switch,
  Text,
  Tooltip,
  HStack,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCheck, FaHouseUser, FaInfoCircle, FaTrash } from 'react-icons/fa';
import { useChainId } from 'wagmi';

import DropZone from '@/components/atoms/DropZone';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import ItemDetailsForm from '@/forms/ItemDetailsForm';
import useCid from '@/hooks/useCid';
import useDebounce from '@/hooks/useDebounce';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import useResolveGuild from '@/hooks/useResolvedGuild';
import { isTopHat } from '@/lib/hats';
import { DetailsItem } from '@/types';

const HatDetailsForm = ({
  localForm,
  hatData,
  chainId,
  setNewImageURI,
  defaultValues,
  setNewDetailsURI,
  setNewDetailsData,
}: {
  localForm: any;
  hatData: any;
  chainId: number;
  defaultValues: {
    name?: string;
    description?: string;
    imageUrl?: string;
    guilds?: string[];
    responsibilities: DetailsItem[];
    authorities: DetailsItem[];
  };
  setNewImageURI: (uri: string) => void;
  setNewDetailsURI: (uri: string) => void;
  setNewDetailsData: (data: any) => void;
}) => {
  const [customImage, setCustomImage] = useState(true);
  const [image, setImage] = useState<any>();
  const { formState, watch } = localForm;
  const [guilds, setGuilds] = useState(defaultValues.guilds || []);
  const [newGuild, setNewGuild] = useState('');
  const [responsibilities, setResponsibilities] = useState(
    defaultValues.responsibilities || [],
  );
  const [authorities, setAuthorities] = useState(
    defaultValues.authorities || [],
  );

  const { isResolved, isLoading: isResolvingGuild } = useResolveGuild({
    guildName: newGuild,
  });

  const handleAddGuild = () => {
    setGuilds([...guilds, newGuild]);
    setNewGuild('');
  };

  const handleAddResponsibility = ({ link, label }: DetailsItem) => {
    setResponsibilities([...responsibilities, { link, label }]);
  };

  const handleAddAuthority = ({ link, label }: DetailsItem) => {
    setAuthorities([...authorities, { link, label }]);
  };

  const handleRemoveGuild = (index: number) => {
    setGuilds(guilds.filter((__: any, i: number) => i !== index));
  };

  const handleRemoveResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((__, i) => i !== index));
  };

  const handleRemoveAuthority = (index: number) => {
    setAuthorities(authorities.filter((__, i) => i !== index));
  };

  const name = useDebounce(watch('name', defaultValues?.name || ''));
  const description = useDebounce(
    watch('description', defaultValues?.description || ''),
  );

  const { cid: detailsCID, loading: detailsCidLoading } = useCid({
    type: '1.0',
    data: { name, description, guilds, responsibilities, authorities },
  });

  useEffect(() => {
    setNewDetailsURI(detailsCID);
    setNewDetailsData({
      name,
      description,
      guilds,
      responsibilities,
      authorities,
    });
  }, [detailsCID]);

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

  useEffect(() => {
    const hatImageURI = customImage
      ? imagePinData !== undefined
        ? `ipfs://${imagePinData}`
        : undefined
      : formState?.values?.imageUrl || '';
    setNewImageURI(hatImageURI);
  }, [customImage, imagePinData, formState?.values?.imageUrl]);

  return (
    <form>
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

            <ItemDetailsForm
              items={responsibilities}
              setItems={setResponsibilities}
              handleAddItem={handleAddResponsibility}
              handleRemoveItem={handleRemoveResponsibility}
              title='Responsibilities'
              label='Responsibility'
            />

            <ItemDetailsForm
              items={authorities}
              setItems={setAuthorities}
              handleAddItem={handleAddAuthority}
              handleRemoveItem={handleRemoveAuthority}
              title='Authorities'
              label='Authority'
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
                isFullWidth
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
      </Stack>
    </form>
  );
};

export default HatDetailsForm;
