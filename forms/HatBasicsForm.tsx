import {
  Box,
  Flex,
  FormControl,
  Icon,
  IconButton,
  Image,
  Input as ChakraInput,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FaChartBar,
  FaCheck,
  FaHouseUser,
  FaImage,
  FaInfoCircle,
  FaParagraph,
  FaRegEdit,
  FaTrash,
} from 'react-icons/fa';

import DropZone from '@/components/atoms/DropZone';
import Input from '@/components/atoms/Input';
import RadioBox from '@/components/atoms/RadioBox';
import Textarea from '@/components/atoms/Textarea';
import FormRowWrapper from '@/components/FormRowWrapper';
import { MUTABILITY } from '@/constants';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import useResolveGuild from '@/hooks/useResolvedGuild';
import { isTopHat, isTopHatOrMutable } from '@/lib/hats';

const MUTABILITY_OPTIONS = [
  { value: MUTABILITY.MUTABLE, label: 'Editable' },
  {
    value: MUTABILITY.IMMUTABLE,
    label: 'Not Editable (cannot be reversed)',
  },
];

const HatBasicsForm = ({
  localForm,
  hatData,
  chainId,
  setNewImageURI,
  defaultValues,
}: {
  localForm: any;
  hatData: any;
  chainId: number;
  defaultValues: {
    guilds?: string[];
  };
  setNewImageURI: (uri: string) => void;
}) => {
  const [image, setImage] = useState<any>();
  const { formState } = localForm;
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

  const { data: imagePinData } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: true,
    metadata: { name: `image_${_.toString(chainId)}_tophat` },
  });

  useEffect(() => {
    const hatImageURI =
      imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined || '';
    setNewImageURI(hatImageURI);
  }, [imagePinData, formState.values.imageUrl, setNewImageURI]);

  return (
    <form>
      <FormControl>
        <Stack spacing={4}>
          <FormRowWrapper>
            <Image src='/icons/hat.svg' alt='Hat' />
            <Input
              localForm={localForm}
              name='name'
              label='Hat Name'
              placeholder='Hat name'
            />
          </FormRowWrapper>
          <FormRowWrapper>
            <FaParagraph />
            <Textarea
              localForm={localForm}
              name='description'
              label='Description'
              placeholder='Add a brief description (or a link to one) for this hat'
            />
          </FormRowWrapper>

          <FormRowWrapper>
            <FaImage />
            <Box>
              <Text fontSize='sm' fontWeight='medium' mb={2}>
                {' '}
                IMAGE
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
            </Box>
          </FormRowWrapper>
          {isTopHat(hatData) && (
            <FormRowWrapper>
              <FaHouseUser />
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
            </FormRowWrapper>
          )}

          <FormRowWrapper>
            <FaChartBar />
            <Input
              name='maxSupply'
              label='MAX WEARERS'
              placeholder='10'
              isDisabled={!isTopHatOrMutable(hatData)}
              localForm={localForm}
            />
          </FormRowWrapper>

          <FormRowWrapper>
            <FaRegEdit />
            <Box>
              <RadioBox
                name='mutable'
                label='EDITABLE'
                subLabel='Should it be possible for an admin to make changes to this Hat?'
                localForm={localForm}
                options={MUTABILITY_OPTIONS}
                tooltip='Choose whether the Hat should be editable or not'
              />
              {localForm.watch('mutable') === MUTABILITY.IMMUTABLE && (
                <Text color='red.500' mt={3}>
                  Beware: This will make the Hat immutable. No one can ever
                  change it. This can not be undone.
                </Text>
              )}
            </Box>
          </FormRowWrapper>
        </Stack>
      </FormControl>
    </form>
  );
};

export default HatBasicsForm;
