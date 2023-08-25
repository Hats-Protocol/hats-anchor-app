import {
  Box,
  Button,
  FormControl,
  HStack,
  Icon,
  IconButton,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import {
  FaHouseUser,
  FaImage,
  FaParagraph,
  FaPlus,
  FaRegEdit,
  FaTrash,
} from 'react-icons/fa';

import DropZone from '@/components/atoms/DropZone';
import Input from '@/components/atoms/Input';
import RadioBox from '@/components/atoms/RadioBox';
import Textarea from '@/components/atoms/Textarea';
import FormRowWrapper from '@/components/FormRowWrapper';
import { MUTABILITY } from '@/constants';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useDebounce from '@/hooks/useDebounce';
import usePinImageIpfs from '@/hooks/usePinImageIpfs';
import { formatImageUrl } from '@/lib/general';
import { isMutable, isTopHat } from '@/lib/hats';

const MUTABILITY_OPTIONS = [
  { value: MUTABILITY.MUTABLE, label: 'Editable' },
  {
    value: MUTABILITY.IMMUTABLE,
    label: 'Not Editable (cannot be reversed)',
  },
];

const HatBasicsForm = ({
  localForm,
  setNewImageURI,
}: {
  localForm: UseFormReturn<any>;
  setNewImageURI: (uri: string) => void;
}) => {
  const { watch, control, formState } = localForm;

  const { chainId, selectedHat } = useTreeForm();
  const [image, setImage] = useState<any>();

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'guilds',
  });

  const guilds = useDebounce<string[]>(watch('guilds'));

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

  const imageUrl = formatImageUrl(formState?.defaultValues?.imageUrl);
  const currentImageUrl = watch('imageUrl');

  const { data: imagePinData } = usePinImageIpfs({
    imageFile: acceptedFiles[0],
    enabled: true,
    metadata: { name: `image_${_.toString(chainId)}_hat_${selectedHat?.id}` },
  });

  useEffect(() => {
    const hatImageURI =
      imagePinData !== undefined ? `ipfs://${imagePinData}` : undefined || '';
    setNewImageURI(hatImageURI);
  }, [imagePinData, currentImageUrl, setNewImageURI]);

  return (
    <form>
      <FormControl>
        <Stack spacing={8}>
          <FormRowWrapper>
            <Image src='/icons/hat.svg' alt='Hat' boxSize={4} mt='2px' />
            <Input
              localForm={localForm}
              name='name'
              label='Hat Name'
              placeholder='Hat name'
            />
          </FormRowWrapper>
          <FormRowWrapper>
            <Icon as={FaParagraph} boxSize={4} mt='2px' />
            <Textarea
              localForm={localForm}
              name='description'
              label='Description'
              placeholder='Add a brief description (or a link to one) for this hat'
            />
          </FormRowWrapper>

          <FormRowWrapper>
            <Icon as={FaImage} boxSize={4} mt='2px' />
            <Box w='100%'>
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
                imageUrl={imageUrl}
              />
            </Box>
          </FormRowWrapper>
          {isTopHat(selectedHat) && (
            <FormRowWrapper>
              <FaHouseUser />
              <Stack w='full'>
                <Text fontSize='sm'>GUILDS</Text>
                {fields.map((field, index) => (
                  <HStack key={field.id}>
                    <Input
                      name={`guilds.${index}`}
                      localForm={localForm}
                      placeholder='Guild name (e.g. hats-protocol)'
                      isDisabled={index !== fields.length - 1}
                    />
                    <IconButton
                      type='button'
                      onClick={() => remove(index)}
                      icon={<FaTrash />}
                      aria-label='Remove'
                      height={9}
                      w={16}
                    />
                  </HStack>
                ))}
                <Box mb={2}>
                  <Button
                    onClick={() => append('')}
                    isDisabled={_.some(guilds, (item: string) => item === '')}
                    gap={2}
                  >
                    <FaPlus />
                    Add {guilds?.length ? 'another' : 'a'} Guild
                  </Button>
                </Box>
              </Stack>
            </FormRowWrapper>
          )}

          <FormRowWrapper>
            <Icon as={FaRegEdit} boxSize={4} mt='2px' />
            <Box>
              <RadioBox
                name='mutable'
                label='EDITABLE'
                isDisabled={!isMutable(selectedHat)}
                subLabel='Should it be possible for an admin to make changes to this Hat?'
                localForm={localForm}
                options={MUTABILITY_OPTIONS}
                tooltip='Choose whether the Hat should be editable or not'
              />
              {localForm.watch('mutable') === MUTABILITY.IMMUTABLE &&
                !isTopHat(selectedHat) && (
                  <Text color='red.500' fontSize='sm' mt={3}>
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
